import { Window } from 'happy-dom';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const res = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
});
const html = await res.text();

const cls = [...html.matchAll(/class="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((c) => /ad-|comment|share|recommend|related/i.test(c));
console.log('noise-like classes', [...new Set(cls)].slice(0, 50));

const NOISE =
  'script,style,noscript,nav,aside,footer,body > header,[role="navigation"],[role="banner"],[role="contentinfo"],[class*="ad-"],[class*="advert"],[class*="related_article"],[class*="recommend"],[class*="share"],[class*="sns"],[class*="comment"],[id*="comment"],[class*="infeed"],[class*="popin"]';

function score(selectors) {
  const window = new Window();
  window.document.write(html);
  let best = null;
  let bestLen = 0;
  for (const sel of selectors) {
    for (const el of window.document.querySelectorAll(sel)) {
      const len = el.textContent?.trim().length ?? 0;
      if (len > bestLen) {
        bestLen = len;
        best = el;
      }
    }
  }
  const clone = best.cloneNode(true);
  clone.querySelectorAll(NOISE).forEach((el) => el.remove());
  const cleaned = clone.textContent.replace(/\s+/g, ' ').trim();
  return { picked: best?.className || best?.tagName, raw: bestLen, cleaned: cleaned.length, preview: cleaned.slice(0, 120) };
}

const yahooSelectors = [
  '[data-ual-gid="article-body"]',
  '.article_body',
  '.article-body',
  'article',
];

console.log('yahoo pickBest:', score(yahooSelectors));

// Prefer .article_body only
console.log('article_body only:', score(['.article_body']));

// article .article_body nested
console.log('article .article_body:', score(['article .article_body', '.article_body']));

// check if comment class removes article_body content
const window = new Window();
window.document.write(html);
const body = window.document.querySelector('.article_body');
const clone = body.cloneNode(true);
const removed = [];
clone.querySelectorAll(NOISE).forEach((el) => {
  removed.push({ tag: el.tagName, class: el.className, text: el.textContent?.slice(0, 60) });
  el.remove();
});
console.log('article_body removed', removed);
console.log('article_body cleaned len', clone.textContent.replace(/\s+/g, ' ').trim().length);
