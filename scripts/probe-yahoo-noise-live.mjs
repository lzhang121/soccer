import { chromium } from 'playwright';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle' });

const result = await page.evaluate(() => {
  const NOISE =
    '[class*="comment"],[id*="comment"],[class*="recommend"],[class*="related"],[class*="share"]';
  const article = document.querySelector('article');
  const body = document.querySelector('.article_body');
  const removed = [];
  for (const root of [article, body]) {
    if (!root) continue;
    root.querySelectorAll(NOISE).forEach((el) => {
      removed.push({
        root: root.className || root.tagName,
        tag: el.tagName,
        id: el.id,
        class: el.className?.slice?.(0, 80),
        len: el.textContent?.length ?? 0,
      });
    });
  }
  return removed;
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
