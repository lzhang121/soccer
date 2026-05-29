export interface UserPreferences {
  confirmRegenerate: boolean;
  autoEnableSidePanel: boolean;
}

const PREFS_KEY = 'userPreferences';

export const DEFAULT_PREFERENCES: UserPreferences = {
  confirmRegenerate: true,
  autoEnableSidePanel: true,
};

export async function loadPreferences(): Promise<UserPreferences> {
  const stored = await browser.storage.local.get(PREFS_KEY);
  const raw = stored[PREFS_KEY] as Partial<UserPreferences> | undefined;
  return { ...DEFAULT_PREFERENCES, ...raw };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await browser.storage.local.set({ [PREFS_KEY]: prefs });
}

export function onPreferencesChanged(callback: (prefs: UserPreferences) => void): () => void {
  const listener = (
    changes: Record<string, { newValue?: unknown }>,
    area: string,
  ) => {
    if (area !== 'local' || !changes[PREFS_KEY]) return;
    void loadPreferences().then(callback);
  };

  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
