import { syncActionPopupForTab, syncActiveTabActionPopup } from '@/lib/action-popup';
import { fetchTabArticle } from '@/lib/fetch-tab-article';
import {
  enableOpenSidePanelOnActionClick,
  prepareSidePanelForTab,
  rememberArticleTab,
} from '@/lib/open-side-panel';
import { isSupportedArticleUrl } from '@/lib/supported-urls';
import { sidePanelPathForTab } from '@/lib/tab-context';
import { loadPreferences } from '@/lib/storage/preferences';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'FETCH_TAB_ARTICLE') {
      void fetchTabArticle(message.preferredTabId).then(sendResponse);
      return true;
    }
    return undefined;
  });

  browser.action.onClicked.addListener((tab) => {
    if (tab.id == null || !tab.url || !isSupportedArticleUrl(tab.url)) return;
    void prepareSidePanelForTab(tab.id);
  });

  browser.runtime.onInstalled.addListener(() => {
    browser.sidePanel
      .setOptions({ path: 'sidepanel.html', enabled: true })
      .catch(() => undefined);
    void enableOpenSidePanelOnActionClick();
    void syncActiveTabActionPopup();
  });

  browser.runtime.onStartup.addListener(() => {
    void enableOpenSidePanelOnActionClick();
    void syncActiveTabActionPopup();
  });

  browser.tabs.onActivated.addListener(({ tabId }) => {
    void browser.tabs.get(tabId).then(async (tab) => {
      await syncActionPopupForTab(tabId, tab.url);
      if (tab.url && isSupportedArticleUrl(tab.url)) {
        await rememberArticleTab(tabId);
      }
    });
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.status === 'complete') {
      void syncActionPopupForTab(tabId, tab.url);
    }

    if (changeInfo.status !== 'complete' || !tab.url) return;

    void (async () => {
      if (isSupportedArticleUrl(tab.url!)) {
        await rememberArticleTab(tabId);
      }

      const prefs = await loadPreferences();
      if (!prefs.autoEnableSidePanel) return;
      if (!isSupportedArticleUrl(tab.url!)) return;

      await browser.sidePanel
        .setOptions({
          tabId,
          path: sidePanelPathForTab(tabId),
          enabled: true,
        })
        .catch(() => undefined);
    })();
  });
});
