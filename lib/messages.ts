import type { ArticleData } from '@/lib/extractors';
import { injectExtractArticle } from '@/lib/inject-article';
import { normalizeArticleUrl } from '@/lib/url';

export type MessageType =
  | { type: 'GET_ARTICLE' }
  | { type: 'ARTICLE'; data: ArticleData }
  | { type: 'ARTICLE_NOT_FOUND'; url: string }
  | { type: 'UNSUPPORTED_SITE'; url: string }
  | { type: 'HIGHLIGHT_KEYWORD'; keyword: string }
  | { type: 'HIGHLIGHT_RESULT'; count: number };

export type RuntimeMessage =
  | MessageType
  | { type: 'ARTICLE_URL_CHANGED'; url: string; tabId?: number }
  | { type: 'FETCH_TAB_ARTICLE'; preferredTabId?: number | null };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendGetArticle(tabId: number): Promise<MessageType | null> {
  const response = (await browser.tabs.sendMessage(tabId, {
    type: 'GET_ARTICLE',
  })) as MessageType | undefined;

  return response ?? null;
}

export async function fetchArticleFromTab(tabId: number): Promise<ArticleData | null> {
  const maxAttempts = 4;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await sendGetArticle(tabId);
      if (response?.type === 'ARTICLE') return response.data;
      if (response?.type === 'ARTICLE_NOT_FOUND' && attempt >= 2) break;
    } catch {
      // Content script may not be ready yet (page loading / SPA).
    }

    if (attempt < maxAttempts - 1) {
      await sleep(500);
    }
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const injected = await injectExtractArticle(tabId);
    if (injected) return injected;
    if (attempt < 2) await sleep(600);
  }

  return null;
}

export async function highlightKeywordInTab(
  tabId: number,
  keyword: string,
): Promise<number> {
  try {
    const response = (await browser.tabs.sendMessage(tabId, {
      type: 'HIGHLIGHT_KEYWORD',
      keyword,
    })) as MessageType | undefined;
    if (response?.type === 'HIGHLIGHT_RESULT') return response.count;
  } catch {
    return 0;
  }
  return 0;
}

export async function getActiveTabArticle(preferredTabId?: number | null): Promise<{
  article: ArticleData | null;
  tabUrl: string;
  tabId: number | null;
  hint?: string;
}> {
  try {
    const response = (await browser.runtime.sendMessage({
      type: 'FETCH_TAB_ARTICLE',
      preferredTabId,
    })) as
      | {
          article: ArticleData | null;
          tabUrl: string;
          tabId: number | null;
          hint?: string;
        }
      | undefined;
    if (response) return response;
  } catch {
    // Fall back when messaging fails (e.g. unit tests).
  }

  const { fetchTabArticle } = await import('@/lib/fetch-tab-article');
  return fetchTabArticle(preferredTabId);
}

export function articleUrlsMatch(a: string, b: string): boolean {
  return normalizeArticleUrl(a) === normalizeArticleUrl(b);
}
