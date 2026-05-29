import { describe, expect, it } from 'vitest';
import { parsePartialResult } from '@/lib/ai/parse-partial';

describe('parsePartialResult', () => {
  it('parses complete summary and keywords arrays', () => {
    const buffer = `{
      "summary": ["行1", "行2", "行3"],
      "keywords": ["Jリーグ", "移籍"]
    }`;
    expect(parsePartialResult(buffer)).toEqual({
      summary: ['行1', '行2', '行3'],
      keywords: ['Jリーグ', '移籍'],
    });
  });

  it('parses partial streaming buffer', () => {
    const buffer = `{"summary": ["途中", "まだ`;
    expect(parsePartialResult(buffer)).toEqual({ summary: ['途中'] });
  });

  it('unescapes JSON string escapes', () => {
    const buffer = `{"keywords": ["3\\u70b9\\u30b7\\u30b9\\u30c6\\u30e0"]}`;
    expect(parsePartialResult(buffer).keywords).toEqual(['3点システム']);
  });

  it('returns empty object when fields are missing', () => {
    expect(parsePartialResult('{}')).toEqual({});
  });
});
