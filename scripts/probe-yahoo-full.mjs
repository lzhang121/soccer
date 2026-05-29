import { Window } from 'happy-dom';
import { writeFileSync } from 'node:fs';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const res = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
});
const html = await res.text();

const idx = html.indexOf('article_body');
const snippet = html.slice(Math.max(0, idx - 200), idx + 8000);
writeFileSync('scripts/yahoo-article-snippet.html', snippet);

const window = new Window();
window.document.write(html);

// Simulate extractArticle logic
Object.defineProperty(window, 'location', {
  value: { href: url, hostname: 'news.yahoo.co.jp' },
  configurable: true,
});

const config = {
  bodySelectors: [
    '[data-ual-gid="article-body"]',
    '.article_body',
    '.article-body',
    'article',
  ],
  titleSelectors: ['[data-ual-gid="article-title"]', 'h1'],
};

let best = null;
let bestLen = 0;
for (const sel of config.bodySelectors) {
  for (const el of window.document.querySelectorAll(sel)) {
    const len = el.textContent?.trim().length ?? 0;
    if (len > bestLen) {
      bestLen = len;
      best = el;
    }
  }
}

const NOISE =
  'script,style,noscript,nav,aside,footer,body > header,[role="navigation"],[role="banner"],[role="contentinfo"],[class*="ad-"],[class*="advert"],[class*="related_article"],[class*="recommend"],[class*="share"],[class*="sns"],[class*="comment"],[id*="comment"],[class*="infeed"],[class*="popin"]';

const clone = best.cloneNode(true);
clone.querySelectorAll(NOISE).forEach((el) => el.remove());
const blocks = [];
const walker = window.document.createTreeWalker(clone, 4 /* SHOW_TEXT */);
let node = walker.nextNode();
while (node) {
  const text = node.textContent?.trim();
  if (text && text.length > 1) blocks.push(text);
  node = walker.nextNode();
}
const text = blocks.join('\n').replace(/\n{3,}/g, '\n\n').trim();

console.log('extractArticle simulation:', {
  ok: text.length >= 80,
  len: text.length,
  title: window.document.querySelector('h1')?.textContent?.trim(),
});

// Check iframe
console.log('iframes', window.document.querySelectorAll('iframe').length);
