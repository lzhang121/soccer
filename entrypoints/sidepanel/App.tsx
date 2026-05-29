import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { getModelLabel, getProviderMeta } from '@/lib/ai';
import { Collapsible } from '@/components/Collapsible';
import { ProviderSwitcher } from '@/components/ProviderSwitcher';
import { ShareBar } from '@/components/ShareBar';
import { StreamingSummary } from '@/components/StreamingSummary';
import footballIcon from '@/assets/football.svg';
import { useSummarize } from '@/hooks/useSummarize';
import { useTabArticle } from '@/hooks/useTabArticle';
import { highlightKeywordInTab } from '@/lib/messages';
import { loadPreferences } from '@/lib/storage/preferences';
import { loadSettings, onSettingsChanged, updateProvider } from '@/lib/storage/settings';
import type { AiProvider, AiSettings } from '@/lib/ai/types';
import { DEFAULT_TICKER_ITEMS, SUPPORTED_SITE_LABELS, getSiteBadgeClass, getSiteTheme } from '@/lib/site-styles';
import { openExtensionPage } from '@/lib/extension-pages';

const PanelHeader = lazy(() =>
  import('@/components/PanelHeader').then((m) => ({ default: m.PanelHeader })),
);
const LoadingSkeleton = lazy(() =>
  import('@/components/LoadingSkeleton').then((m) => ({ default: m.LoadingSkeleton })),
);
const AnimatedSummary = lazy(() =>
  import('@/components/AnimatedResults').then((m) => ({ default: m.AnimatedSummary })),
);
const AnimatedTags = lazy(() =>
  import('@/components/AnimatedResults').then((m) => ({ default: m.AnimatedTags })),
);
const CelebrateBurst = lazy(() =>
  import('@/components/AnimatedResults').then((m) => ({ default: m.CelebrateBurst })),
);

function openOptions() {
  void openExtensionPage('/options.html', false);
}

function openPrivacy() {
  void openExtensionPage('/privacy.html', true);
}

async function copySummary(lines: string[]) {
  await navigator.clipboard.writeText(lines.join('\n'));
}

function MotionFallback() {
  return <div className="card card--glass muted" style={{ padding: 20 }}>読み込み中...</div>;
}

export default function App() {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  const [highlightHint, setHighlightHint] = useState('');
  const [manualHint, setManualHint] = useState('');

  const { article, tabUrl, tabId, loading: articleLoading, articleHint, loadArticle } = useTabArticle();
  const {
    result,
    state,
    error,
    fromCache,
    freshAnimate,
    celebrate,
    streamingPartial,
    runSummarize,
  } = useSummarize({
    settings,
    article,
    articleLoading,
    onLoadArticle: loadArticle,
  });

  useEffect(() => {
    void loadSettings().then(setSettings);
    return onSettingsChanged(setSettings);
  }, []);

  const providerMeta = settings ? getProviderMeta(settings.provider) : null;
  const siteTheme = getSiteTheme(article?.site);
  const modelLabel = settings ? getModelLabel(settings) : undefined;
  const hasSummary = Boolean(result && article);
  const isSummarizing = state === 'loading';
  const isInitializing = settings === null || (articleLoading && !article && !result);

  const tickerItems = useMemo(() => {
    if (result?.keywords.length) return result.keywords;
    if (streamingPartial?.keywords?.length) return streamingPartial.keywords;
    if (article?.title) {
      return article.title.split(/\s+/).slice(0, 6);
    }
    return DEFAULT_TICKER_ITEMS;
  }, [article?.title, result?.keywords, streamingPartial?.keywords]);

  const handleCopy = async () => {
    if (!result) return;
    await copySummary(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProviderChange = async (provider: AiProvider) => {
    if (!settings) return;
    const next = await updateProvider(settings, provider);
    setSettings(next);
  };

  const handleKeywordClick = async (keyword: string) => {
    if (!tabId) return;
    setActiveKeyword(keyword);
    const count = await highlightKeywordInTab(tabId, keyword);
    setHighlightHint(
      count > 0
        ? count === 1
          ? `「${keyword}」を記事内でハイライトしました`
          : `「${keyword}」を ${count} 箇所ハイライトしました`
        : `「${keyword}」が見つかりませんでした`,
    );
    setTimeout(() => setHighlightHint(''), 2500);
  };

  const handleManualSummarize = async (force: boolean) => {
    setManualHint('');

    if (force && result) {
      const prefs = await loadPreferences();
      if (
        prefs.confirmRegenerate &&
        !window.confirm('再生成すると API 利用料が発生する場合があります。続行しますか？')
      ) {
        return;
      }
    }

    const { article: data, hint } = await loadArticle(true);
    if (!data) {
      setManualHint(hint || articleHint || '記事ページを開いてから要約してください');
      return;
    }

    await runSummarize(force, data, { keepPreviousOnFailure: Boolean(result) });
  };

  const showStreaming =
    isSummarizing && (streamingPartial?.summary?.length ?? 0) > 0;
  const showSkeleton =
    isSummarizing &&
    !showStreaming &&
    !streamingPartial?.summary?.length &&
    !result;

  return (
    <div className={`container theme-${siteTheme.id}`}>
      <Suspense fallback={<MotionFallback />}>
        <PanelHeader
          siteTheme={siteTheme}
          tickerItems={tickerItems}
          providerLabel={providerMeta?.label}
          model={modelLabel}
          onSettings={openOptions}
        />
      </Suspense>

      {settings && (
        <ProviderSwitcher settings={settings} onChange={(p) => void handleProviderChange(p)} />
      )}

      <p className="muted manual-sync-hint">
        タブを切り替えても要約は変わりません。更新は「要約する / 再生成」から。
      </p>

      {isInitializing && (
        <Suspense fallback={<MotionFallback />}>
          <LoadingSkeleton />
          <p className="muted article-loading-hint">準備中...</p>
        </Suspense>
      )}

      {state === 'no-key' && !result && !isInitializing && (
        <div className="card card--glass fade-in">
          <div className="empty-state">
            <img src={footballIcon} alt="" className="empty-state__icon" />
            <p className="empty-state__title">API キーが必要です</p>
            <p className="muted">
              OpenAI / Claude / Groq / OpenRouter の API キーを設定してください。
            </p>
            <p className="muted privacy-note">
              記事本文はご自身の API キー経由で AI プロバイダーに直接送信されます。
            </p>
          </div>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={openOptions}>
              API キーを設定
            </button>
          </div>
        </div>
      )}

      {state === 'no-article' && !articleLoading && !result && !isInitializing && (
        <div className="card card--glass fade-in">
          <div className="empty-state">
            <img src={footballIcon} alt="" className="empty-state__icon" />
            <p className="empty-state__title">ピッチに出よう</p>
            <p className="muted">{SUPPORTED_SITE_LABELS.join(' / ')} の記事ページを開いてください</p>
            {articleHint && <p className="toast tag-toast">{articleHint}</p>}
          </div>
          <div className="actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handleManualSummarize(false)}
            >
              要約する
            </button>
          </div>
        </div>
      )}

      {article && (
        <div className="card card--glass card--accent fade-in">
          <span className={getSiteBadgeClass(article.site)}>{article.site}</span>
          <p className="article-card__title">{article.title}</p>
        </div>
      )}

      {showStreaming && streamingPartial?.summary && (
        <StreamingSummary lines={streamingPartial.summary} />
      )}
      {showSkeleton && (
        <Suspense fallback={<MotionFallback />}>
          <LoadingSkeleton />
        </Suspense>
      )}

      {isSummarizing && result && (
        <p className="muted article-loading-hint">要約を更新中...</p>
      )}

      {state === 'error' && !result && (
        <div className="card card--glass fade-in">
          <p className="error">{error}</p>
          <div className="actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handleManualSummarize(true)}
            >
              再試行
            </button>
          </div>
        </div>
      )}

      {error && result && <p className="toast tag-toast">{error}</p>}
      {manualHint && <p className="toast tag-toast">{manualHint}</p>}

      {hasSummary && result && article && (
        <>
          <Suspense fallback={null}>
            <CelebrateBurst show={celebrate} />
          </Suspense>

          {fromCache && <span className="cache-badge">キャッシュ表示 · 24h</span>}

          <div className="card card--glass summary-card fade-in">
            <div className="summary-card__head">
              <p className="summary-card__title">⚡ クイック要約</p>
              <button
                type="button"
                className={`btn btn-sm ${copied ? 'btn--copied' : ''}`}
                onClick={() => void handleCopy()}
              >
                {copied ? '✓ コピー済' : 'コピー'}
              </button>
            </div>
            <Suspense fallback={<MotionFallback />}>
              <AnimatedSummary lines={result.summary} animate={freshAnimate} />
            </Suspense>
          </div>

          <ShareBar title={article.title} url={article.url} result={result} />

          {result.keywords.length > 0 && (
            <div className="card card--glass fade-in">
              <h2>🏷 キーワード</h2>
              <p className="muted tag-hint">クリックで記事内をハイライト</p>
              <Suspense fallback={<MotionFallback />}>
                <AnimatedTags
                  keywords={result.keywords}
                  animate={freshAnimate}
                  onKeywordClick={(kw) => void handleKeywordClick(kw)}
                  activeKeyword={activeKeyword}
                />
              </Suspense>
              {highlightHint && <p className="toast tag-toast">{highlightHint}</p>}
            </div>
          )}

          {result.players.length > 0 && (
            <div className="card card--glass fade-in">
              <Collapsible
                title={<h2>👤 選手紹介</h2>}
                defaultOpen={result.players.length <= 2}
              >
                {result.players.map((player) => (
                  <div key={player.name} className="player-item">
                    <strong>{player.name}</strong>
                    <p className="muted">{player.intro}</p>
                  </div>
                ))}
              </Collapsible>
            </div>
          )}

          {result.terms.length > 0 && (
            <div className="card card--glass fade-in">
              <Collapsible title={<h2>📖 用語解説</h2>} defaultOpen={false}>
                {result.terms.map((term) => (
                  <div key={term.term} className="term-item">
                    <strong>{term.term}</strong>
                    <p className="muted">{term.explanation}</p>
                  </div>
                ))}
              </Collapsible>
            </div>
          )}

          <div className="actions actions--footer">
            <button
              type="button"
              className="btn btn-primary"
              disabled={isSummarizing}
              onClick={() => void handleManualSummarize(true)}
            >
              再生成
            </button>
          </div>
        </>
      )}

      {!hasSummary && state !== 'no-key' && state !== 'no-article' && !isSummarizing && article && (
        <div className="actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleManualSummarize(false)}
          >
            要約する
          </button>
        </div>
      )}

      <footer className="sidepanel-footer">
        <button type="button" className="link-btn" onClick={openPrivacy}>
          プライバシーポリシー
        </button>
      </footer>
    </div>
  );
}
