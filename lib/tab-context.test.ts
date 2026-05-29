import { describe, expect, it } from 'vitest';
import { describeTabForArticleHint, sidePanelPathForTab } from '@/lib/tab-context';

describe('tab-context', () => {
  it('builds side panel path with tab id', () => {
    expect(sidePanelPathForTab(42)).toBe('sidepanel.html?tabId=42');
  });

  it('describes supported host on non-article path', () => {
    expect(describeTabForArticleHint('https://web.gekisaka.jp/')).toContain('ゲキサカ');
    expect(describeTabForArticleHint('https://web.gekisaka.jp/')).toContain('記事詳細');
  });

  it('describes unsupported host', () => {
    expect(describeTabForArticleHint('https://example.com/foo')).toContain('example.com');
  });

  it('describes supported host without article body', () => {
    expect(describeTabForArticleHint('https://news.yahoo.co.jp/articles/abc123')).toContain(
      'news.yahoo.co.jp',
    );
  });
});
