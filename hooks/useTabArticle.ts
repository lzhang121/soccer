import { useCallback, useEffect, useRef, useState } from 'react';
import type { ArticleData } from '@/lib/extractors';
import { getActiveTabArticle } from '@/lib/messages';
import { getRememberedArticleTabId } from '@/lib/open-side-panel';
import { getSidePanelPinnedTabId } from '@/lib/tab-context';
import { normalizeArticleUrl } from '@/lib/url';

export interface LoadArticleResult {
  article: ArticleData | null;
  hint: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Load article once on panel open; further loads are manual (再生成). */
export function useTabArticle() {
  const pinnedTabId = getSidePanelPinnedTabId();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [tabUrl, setTabUrl] = useState('');
  const [tabId, setTabId] = useState<number | null>(null);
  const [articleHint, setArticleHint] = useState('');
  const [loading, setLoading] = useState(false);
  const lastLoadedUrl = useRef('');

  const loadArticle = useCallback(async (force = false): Promise<LoadArticleResult> => {
    setLoading(true);
    try {
      let data: ArticleData | null = null;
      let url = '';
      let id: number | null = null;
      let hint = '';

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const preferredTabId =
          pinnedTabId ?? (await getRememberedArticleTabId());
        const response = await getActiveTabArticle(preferredTabId);
        data = response.article;
        url = response.tabUrl;
        id = response.tabId;
        hint = response.hint ?? '';

        if (data || url || attempt === 2) break;
        await sleep(350);
      }

      setTabUrl(url);
      setTabId(id);
      setArticleHint(hint);

      const normalized = normalizeArticleUrl(url);
      if (!force && data && lastLoadedUrl.current === normalized) {
        setArticle(data);
        return { article: data, hint };
      }

      lastLoadedUrl.current = normalized;
      setArticle(data);
      return { article: data, hint };
    } finally {
      setLoading(false);
    }
  }, [pinnedTabId]);

  useEffect(() => {
    void loadArticle();
  }, [loadArticle]);

  return { article, tabUrl, tabId, loading, articleHint, loadArticle };
};
