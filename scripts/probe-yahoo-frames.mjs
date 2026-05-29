import { chromium } from 'playwright';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle' });

const frames = page.frames().map((f) => ({
  url: f.url(),
  article_body: null,
  article: null,
}));

for (let i = 0; i < page.frames().length; i++) {
  const f = page.frames()[i];
  const counts = await f.evaluate(() => ({
    article_body: document.querySelectorAll('.article_body').length,
    article: document.querySelectorAll('article').length,
    bodyText: document.body?.textContent?.includes('中国商務省') ?? false,
  }));
  frames[i] = { url: f.url(), ...counts };
}

console.log(JSON.stringify(frames, null, 2));
await browser.close();
