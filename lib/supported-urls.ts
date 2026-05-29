import { detectSite, isArticlePath } from '@/lib/extractors';

export function isSupportedArticleUrl(url: string): boolean {
  if (!url.startsWith('http')) return false;
  if (!detectSite(url)) return false;
  return isArticlePath(url);
}
