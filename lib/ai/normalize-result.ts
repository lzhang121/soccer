import type { SummarizeResult } from './types';
import { AiError } from './types';

export function normalizeSummarizeResult(content: string): SummarizeResult {
  const trimmed = content.trim();
  const jsonText = trimmed.startsWith('{') ? trimmed : trimmed.match(/\{[\s\S]*\}/)?.[0];

  if (!jsonText) {
    throw new AiError('AI の応答を JSON として解析できませんでした', 'invalid_json');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new AiError('AI の応答を JSON として解析できませんでした', 'invalid_json');
  }

  const data = parsed as Partial<SummarizeResult>;
  if (!Array.isArray(data.summary) || !Array.isArray(data.keywords)) {
    throw new AiError('AI の応答形式が不正です', 'invalid_json');
  }

  return {
    summary: data.summary.slice(0, 3).map(String),
    keywords: data.keywords.map(String),
    players: (data.players ?? []).map((p) => ({
      name: String((p as { name?: string }).name ?? ''),
      intro: String((p as { intro?: string }).intro ?? ''),
    })),
    terms: (data.terms ?? []).map((t) => ({
      term: String((t as { term?: string }).term ?? ''),
      explanation: String((t as { explanation?: string }).explanation ?? ''),
    })),
  };
}
