const url = 'https://web.gekisaka.jp/news/jleague/detail/?348529-348529-fl';
const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
const html = await res.text();
console.log('final url', res.url);
console.log('pathname', new URL(res.url).pathname);
console.log('includes /news/detail', new URL(res.url).pathname.includes('/news/detail'));
console.log('includes /detail/', new URL(res.url).pathname.includes('/detail/'));

const selectors = [
  '.entry-body',
  '.geki_contents',
  '.article-body',
  'article',
  'h1',
  '[class*="entry"]',
  '[class*="article"]',
  'main',
];
for (const sel of selectors) {
  const count = (html.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('\\[', '[').replace('\\]', ']'), 'g')) || []).length;
  if (sel.includes('[')) {
    console.log(sel, html.includes('entry-body') ? 'entry-body text' : '', html.includes('geki_contents') ? 'geki' : '');
  } else {
    console.log(sel, html.includes(sel.slice(1)) ? 'found class fragment' : 'no');
  }
}

// class names with article content
const classes = [...html.matchAll(/class="([^"]{0,60})"/g)]
  .map((m) => m[1])
  .filter((c) => /body|content|article|entry|geki|text/i.test(c));
console.log('content classes', [...new Set(classes)].slice(0, 20));
