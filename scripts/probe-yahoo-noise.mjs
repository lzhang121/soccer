import { Window } from 'happy-dom';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const res = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
});
const html = await res.text();

const window = new Window();
window.document.write(html);

Object.defineProperty(window, 'location', {
  value: {
    href: url,
    hostname: 'news.yahoo.co.jp',
  },
});

// simulate pickBestElement
const selectors = [
  '[data-ual-gid="article-body"]',
  '.article_body',
  '.article-body',
  'article',
];

let best = null;
let bestLen = 0;
for (const sel of selectors) {
  for (const el of window.document.querySelectorAll(sel)) {
    const len = el.textContent?.trim().length ?? 0;
    console.log('candidate', sel, len);
    if (len > bestLen) {
      bestLen = len;
      best = el;
    }
  }
}

console.log('picked tag', best?.tagName, best?.className, 'raw len', bestLen);

// Can't import TS directly in mjs easily - duplicate noise logic
const NOISE =
  'script,style,noscript,nav,aside,footer,body > header,[role="navigation"],[role="banner"],[role="contentinfo"],[class*="ad-"],[class*="advert"],[class*="related_article"],[class*="recommend"],[class*="share"],[class*="sns"],[class*="comment"],[id*="comment"],[class*="infeed"],[class*="popin"]';

const clone = best.cloneNode(true);
clone.querySelectorAll(NOISE).forEach((el) => el.remove());
const text = clone.textContent.replace(/\s+/g, ' ').trim();
console.log('after noise len', text.length);
console.log('preview', text.slice(0, 200));

// check what comment nodes get removed
const removed = [];
best.querySelectorAll(NOISE).forEach((el) => {
  removed.push({ tag: el.tagName, class: el.className, len: el.textContent?.length });
});
console.log('removed nodes', removed.slice(0, 10));

// ld+json fallback
const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (ldMatch) {
  const json = JSON.parse(ldMatch[1]);
  console.log('ld+json articleBody', json.articleBody?.slice(0, 200));
}
