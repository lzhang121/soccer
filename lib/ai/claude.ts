import { toFriendlyAiError } from './errors';
import { normalizeSummarizeResult } from './normalize-result';
import { parsePartialResult } from './parse-partial';
import { buildUserPrompt, SYSTEM_PROMPT } from './prompt';
import type { SummarizeOptions, SummarizeStreamCallbacks, SummarizeResult } from './types';
import { AiError } from './types';

async function readClaudeSse(
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
          type?: string;
          delta?: { text?: string };
        };
        if (json.type === 'content_block_delta' && json.delta?.text) {
          full += json.delta.text;
          callbacks?.onPartial(parsePartialResult(full));
        }
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }

  return full;
}

export async function callClaude(
  apiKey: string,
  model: string,
  options: SummarizeOptions,
  callbacks?: SummarizeStreamCallbacks,
): Promise<SummarizeResult> {
  if (!apiKey.trim()) {
    throw new AiError('API キーが設定されていません', 'missing_key');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      stream: Boolean(callbacks),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(options.article, options.title, options.testMode),
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new AiError(toFriendlyAiError(response.status, detail), 'api_error');
  }

  const content = callbacks
    ? await readClaudeSse(response, callbacks)
    : (
        (await response.json()) as {
          content?: Array<{ type?: string; text?: string }>;
        }
      ).content?.find((block) => block.type === 'text')?.text;

  if (!content) {
    throw new AiError('AI から空の応答が返されました', 'api_error');
  }

  return normalizeSummarizeResult(content);
}
