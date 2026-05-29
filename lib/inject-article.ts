import type { ArticleData } from '@/lib/extractors';
import { extractArticleInPage } from '@/lib/extractors/inject-extract';

async function runInject(tabId: number, world?: 'MAIN' | 'ISOLATED'): Promise<ArticleData | null> {
  try {
    const [{ result }] = await browser.scripting.executeScript({
      target: { tabId },
      world,
      func: extractArticleInPage,
    });
    return (result as ArticleData | null | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function injectExtractArticle(tabId: number): Promise<ArticleData | null> {
  for (const world of ['ISOLATED', 'MAIN'] as const) {
    const article = await runInject(tabId, world);
    if (article) return article;
  }
  return null;
}
