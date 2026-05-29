import { chromium } from 'playwright';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const result = await page.evaluate(() => {
  const article = document.querySelector('article');
  const comment = document.querySelector('#articleCommentModule');
  return {
    commentInsideArticle: article?.contains(comment) ?? false,
    articleLen: article?.textContent?.trim().length ?? 0,
    bodyLen: document.querySelector('.article_body')?.textContent?.trim().length ?? 0,
    commentLen: comment?.textContent?.trim().length ?? 0,
    commentIdMatch: comment?.matches?.('[id*="comment"]') ?? false,
  };
});

console.log(result);
await browser.close();
