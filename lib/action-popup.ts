import { rememberArticleTab } from '@/lib/open-side-panel';
import { isSupportedArticleUrl } from '@/lib/supported-urls';
import { resolveArticleTab, sidePanelPathForTab } from '@/lib/tab-context';

export const ACTION_POPUP_PATH = 'popup.html';

async function enableSidePanelForArticleTab(tabId: number): Promise<void> {
  try {
    await browser.sidePanel.setOptions({
      tabId,
      path: sidePanelPathForTab(tabId),
      enabled: true,
    });
  } catch {
    // Firefox may not support sidePanel.
  }
}

/** On supported article pages, clear popup so the icon opens Side Panel directly. */
export async function syncActionPopupForTab(tabId: number, url?: string): Promise<void> {
  if (!url?.startsWith('http')) return;

  const popup = isSupportedArticleUrl(url) ? '' : ACTION_POPUP_PATH;

  if (isSupportedArticleUrl(url)) {
    await enableSidePanelForArticleTab(tabId);
    await rememberArticleTab(tabId);
  }

  try {
    await browser.action.setPopup({ tabId, popup });
  } catch {
    const browserAction = (
      browser as typeof browser & {
        browserAction?: { setPopup: typeof browser.action.setPopup };
      }
    ).browserAction;
    try {
      await browserAction?.setPopup({ tabId, popup });
    } catch {
      // Firefox MV2 may not support per-tab popup.
    }
  }
}

export async function syncActiveTabActionPopup(): Promise<void> {
  const tab = await resolveArticleTab();
  if (tab?.id !== undefined) {
    await syncActionPopupForTab(tab.id, tab.url);
  }
}
