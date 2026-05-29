import { chromium } from 'playwright';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

const result = await page.evaluate(() => {
  const selectors = [
    '[data-ual-gid="article-body"]',
    '[data-ual-gid="article-title"]',
    '.article_body',
    '.article-body',
    'article',
    'main',
    'h1',
  ];

  const out = {};
  for (const sel of selectors) {
    const nodes = [...document.querySelectorAll(sel)];
    out[sel] = nodes.map((n) => ({
      len: n.textContent?.trim().length ?? 0,
      preview: n.textContent?.trim().slice(0, 100) ?? '',
      class: n.className?.slice?.(0, 80) ?? '',
    }));
  }

  // pickBest simulation
  const bodySelectors = [
    '[data-ual-gid="article-body"]',
    '.article_body',
    '.article-body',
    'article',
  ];
  let best = null;
  let bestLen = 0;
  for (const sel of bodySelectors) {
    for (const el of document.querySelectorAll(sel)) {
      const len = el.textContent?.trim().length ?? 0;
      if (len > bestLen) {
        bestLen = len;
        best = { sel, len, preview: el.textContent?.trim().slice(0, 120) };
      }
    }
  }

  return { out, best, href: location.href, title: document.title };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
