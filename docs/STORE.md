# Chrome Web Store 掲載用文案

## 拡張機能名（32 文字以内）

サッカー速読 — AI 3行要約

## 短い説明（132 文字以内）

日本のサッカーニュースを Side Panel で3行要約。キーワード・選手解説付き。BYOK（OpenAI / Claude / Groq / OpenRouter）。8 メディア対応。

## 詳細説明

⚽ **サッカー速読**は、日本のサッカーニュース記事を読みながら、AI が要点を Side Panel に表示する Chrome 拡張機能です。

### 対応サイト

- サッカーキング（soccer-king.jp）
- Yahoo!ニュース（news.yahoo.co.jp）
- NHK（*.nhk.or.jp）
- ゲキサカ（web.gekisaka.jp）
- 日刊スポーツ（nikkansports.com）
- スポーツ報知（hochi.news）
- サッカーダイジェスト Web（soccerdigestweb.com）
- フットボールチャンネル（footballchannel.jp）

### 主な機能

- **3 行要約** — 長文記事を素早く把握
- **キーワード抽出** — クリックで記事内をハイライト
- **選手・用語解説** — サッカー初心者にもわかりやすく
- **Side Panel** — 記事を見ながら並べて表示
- **ストリーミング表示** — 要約を逐次表示
- **共有** — コピー / LINE / X（Twitter）
- **24 時間キャッシュ** — 同じ記事の再要約を節約

### BYOK（Bring Your Own Key）

API キーは **あなたのブラウザ内** にのみ保存され、開発者のサーバーには送信されません。AI へのリクエストは各プロバイダーへ直接送信されます。

対応プロバイダー：

- OpenAI
- Anthropic Claude
- Groq
- OpenRouter（カスタムモデル対応）

利用料金は各プロバイダーのアカウントに直接請求されます。

### プライバシー

- 記事本文は要約のため AI API に送信されます（ユーザー操作時のみ）
- API キーは `chrome.storage.local` に保存
- 個人情報の収集・販売は行いません

プライバシーポリシー：拡張機能内 `/privacy.html`（パッケージ同梱）

### 使い方

1. 拡張機能をインストール
2. Options で AI プロバイダーと API キーを設定
3. 対応サイトの記事ページを開く
4. Side Panel を開き「要約する」をクリック

---

## カテゴリ

ニュース / スポーツ / 生産性向上

## 言語

日本語（primary）、English 副标题: Soccer Quick Read

## プライバシーポリシー URL

ストア登録時は、ホスティングした `privacy.html` の公開 URL を入力してください。  
例：`https://<your-github-pages>/sakka-sokudoku/privacy.html`

同梱ファイル：`entrypoints/privacy/index.html` → ビルド後 `privacy.html`

## スクリーンショット案（1280×800 推奨）

1. Side Panel — 要約・キーワード・選手カード表示
2. Options — プロバイダー選択と API キー設定
3. 記事ページ + Side Panel 並列（サッカーキング）
4. キーワードハイライト（記事内に黄色マーク）
5. ストリーミング中のローディング UI

## 提出前チェックリスト

- [ ] `npm run build && npm run zip` で `.output/*-mv3.zip` を生成
- [ ] Options で接続テスト成功
- [ ] 3 サイト各 1 記事で要約・ハイライト・共有を確認
- [ ] アイコン 128px が Store 要件を満たす（`public/icon/128.png`）
- [ ] プライバシーポリシー URL を公開
- [ ] 単一用途の説明が Store ガイドラインに合致

## ビルドコマンド

```bash
npm run build
npm run zip
```

生成物：`.output/sakka-sokudoku-*-chrome.zip`

### Firefox

```bash
npm run build:firefox
npm run zip:firefox
```

生成物：`.output/sakka-sokudoku-*-firefox.zip`

- Manifest V2 + `sidebar_action`（Chrome Side Panel 相当）
- `browser_specific_settings.gecko.data_collection_permissions` 済み（`websiteContent` / `authenticationInfo` — BYOK で AI プロバイダーへ直接送信）
