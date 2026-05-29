import { useCallback, useEffect, useRef, useState } from 'react';
import { AiError, getEffectiveModel, hasApiKey, summarize, type SummarizeResult } from '@/lib/ai';
import type { AiSettings } from '@/lib/ai/types';
import { getCachedResult, setCachedResult } from '@/lib/cache';
import type { ArticleData } from '@/lib/extractors';
import type { LoadArticleResult } from '@/hooks/useTabArticle';
import { normalizeArticleUrl } from '@/lib/url';

type LoadState = 'idle' | 'loading' | 'error' | 'ready' | 'no-key' | 'no-article';

interface UseSummarizeOptions {
  settings: AiSettings | null;
  article: ArticleData | null;
  articleLoading: boolean;
  onLoadArticle: (force?: boolean) => Promise<LoadArticleResult>;
}

function clearSummaryState(
  setResult: (value: SummarizeResult | null) => void,
  setStreamingPartial: (value: Partial<SummarizeResult> | null) => void,
) {
  setResult(null);
  setStreamingPartial(null);
}

export function useSummarize({
  settings,
  article,
  articleLoading,
  onLoadArticle,
}: UseSummarizeOptions) {
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [state, setState] = useState<LoadState>('idle');
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);
  const [freshAnimate, setFreshAnimate] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [streamingPartial, setStreamingPartial] = useState<Partial<SummarizeResult> | null>(null);

  const inFlightKey = useRef('');

  const runSummarize = useCallback(
    async (
      force = false,
      articleOverride?: ArticleData,
      options?: { keepPreviousOnFailure?: boolean },
    ): Promise<boolean> => {
      if (!settings) return false;

      const keepPrevious = options?.keepPreviousOnFailure ?? false;
      const previousResult = keepPrevious ? result : null;

      if (!hasApiKey(settings)) {
        if (!previousResult) {
          setState('no-key');
          clearSummaryState(setResult, setStreamingPartial);
        }
        return false;
      }

      const loaded =
        articleOverride != null
          ? { article: articleOverride, hint: '' }
          : article
            ? { article, hint: '' }
            : await onLoadArticle();
      const data = loaded.article;
      if (!data) {
        if (previousResult) return false;
        setState('no-article');
        clearSummaryState(setResult, setStreamingPartial);
        return false;
      }

      const model = getEffectiveModel(settings);
      const requestKey = `${normalizeArticleUrl(data.url)}|${settings.provider}|${model}`;

      if (!force && inFlightKey.current === requestKey) {
        return false;
      }

      inFlightKey.current = requestKey;
      setState('loading');
      setError('');
      setFromCache(false);
      setCelebrate(false);
      setFreshAnimate(false);
      setStreamingPartial(null);

      if (!keepPrevious) {
        clearSummaryState(setResult, setStreamingPartial);
      }

      if (!force) {
        const cached = await getCachedResult(data.url, settings.provider, model);
        if (cached) {
          inFlightKey.current = '';
          setResult(cached);
          setState('ready');
          setFromCache(true);
          setFreshAnimate(false);
          setStreamingPartial(null);
          return true;
        }
      }

      try {
        setStreamingPartial({});
        const summary = await summarize(
          {
            article: data.text,
            title: data.title,
            settings,
          },
          {
            onPartial: (partial) => setStreamingPartial(partial),
          },
        );
        await setCachedResult(data.url, settings.provider, model, summary);
        inFlightKey.current = '';
        setResult(summary);
        setState('ready');
        setFromCache(false);
        setFreshAnimate(true);
        setCelebrate(true);
        setStreamingPartial(null);
        window.setTimeout(() => setCelebrate(false), 900);
        return true;
      } catch (err) {
        inFlightKey.current = '';
        if (previousResult) {
          setResult(previousResult);
          setState('ready');
          setStreamingPartial(null);
          setError(err instanceof AiError ? err.message : '要約に失敗しました');
          return false;
        }
        setState('error');
        clearSummaryState(setResult, setStreamingPartial);
        setError(err instanceof AiError ? err.message : '要約に失敗しました');
        return false;
      }
    },
    [article, onLoadArticle, result, settings],
  );

  // Keep empty-state flags in sync; summarize runs only from user actions.
  useEffect(() => {
    if (!settings || articleLoading || result) return;

    if (!hasApiKey(settings)) {
      setState('no-key');
      return;
    }

    if (!article) {
      setState('no-article');
    }
  }, [settings, article, articleLoading, result]);

  return {
    result,
    state,
    error,
    fromCache,
    freshAnimate,
    celebrate,
    streamingPartial,
    runSummarize,
  };
};
