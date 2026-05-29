import '@/assets/shared.css';
import './App.css';
import footballIcon from '@/assets/football.svg';

import { SUPPORTED_SITE_LABELS } from '@/lib/site-styles';
import { prepareSidePanelForTab } from '@/lib/open-side-panel';

function openSidePanel(): void {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id || tab.windowId === undefined) return;

    void prepareSidePanelForTab(tab.id);
    // Callback (not async/await) keeps the popup click user-gesture for sidePanel.open().
    void browser.sidePanel.open({ windowId: tab.windowId }).catch(() => undefined);
  });
}

function openOptions() {
  void browser.runtime.openOptionsPage();
}

export default function App() {
  return (
    <>
      <div className="popup-strip" />
      <div className="container popup">
        <div className="popup__brand">
          <img src={footballIcon} alt="" className="popup__icon" />
          <h1>サッカー速読</h1>
        </div>
        <p className="muted">3行でサッカーニュースを速読</p>
        <p className="muted">記事ページではアイコン1クリックで Side Panel が開きます</p>
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={openSidePanel}>
            Side Panel を開く
          </button>
          <button type="button" className="btn" onClick={openOptions}>
            AI 設定
          </button>
        </div>
        <p className="muted sites">{SUPPORTED_SITE_LABELS.slice(0, 4).join(' · ')} ほか</p>
      </div>
    </>
  );
}
