# サッカー速読

日本のサッカーニュース向け Chrome / Firefox 拡張機能。Side Panel で **3 行要約・キーワード・選手紹介・用語解説** を表示します。

**Soccer Quick Read** — BYOK（Bring Your Own Key）。開発者の AI / サーバーは使いません。ユーザー自身の API キーで以下から選択できます：

- OpenAI
- Claude
- Groq
- OpenRouter

## 対応サイト

- [サッカーキング](https://soccer-king.jp/)
- Yahoo!ニュース（news.yahoo.co.jp）
- NHK（*.nhk.or.jp）
- [ゲキサカ](https://web.gekisaka.jp/)
- [日刊スポーツ](https://www.nikkansports.com/)（サッカー記事）
- [スポーツ報知](https://hochi.news/)
- [サッカーダイジェスト Web](https://www.soccerdigestweb.com/)
- [フットボールチャンネル](https://www.footballchannel.jp/)

## 開発

```bash
npm install
npm run dev
```

Chrome が起動したら：

1. 拡張機能の **Options** で AI プロバイダーと API キーを設定
2. 対応サイトの記事ページを開く
3. ツールバーアイコンから **Side Panel** を開く

## ビルド

```bash
npm run build
# 出力: .output/chrome-mv3/

npm run build:firefox
# 出力: .output/firefox-mv2/（sidebar_action）

npm run zip          # Chrome 提出用 zip
npm run zip:firefox  # Firefox 提出用 zip
```

## トラブルシュート

### Side Panel / 隐私页が真っ白

**原因 A — dev server 未起動:** 開発用ビルド（`chrome-mv3-dev`）は `npm run dev` 必須。

**原因 B — CSP ポート不一致（Console に `localhost:3001` blocked / CSP allows 3000）:**

- 別の `npm run dev` が 3000 を占有 → WXT が 3001 で起動 → manifest CSP と不一致
- **対処:** 既存の dev プロセスをすべて停止してから:

```bash
npm run dev
# → Started dev server @ http://localhost:3000 であることを確認
# → chrome://extensions で「再読み込み」
```

3000 が使用中で起動失敗する場合、他アプリまたは古い dev プロセスを終了してください。

**安定テスト（dev 不要）:**

```bash
npm run build
# → .output/chrome-mv3 を読み込む
```

### 動作確認チェックリスト

1. Yahoo / サッカーキング / NHK の**記事詳細**を開く
2. 記事ページでツールバーアイコン → Side Panel（1クリック）
3. 初回は自動要約 → 以降は「再生成」のみ更新
4. LINE / X 共有後も要約が消えないこと
5. `chrome-extension://<ID>/privacy.html` に日文ポリシーが表示されること

## テスト / CI

```bash
npm test           # Vitest 単体テスト
npm run ci         # test + compile + Chrome/Firefox ビルド
```

GitHub Actions（`.github/workflows/ci.yml`）で push / PR 時に同じチェックを実行します。

### Firefox ローカル確認

1. `npm run dev:firefox` または `about:debugging` → 一時読み込み
2. Side Panel は **サイドバー** として表示（Chrome の Side Panel API とは別）
3. Popup の「Side Panel を開く」は Firefox ではサイドバーを開く

## プロジェクト構成

```
lib/ai/           # AI 抽象层（OpenAI 兼容 + Claude）
lib/extractors/   # 正文抽取
lib/storage/      # 设置持久化
entrypoints/
  sidepanel/      # Side Panel UI
  options/        # API 设置页
  soccer.content/ # Content Script
```

## プライバシー

- API キーは `chrome.storage.local` にのみ保存
- 記事本文はユーザー端末から直接 AI プロバイダーへ送信（開発者サーバー経由なし）
- 同一 URL の要約結果は 24 時間ローカルキャッシュ（URL は utm 等を除去して正規化）
- Options からキャッシュ削除可能

## 最適化

- **Tab 同期**: タブ切替・ページ読み込み完了・SPA URL 変更で Side Panel 自動更新
- **正文抽取**: 広告・関連記事・ナビ等を除外
- **API エラー**: 401/429/残高不足などを日本語メッセージで表示
- **重複防止**: 同一 URL + モデルでの二重 API 呼び出しを抑制

## Phase 2

- **キーワードハイライト**: タグをクリック → 記事本文で該当語句をハイライト
- **Side Panel AI 切替**: ヘッダー下のドロップダウンで OpenAI / Claude / Groq / OpenRouter を即切替
- **OpenRouter カスタムモデル**: Options で任意のモデル ID を指定
- **ストリーミング**: 要約生成中に 3 行目を逐次表示

## Phase 3

- **共有**: 全文コピー / LINE / X で要約をシェア
- **プライバシーポリシー**: `/privacy.html`（Chrome Web Store 用）
- **カスタムアイコン**: サッカー绿ブランド icon（`npm run icons`）
- **動作設定**: 再生成確認・Side Panel 自動有効化
- **パフォーマンス**: framer-motion を lazy load
