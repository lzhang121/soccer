import type { AiProvider, AiSettings } from './types';
import { getProviderMeta } from './providers';

export const CUSTOM_MODEL_ID = '__custom__';

export function getEffectiveModel(settings: AiSettings): string {
  const config = settings[settings.provider];
  if (settings.provider === 'openrouter' && config.model === CUSTOM_MODEL_ID) {
    const custom = config.customModel?.trim();
    if (custom) return custom;
    return getProviderMeta('openrouter').defaultModel;
  }
  return config.model;
}

export function getModelLabel(settings: AiSettings): string {
  const model = getEffectiveModel(settings);
  if (settings.provider === 'openrouter' && settings.openrouter.model === CUSTOM_MODEL_ID) {
    return `カスタム · ${model}`;
  }
  const meta = getProviderMeta(settings.provider);
  return meta.models.find((m) => m.id === settings[settings.provider].model)?.label ?? model;
}

export function patchProvider(settings: AiSettings, provider: AiProvider): AiSettings {
  return { ...settings, provider };
}
