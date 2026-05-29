import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ACTION_POPUP_PATH, syncActionPopupForTab } from '@/lib/action-popup';

describe('syncActionPopupForTab', () => {
  beforeEach(() => {
    vi.stubGlobal('browser', {
      action: {
        setPopup: vi.fn().mockResolvedValue(undefined),
      },
      sidePanel: {
        setOptions: vi.fn().mockResolvedValue(undefined),
      },
      storage: {
        session: {
          set: vi.fn().mockResolvedValue(undefined),
        },
      },
    });
  });

  it('clears popup on supported article URLs', async () => {
    await syncActionPopupForTab(
      1,
      'https://news.yahoo.co.jp/articles/abc123',
    );
    expect(browser.action.setPopup).toHaveBeenCalledWith({ tabId: 1, popup: '' });
  });

  it('restores popup on unsupported URLs', async () => {
    await syncActionPopupForTab(1, 'https://example.com/');
    expect(browser.action.setPopup).toHaveBeenCalledWith({
      tabId: 1,
      popup: ACTION_POPUP_PATH,
    });
  });

  it('ignores non-http URLs', async () => {
    await syncActionPopupForTab(1, 'chrome://extensions');
    expect(browser.action.setPopup).not.toHaveBeenCalled();
  });
});
