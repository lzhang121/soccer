import type { ArticleData } from '@/lib/extractors';
import { fetchArticleFromTab } from '@/lib/messages';
import { isSupportedArticleUrl } from '@/lib/supported-urls';
import { describeTabForArticleHint, resolveArticleTab } from '@/lib/tab-context';

export interface FetchTabArticleResult {
  article: ArticleData | null;
  tabUrl: string;
  tabId: number | null;
  hint?: string;
}

export async function fetchTabArticle(
  preferredTabId?: number | null,
): Promise<FetchTabArticleResult> {
  const tab = await resolveArticleTab(preferredTabId);
  if (!tab?.id || !tab.url) {
    return {
      article: null,
      tabUrl: '',
      tabId: null,
      hint: describeTabForArticleHint(''),
    };
  }

  if (!isSupportedArticleUrl(tab.url)) {
    return {
      article: null,
      tabUrl: tab.url,
      tabId: tab.id,
      hint: describeTabForArticleHint(tab.url),
    };
  }

  const article = await fetchArticleFromTab(tab.id);
  if (article) {
    return { article, tabUrl: tab.url, tabId: tab.id };
  }

  return {
    article: null,
    tabUrl: tab.url,
    tabId: tab.id,
    hint: describeTabForArticleHint(tab.url),
  };
}
