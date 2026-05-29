import { toFriendlyAiError } from './errors';
import { normalizeSummarizeResult } from './normalize-result';
import { parsePartialResult } from './parse-partial';
import { buildUserPrompt, SYSTEM_PROMPT } from './prompt';
import type { SummarizeOptions, SummarizeStreamCallbacks, SummarizeResult } from './types';
import { AiError } from './types';

export interface OpenAiCompatibleConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  referer?: string;
  title?: string;
}

function buildHeaders(config: OpenAiCompatibleConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };
  if (config.referer) {
    headers['HTTP-Referer'] = config.referer;
    headers['X-Title'] = config.title ?? 'サッカー速読';
  }
  return headers;
}

function buildBody(config: OpenAiCompatibleConfig, options: SummarizeOptions, stream: boolean) {
  return JSON.stringify({
    model: config.model,
    stream,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildUserPrompt(options.article, options.title, options.testMode),
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });
}

async function readOpenAiSse(
  response: Response,
  callbacks?: SummarizeStreamCallbacks,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new AiError('ストリームを読み取れませんでした', 'api_error');

  const decoder = new TextDecoder();
  let lineBuffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    lineBuffer += decoder.decode(value, { stream: true });
    const lines = lineBuffer.split('\n');
    lineBuffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') continue;

      try {
        const json = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          callbacks?.onPartial(parsePartialResult(full));
        }
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }

  return full;
}

export async function callOpenAiCompatible(
  config: OpenAiCompatibleConfig,
  options: SummarizeOptions,
  callbacks?: SummarizeStreamCallbacks,
): Promise<SummarizeResult> {
  if (!config.apiKey.trim()) {
    throw new AiError('API キーが設定されていません', 'missing_key');
  }

  const response = await fetch(config.baseUrl, {
    method: 'POST',
    headers: buildHeaders(config),
    body: buildBody(config, options, Boolean(callbacks)),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new AiError(toFriendlyAiError(response.status, detail), 'api_error');
  }

  let content: string | undefined;
  if (callbacks) {
    content = await readOpenAiSse(response, callbacks);
  } else {
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    content = json.choices?.[0]?.message?.content;
  }

  if (!content) {
    throw new AiError('AI から空の応答が返されました', 'api_error');
  }

  return normalizeSummarizeResult(content);
}
