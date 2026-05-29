import { extractArticle } from '@/lib/extractors';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Poll until article body appears (SPA / lazy-loaded pages). */
export async function waitForArticle(maxMs = 8000): Promise<ReturnType<typeof extractArticle>> {
  const deadline = Date.now() + maxMs;
  let last: ReturnType<typeof extractArticle> = null;

  while (Date.now() < deadline) {
    last = extractArticle();
    if (last) return last;
    await sleep(350);
  }

  return extractArticle();
}
