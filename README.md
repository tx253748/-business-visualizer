# 事業可視化ツール

## セットアップ

### 1. 依存関係インストール
```bash
npm install
```

### 2. 環境変数設定
`.env.local` ファイルを作成し、以下を追加：
```
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. 開発サーバー起動
```bash
npm run dev
```

http://localhost:3000 で確認

## Vercelデプロイ

### 1. GitHubにpush
```bash
git add .
git commit -m "Add AI diagnosis API"
git push origin main
```

### 2. Vercelで環境変数設定
1. Vercelダッシュボードでプロジェクトを開く
2. Settings → Environment Variables
3. 以下を追加：
   - Name: `ANTHROPIC_API_KEY`
   - Value: あなたのAPIキー
4. Redeploy

## 機能
- 事業情報の入力
- ファネル別の現状入力
- AI診断（Claude API）
- レーダーチャートでの可視化
- おすすめ施策の提示
- 業界標準との比較
