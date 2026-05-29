import { describe, expect, it } from 'vitest';
import { CUSTOM_MODEL_ID, getEffectiveModel } from '@/lib/ai/resolve-model';
import type { AiSettings } from '@/lib/ai/types';
import { getProviderMeta } from '@/lib/ai/providers';

function makeSettings(overrides: Partial<AiSettings> = {}): AiSettings {
  const base: AiSettings = {
    provider: 'openai',
    openai: { apiKey: '', model: 'gpt-4o-mini' },
    claude: { apiKey: '', model: 'claude-3-5-haiku-latest' },
    groq: { apiKey: '', model: 'llama-3.3-70b-versatile' },
    openrouter: { apiKey: '', model: 'openai/gpt-4o-mini', customModel: '' },
  };
  return { ...base, ...overrides, openrouter: { ...base.openrouter, ...overrides.openrouter } };
}

describe('getEffectiveModel', () => {
  it('returns configured model for standard providers', () => {
    expect(getEffectiveModel(makeSettings({ provider: 'groq' }))).toBe('llama-3.3-70b-versatile');
  });

  it('uses customModel when OpenRouter custom id is selected', () => {
    const settings = makeSettings({
      provider: 'openrouter',
      openrouter: { apiKey: '', model: CUSTOM_MODEL_ID, customModel: 'anthropic/claude-3.5-sonnet' },
    });
    expect(getEffectiveModel(settings)).toBe('anthropic/claude-3.5-sonnet');
  });

  it('falls back to OpenRouter default when custom model is empty', () => {
    const settings = makeSettings({
      provider: 'openrouter',
      openrouter: { apiKey: '', model: CUSTOM_MODEL_ID, customModel: '  ' },
    });
    expect(getEffectiveModel(settings)).toBe(getProviderMeta('openrouter').defaultModel);
  });
});
