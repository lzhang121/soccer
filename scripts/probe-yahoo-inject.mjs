import { chromium } from 'playwright';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded' });

async function runExtract(label) {
  return page.evaluate(() => {
    const SITE_HOSTS = [
      { pattern: /(^|\.)news\.yahoo\.co\.jp$/i, name: 'Yahoo!ニュース' },
    ];
    const SITE_BODY = {
      'Yahoo!ニュース': [
        '[data-ual-gid="article-body"]',
        '.article_body',
        '.article-body',
        'article',
      ],
    };
    const SITE_TITLE = {
      'Yahoo!ニュース': ['[data-ual-gid="article-title"]', 'h1'],
    };
    const NOISE =
      'script,style,noscript,nav,aside,footer,[role="navigation"],[role="banner"],[role="contentinfo"],[class*="ad-"],[class*="advert"],[class*="related_article"],[class*="recommend"],[class*="share"],[class*="sns"],[class*="comment"],[id*="comment"],[class*="infeed"],[class*="popin"],.article_end,.related_article';

    const site = SITE_HOSTS.find(({ pattern }) => pattern.test(location.hostname))?.name;
    if (!site) return { error: 'no site' };

    let best = null;
    let bestLen = 0;
    for (const sel of SITE_BODY[site]) {
      for (const el of document.querySelectorAll(sel)) {
        const len = el.textContent?.trim().length ?? 0;
        if (len > bestLen) {
          bestLen = len;
          best = el;
        }
      }
    }
    if (!best) return { error: 'no root', site };

    const clone = best.cloneNode(true);
    clone.querySelectorAll(NOISE).forEach((el) => el.remove());
    const blocks = [];
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const text = node.textContent?.trim();
      if (text && text.length > 1) blocks.push(text);
      node = walker.nextNode();
    }
    const text = blocks.join('\n').replace(/\n{3,}/g, '\n\n').trim();

    let title = document.title.replace(/\s*[\|｜\-－].*$/, '').trim();
    for (const sel of SITE_TITLE[site]) {
      const t = document.querySelector(sel)?.textContent?.trim();
      if (t && t.length > 3) {
        title = t;
        break;
      }
    }

    return {
      site,
      bestLen,
      textLen: text.length,
      ok: text.length >= 80,
      title,
      preview: text.slice(0, 150),
    };
  });
}

console.log('domcontentloaded', await runExtract());
await page.waitForTimeout(500);
console.log('+500ms', await runExtract());
await page.waitForLoadState('networkidle');
console.log('networkidle', await runExtract());

await browser.close();
