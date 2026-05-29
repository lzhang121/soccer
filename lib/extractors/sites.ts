export interface ArticleData {
  url: string;
  title: string;
  text: string;
  site: string;
}

export interface SiteExtractConfig {
  id: string;
  /** Label shown in Side Panel badge */
  name: string;
  hostPattern: RegExp;
  matchPatterns: string[];
  titleSelectors: string[];
  bodySelectors: string[];
  isArticlePath: (pathname: string) => boolean;
}

function rejectListOrSearch(pathname: string): boolean {
  return !pathname.endsWith('/search') && !pathname.includes('/list');
}

function isGekisakaArticlePath(pathname: string): boolean {
  if (pathname.includes('/datadisp/')) return false;
  if (pathname.includes('/pickup/detail')) return true;
  if (pathname.includes('/news/detail')) return true;
  return /\/news\/[^/]+\/detail\//.test(pathname);
}

export const SITE_CONFIGS: SiteExtractConfig[] = [
  {
    id: 'soccer-king',
    name: 'サッカーキング',
    hostPattern: /(^|\.)soccer-king\.jp$/i,
    matchPatterns: ['*://*.soccer-king.jp/*'],
    titleSelectors: ['h1'],
    bodySelectors: [
      'article .article-body',
      'article',
      '.article-body',
      '.entry-content',
    ],
    isArticlePath: (pathname) => pathname.length >= 5 && rejectListOrSearch(pathname),
  },
  {
    id: 'yahoo',
    name: 'Yahoo!ニュース',
    hostPattern: /(^|\.)news\.yahoo\.co\.jp$/i,
    matchPatterns: ['*://news.yahoo.co.jp/*', '*://*.news.yahoo.co.jp/*'],
    titleSelectors: [
      'meta[property="og:title"]',
      'article h1',
      '[data-ual-gid="article-title"]',
      'h1',
    ],
    bodySelectors: [
      '.article_body.highLightSearchTarget',
      '.article_body',
      'article .article_body',
      '[data-ual-gid="article-body"]',
      '.article-body',
    ],
    isArticlePath: (pathname) =>
      pathname.includes('/articles/') || pathname.includes('/pickup/'),
  },
  {
    id: 'nhk',
    name: 'NHK',
    hostPattern: /(^|\.)nhk\.or\.jp$/i,
    matchPatterns: ['*://*.nhk.or.jp/*'],
    titleSelectors: ['.content--title', 'article h1', 'h1'],
    bodySelectors: ['.content--body', 'article .content--body', 'article'],
    isArticlePath: (pathname) => pathname.length >= 5 && rejectListOrSearch(pathname),
  },
  {
    id: 'gekisaka',
    name: 'ゲキサカ',
    hostPattern: /(^|\.)gekisaka\.jp$/i,
    matchPatterns: ['*://web.gekisaka.jp/*', '*://*.gekisaka.jp/*'],
    titleSelectors: ['h1.entry-title', 'h1[itemprop="name"]', 'h1'],
    bodySelectors: ['.entry-body', '.geki_contents', 'article'],
    isArticlePath: isGekisakaArticlePath,
  },
  {
    id: 'nikkansports',
    name: '日刊スポーツ',
    hostPattern: /(^|\.)nikkansports\.com$/i,
    matchPatterns: ['*://www.nikkansports.com/*', '*://*.nikkansports.com/*'],
    titleSelectors: ['.article-title', 'h1'],
    bodySelectors: ['.article-body', '.article-main', 'article'],
    isArticlePath: (pathname) => /\/news\/\d+\.html/.test(pathname),
  },
  {
    id: 'hochi',
    name: 'スポーツ報知',
    hostPattern: /(^|\.)hochi\.news$/i,
    matchPatterns: ['*://hochi.news/*', '*://*.hochi.news/*'],
    titleSelectors: ['h1.preview__title', 'h1'],
    bodySelectors: ['.preview__detail', '.preview__wrap', '.article__wrap', 'article'],
    isArticlePath: (pathname) => pathname.startsWith('/articles/'),
  },
  {
    id: 'soccerdigest',
    name: 'サッカーダイジェスト',
    hostPattern: /(^|\.)soccerdigestweb\.com$/i,
    matchPatterns: ['*://www.soccerdigestweb.com/*', '*://*.soccerdigestweb.com/*'],
    titleSelectors: ['h2', '.news_header h2', 'h1'],
    bodySelectors: ['.news_body .content_detail', '.content_detail', 'main', 'article'],
    isArticlePath: (pathname) => pathname.includes('/news/detail'),
  },
  {
    id: 'footballchannel',
    name: 'フットボールチャンネル',
    hostPattern: /(^|\.)footballchannel\.jp$/i,
    matchPatterns: ['*://www.footballchannel.jp/*', '*://*.footballchannel.jp/*'],
    titleSelectors: ['h1.entry_title', 'h1'],
    bodySelectors: ['.entry_body', '.entry', 'article'],
    isArticlePath: (pathname) => /\/post\d+/.test(pathname),
  },
];

export type SupportedSite = Pick<SiteExtractConfig, 'id' | 'name' | 'hostPattern'>;

export const SUPPORTED_SITES: SupportedSite[] = SITE_CONFIGS.map(
  ({ id, name, hostPattern }) => ({ id, name, hostPattern }),
);

export function detectSiteConfig(url: string): SiteExtractConfig | null {
  try {
    const host = new URL(url).hostname;
    return SITE_CONFIGS.find((site) => site.hostPattern.test(host)) ?? null;
  } catch {
    return null;
  }
}

export function getMatchPatterns(): string[] {
  return [...new Set(SITE_CONFIGS.flatMap((site) => site.matchPatterns))];
}

export function isArticlePath(url: string): boolean {
  try {
    const { pathname } = new URL(url);
    if (pathname === '/' || pathname.length < 5) return false;
    const site = detectSiteConfig(url);
    if (!site) return false;
    return site.isArticlePath(pathname);
  } catch {
    return false;
  }
}

export function pickBestElement(selectors: string[]): Element | null {
  let best: Element | null = null;
  let bestLen = 0;

  for (const selector of selectors) {
    for (const element of document.querySelectorAll(selector)) {
      const len = element.textContent?.trim().length ?? 0;
      if (len > bestLen) {
        bestLen = len;
        best = element;
      }
    }
  }

  return best;
}

export function pickFirstElement(selectors: string[]): Element | null {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  return null;
}

const GENERIC_TITLE_LABELS = /^Yahoo!ニュース$/;

function normalizeTitleCandidate(raw: string): string {
  return raw
    .replace(/\s*（[^）]*）\s*$/, '')
    .replace(/\s*-\s*Yahoo!.*$/i, '')
    .trim();
}

export function pickTitle(selectors: string[]): string {
  for (const selector of selectors) {
    if (selector.startsWith('meta[')) {
      const content = document.querySelector(selector)?.getAttribute('content')?.trim();
      if (content && content.length > 5 && !GENERIC_TITLE_LABELS.test(content)) {
        return normalizeTitleCandidate(content);
      }
      continue;
    }

    if (selector === 'h1' || selector.includes(' h1')) {
      const nodes = [...document.querySelectorAll(selector)];
      let best = '';
      for (const node of nodes) {
        const text = node.textContent?.trim();
        if (!text || text.length <= 3 || GENERIC_TITLE_LABELS.test(text)) continue;
        if (text.length > best.length) best = text;
      }
      if (best) return best;
      continue;
    }

    const text = document.querySelector(selector)?.textContent?.trim();
    if (text && text.length > 3 && !GENERIC_TITLE_LABELS.test(text)) {
      return text;
    }
  }

  return normalizeTitleCandidate(document.title);
}
