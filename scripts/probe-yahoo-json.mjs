import { writeFileSync } from 'node:fs';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const res = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
});
const html = await res.text();

const patterns = [
  /article_body/g,
  /article-body/g,
  /articleBody/g,
  /ual-gid/g,
  /data-ual/g,
  /NewsArticle/g,
  /articleText/g,
  /bodyText/g,
  /paragraph/g,
];

for (const re of patterns) {
  const m = html.match(re);
  console.log(re, m ? m.length + ' matches' : 'none');
}

// find script tags with article content
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]{0,500}?北京[\s\S]{0,500}?)<\/script>/g)];
console.log('scripts with 北京:', scripts.length);
for (const s of scripts.slice(0, 2)) {
  console.log('---', s[1].slice(0, 300));
}

// article_body context
const idx = html.indexOf('article_body');
if (idx >= 0) {
  console.log('article_body context:', html.slice(idx - 100, idx + 500));
}

// all ld+json blocks
for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  try {
    const j = JSON.parse(m[1]);
    console.log('ld+json:', j['@type'], Object.keys(j));
    if (j.description) console.log('desc len', j.description.length);
  } catch {}
}

writeFileSync('scripts/yahoo-sample.html', html.slice(0, 50000));
