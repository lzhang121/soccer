import { describe, expect, it } from 'vitest';
import { countKeywordOccurrences, findKeywordIndices } from '@/lib/text/keyword';

describe('keyword search helpers', () => {
  it('finds all non-overlapping indices', () => {
    expect(findKeywordIndices('abababa', 'aba')).toEqual([0, 4]);
  });

  it('respects max limit', () => {
    expect(findKeywordIndices('aaa', 'a', 2)).toEqual([0, 1]);
  });

  it('counts occurrences', () => {
    expect(countKeywordOccurrences('Jリーグ Jリーグ J1', 'Jリーグ')).toBe(2);
  });

  it('returns empty for blank keyword', () => {
    expect(findKeywordIndices('text', '')).toEqual([]);
  });
});
