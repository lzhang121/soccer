import { Window } from 'happy-dom';

const url =
  process.argv[2] ??
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const res = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
});
const html = await res.text();
console.log('status', res.status, 'length', html.length);

const markers = [
  'data-ual-gid="article-body"',
  'data-ual-gid="article-title"',
  'class="article_body"',
  'class="article-body"',
  '<article',
  '__NEXT_DATA__',
  'application/ld+json',
  'ArticleBody',
  'articleBody',
];

for (const m of markers) {
  console.log(m, html.includes(m) ? 'YES' : 'no');
}

const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (ldMatch) {
  try {
    const json = JSON.parse(ldMatch[1]);
    console.log('ld+json type:', json['@type'], 'body len:', json.articleBody?.length ?? json.description?.length);
    console.log('ld title:', json.headline ?? json.name);
  } catch (e) {
    console.log('ld+json parse fail');
  }
}

const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (nextMatch) {
  try {
    const data = JSON.parse(nextMatch[1]);
    console.log('__NEXT_DATA__ keys:', Object.keys(data));
    const pageProps = data.props?.pageProps;
    console.log('pageProps keys:', pageProps ? Object.keys(pageProps) : null);
  } catch (e) {
    console.log('next parse fail');
  }
}

const selectors = [
  '[data-ual-gid="article-body"]',
  '[data-ual-gid="article-title"]',
  '.article_body',
  '.article-body',
  'article',
  'main',
  '[class*="Article"]',
  '[class*="article"]',
  'h1',
];

const window = new Window();
window.document.write(html);

for (const sel of selectors) {
  const nodes = window.document.querySelectorAll(sel);
  if (nodes.length === 0) {
    console.log(sel, '-> 0');
    continue;
  }
  const lengths = [...nodes].map((n) => n.textContent?.trim().length ?? 0);
  const max = Math.max(...lengths);
  console.log(sel, '->', nodes.length, 'max len', max, 'preview:', [...nodes].find((n) => (n.textContent?.trim().length ?? 0) === max)?.textContent?.trim().slice(0, 80));
}
