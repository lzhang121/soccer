export type SiteThemeId =
  | 'default'
  | 'soccer-king'
  | 'yahoo'
  | 'nhk'
  | 'gekisaka'
  | 'nikkansports'
  | 'hochi'
  | 'soccerdigest'
  | 'footballchannel';

export interface SiteTheme {
  id: SiteThemeId;
  badgeClass: string;
  headerClass: string;
  label: string;
}

const THEMES: Record<SiteThemeId, Omit<SiteTheme, 'id'>> = {
  default: {
    badgeClass: 'site-badge',
    headerClass: 'panel-header--theme-default',
    label: 'サッカーニュース',
  },
  'soccer-king': {
    badgeClass: 'site-badge site-badge--soccer-king',
    headerClass: 'panel-header--theme-soccer-king',
    label: 'サッカーキング',
  },
  yahoo: {
    badgeClass: 'site-badge site-badge--yahoo',
    headerClass: 'panel-header--theme-yahoo',
    label: 'Yahoo!ニュース',
  },
  nhk: {
    badgeClass: 'site-badge site-badge--nhk',
    headerClass: 'panel-header--theme-nhk',
    label: 'NHK',
  },
  gekisaka: {
    badgeClass: 'site-badge site-badge--gekisaka',
    headerClass: 'panel-header--theme-gekisaka',
    label: 'ゲキサカ',
  },
  nikkansports: {
    badgeClass: 'site-badge site-badge--nikkansports',
    headerClass: 'panel-header--theme-nikkansports',
    label: '日刊スポーツ',
  },
  hochi: {
    badgeClass: 'site-badge site-badge--hochi',
    headerClass: 'panel-header--theme-hochi',
    label: 'スポーツ報知',
  },
  soccerdigest: {
    badgeClass: 'site-badge site-badge--soccerdigest',
    headerClass: 'panel-header--theme-soccerdigest',
    label: 'サッカーダイジェスト',
  },
  footballchannel: {
    badgeClass: 'site-badge site-badge--footballchannel',
    headerClass: 'panel-header--theme-footballchannel',
    label: 'フットボールチャンネル',
  },
};

const SITE_THEME_BY_LABEL: Record<string, SiteThemeId> = {
  サッカーキング: 'soccer-king',
  'Yahoo!ニュース': 'yahoo',
  NHK: 'nhk',
  ゲキサカ: 'gekisaka',
  日刊スポーツ: 'nikkansports',
  スポーツ報知: 'hochi',
  サッカーダイジェスト: 'soccerdigest',
  フットボールチャンネル: 'footballchannel',
};

export function getSiteThemeId(site?: string): SiteThemeId {
  if (!site) return 'default';
  if (SITE_THEME_BY_LABEL[site]) return SITE_THEME_BY_LABEL[site];
  if (site.includes('サッカーキング') || site.includes('soccer-king')) return 'soccer-king';
  if (site.includes('Yahoo')) return 'yahoo';
  if (site.includes('NHK')) return 'nhk';
  if (site.includes('ゲキサカ')) return 'gekisaka';
  if (site.includes('日刊')) return 'nikkansports';
  if (site.includes('報知')) return 'hochi';
  if (site.includes('ダイジェスト')) return 'soccerdigest';
  if (site.includes('フットボールチャンネル')) return 'footballchannel';
  return 'default';
}

export function getSiteTheme(site?: string): SiteTheme {
  const id = getSiteThemeId(site);
  return { id, ...THEMES[id] };
}

export function getSiteBadgeClass(site: string): string {
  return getSiteTheme(site).badgeClass;
}

export const DEFAULT_TICKER_ITEMS = [
  'Jリーグ',
  '速報要約',
  '3行サマリー',
  '選手紹介',
  '用語解説',
  'サッカーニュース',
];

export const SUPPORTED_SITE_LABELS = [
  'サッカーキング',
  'Yahoo!ニュース',
  'NHK',
  'ゲキサカ',
  '日刊スポーツ',
  'スポーツ報知',
  'サッカーダイジェスト',
  'フットボールチャンネル',
] as const;
