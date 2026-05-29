/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { extractArticleTextFromRoot } from '@/lib/extractors/index';
import { highlightKeywordInArticle, MAX_KEYWORD_HIGHLIGHTS } from '@/lib/extractors/highlight';

const YAHOO_FIXTURE = `
<article>
  <div data-ual-gid="article-body">
    <p>久保建英が今季初ゴールを決めた。チームは Jリーグ で勝利を収めた。</p>
    <aside class="related-articles">関連記事</aside>
    <p>監督は「良い試合だった」とコメントした。久保建英の活躍が続く。</p>
  </div>
</article>`;

describe('extractArticleTextFromRoot', () => {
  it('strips noise nodes and joins paragraph text', () => {
    document.body.innerHTML = YAHOO_FIXTURE;
    const root = document.querySelector('[data-ual-gid="article-body"]')!;
    const text = extractArticleTextFromRoot(root);
    expect(text).toContain('久保建英が今季初ゴール');
    expect(text).not.toContain('関連記事');
  });
});

describe('highlightKeywordInArticle', () => {
  it('highlights all keyword matches up to the limit', () => {
    document.body.innerHTML = YAHOO_FIXTURE;
    const count = highlightKeywordInArticle('久保建英');
    expect(count).toBe(2);
    expect(document.querySelectorAll('mark.ss-highlight')).toHaveLength(2);
  });

  it('respects maxMatches cap', () => {
    document.body.innerHTML = `<article><p>${'a'.repeat(50)}</p></article>`;
    const count = highlightKeywordInArticle('a', 3);
    expect(count).toBe(3);
    expect(document.querySelectorAll('mark.ss-highlight')).toHaveLength(3);
    expect(MAX_KEYWORD_HIGHLIGHTS).toBeGreaterThan(3);
  });
});
