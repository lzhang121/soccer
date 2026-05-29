import { describe, expect, it } from 'vitest';
import { buildSharePayload, formatShareText, formatShareTextShort } from '@/lib/share';

describe('share formatting', () => {
  const title = '久保建英、今季初ゴール';
  const summary = ['要点1', '要点2', '要点3'];
  const url = 'https://news.yahoo.co.jp/articles/abc';

  it('formatShareText includes title, numbered lines, and url', () => {
    const text = formatShareText(title, summary, url);
    expect(text).toContain('⚽ 久保建英、今季初ゴール');
    expect(text).toContain('1. 要点1');
    expect(text).toContain('3. 要点3');
    expect(text).toContain(url);
  });

  it('formatShareTextShort uses first summary line', () => {
    expect(formatShareTextShort(title, summary)).toBe('⚽ 久保建英、今季初ゴール — 要点1');
  });

  it('buildSharePayload returns full and short variants', () => {
    const payload = buildSharePayload(title, { summary, keywords: [], players: [], terms: [] }, url);
    expect(payload.full).toBe(formatShareText(title, summary, url));
    expect(payload.short).toBe(formatShareTextShort(title, summary));
  });
});
