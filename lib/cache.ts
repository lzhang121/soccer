import type { SummarizeResult } from '@/lib/ai/types';
import { normalizeArticleUrl } from '@/lib/url';

const CACHE_PREFIX = 'articleCache:';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  result: SummarizeResult;
  cachedAt: number;
  provider: string;
  model: string;
}

function cacheKey(url: string, provider: string, model: string): string {
  return `${CACHE_PREFIX}${normalizeArticleUrl(url)}|${provider}|${model}`;
}

export async function getCachedResult(
  url: string,
  provider: string,
  model: string,
): Promise<SummarizeResult | null> {
  const key = cacheKey(url, provider, model);
  const stored = await browser.storage.local.get(key);
  const entry = stored[key] as CacheEntry | undefined;
  if (!entry) return null;

  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    await browser.storage.local.remove(key);
    return null;
  }

  return entry.result;
}

export async function setCachedResult(
  url: string,
  provider: string,
  model: string,
  result: SummarizeResult,
): Promise<void> {
  const key = cacheKey(url, provider, model);
  const entry: CacheEntry = {
    result,
    cachedAt: Date.now(),
    provider,
    model,
  };
  await browser.storage.local.set({ [key]: entry });
}

export async function clearArticleCache(): Promise<number> {
  const all = await browser.storage.local.get(null);
  const keys = Object.keys(all).filter((k) => k.startsWith(CACHE_PREFIX));
  if (keys.length === 0) return 0;
  await browser.storage.local.remove(keys);
  return keys.length;
}

export async function getArticleCacheCount(): Promise<number> {
  const all = await browser.storage.local.get(null);
  return Object.keys(all).filter((k) => k.startsWith(CACHE_PREFIX)).length;
}
