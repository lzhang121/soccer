import {
  detectSiteConfig,
  getMatchPatterns,
  isArticlePath,
  pickBestElement,
  pickTitle,
  SUPPORTED_SITES,
  type ArticleData,
  type SupportedSite,
} from '@/lib/extractors/sites';
import { extractYahooFallback } from '@/lib/extractors/yahoo-fallback';

export type { ArticleData, SupportedSite };
export { SUPPORTED_SITES, getMatchPatterns, isArticlePath };

const NOISE_SELECTORS = [
  'script',
  'style',
  'noscript',
  'nav',
  'aside',
  'footer',
  'body > header',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[class*="ad-"]',
  '[class*="advert"]',
  '[class*="related_article"]',
  '[class*="recommend"]',
  '[class*="share"]',
  '[class*="sns"]',
  '[class*="comment"]',
  '[id*="comment"]',
  '[class*="infeed"]',
  '[class*="popin"]',
].join(', ');

export function detectSite(url: string): SupportedSite | null {
  const config = detectSiteConfig(url);
  if (!config) return null;
  return { id: config.id, name: config.name, hostPattern: config.hostPattern };
}

function collectText(root: ParentNode): string {
  const blocks: string[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const text = node.textContent?.trim();
    if (text && text.length > 1) blocks.push(text);
    node = walker.nextNode();
  }
  return blocks.join('\n');
}

function cleanArticleRoot(root: Element): string {
  const clone = root.cloneNode(true) as Element;
  clone.querySelectorAll(NOISE_SELECTORS).forEach((el) => el.remove());
  return collectText(clone).replace(/\n{3,}/g, '\n\n').trim();
}

/** Extract plain text from an article DOM root (for tests and tooling). */
export function extractArticleTextFromRoot(root: Element): string {
  return cleanArticleRoot(root);
}

export function extractArticle(): ArticleData | null {
  const config = detectSiteConfig(location.href);
  if (!config) return null;

  const article = pickBestElement(config.bodySelectors);
  let text = article ? cleanArticleRoot(article) : '';
  let title = pickTitle(config.titleSelectors);

  if (text.length < 80 && config.id === 'yahoo') {
    const fallback = extractYahooFallback();
    if (fallback) {
      text = fallback.text;
      title = fallback.title;
    }
  }

  if (text.length < 80) return null;

  return {
    url: location.href,
    title,
    text,
    site: config.name,
  };
}
