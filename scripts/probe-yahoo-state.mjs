import { Window } from 'happy-dom';

const url =
  'https://news.yahoo.co.jp/articles/692b8b222f6f3c96f702d10ea9c83eb3e8cd7e73';

const res = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
});
const html = await res.text();

const m = html.match(/window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\});/);
if (!m) {
  console.log('no preloaded state');
  process.exit(1);
}

const state = JSON.parse(m[1]);
const article = state?.articleDetail?.article ?? state?.article ?? state?.detail;
console.log('top keys', Object.keys(state));
console.log('article keys', article ? Object.keys(article) : 'none');

function findParagraphs(obj, path = '') {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj.paragraphs) && obj.paragraphs.length) {
    console.log('paragraphs at', path, 'count', obj.paragraphs.length);
    const texts = [];
    for (const p of obj.paragraphs) {
      if (typeof p.text === 'string') texts.push(p.text);
      if (Array.isArray(p.objectItems)) {
        for (const item of p.objectItems) {
          if (typeof item.text === 'string') texts.push(item.text);
          if (typeof item.caption === 'string') texts.push(item.caption);
        }
      }
    }
    console.log('text len', texts.join('\n').length);
    console.log('preview', texts.join('\n').slice(0, 200));
  }
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object') findParagraphs(v, `${path}.${k}`);
  }
}

findParagraphs(state);

// og meta fallback
const window = new Window();
window.document.write(html);
const ogTitle = window.document.querySelector('meta[property="og:title"]')?.getAttribute('content');
const ogDesc = window.document.querySelector('meta[property="og:description"]')?.getAttribute('content');
console.log('og:title', ogTitle);
console.log('og:desc len', ogDesc?.length);
