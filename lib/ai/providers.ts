import type { AiProvider } from './types';

export interface ModelOption {
  id: string;
  label: string;
}

export interface ProviderMeta {
  id: AiProvider;
  label: string;
  keyPlaceholder: string;
  keyUrl: string;
  models: ModelOption[];
  defaultModel: string;
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', label: 'gpt-4o-mini（推奨・低コスト）' },
      { id: 'gpt-4o', label: 'gpt-4o（高精度）' },
    ],
  },
  {
    id: 'claude',
    label: 'Claude',
    keyPlaceholder: 'sk-ant-...',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    defaultModel: 'claude-3-5-haiku-latest',
    models: [
      { id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku（推奨・低コスト）' },
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4（高精度）' },
    ],
  },
  {
    id: 'groq',
    label: 'Groq',
    keyPlaceholder: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B（推奨）' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B（高速）' },
    ],
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    keyPlaceholder: 'sk-or-...',
    keyUrl: 'https://openrouter.ai/keys',
    defaultModel: 'openai/gpt-4o-mini',
    models: [
      { id: 'openai/gpt-4o-mini', label: 'OpenAI GPT-4o mini' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Anthropic Claude 3.5 Sonnet' },
      { id: 'google/gemini-flash-1.5', label: 'Google Gemini Flash 1.5' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Meta Llama 3.3 70B' },
      { id: '__custom__', label: 'カスタムモデル ID...' },
    ],
  },
];

export function getProviderMeta(provider: AiProvider): ProviderMeta {
  return PROVIDERS.find((p) => p.id === provider) ?? PROVIDERS[0];
}
