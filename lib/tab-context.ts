import { detectSite, isArticlePath } from '@/lib/extractors';
import { isSupportedArticleUrl } from '@/lib/supported-urls';
import { SUPPORTED_SITE_LABELS } from '@/lib/site-styles';
import { getRememberedArticleTabId } from '@/lib/open-side-panel';

export function getSidePanelPinnedTabId(): number | null {
  const raw = new URLSearchParams(globalThis.location?.search ?? '').get('tabId');
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

/** Resolve the browser tab whose article the Side Panel should read. */
export async function resolveArticleTab(
  preferredTabId?: number | null,
): Promise<Browser.tabs.Tab | undefined> {
  if (preferredTabId != null) {
    try {
      const tab = await browser.tabs.get(preferredTabId);
      if (tab.url?.startsWith('http') && isSupportedArticleUrl(tab.url)) return tab;
    } catch {
      // Tab was closed.
    }
  }

  const remembered = await getRememberedArticleTabId();
  if (remembered != null && remembered !== preferredTabId) {
    try {
      const tab = await browser.tabs.get(remembered);
      if (tab.url?.startsWith('http') && isSupportedArticleUrl(tab.url)) return tab;
    } catch {
      // Tab was closed.
    }
  }

  const [lastFocused] = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (lastFocused?.url?.startsWith('http')) {
    if (isSupportedArticleUrl(lastFocused.url)) return lastFocused;
  }

  const windowTabs = await browser.tabs.query({ lastFocusedWindow: true });
  const supportedTabs = windowTabs.filter(
    (tab) => tab.url?.startsWith('http') && isSupportedArticleUrl(tab.url),
  );
  const activeSupported = supportedTabs.find((tab) => tab.active);
  if (activeSupported) return activeSupported;
  if (supportedTabs.length === 1) return supportedTabs[0];

  const [currentWindowTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  return currentWindowTab;
}

export function describeTabForArticleHint(tabUrl: string): string {
  if (!tabUrl) {
    return '記事タブが見つかりません。記事ページで拡張アイコンから Side Panel を開いてください。';
  }

  const site = detectSite(tabUrl);
  try {
    const host = new URL(tabUrl).hostname;
    if (site && !isArticlePath(tabUrl)) {
      return `${site.name} の記事詳細ページを開いてから「要約する」を押してください。`;
    }
    if (!site) {
      return `現在のタブ（${host}）は対応サイトではありません。${SUPPORTED_SITE_LABELS.slice(0, 3).join(' / ')} などの記事ページを開いてください。`;
    }
  } catch {
    if (!site) {
      return '対応サイトの記事ページを開いてから要約してください。';
    }
  }

  if (!isSupportedArticleUrl(tabUrl)) {
    return '対応サイトの記事ページを開いてから要約してください。';
  }

  let host = '';
  try {
    host = new URL(tabUrl).hostname;
  } catch {
    host = tabUrl;
  }
  return `記事本文を取得できませんでした（${host}）。ページを再読み込みしてから「要約する」を押してください。`;
}

export function sidePanelPathForTab(tabId: number): string {
  return `sidepanel.html?tabId=${tabId}`;
}
