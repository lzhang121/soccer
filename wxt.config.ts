import { defineConfig } from 'wxt';

/** Dev CSP fallback when Vite picks a port other than the one baked into origin. */
function patchDevCsp(manifest: Browser.runtime.Manifest): void {
  const csp = manifest.content_security_policy;
  if (!csp || typeof csp !== 'object') return;

  for (const key of ['extension_pages', 'sandbox'] as const) {
    const value = csp[key];
    if (typeof value !== 'string' || value.includes('http://localhost:*')) continue;
    csp[key] = value.replace(
      /script-src([^;]*);/,
      'script-src$1 http://localhost:*;',
    );
  }
}

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  dev: {
    server: {
      port: 3000,
      // Do not set `origin` with a fixed port — WXT derives it from the resolved port.
      strictPort: true,
    },
  },
  hooks: {
    'build:manifestGenerated'(_wxt, manifest) {
      if (_wxt.config.command === 'serve') patchDevCsp(manifest);
    },
  },
  manifest: {
    name: 'サッカー速読',
    description:
      'サッカーニュースを3行で速読。OpenAI / Claude / Groq / OpenRouter の API キー（ご自身の契約）を使用します。',
    permissions: ['storage', 'sidePanel', 'activeTab', 'tabs', 'scripting'],
    host_permissions: [
      '*://*.soccer-king.jp/*',
      '*://news.yahoo.co.jp/*',
      '*://*.news.yahoo.co.jp/*',
      '*://*.nhk.or.jp/*',
      '*://web.gekisaka.jp/*',
      '*://*.gekisaka.jp/*',
      '*://www.nikkansports.com/*',
      '*://*.nikkansports.com/*',
      '*://hochi.news/*',
      '*://*.hochi.news/*',
      '*://www.soccerdigestweb.com/*',
      '*://*.soccerdigestweb.com/*',
      '*://www.footballchannel.jp/*',
      '*://*.footballchannel.jp/*',
      'https://api.openai.com/*',
      'https://api.anthropic.com/*',
      'https://api.groq.com/*',
      'https://openrouter.ai/*',
    ],
    action: {
      default_title: 'サッカー速読',
    },
    browser_specific_settings: {
      gecko: {
        id: 'sakka-sokudoku@sakka-sokudoku',
        data_collection_permissions: {
          // BYOK: article + API key go directly to the user's AI provider on summarize.
          required: ['websiteContent', 'authenticationInfo'],
        },
      },
    },
  },
});
