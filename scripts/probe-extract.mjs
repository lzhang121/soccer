import { Window } from 'happy-dom';

const samples = {
  yahoo: {
    url: 'https://news.yahoo.co.jp/articles/977c1d527cc31d02385018bde66ff5f7be092912',
    selectors: ['[data-ual-gid="article-body"]', '.article_body', '.article-body', 'article'],
  },
  hochi: {
    url: 'https://hochi.news/articles/20260527-OHT1T51064.html',
    selectors: ['.preview__detail', '.article__wrap', '.preview__wrap', 'article'],
  },
  nikkan: {
    url: 'https://www.nikkansports.com/soccer/japan/news/202605270000376.html',
    selectors: ['.article-body', '.article-main', 'article'],
  },
  gekisaka: {
    url: 'https://web.gekisaka.jp/news/detail/?348529-348529-fl',
    selectors: ['.entry-body', '.geki_contents', 'article'],
  },
  digest: {
    url: 'https://www.soccerdigestweb.com/news/detail/12345',
    selectors: ['.content_detail', 'article'],
  },
  fc: {
    url: 'https://www.footballchannel.jp/2025/05/22/post721179/',
    selectors: ['.entry_body', '.entry', 'article'],
  },
};

const NOISE =
  'script,style,noscript,nav,aside,footer,body > header,[role="navigation"],[class*="related"],[class*="recommend"],[class*="share"],[class*="infeed"],[class*="popin"],[class*="comment"]';

function extract(html, selectors) {
  const window = new Window();
  window.document.write(html);
  let root = null;
  let matched = null;
  for (const selector of selectors) {
    root = window.document.querySelector(selector);
    if (root) {
      matched = selector;
      break;
    }
  }
  if (!root) return { len: 0, matched: null };
  const clone = root.cloneNode(true);
  clone.querySelectorAll(NOISE).forEach((el) => el.remove());
  const text = clone.textContent.replace(/\s+/g, ' ').trim();
  return { len: text.length, matched, preview: text.slice(0, 100) };
}

for (const [name, { url, selectors }] of Object.entries(samples)) {
  const res = await fetch(url);
  const html = await res.text();
  console.log(name, extract(html, selectors));
}
