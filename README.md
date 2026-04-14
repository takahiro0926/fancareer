# ファンキャリ（FanCareer）

> サポーターの推し活スキルを、スポンサー企業が本気でスカウトする求人マッチングプラットフォーム

---

## プロジェクト概要

スポーツチームのサポーター（求職者）とスポンサー企業を、「チームへの熱量」と「価値観の合致（シンクロ率）」で結びつけるマッチングサービスです。

### 主な特徴
- **マルチテナント構成** — チームごとにURLとテーマカラーが変わる（`/oita-trinita`, `/gamba-osaka` など）
- **シンクロ率マッチング** — ユーザーの価値観スコアと企業が求める人物像を数値化してマッチング
- **匿名スカウト** — 企業はユーザーの個人情報を見ずにスカウト送信。承諾後にチャットと個人情報が開示

---

## 技術スタック

| 役割 | 技術 |
|---|---|
| フロントエンド | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS + CSS変数（テーマシステム） |
| バックエンド | Supabase（DB + Auth + Realtime） |
| デプロイ | Vercel |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── [teamId]/              # チームごとのルート（マルチテナント）
│   │   ├── page.tsx           # トップページ（LP）
│   │   ├── onboarding/        # 初回登録フロー（ファン）
│   │   ├── mypage/            # マイページ（ファン）
│   │   ├── companies/         # 企業一覧・詳細（ファン向け）
│   │   ├── chat/              # チャット画面（ファン向け）
│   │   └── company/           # 企業側の画面群
│   │       ├── login/         # 企業ログイン・新規申請
│   │       ├── dashboard/     # 企業ダッシュボード
│   │       └── chat/          # チャット画面（企業向け）
│   └── layout.tsx
├── components/
│   ├── ui/                    # 汎用UIコンポーネント
│   ├── layout/                # ナビゲーション・フッター
│   ├── fan/                   # ファン向け画面コンポーネント
│   │   ├── Onboarding.tsx     # ← モック実装済み
│   │   ├── MyPage.tsx         # ← モック実装済み
│   │   └── SponsorDetail.tsx  # ← モック実装済み
│   ├── company/               # 企業向け画面コンポーネント
│   │   ├── CompanyLogin.tsx   # ← モック実装済み
│   │   └── Dashboard.tsx      # ← モック実装済み
│   └── chat/
│       └── ChatWindow.tsx     # ← モック実装済み
├── lib/
│   ├── themes.ts              # テーマ設定（チームカラー管理）
│   ├── supabase.ts            # Supabaseクライアント
│   └── dummy.ts               # ダミーデータ（API移行前の仮データ）
└── types/
    └── database.ts            # Supabaseのテーブル型定義
```

---

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/YOUR_USERNAME/fancareer.git
cd fancareer
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を開いて、SupabaseのURLとANONキーを設定してください。  
Supabaseの管理画面 → Settings → API から取得できます。

### 4. 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000` を開くと `/oita-trinita` にリダイレクトされます。

---

## テーマ（着せ替え）の設定方法

`src/lib/themes.ts` にチームのオブジェクトを追記するだけで新チームを追加できます。

```typescript
'new-team-id': {
  teamId: 'new-team-id',
  label: 'チーム名',
  primary: '#メインカラー',
  primaryLight: '#明るめのメインカラー',
  accent: '#CTAボタン色',
  accentText: '#ボタン上テキスト色',  // 視認性に注意
  bgBase: '#ページ背景',
  bgSurface: '#カード背景',
  bgSurface2: '#フォーム背景',
  textMain: '#メインテキスト',
  textMuted: '#サブテキスト',
  footerLabel: 'フッターのサービス名',
},
```

---

## バックエンド実装ガイド（Supabaseとの連携）

### 認証

`src/lib/supabase.ts` の関数を各画面から呼び出してください。

```typescript
// ログイン
const { data, error } = await signInWithEmail(email, password)

// Googleログイン
await signInWithGoogle()

// ログアウト
await signOut()
```

### データ取得

ダミーデータ（`src/lib/dummy.ts`）をSupabaseのクエリに置き換えます。

```typescript
// Before（ダミー）
const companies = DUMMY_COMPANIES

// After（Supabase）
const { data: companies } = await supabase
  .from('companies')
  .select('*')
  .eq('team_id', teamId)
  .eq('is_approved', true)
  .order('created_at', { ascending: false })
```

### リアルタイムチャット

```typescript
// チャットのリアルタイム受信
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `scout_id=eq.${scoutId}`,
  }, (payload) => {
    setMessages(prev => [...prev, payload.new as Message])
  })
  .subscribe()
```

---

## Supabaseのテーブル設計

`src/types/database.ts` に全テーブルの型定義があります。  
Supabaseの管理画面でテーブルを作成する際の参考にしてください。

| テーブル名 | 内容 |
|---|---|
| `teams` | チーム情報・テーマカラー |
| `users` | ファン（求職者）の情報・価値観スコア |
| `companies` | スポンサー企業情報 |
| `scouts` | スカウト送信・ステータス管理 |
| `messages` | チャットメッセージ |

---

## デプロイ（Vercel）

1. GitHubリポジトリをVercelに接続
2. Environment Variables に `.env.local` の内容を設定
3. デプロイ完了

---

## モックのデザインデータについて

このリポジトリのUIコンポーネントは、Claude（Anthropic）との対話を通じて設計されました。  
設計の意図や変更履歴については、プロジェクトオーナーに確認してください。

---

## 連絡先・質問

不明点はプロジェクトオーナーまでご連絡ください。
