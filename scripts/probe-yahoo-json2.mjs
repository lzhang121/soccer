import { writeFileSync } from 'node:fs';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const res = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
});
const html = await res.text();

// Find embedded JSON with article paragraphs
const needles = ['北京共同', 'articleBody', 'paragraphs', 'shannon', 'contents'];
for (const n of needles) {
  let idx = 0;
  let count = 0;
  while ((idx = html.indexOf(n, idx)) !== -1 && count < 3) {
    console.log(n, 'at', idx, ':', html.slice(Math.max(0, idx - 40), idx + 120).replace(/\s+/g, ' '));
    idx += n.length;
    count++;
  }
}

// window.__PRELOADED_STATE__ or similar
for (const m of html.matchAll(/window\.([A-Z_]+)\s*=\s*(\{[\s\S]{0,200})/g)) {
  console.log('window var', m[1], m[2].slice(0, 100));
}

writeFileSync('scripts/yahoo-full.html', html);
