const STRIP_QUERY_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'ref',
  'from',
]);

/** Normalize article URL for cache keys (strip tracking params, hash, trailing slash). */
export function normalizeArticleUrl(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()]) {
      if (STRIP_QUERY_PARAMS.has(key) || key.startsWith('utm_')) {
        parsed.searchParams.delete(key);
      }
    }
    parsed.hash = '';
    let path = parsed.pathname.replace(/\/+$/, '') || '/';
    parsed.pathname = path;
    return parsed.toString();
  } catch {
    return url;
  }
}
