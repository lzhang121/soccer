export type AiProvider = 'openai' | 'claude' | 'groq' | 'openrouter';

export interface PlayerInfo {
  name: string;
  intro: string;
}

export interface TermInfo {
  term: string;
  explanation: string;
}

export interface SummarizeResult {
  summary: string[];
  keywords: string[];
  players: PlayerInfo[];
  terms: TermInfo[];
}

export interface ProviderConfig {
  apiKey: string;
  model: string;
  /** OpenRouter: used when model === '__custom__' */
  customModel?: string;
}

export interface SummarizeStreamCallbacks {
  onPartial: (partial: Partial<SummarizeResult>) => void;
}

export interface AiSettings {
  provider: AiProvider;
  openai: ProviderConfig;
  claude: ProviderConfig;
  groq: ProviderConfig;
  openrouter: ProviderConfig;
}

export interface SummarizeOptions {
  article: string;
  title?: string;
  settings: AiSettings;
  testMode?: boolean;
}

export class AiError extends Error {
  constructor(
    message: string,
    readonly code?: 'missing_key' | 'invalid_json' | 'api_error',
  ) {
    super(message);
    this.name = 'AiError';
  }
}
