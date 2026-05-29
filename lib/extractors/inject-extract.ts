import type { ArticleData } from '@/lib/extractors/sites';

/**
 * Self-contained extractor for `scripting.executeScript({ func })`.
 * Chrome serializes only this function body — no outer scope references.
 */
export function extractArticleInPage(): ArticleData | null {
  const NOISE =
    'script,style,noscript,nav,aside,footer,[role="navigation"],[role="banner"],[role="contentinfo"],[class*="ad-"],[class*="advert"],[class*="related_article"],[class*="recommend"],[class*="share"],[class*="sns"],[class*="comment"],[id*="comment"],[class*="infeed"],[class*="popin"],.article_end,.related_article';

  const SITE_BODY: Record<string, string[]> = {
    'サッカーキング': ['article .article-body', 'article', '.article-body', '.entry-content'],
    'Yahoo!ニュース': [
      '.article_body.highLightSearchTarget',
      '.article_body',
      'article .article_body',
      '[data-ual-gid="article-body"]',
      '.article-body',
    ],
    NHK: ['.content--body', 'article .content--body', 'article'],
    ゲキサカ: ['.entry-body', '.geki_contents', 'article'],
    日刊スポーツ: ['.article-body', '.article-main', 'article'],
    スポーツ報知: ['.preview__detail', '.preview__wrap', '.article__wrap', 'article'],
    サッカーダイジェスト: ['.news_body .content_detail', '.content_detail', 'main', 'article'],
    フットボールチャンネル: ['.entry_body', '.entry', 'article'],
  };

  const SITE_TITLE: Record<string, string[]> = {
    'サッカーキング': ['h1'],
    'Yahoo!ニュース': [
      'meta[property="og:title"]',
      'article h1',
      '[data-ual-gid="article-title"]',
      'h1',
    ],
    NHK: ['.content--title', 'article h1', 'h1'],
    ゲキサカ: ['h1.entry-title', 'h1[itemprop="name"]', 'h1'],
    日刊スポーツ: ['.article-title', 'h1'],
    スポーツ報知: ['h1.preview__title', 'h1'],
    サッカーダイジェスト: ['h2', '.news_header h2', 'h1'],
    フットボールチャンネル: ['h1.entry_title', 'h1'],
  };

  function detectSite(hostname: string): string | null {
    if (/(^|\.)soccer-king\.jp$/i.test(hostname)) return 'サッカーキング';
    if (/(^|\.)news\.yahoo\.co\.jp$/i.test(hostname)) return 'Yahoo!ニュース';
    if (/(^|\.)nhk\.or\.jp$/i.test(hostname)) return 'NHK';
    if (/(^|\.)gekisaka\.jp$/i.test(hostname)) return 'ゲキサカ';
    if (/(^|\.)nikkansports\.com$/i.test(hostname)) return '日刊スポーツ';
    if (/(^|\.)hochi\.news$/i.test(hostname)) return 'スポーツ報知';
    if (/(^|\.)soccerdigestweb\.com$/i.test(hostname)) return 'サッカーダイジェスト';
    if (/(^|\.)footballchannel\.jp$/i.test(hostname)) return 'フットボールチャンネル';
    return null;
  }

  function pickBestRoot(selectors: string[]): Element | null {
    let best: Element | null = null;
    let bestLen = 0;
    for (const selector of selectors) {
      for (const element of document.querySelectorAll(selector)) {
        const len = element.textContent?.trim().length ?? 0;
        if (len > bestLen) {
          bestLen = len;
          best = element;
        }
      }
    }
    return best;
  }

  function normalizeTitle(raw: string): string {
    return raw
      .replace(/\s*（[^）]*）\s*$/, '')
      .replace(/\s*-\s*Yahoo!.*$/i, '')
      .trim();
  }

  function pickTitle(selectors: string[]): string {
    for (const selector of selectors) {
      if (selector.startsWith('meta[')) {
        const content = document.querySelector(selector)?.getAttribute('content')?.trim();
        if (content && content.length > 5 && content !== 'Yahoo!ニュース') {
          return normalizeTitle(content);
        }
        continue;
      }

      if (selector === 'h1' || selector.includes(' h1')) {
        const nodes = [...document.querySelectorAll(selector)];
        let best = '';
        for (const node of nodes) {
          const text = node.textContent?.trim();
          if (!text || text.length <= 3 || text === 'Yahoo!ニュース') continue;
          if (text.length > best.length) best = text;
        }
        if (best) return best;
        continue;
      }

      const text = document.querySelector(selector)?.textContent?.trim();
      if (text && text.length > 3 && text !== 'Yahoo!ニュース') return text;
    }

    return normalizeTitle(document.title);
  }

  function parseJsonAfterMarker(text: string, marker: string): Record<string, unknown> | null {
    const idx = text.indexOf(marker);
    if (idx < 0) return null;

    let i = idx + marker.length;
    while (text[i] === ' ') i += 1;
    if (text[i] !== '{') return null;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let j = i; j < text.length; j += 1) {
      const char = text[j];
      if (inString) {
        if (escape) escape = false;
        else if (char === '\\') escape = true;
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') {
        inString = true;
        continue;
      }
      if (char === '{') depth += 1;
      if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          try {
            return JSON.parse(text.slice(i, j + 1)) as Record<string, unknown>;
          } catch {
            return null;
          }
        }
      }
    }

    return null;
  }

  function metaContent(selector: string): string {
    return document.querySelector(selector)?.getAttribute('content')?.trim() ?? '';
  }

  function yahooFallback(): { title: string; text: string } | null {
    const win = window as Window & { __PRELOADED_STATE__?: Record<string, unknown> };
    const state =
      win.__PRELOADED_STATE__ ??
      (() => {
        for (const script of document.querySelectorAll('script:not([src])')) {
          const parsed = parseJsonAfterMarker(
            script.textContent ?? '',
            'window.__PRELOADED_STATE__=',
          );
          if (parsed) return parsed;
        }
        return null;
      })();

    if (state) {
      const detail = state.articleDetail as
        | {
            headline?: string;
            paragraphs?: Array<{ textDetails?: Array<{ text?: string }> }>;
          }
        | undefined;
      const parts: string[] = [];
      for (const paragraph of detail?.paragraphs ?? []) {
        for (const item of paragraph.textDetails ?? []) {
          const part = item.text?.trim();
          if (part) parts.push(part);
        }
      }
      const text = parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
      if (text.length >= 80) {
        const pageData = state.pageData as { title?: string } | undefined;
        const title =
          detail?.headline?.trim() ||
          normalizeTitle(pageData?.title ?? '') ||
          normalizeTitle(document.title);
        if (title) return { title, text };
      }
    }

    const ogDescription = metaContent('meta[property="og:description"]');
    if (ogDescription.length >= 80) {
      return {
        title: normalizeTitle(metaContent('meta[property="og:title"]')) || normalizeTitle(document.title),
        text: ogDescription,
      };
    }

    const description = metaContent('meta[name="description"]');
    if (description.length >= 80) {
      return {
        title: normalizeTitle(metaContent('meta[property="og:title"]')) || normalizeTitle(document.title),
        text: description,
      };
    }

    return null;
  }

  function cleanRootText(root: Element): string {
    const clone = root.cloneNode(true) as Element;
    clone.querySelectorAll(NOISE).forEach((el) => el.remove());

    const blocks: string[] = [];
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const text = node.textContent?.trim();
      if (text && text.length > 1) blocks.push(text);
      node = walker.nextNode();
    }

    return blocks.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  const site = detectSite(location.hostname);
  if (!site) return null;

  const root = pickBestRoot(SITE_BODY[site] ?? []);
  let text = root ? cleanRootText(root) : '';
  let title = pickTitle(SITE_TITLE[site] ?? ['h1']);

  if (text.length < 80 && site === 'Yahoo!ニュース') {
    const fallback = yahooFallback();
    if (fallback) {
      text = fallback.text;
      title = fallback.title;
    }
  }

  if (text.length < 80) return null;

  return { url: location.href, title, text, site };
}
