/**
 * @vitest-environment happy-dom
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extractArticle } from '@/lib/extractors/index';
import { extractArticleInPage } from '@/lib/extractors/inject-extract';
import { extractYahooFallback } from '@/lib/extractors/yahoo-fallback';

const YAHOO_URL =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const FIXTURE = readFileSync('lib/extractors/fixtures/yahoo-article.html', 'utf8');

function mountYahooFixture() {
  Object.defineProperty(window, 'location', {
    value: { href: YAHOO_URL, hostname: 'news.yahoo.co.jp' },
    configurable: true,
  });
  document.documentElement.innerHTML = FIXTURE.replace(/^[\s\S]*?<body[^>]*>/i, '').replace(
    /<\/body>[\s\S]*$/i,
    '',
  );
}

describe('Yahoo article fixture', () => {
  it('extractArticle reads .article_body', () => {
    mountYahooFixture();
    const article = extractArticle();
    expect(article?.site).toBe('Yahoo!ニュース');
    expect(article?.title).toContain('日中関係悪化');
    expect(article?.text).toContain('中国商務省');
    expect(article?.text.length).toBeGreaterThan(80);
  });

  it('extractArticleInPage reads .article_body', () => {
    mountYahooFixture();
    const article = extractArticleInPage();
    expect(article?.site).toBe('Yahoo!ニュース');
    expect(article?.text).toContain('中国商務省');
  });

  it('extractYahooFallback reads __PRELOADED_STATE__ when body is empty', () => {
    mountYahooFixture();
    document.querySelector('.article_body')?.remove();
    const fallback = extractYahooFallback();
    expect(fallback?.text).toContain('中国商務省');
    expect(fallback?.title).toContain('日中関係悪化');
  });
});
