/** Shared article body selectors across supported news sites. */
export function findArticleRoot(): Element | null {
  const selectors = [
    '[data-ual-gid="article-body"]',
    '.article_body',
    '.article-body',
    '.content--body',
    '.preview__detail',
    '.entry-body',
    '.entry_body',
    '.content_detail',
    '.preview__wrap',
    '.article__wrap',
    '.geki_contents',
    'article .article-body',
    'article',
    '.entry-content',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  return null;
}
