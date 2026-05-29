const url = 'https://web.gekisaka.jp/news/jleague/detail/?348529-348529-fl';
const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
const html = await res.text();
const m = html.match(/class="entry-body"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
const text = m ? m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
console.log('entry-body text len', text.length, text.slice(0, 120));
const h1 = html.match(/class="entry-title"[^>]*>([\s\S]*?)<\/h1>/);
console.log('title', h1 ? h1[1].replace(/<[^>]+>/g, '').trim() : 'none');
