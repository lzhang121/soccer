import { describe, expect, it } from 'vitest';
import { detectSite, isArticlePath } from '@/lib/extractors/index';

describe('detectSite', () => {
  it('detects soccer-king', () => {
    expect(detectSite('https://www.soccer-king.jp/news/123')?.id).toBe('soccer-king');
  });

  it('detects yahoo news', () => {
    expect(detectSite('https://news.yahoo.co.jp/articles/abc')?.id).toBe('yahoo');
  });

  it('detects nhk', () => {
    expect(detectSite('https://www3.nhk.or.jp/news/html/article')?.id).toBe('nhk');
  });

  it('detects gekisaka', () => {
    expect(detectSite('https://web.gekisaka.jp/news/detail/?123')?.id).toBe('gekisaka');
  });

  it('detects nikkansports', () => {
    expect(detectSite('https://www.nikkansports.com/soccer/japan/news/202605270000376.html')?.id).toBe(
      'nikkansports',
    );
  });

  it('detects hochi', () => {
    expect(detectSite('https://hochi.news/articles/20260527-OHT1T51064.html')?.id).toBe('hochi');
  });

  it('detects soccerdigest', () => {
    expect(detectSite('https://www.soccerdigestweb.com/news/detail/12345')?.id).toBe('soccerdigest');
  });

  it('detects footballchannel', () => {
    expect(detectSite('https://www.footballchannel.jp/2025/05/22/post721179/')?.id).toBe(
      'footballchannel',
    );
  });

  it('returns null for unsupported hosts', () => {
    expect(detectSite('https://example.com/article')).toBeNull();
  });
});

describe('isArticlePath', () => {
  it('accepts typical article paths', () => {
    expect(isArticlePath('https://news.yahoo.co.jp/articles/abc123')).toBe(true);
    expect(isArticlePath('https://hochi.news/articles/20260527-OHT1T51064.html')).toBe(true);
    expect(isArticlePath('https://web.gekisaka.jp/news/detail/?348529-fl')).toBe(true);
    expect(isArticlePath('https://web.gekisaka.jp/news/jleague/detail/?348529-fl')).toBe(true);
    expect(isArticlePath('https://web.gekisaka.jp/pickup/detail/?436216-fl')).toBe(true);
    expect(isArticlePath('https://www.nikkansports.com/soccer/japan/news/202605270000376.html')).toBe(
      true,
    );
    expect(isArticlePath('https://www.footballchannel.jp/2025/05/22/post721179/')).toBe(true);
  });

  it('rejects root and list/search paths', () => {
    expect(isArticlePath('https://news.yahoo.co.jp/')).toBe(false);
    expect(isArticlePath('https://news.yahoo.co.jp/list')).toBe(false);
    expect(isArticlePath('https://news.yahoo.co.jp/search')).toBe(false);
    expect(isArticlePath('https://web.gekisaka.jp/')).toBe(false);
    expect(isArticlePath('https://web.gekisaka.jp/datadisp/detail?id=236')).toBe(false);
    expect(isArticlePath('https://hochi.news/')).toBe(false);
  });
});
