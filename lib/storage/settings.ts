import type { AiProvider, AiSettings } from '@/lib/ai/types';
import { getProviderMeta } from '@/lib/ai/providers';

const STORAGE_KEY = 'aiSettings';

function defaultProviderConfig(provider: keyof Pick<AiSettings, 'openai' | 'claude' | 'groq' | 'openrouter'>) {
  const meta = getProviderMeta(provider);
  return { apiKey: '', model: meta.defaultModel, customModel: '' };
}

export const DEFAULT_SETTINGS: AiSettings = {
  provider: 'openai',
  openai: defaultProviderConfig('openai'),
  claude: defaultProviderConfig('claude'),
  groq: defaultProviderConfig('groq'),
  openrouter: defaultProviderConfig('openrouter'),
};

export async function loadSettings(): Promise<AiSettings> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  const raw = stored[STORAGE_KEY] as Partial<AiSettings> | undefined;
  if (!raw) return { ...DEFAULT_SETTINGS };

  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    openai: { ...DEFAULT_SETTINGS.openai, ...raw.openai },
    claude: { ...DEFAULT_SETTINGS.claude, ...raw.claude },
    groq: { ...DEFAULT_SETTINGS.groq, ...raw.groq },
    openrouter: { ...DEFAULT_SETTINGS.openrouter, ...raw.openrouter },
  };
}

export async function saveSettings(settings: AiSettings): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: settings });
}

export async function updateProvider(settings: AiSettings, provider: AiProvider): Promise<AiSettings> {
  const next = { ...settings, provider };
  await saveSettings(next);
  return next;
}

export function onSettingsChanged(callback: (settings: AiSettings) => void): () => void {
  const listener = (
    changes: Record<string, { newValue?: unknown }>,
    area: string,
  ) => {
    if (area !== 'local' || !changes[STORAGE_KEY]) return;
    void loadSettings().then(callback);
  };

  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
