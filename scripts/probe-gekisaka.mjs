const urls = [
  'https://web.gekisaka.jp/news/detail/?348529-348529-fl',
  'https://web.gekisaka.jp/',
  'https://web.gekisaka.jp/news/',
];

for (const url of urls) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
  });
  const html = await res.text();
  const links = [...html.matchAll(/href="(\/news\/detail\/[^"]+|https:\/\/web\.gekisaka\.jp\/news\/detail\/[^"]+)"/g)]
    .map((m) => m[1])
    .slice(0, 5);
  const other = [...html.matchAll(/href="(\/[^"]*detail[^"]*)"/g)]
    .map((m) => m[1])
    .filter((l) => !l.includes('news/detail'))
    .slice(0, 10);
  console.log(url, 'status', res.status, 'final', res.url);
  console.log('  detail links', links);
  console.log('  other detail', other);
}

// probe article page selectors
const articleUrl = 'https://web.gekisaka.jp/news/detail/?348529-348529-fl';
const html = await (await fetch(articleUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
for (const sel of ['.entry-body', '.geki_contents', 'article', 'h1.entry-title']) {
  const re = new RegExp(sel.replace('.', '\\.'));
  console.log(sel, re.test(html) ? 'in html' : 'missing');
}
