/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { extractArticle } from '@/lib/extractors/index';
import { pickBestElement } from '@/lib/extractors/sites';

const SOCCER_DIGEST_FIXTURE = `
<div class="news_body">
  <h2>テスト記事タイトル</h2>
  <div class="content_detail"></div>
  <div class="content_detail">
    <p>${'上田綺世が今季エールディビジで得点王に輝いた。'.repeat(6)}</p>
    <div class="related_article">関連記事リンク</div>
  </div>
  <div class="content_detail">短い</div>
</div>`;

describe('pickBestElement', () => {
  it('picks the longest matching node for soccer digest', () => {
    document.body.innerHTML = SOCCER_DIGEST_FIXTURE;
    const best = pickBestElement(['.content_detail', 'main']);
    expect(best?.textContent).toContain('上田綺世');
    expect(best?.textContent).not.toBe('短い');
  });
});

describe('extractArticle soccer digest', () => {
  it('extracts from the fullest content_detail block', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://www.soccerdigestweb.com/news/detail/12345',
        hostname: 'www.soccerdigestweb.com',
      },
      configurable: true,
    });
    document.body.innerHTML = SOCCER_DIGEST_FIXTURE;

    const article = extractArticle();
    expect(article?.site).toBe('サッカーダイジェスト');
    expect(article?.title).toBe('テスト記事タイトル');
    expect(article?.text).toContain('上田綺世');
    expect(article?.text).not.toContain('関連記事リンク');
  });
});
