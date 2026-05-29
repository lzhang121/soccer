import { chromium } from 'playwright';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('domcontentloaded', async () => {
  const r = await page.evaluate(() => ({
    body: document.querySelector('.article_body')?.textContent?.trim().length ?? 0,
    article: document.querySelector('article')?.textContent?.trim().length ?? 0,
    preload: typeof window.__PRELOADED_STATE__ !== 'undefined',
  }));
  console.log('domcontentloaded', r);
});

await page.goto(url, { waitUntil: 'load' });
await browser.close();
