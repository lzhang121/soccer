import { extractArticle, getMatchPatterns, isArticlePath } from '@/lib/extractors';
import { waitForArticle } from '@/lib/extractors/wait-for-article';
import { highlightKeywordInArticle } from '@/lib/extractors/highlight';
import type { MessageType } from '@/lib/messages';

let cachedArticle: ReturnType<typeof extractArticle> = null;
let cachedUrl = '';

function refreshArticleCache(): void {
  const article = extractArticle();
  if (article) {
    cachedArticle = article;
    cachedUrl = location.href;
  }
}

function watchUrlChanges(onChange: (url: string) => void) {
  let lastUrl = location.href;

  const check = () => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      onChange(lastUrl);
    }
  };

  window.addEventListener('popstate', check);
  window.addEventListener('hashchange', check);

  const rawPushState = history.pushState.bind(history);
  const rawReplaceState = history.replaceState.bind(history);

  history.pushState = (...args) => {
    rawPushState(...args);
    check();
  };

  history.replaceState = (...args) => {
    rawReplaceState(...args);
    check();
  };
}

export default defineContentScript({
  matches: getMatchPatterns(),
  runAt: 'document_end',
  main() {
    browser.runtime.onMessage.addListener((message: MessageType, _sender, sendResponse) => {
      if (message.type === 'GET_ARTICLE') {
        const immediate = extractArticle();
        if (immediate) {
          cachedArticle = immediate;
          cachedUrl = location.href;
          sendResponse({ type: 'ARTICLE', data: immediate } satisfies MessageType);
          return true;
        }

        if (cachedArticle && cachedUrl === location.href) {
          sendResponse({ type: 'ARTICLE', data: cachedArticle } satisfies MessageType);
          return true;
        }

        void waitForArticle(12000).then((article) => {
          if (article) {
            cachedArticle = article;
            cachedUrl = location.href;
            sendResponse({ type: 'ARTICLE', data: article } satisfies MessageType);
          } else {
            sendResponse({ type: 'ARTICLE_NOT_FOUND', url: location.href } satisfies MessageType);
          }
        });
        return true;
      }

      if (message.type === 'HIGHLIGHT_KEYWORD') {
        const count = highlightKeywordInArticle(message.keyword);
        sendResponse({ type: 'HIGHLIGHT_RESULT', count } satisfies MessageType);
        return true;
      }

      return undefined;
    });

    watchUrlChanges((url) => {
      cachedArticle = null;
      cachedUrl = '';
      if (!isArticlePath(url)) return;
      void browser.runtime.sendMessage({
        type: 'ARTICLE_URL_CHANGED',
        url,
      });
      void waitForArticle(12000).then((article) => {
        if (article) {
          cachedArticle = article;
          cachedUrl = location.href;
        }
      });
    });

    if (isArticlePath(location.href)) {
      refreshArticleCache();
      void waitForArticle(12000).then((article) => {
        if (article) {
          cachedArticle = article;
          cachedUrl = location.href;
        }
      });
    }
  },
});
