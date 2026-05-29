/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { extractArticleInPage } from '@/lib/extractors/inject-extract';

const YAHOO_HTML = `
<article>
  <div class="article_body">
    <p>${'久保建英が今季初ゴールを決めた。'.repeat(8)}</p>
  </div>
</article>`;

describe('extractArticleInPage', () => {
  it('extracts Yahoo article body from article_body class', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://news.yahoo.co.jp/articles/test123',
        hostname: 'news.yahoo.co.jp',
      },
      configurable: true,
    });
    document.body.innerHTML = YAHOO_HTML;
    document.title = 'テスト記事 - Yahoo!ニュース';

    const article = extractArticleInPage();
    expect(article?.site).toBe('Yahoo!ニュース');
    expect(article?.text).toContain('久保建英');
    expect(article?.title).toBeTruthy();
  });

  it('extracts Gekisaka article from entry-body', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://web.gekisaka.jp/news/jleague/detail/?348529-348529-fl',
        hostname: 'web.gekisaka.jp',
      },
      configurable: true,
    });
    document.body.innerHTML = `
      <h1 class="entry-title">鳥栖新指揮官は川井健太氏に決定</h1>
      <div class="entry-body">
        <p>${'川井健太氏がサガン鳥栖の新監督に就任した。'.repeat(12)}</p>
      </div>`;

    const article = extractArticleInPage();
    expect(article?.site).toBe('ゲキサカ');
    expect(article?.text).toContain('川井健太');
    expect(article?.title).toContain('川井健太');
  });

  it('works when invoked like chrome.scripting.executeScript serializes it', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://news.yahoo.co.jp/articles/test123',
        hostname: 'news.yahoo.co.jp',
      },
      configurable: true,
    });
    document.body.innerHTML = YAHOO_HTML;

    const serialized = extractArticleInPage.toString();
    const isolated = new Function(`return (${serialized})()`)() as ReturnType<
      typeof extractArticleInPage
    >;

    expect(isolated?.site).toBe('Yahoo!ニュース');
    expect(isolated?.text).toContain('久保建英');
  });
});
