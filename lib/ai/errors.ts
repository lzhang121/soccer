/** Map HTTP / API errors to user-friendly Japanese messages. */
export function toFriendlyAiError(status: number, detail: string): string {
  const lower = detail.toLowerCase();

  if (status === 401 || lower.includes('invalid api key') || lower.includes('incorrect api key')) {
    return 'API キーが無効です。Options でキーを確認してください。';
  }
  if (status === 403) {
    return 'API へのアクセスが拒否されました。キーの権限を確認してください。';
  }
  if (status === 429 || lower.includes('rate limit')) {
    return 'リクエスト制限に達しました。しばらく待ってから再試行してください。';
  }
  if (status === 402 || lower.includes('insufficient') || lower.includes('quota')) {
    return 'API 残高または利用上限に達しました。プロバイダーのダッシュボードを確認してください。';
  }
  if (status === 404 || lower.includes('model')) {
    return 'モデル名が見つかりません。Options のモデル設定を確認してください。';
  }
  if (status >= 500) {
    return 'AI サービス側でエラーが発生しました。しばらく待ってから再試行してください。';
  }

  return `API エラー (${status})。接続テストで詳細を確認してください。`;
}
