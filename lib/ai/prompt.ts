export const SYSTEM_PROMPT = `あなたは日本のサッカーニュースを要約するアシスタントです。
必ず有効な JSON のみを返してください。Markdown や説明文は不要です。

出力形式:
{
  "summary": ["要点1（40字以内）", "要点2（40字以内）", "要点3（40字以内）"],
  "keywords": ["キーワード1", "キーワード2"],
  "players": [{ "name": "選手名", "intro": "2-3文の紹介" }],
  "terms": [{ "term": "用語", "explanation": "一般読者向けの説明" }]
}

ルール:
- summary は日本語で事実のみ、ちょうど3行
- keywords は記事の重要語句を3-8個
- players は記事に登場する選手のみ（いなければ空配列）
- terms はサッカー用語の説明（不要なら空配列）
- 推測や捏造はしない`;

export const TEST_ARTICLE =
  'Jリーグ第10節、東京ヴェルディはホームで浦和レッズと1-1の引き分け。前半15分、久保建英の左サイドからのクロスを前田大然がヘディングで先制。後半38分、浦和のサイドハーフ岩田智輝がFKを直接ゴールに結びつけた。';

export function buildUserPrompt(article: string, title?: string, testMode?: boolean): string {
  const body = testMode ? TEST_ARTICLE : smartTruncate(article, 12000);
  const titleLine = title ? `タイトル: ${title}\n\n` : '';
  return `${titleLine}以下のサッカー記事を分析してください:\n\n${body}`;
}

/** Prefer paragraph boundaries when truncating long articles (e.g. NHK). */
function smartTruncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;

  const slice = text.slice(0, maxLen);
  const lastBreak = Math.max(slice.lastIndexOf('\n\n'), slice.lastIndexOf('。'));
  if (lastBreak > maxLen * 0.7) {
    return slice.slice(0, lastBreak + 1);
  }
  return slice;
}
