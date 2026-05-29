import { useEffect, useState } from 'react';
import {
  AiError,
  CUSTOM_MODEL_ID,
  getProviderMeta,
  PROVIDERS,
  summarize,
  type AiProvider,
  type AiSettings,
} from '@/lib/ai';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/lib/storage/settings';
import { clearArticleCache, getArticleCacheCount } from '@/lib/cache';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from '@/lib/storage/preferences';
import { openExtensionPage } from '@/lib/extension-pages';
import { SUPPORTED_SITE_LABELS, getSiteBadgeClass } from '@/lib/site-styles';

export default function App() {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testError, setTestError] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [cacheCount, setCacheCount] = useState(0);
  const [cacheMessage, setCacheMessage] = useState('');
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    void loadSettings().then(setSettings);
    void getArticleCacheCount().then(setCacheCount);
    void loadPreferences().then(setPrefs);
  }, []);

  const activeProvider = settings.provider;
  const activeConfig = settings[activeProvider];
  const providerMeta = getProviderMeta(activeProvider);

  const updateProvider = (provider: AiProvider) => {
    setSettings((prev) => ({ ...prev, provider }));
    setSaved(false);
    setTestMessage('');
  };

  const updateApiKey = (apiKey: string) => {
    setSettings((prev) => ({
      ...prev,
      [activeProvider]: { ...prev[activeProvider], apiKey },
    }));
    setSaved(false);
    setTestMessage('');
  };

  const updateModel = (model: string) => {
    setSettings((prev) => ({
      ...prev,
      [activeProvider]: { ...prev[activeProvider], model },
    }));
    setSaved(false);
    setTestMessage('');
  };

  const updateCustomModel = (customModel: string) => {
    setSettings((prev) => ({
      ...prev,
      openrouter: { ...prev.openrouter, customModel },
    }));
    setSaved(false);
    setTestMessage('');
  };

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestMessage('');
    setTestError(false);

    try {
      const result = await summarize({
        article: '',
        settings,
        testMode: true,
      });
      setTestMessage(`接続 OK ⚽ — 要約 ${result.summary.length} 行を取得しました`);
    } catch (err) {
      setTestError(true);
      setTestMessage(err instanceof AiError ? err.message : '接続テストに失敗しました');
    } finally {
      setTesting(false);
    }
  };

  const handleClearCache = async () => {
    const removed = await clearArticleCache();
    setCacheCount(0);
    setCacheMessage(`${removed} 件のキャッシュを削除しました`);
    setTimeout(() => setCacheMessage(''), 2500);
  };

  const updatePref = async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await savePreferences(next);
  };

  const openPrivacy = () => {
    void openExtensionPage('/privacy.html', true);
  };

  return (
    <div className="container">
      <header className="options-header">
        <h1>AI 設定</h1>
        <p>ご自身の API キーを使用 · 開発者サーバー不要</p>
      </header>

      <div className="card">
        <div className="field">
          <label>使用する AI</label>
          <div className="provider-grid">
            {PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                type="button"
                className={`provider-btn ${activeProvider === provider.id ? 'active' : ''}`}
                onClick={() => updateProvider(provider.id)}
              >
                <strong>{provider.label}</strong>
                <span>{provider.id === 'openrouter' ? '1 Key · 多モデル' : 'BYOK'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="api-key">API キー（{providerMeta.label}）</label>
          <input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            value={activeConfig.apiKey}
            onChange={(e) => updateApiKey(e.target.value)}
            placeholder={providerMeta.keyPlaceholder}
            autoComplete="off"
          />
          <p className="muted">
            <a href={providerMeta.keyUrl} target="_blank" rel="noreferrer">
              {providerMeta.label} でキーを取得
            </a>
            {' · '}
            <button type="button" className="link-btn" onClick={() => setShowKey((v) => !v)}>
              {showKey ? '隠す' : '表示'}
            </button>
          </p>
        </div>

        <div className="field">
          <label htmlFor="model">モデル</label>
          <select
            id="model"
            value={activeConfig.model}
            onChange={(e) => updateModel(e.target.value)}
          >
            {providerMeta.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
          {activeProvider === 'openrouter' && (
            <p className="muted">OpenRouter はモデル ID をそのまま使用します。</p>
          )}
          {activeProvider === 'openrouter' && activeConfig.model === CUSTOM_MODEL_ID && (
            <div className="field" style={{ marginTop: 10 }}>
              <label htmlFor="custom-model">カスタムモデル ID</label>
              <input
                id="custom-model"
                type="text"
                value={activeConfig.customModel ?? ''}
                onChange={(e) => updateCustomModel(e.target.value)}
                placeholder="例: anthropic/claude-3.5-sonnet"
                autoComplete="off"
              />
            </div>
          )}
          {activeProvider === 'groq' && (
            <p className="muted">Groq は高速ですが、日本語精度は OpenAI / Claude より劣る場合があります。</p>
          )}
        </div>

        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={() => void handleSave()}>
            保存
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => void handleTest()}
            disabled={testing || !activeConfig.apiKey.trim()}
          >
            {testing ? 'テスト中...' : '接続テスト'}
          </button>
        </div>

        {saved && <p className="toast">保存しました ⚽</p>}
        {testMessage && (
          <p className={testError ? 'error' : 'toast'} style={{ marginTop: 12 }}>
            {testMessage}
          </p>
        )}
      </div>

      <div className="card">
        <h2>動作設定</h2>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={prefs.confirmRegenerate}
            onChange={(e) => void updatePref('confirmRegenerate', e.target.checked)}
          />
          再生成前に確認ダイアログを表示
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={prefs.autoEnableSidePanel}
            onChange={(e) => void updatePref('autoEnableSidePanel', e.target.checked)}
          />
          対応サイトの記事ページで Side Panel を自動有効化
        </label>
      </div>

      <div className="card">
        <h2>プライバシー</h2>
        <p className="muted">
          記事本文はお使いのブラウザから、選択した AI プロバイダーへ直接送信されます。開発者のサーバーは使用しません。
        </p>
        <button type="button" className="link-btn" onClick={openPrivacy}>
          プライバシーポリシーを読む
        </button>
      </div>

      <div className="card">
        <h2>キャッシュ</h2>
        <p className="muted">要約結果は同一 URL で 24 時間ローカル保存されます（{cacheCount} 件）。</p>
        <div className="actions">
          <button type="button" className="btn" onClick={() => void handleClearCache()}>
            キャッシュを削除
          </button>
        </div>
        {cacheMessage && <p className="toast">{cacheMessage}</p>}
      </div>

      <div className="card">
        <h2>対応サイト</h2>
        <ul className="summary-list">
          {SUPPORTED_SITE_LABELS.map((label) => (
            <li key={label} className="summary-item" style={{ marginTop: 8 }}>
              <span className={getSiteBadgeClass(label)}>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
