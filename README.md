# カルチャーウォーク（CultureWalk）

> シニアの「観たい（文化・エンタメ体験）」を「健康（歩行）」に変える、ヘルスケア×O2Oプラットフォーム

---

## プロジェクト概要

コンサート・美術展・歌舞伎などの「お出かけの目的」を提供することで、シニアの外出習慣化と健康寿命延伸を実現するサービスです。事業主体はPANX（ぴあ×朝日新聞グループ）。

詳しい要件定義は [`docs/culturewalk-ai-dev-spec.md`](./docs/culturewalk-ai-dev-spec.md)、各画面の仕様は [`docs/culturewalk-screen-spec.md`](./docs/culturewalk-screen-spec.md) を参照してください。

### 主な特徴
- **歩数×マイル還元** — 歩いた分だけ「カルチャーマイル」が貯まり、チケット割引に使える
- **近隣イベント自動リマインド** — ぴあAPI連携を想定し、徒歩・電車15〜30分圏内のイベントを提示
- **対面サポート導線** — デジタル操作が不安なユーザー向けに、ASA（新聞販売店）店頭・電話でのサポートに接続
- **B2Bダッシュボード** — 協賛企業向けに、行動連動アンケート・サンプリング効果・広告出稿状況を可視化

---

## 技術スタック

| 役割 | 技術 |
|---|---|
| フロントエンド | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| バックエンド（予定） | Supabase（DB + Auth） |
| デプロイ（予定） | Vercel |

現状はフロントエンドのみで、データは `src/lib/dummy.ts` のダミーデータを使用しています。Supabase接続は未実装です。

---

## 画面一覧

| 画面 | ルート | 状態 |
|---|---|---|
| ホーム | `/` | ✅ モック実装済み |
| イベント詳細 | `/events/[id]` | ✅ モック実装済み（マイル割引の適用/解除が実際に動作） |
| 対面サポート | `/support` | ✅ モック実装済み |
| カルチャーマイル | `/miles` | ✅ モック実装済み（クーポン交換が実際に動作） |
| B2Bダッシュボード | `/company/dashboard` | ✅ モック実装済み |

ワイヤーフレーム（Artifact）: https://claude.ai/artifact/CggEWK8B644CXurukGKXiw

---

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                # ホーム画面
│   ├── layout.tsx
│   ├── globals.css
│   ├── events/[id]/
│   │   ├── page.tsx             # イベント詳細画面
│   │   └── DiscountToggle.tsx   # マイル割引ボタン（クライアントコンポーネント）
│   ├── support/page.tsx         # 対面サポート画面
│   ├── miles/
│   │   ├── page.tsx             # カルチャーマイル画面
│   │   └── CouponRow.tsx        # クーポン交換ボタン（クライアントコンポーネント）
│   └── company/dashboard/page.tsx  # B2Bダッシュボード
├── components/
│   ├── icons.tsx                # インラインSVGアイコン集
│   └── BottomNav.tsx            # 下部ナビゲーション
├── lib/
│   └── dummy.ts                 # ダミーデータ（API/Supabase移行前の仮データ）
└── types/
    └── index.ts                 # 型定義
```

---

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000` を開くとホーム画面が表示されます。

### 3. 本番ビルドの確認

```bash
npm run build
npm run start
```

---

## 本番化に向けて（未実装のバックエンド作業）

| 優先度 | 作業 | 参考 |
|---|---|---|
| 🔴 高 | Supabaseプロジェクト作成・テーブル設計 | `docs/culturewalk-screen-spec.md` の「共通のデータモデル」 |
| 🔴 高 | 認証実装（LINEログイン or 電話番号＋ASA認証） | `docs/culturewalk-ai-dev-spec.md` 5章 |
| 🔴 高 | ぴあAPI連携（近隣イベント取得） | `docs/culturewalk-ai-dev-spec.md` 4章 |
| 🟡 中 | HealthKit / Google Fit 連携（歩数取得） | `docs/culturewalk-ai-dev-spec.md` 3.1章 |
| 🟡 中 | マイル交換・割引適用のサーバーサイド処理 | `docs/culturewalk-screen-spec.md` 各画面の「連携ポイント」 |
| 🟢 低 | B2Bレポート出力・k-匿名化集計 | `docs/culturewalk-ai-dev-spec.md` 6章 |

`src/lib/dummy.ts` の各データを、Supabaseへのクエリに置き換えることで本番化できます。

---

## 関連ドキュメント

- [要件定義書（AI開発マスター指示書）](./docs/culturewalk-ai-dev-spec.md)
- [画面仕様書](./docs/culturewalk-screen-spec.md)
