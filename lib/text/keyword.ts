/** Find all start indices of `keyword` in `text` (non-overlapping). */
export function findKeywordIndices(text: string, keyword: string, max = Infinity): number[] {
  if (!keyword) return [];
  const indices: number[] = [];
  let start = 0;
  while (indices.length < max) {
    const index = text.indexOf(keyword, start);
    if (index === -1) break;
    indices.push(index);
    start = index + keyword.length;
  }
  return indices;
}

export function countKeywordOccurrences(text: string, keyword: string): number {
  return findKeywordIndices(text, keyword).length;
}
