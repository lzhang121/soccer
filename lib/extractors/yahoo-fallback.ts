interface YahooParagraph {
  textDetails?: Array<{ text?: string }>;
}

interface YahooPreloadedState {
  articleDetail?: {
    headline?: string;
    paragraphs?: YahooParagraph[];
  };
  pageData?: {
    title?: string;
    description?: string;
  };
}

function extractJsonObject(text: string, marker: string): unknown | null {
  const idx = text.indexOf(marker);
  if (idx < 0) return null;

  let i = idx + marker.length;
  while (text[i] === ' ') i += 1;
  if (text[i] !== '{') return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let j = i; j < text.length; j += 1) {
    const char = text[j];
    if (inString) {
      if (escape) escape = false;
      else if (char === '\\') escape = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(i, j + 1));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function readPreloadedState(): YahooPreloadedState | null {
  const fromWindow = (window as Window & { __PRELOADED_STATE__?: YahooPreloadedState })
    .__PRELOADED_STATE__;
  if (fromWindow?.articleDetail) return fromWindow;

  for (const script of document.querySelectorAll('script:not([src])')) {
    const text = script.textContent ?? '';
    const parsed = extractJsonObject(text, 'window.__PRELOADED_STATE__=');
    if (parsed && typeof parsed === 'object') {
      return parsed as YahooPreloadedState;
    }
  }

  return null;
}

function normalizeYahooTitle(raw: string): string {
  return raw
    .replace(/\s*（[^）]*）\s*$/, '')
    .replace(/\s*-\s*Yahoo!.*$/i, '')
    .trim();
}

function textFromPreloadedState(state: YahooPreloadedState): string {
  const parts: string[] = [];
  for (const paragraph of state.articleDetail?.paragraphs ?? []) {
    for (const detail of paragraph.textDetails ?? []) {
      const text = detail.text?.trim();
      if (text) parts.push(text);
    }
  }
  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

function readMetaContent(selector: string): string {
  return document.querySelector(selector)?.getAttribute('content')?.trim() ?? '';
}

/** Fallback extractors when Yahoo article DOM nodes are empty or stripped. */
export function extractYahooFallback(): { title: string; text: string } | null {
  const state = readPreloadedState();
  if (state) {
    const text = textFromPreloadedState(state);
    if (text.length >= 80) {
      const title =
        state.articleDetail?.headline?.trim() ||
        normalizeYahooTitle(state.pageData?.title ?? '') ||
        normalizeYahooTitle(document.title);
      if (title) return { title, text };
    }
  }

  const ogDescription = readMetaContent('meta[property="og:description"]');
  if (ogDescription.length >= 80) {
    const title =
      normalizeYahooTitle(readMetaContent('meta[property="og:title"]')) ||
      normalizeYahooTitle(document.title);
    return { title, text: ogDescription };
  }

  const description = readMetaContent('meta[name="description"]');
  if (description.length >= 80) {
    const title =
      normalizeYahooTitle(readMetaContent('meta[property="og:title"]')) ||
      normalizeYahooTitle(document.title);
    return { title, text: description };
  }

  return null;
}
