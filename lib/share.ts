import type { SummarizeResult } from '@/lib/ai/types';

export function formatShareText(title: string, summary: string[], url: string): string {
  const lines = summary.map((line, index) => `${index + 1}. ${line}`).join('\n');
  return `⚽ ${title}\n\n${lines}\n\n${url}`;
}

export function formatShareTextShort(title: string, summary: string[]): string {
  const first = summary[0] ?? '';
  return `⚽ ${title} — ${first}`;
}

export async function copyShareText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

/** Open URL in a background tab so the Side Panel keeps focus and content. */
export async function openBackgroundTab(url: string): Promise<void> {
  await browser.tabs.create({ url, active: false });
}

export function openLineShare(text: string): void {
  const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
  void openBackgroundTab(url);
}

export function openXShare(text: string, articleUrl: string): void {
  const intent = new URL('https://twitter.com/intent/tweet');
  intent.searchParams.set('text', text);
  intent.searchParams.set('url', articleUrl);
  void openBackgroundTab(intent.toString());
}

export function openHatenaShare(title: string, articleUrl: string): void {
  const url = new URL('https://b.hatena.ne.jp/entry/panel/');
  url.searchParams.set('url', articleUrl);
  url.searchParams.set('title', title);
  void openBackgroundTab(url.toString());
}

export function openMailShare(title: string, body: string): void {
  const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  const anchor = document.createElement('a');
  anchor.href = mailto;
  anchor.rel = 'noopener noreferrer';
  anchor.click();
}

export function canNativeShare(): boolean {
  return typeof navigator.share === 'function';
}

export async function openNativeShare(title: string, text: string, url: string): Promise<void> {
  if (!canNativeShare()) return;
  await navigator.share({ title, text, url });
}

export function buildSharePayload(
  title: string,
  result: SummarizeResult,
  url: string,
): { full: string; short: string } {
  return {
    full: formatShareText(title, result.summary, url),
    short: formatShareTextShort(title, result.summary),
  };
}
