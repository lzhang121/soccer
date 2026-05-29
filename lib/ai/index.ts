import { callClaude } from './claude';
import { callOpenAiCompatible } from './openai-compatible';
import { getEffectiveModel } from './resolve-model';
import type { AiSettings, SummarizeOptions, SummarizeStreamCallbacks, SummarizeResult } from './types';

export * from './types';
export * from './providers';
export { TEST_ARTICLE } from './prompt';
export { getEffectiveModel, getModelLabel, patchProvider, CUSTOM_MODEL_ID } from './resolve-model';

function openAiConfig(settings: AiSettings) {
  const model = getEffectiveModel(settings);
  switch (settings.provider) {
    case 'openai':
      return {
        baseUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: settings.openai.apiKey,
        model,
      };
    case 'groq':
      return {
        baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: settings.groq.apiKey,
        model,
      };
    case 'openrouter':
      return {
        baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
        apiKey: settings.openrouter.apiKey,
        model,
        referer: 'https://github.com/sakka-sokudoku',
        title: 'サッカー速読',
      };
    default:
      return null;
  }
}

export async function summarize(
  options: SummarizeOptions,
  callbacks?: SummarizeStreamCallbacks,
): Promise<SummarizeResult> {
  const { settings } = options;

  switch (settings.provider) {
    case 'openai':
    case 'groq':
    case 'openrouter': {
      const config = openAiConfig(settings);
      if (!config) break;
      return callOpenAiCompatible(config, options, callbacks);
    }
    case 'claude':
      return callClaude(
        settings.claude.apiKey,
        getEffectiveModel(settings),
        options,
        callbacks,
      );
    default:
      throw new Error(`Unknown provider: ${String(settings.provider)}`);
  }

  throw new Error(`Unknown provider: ${String(settings.provider)}`);
}

export function getActiveApiKey(settings: AiSettings): string {
  return settings[settings.provider].apiKey;
}

export function hasApiKey(settings: AiSettings): boolean {
  return getActiveApiKey(settings).trim().length > 0;
}
