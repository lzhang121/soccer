import { describe, expect, it } from 'vitest';
import { normalizeArticleUrl } from '@/lib/url';

describe('normalizeArticleUrl', () => {
  it('strips utm and tracking query params', () => {
    const url =
      'https://news.yahoo.co.jp/articles/abc?utm_source=twitter&utm_medium=social&fbclid=xyz';
    expect(normalizeArticleUrl(url)).toBe('https://news.yahoo.co.jp/articles/abc');
  });

  it('removes hash and trailing slash', () => {
    const url = 'https://www.soccer-king.jp/news/123/#section';
    expect(normalizeArticleUrl(url)).toBe('https://www.soccer-king.jp/news/123');
  });

  it('preserves non-tracking query params', () => {
    const url = 'https://www3.nhk.or.jp/news/article?topic=football';
    expect(normalizeArticleUrl(url)).toBe('https://www3.nhk.or.jp/news/article?topic=football');
  });

  it('returns original string on invalid URL', () => {
    expect(normalizeArticleUrl('not-a-url')).toBe('not-a-url');
  });
});
