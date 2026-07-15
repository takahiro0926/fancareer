# GEO診断ツール

URLを入力するとページをスクレイピングし、AI検索エンジン（Google AI Overviews、ChatGPT、Perplexityなど）に
引用されやすいかどうかを4つの観点で診断するWebアプリケーションです。

## 診断カテゴリ

1. **構造解析（アンサーファースト）** — 結論の早期提示、見出し直下の要約文、リスト/表の活用
2. **テクニカル・アクセス性** — robots.txtでのAIボット許可、llms.txtの設置、構造化データ(JSON-LD)
3. **E-E-A-Tと一次情報** — 著者・監修者情報、独自調査・実体験シグナル（`OPENAI_API_KEY`があればLLM判定を使用）
4. **トピッククラスター・内部リンク** — 内部リンク数とアンカーテキストの関連性

各チェックは `Pass` / `Warning` / `Error` の3段階で評価され、GEO観点の解説付きで表示されます。

## セットアップ

```bash
cd geo-diagnostic-tool/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # OPENAI_API_KEYは任意
```

## 起動

```bash
cd geo-diagnostic-tool/backend
uvicorn main:app --reload
```

ブラウザで `http://localhost:8000` を開くとフロントエンドが表示されます
（FastAPIが `frontend/` を静的配信し、`/api/analyze` にPOSTします）。

## API

```
POST /api/analyze
Content-Type: application/json

{ "url": "https://example.com/article" }
```

レスポンスは総合スコアとカテゴリ別のチェック結果（status / message / explanation / detail）を返します。
