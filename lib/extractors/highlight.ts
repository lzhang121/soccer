import { findArticleRoot } from '@/lib/extractors/article-root';

const HIGHLIGHT_CLASS = 'ss-highlight';
const HIGHLIGHT_STYLE_ID = 'ss-highlight-style';
export const MAX_KEYWORD_HIGHLIGHTS = 20;

let activeMarks: HTMLElement[] = [];

function ensureHighlightStyles() {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `
    mark.${HIGHLIGHT_CLASS} {
      background: linear-gradient(180deg, #fef3c7 0%, #fde68a 100%);
      color: #111827;
      padding: 0 2px;
      border-radius: 3px;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.35);
      animation: ss-pulse 1.2s ease-in-out 2;
    }
    @keyframes ss-pulse {
      0%, 100% { box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.35); }
      50% { box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.15); }
    }
  `;
  document.head.appendChild(style);
}

export function clearKeywordHighlights() {
  for (const mark of activeMarks) {
    const parent = mark.parentNode;
    if (!parent) continue;
    parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark);
    parent.normalize();
  }
  activeMarks = [];
}

function highlightAllInTextNode(node: Text, keyword: string, maxRemaining: number): number {
  const parent = node.parentNode;
  if (!parent || parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE') {
    return 0;
  }

  const text = node.textContent ?? '';
  let lastIndex = 0;
  let count = 0;
  const fragments: (Text | HTMLElement)[] = [];

  while (count < maxRemaining) {
    const index = text.indexOf(keyword, lastIndex);
    if (index === -1) break;

    if (index > lastIndex) {
      fragments.push(document.createTextNode(text.slice(lastIndex, index)));
    }

    const mark = document.createElement('mark');
    mark.className = HIGHLIGHT_CLASS;
    mark.textContent = keyword;
    fragments.push(mark);
    activeMarks.push(mark);

    count++;
    lastIndex = index + keyword.length;
  }

  if (count === 0) return 0;

  if (lastIndex < text.length) {
    fragments.push(document.createTextNode(text.slice(lastIndex)));
  }

  for (const fragment of fragments) {
    parent.insertBefore(fragment, node);
  }
  parent.removeChild(node);
  return count;
}

/** Highlight keyword occurrences in article body (up to maxMatches). Returns match count. */
export function highlightKeywordInArticle(
  keyword: string,
  maxMatches = MAX_KEYWORD_HIGHLIGHTS,
): number {
  clearKeywordHighlights();
  const trimmed = keyword.trim();
  if (!trimmed) return 0;

  ensureHighlightStyles();
  const root = findArticleRoot();
  if (!root) return 0;

  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text);
    }
    node = walker.nextNode();
  }

  let count = 0;
  for (const textNode of textNodes) {
    if (count >= maxMatches) break;
    if (!textNode.isConnected) continue;
    count += highlightAllInTextNode(textNode, trimmed, maxMatches - count);
  }

  activeMarks[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return count;
}
