import type { SummarizeResult } from './types';

function unescapeJsonString(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`) as string;
  } catch {
    return raw;
  }
}

function extractJsonStringArray(text: string, field: string): string[] {
  const complete = new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]*)\\]`, 's');
  const completeMatch = text.match(complete);
  if (completeMatch) {
    return [...completeMatch[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) =>
      unescapeJsonString(m[1]),
    );
  }

  const partial = new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]*)$`, 's');
  const partialMatch = text.match(partial);
  if (partialMatch) {
    return [...partialMatch[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) =>
      unescapeJsonString(m[1]),
    );
  }

  return [];
}

/** Best-effort parse of a streaming JSON buffer from the AI. */
export function parsePartialResult(buffer: string): Partial<SummarizeResult> {
  const partial: Partial<SummarizeResult> = {};
  const summary = extractJsonStringArray(buffer, 'summary');
  const keywords = extractJsonStringArray(buffer, 'keywords');

  if (summary.length) partial.summary = summary;
  if (keywords.length) partial.keywords = keywords;

  return partial;
}
