# カルチャーウォーク 画面仕様書

**対象読者:** 受託開発会社・実装担当AI（Cursor / Claude Code等）
**関連ドキュメント:** [culturewalk-ai-dev-spec.md](./culturewalk-ai-dev-spec.md)（要件定義）／ワイヤーフレーム（Artifact: https://claude.ai/artifact/CggEWK8B644CXurukGKXiw）

本書は、ワイヤーフレームで作成した5画面について、画面内の各要素の役割と、実装に必要なデータ項目を一覧化したものです。そのままDB設計・API設計・フロントエンド実装のインプットとして使用できます。

---

## 画面一覧

| No | 画面名 | ファイル | 想定ユーザー |
|---|---|---|---|
| ① | ホーム | `Home` | シニアユーザー |
| ② | イベント詳細 | `EventDetail` | シニアユーザー |
| ③ | 対面サポート | `ASASupport` | シニアユーザー |
| ④ | カルチャーマイル | `Mile` | シニアユーザー |
| ⑤ | B2Bダッシュボード（インサイト分析） | `Dashboard` | 協賛企業担当者 |

---

## ① ホーム画面

### 目的
ユーザーの当日の歩行状況と、近隣で開催中のイベントを一目で把握させ、外出のきっかけを作る。

### 要素と役割

| 要素 | 役割 | データ項目 |
|---|---|---|
| 挨拶・日付 | パーソナライズ表示 | `user.name`（氏名）, 現在日時 |
| マイル残高バッジ | 現在のカルチャーマイル残高を表示、タップで④へ遷移 | `user.mile_balance`（int） |
| 歩数プログレスカード | 当日の歩数と目標達成率、獲得マイルを表示 | `daily_steps.count`（int）, `daily_steps.goal`（int, デフォルト8000）, `daily_steps.miles_earned`（int） |
| 近くのおでかけカード（複数） | 徒歩・電車15〜30分圏内のイベントを提示、タップで②へ遷移 | `event.id`, `event.title`, `event.image_url`, `event.access_mode`（徒歩/電車）, `event.access_minutes`（int）, `event.datetime`, `event.has_mile_discount`（bool） |
| おでかけパックCTA | 初心者向けパック紹介、タップで②へ遷移 | — |
| ASA相談バナー | 対面サポートへの導線、タップで③へ遷移 | — |
| ボトムナビ | ホーム／イベント検索／マイページの切り替え | — |

### 連携ポイント
- 歩数データ：iOS HealthKit / Android Google Fit から取得しサーバーに同期
- イベント一覧：ぴあAPIから、ユーザーの郵便番号・ASAエリアコード・GPS座標をもとに徒歩/電車15〜30分圏内で絞り込み取得

---

## ② イベント詳細画面

### 目的
チケット未購入者の購入ハードルを下げ、マイル割引・おでかけパック・同伴誘導によって参加を後押しする。

### 要素と役割

| 要素 | 役割 | データ項目 |
|---|---|---|
| ヘッダー（戻る） | ①へ戻る | — |
| イベントイメージ画像 | 会場・演目イメージ | `event.image_url` |
| タイトル・meta | イベント名、距離、日時 | `event.title`, `event.access_minutes`, `event.datetime` |
| 価格・マイル割引ボタン | タップで割引適用状態をトグル。適用後は割引後価格とチェックマークを表示 | `event.price_normal`（int）, `event.discount_amount`（int, 初回500円等）, `user.mile_balance`（割引に必要なマイル数を差し引く） |
| おでかけパック案内カード | 歩数目安・休憩スポット・チケット代行の3点を明示 | `event.pack.walk_minutes`, `event.pack.rest_spots`（配列）, `event.pack.ticket_arranged`（bool） |
| 友達を誘うボタン | 招待リンク発行、招待成立でボーナスマイル付与 | `invite.code`, `invite.bonus_miles`（int） |
| ASA相談バナー | ③への導線 | — |

### 連携ポイント
- 割引適用時：`user.mile_balance` から `discount_amount` に相当するマイルを即時減算し、`ticket_order.discount_applied = true` を記録
- 友達招待：招待コード経由の新規登録成立時にボーナスマイルを両者に付与するバッチ/Webhook処理が必要

---

## ③ 対面サポート画面

### 目的
デジタル操作が難しいユーザーに対し、ASA店頭・電話での有人サポートへの導線を提供する。

### 要素と役割

| 要素 | 役割 | データ項目 |
|---|---|---|
| QRコード | ASA店頭スタッフが読み取り、ユーザーの会員情報・検討中のイベントを店頭端末に表示 | `support_session.token`（一時トークン、有効期限あり） |
| 電話で相談するボタン | 最寄りASAへ`tel:`発信 | `asa.phone_number` |
| 最寄りASA店舗情報 | 店舗名・住所・営業時間 | `asa.name`, `asa.address`, `asa.business_hours` |

### 連携ポイント
- ユーザー住所またはGPSからASAエリアコードを解決し、該当店舗情報を取得
- QRコード発行時、`support_session` を作成（短期有効トークン。店頭端末側でスキャンし、対象ユーザーの直前の閲覧イベント・決済状況を照会できるようにする）

---

## ④ カルチャーマイル画面

### 目的
貯めたマイルの残高確認と、クーポンへの交換を行わせる。

### 要素と役割

| 要素 | 役割 | データ項目 |
|---|---|---|
| マイル残高カード | 現在残高、次のクーポンまでの進捗バー | `user.mile_balance`, `next_coupon.required_miles` |
| クーポンリスト | 交換可能なクーポンを一覧表示。「交換する」タップで即時交換、成功後は「交換済み」表示に切替 | `coupon.id`, `coupon.title`, `coupon.required_miles`, `coupon.discount_amount`, `coupon.status`（利用可能/マイル不足/交換済み） |

### 連携ポイント
- 交換処理：`user.mile_balance -= coupon.required_miles` のトランザクション処理、`user_coupons` テーブルへ発行記録
- マイル不足のクーポンはボタンを非活性表示（グレーアウト）

---

## ⑤ B2Bダッシュボード（インサイト分析）

### 目的
協賛企業に対し、行動データと連動したアンケート結果・サンプリング効果・広告出稿状況を提示する。

### 要素と役割

| 要素 | 役割 | データ項目 |
|---|---|---|
| サイドナビ | インサイト分析／サンプリング効果／広告・イベント管理／設定の切り替え | — |
| KPIカード（4種） | アクティブユーザー数、会場チェックイン数、アンケート回答数、サンプリング配布数（各前月比付き） | `kpi.active_users`, `kpi.checkins`, `kpi.survey_responses`, `kpi.samples_distributed`, 各`*_delta_pct` |
| 行動連動インサイトグラフ | 設問ごとの回答分布（横棒グラフ） | `survey.question`, `survey.answers`（`{label, percentage}`の配列）, `survey.n`（回答数） |
| サンプリング効果トラッカー表 | 商品別の配布数・認知度変化 | `sampling.product_name`, `sampling.distributed_count`, `sampling.awareness_change_pt`（配布前後の認知率差分） |
| 広告・冠イベント管理リスト | バナー／ウォークラリー／クーポンの掲出状況一覧、新規作成導線 | `promotion.title`, `promotion.type`（バナー/ウォークラリー/クーポン）, `promotion.status`（掲出中/準備中）, `promotion.period_start`, `promotion.period_end` |
| レポート出力ボタン | 集計レポートのダウンロード（CSV/PDF等） | — |

### 連携ポイント
- アンケート回答とユーザー行動ログ（匿名化済み）を `company_id` × `event_id` 単位で突合して集計
- B2B向け出力データは個人が特定できない集計単位（k-匿名化）を適用すること（要件定義書 6章参照）
- 「新しい掲出を作成」から先の入稿フォームは別途仕様化が必要（本書のスコープ外）

---

## 共通のデータモデル（参考）

主なエンティティの関係性の概略です。詳細なテーブル定義はDB設計時に確定してください。

```
users ── daily_steps
  │
  ├── mile_transactions（獲得・利用の履歴）
  ├── user_coupons
  └── ticket_orders ── events ── companies（協賛企業）
                                     │
                                     ├── survey_responses
                                     ├── sampling_records
                                     └── promotions（広告・冠イベント）

asa_stores（ASA店舗マスタ）── support_sessions
```
