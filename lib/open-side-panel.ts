import { sidePanelPathForTab } from '@/lib/tab-context';

const LAST_ARTICLE_TAB_KEY = 'lastArticleTabId';

export async function rememberArticleTab(tabId: number): Promise<void> {
  await browser.storage.session.set({ [LAST_ARTICLE_TAB_KEY]: tabId });
}

export async function prepareSidePanelForTab(tabId: number): Promise<void> {
  await rememberArticleTab(tabId);
  await browser.sidePanel
    .setOptions({
      tabId,
      path: sidePanelPathForTab(tabId),
      enabled: true,
    })
    .catch(() => undefined);
}

export async function enableOpenSidePanelOnActionClick(): Promise<void> {
  try {
    await browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch {
    // Firefox and older Chromium builds may not support sidePanel behavior.
  }
}

export async function getRememberedArticleTabId(): Promise<number | null> {
  const stored = await browser.storage.session.get(LAST_ARTICLE_TAB_KEY);
  const id = stored[LAST_ARTICLE_TAB_KEY];
  return typeof id === 'number' ? id : null;
}
