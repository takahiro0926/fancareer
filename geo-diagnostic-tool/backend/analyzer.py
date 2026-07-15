"""GEO (Generative Engine Optimization) diagnostic logic.

GEOAnalyzer scrapes a single URL and evaluates it across four axes that
influence whether AI answer engines (Google AI Overviews, ChatGPT,
Perplexity, ...) are likely to cite the page:

1. structure   - answer-first structure, heading/paragraph shape, list/table usage
2. technical   - bot accessibility (robots.txt / llms.txt) and structured data
3. eeat        - author/authority signals and first-party experience signals
4. topic_links - internal linking strength for topic clusters

Each check returns a "pass" / "warning" / "error" verdict plus a short
GEO-oriented explanation of *why* it matters, which the frontend renders
directly.
"""
from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass, field
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

USER_AGENT = "GEO-Diagnostic-Tool/1.0 (+https://example.com/geo-tool)"
REQUEST_TIMEOUT = 10

AI_BOTS = ["GPTBot", "Claude-SearchBot", "OAI-SearchBot", "PerplexityBot", "Google-Extended"]

STRUCTURED_DATA_TYPES = ["FAQPage", "HowTo", "Article", "Organization"]

AUTHOR_KEYWORDS = ["監修", "著者", "執筆者", "筆者", "ライター", "author", "written by", "profile"]
AUTHOR_LINK_DOMAINS = ["linkedin.com", "twitter.com", "x.com", "facebook.com"]

PRIMARY_SOURCE_KEYWORDS = [
    "当社調べ", "自社調べ", "アンケート", "実際に体験", "実際に使用", "独自調査",
    "実体験", "取材", "検証しました", "検証した結果", "覆面調査", "実測",
]

GENERIC_ANCHOR_TEXTS = {"こちら", "click here", "read more", "詳しくはこちら", "here", "リンク", "詳細"}


class FetchError(Exception):
    """Raised when the target URL (or an auxiliary resource) cannot be fetched."""


@dataclass
class Check:
    id: str
    title: str
    status: str  # pass | warning | error
    message: str
    explanation: str
    detail: str | None = None

    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "status": self.status,
            "message": self.message,
            "explanation": self.explanation,
            "detail": self.detail,
        }


@dataclass
class Category:
    id: str
    name: str
    checks: list[Check] = field(default_factory=list)

    @property
    def score(self) -> int:
        if not self.checks:
            return 0
        weights = {"pass": 1.0, "warning": 0.5, "error": 0.0}
        total = sum(weights[c.status] for c in self.checks)
        return round(total / len(self.checks) * 100)

    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "score": self.score,
            "checks": [c.as_dict() for c in self.checks],
        }


class GEOAnalyzer:
    """Fetches a URL and runs the four GEO diagnostic categories against it."""

    def __init__(self, url: str, use_llm: bool = True):
        parsed = urlparse(url if "://" in url else f"https://{url}")
        if not parsed.netloc:
            raise FetchError(f"無効なURLです: {url}")
        self.url = parsed.geturl()
        self.parsed_url = parsed
        self.root = f"{parsed.scheme}://{parsed.netloc}"
        self.use_llm = use_llm and bool(os.environ.get("OPENAI_API_KEY"))

        response = self._fetch(self.url)
        # Parse raw bytes (not response.text) so BeautifulSoup can sniff the real
        # encoding from <meta charset>; requests falls back to ISO-8859-1 when a
        # server omits a charset in Content-Type, which mangles non-ASCII text.
        self.html = response.content
        self.soup = BeautifulSoup(self.html, "html.parser")
        self.full_text = self._extract_visible_text(self.soup)

    # ------------------------------------------------------------------
    # HTTP helpers
    # ------------------------------------------------------------------
    def _fetch(self, url: str, timeout: int = REQUEST_TIMEOUT) -> requests.Response:
        try:
            resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=timeout)
        except requests.RequestException as exc:
            raise FetchError(f"{url} の取得に失敗しました: {exc}") from exc
        resp.raise_for_status()
        return resp

    @staticmethod
    def _extract_visible_text(soup: BeautifulSoup) -> str:
        clone = BeautifulSoup(str(soup), "html.parser")
        for tag in clone(["script", "style", "noscript", "template"]):
            tag.decompose()
        text = clone.get_text(separator=" ", strip=True)
        return re.sub(r"\s+", " ", text)

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------
    def analyze(self) -> dict:
        categories = [
            self._analyze_structure(),
            self._analyze_technical(),
            self._analyze_eeat(),
            self._analyze_topic_links(),
        ]
        scores = [c.score for c in categories]
        overall = round(sum(scores) / len(scores)) if scores else 0
        return {
            "url": self.url,
            "overall_score": overall,
            "categories": [c.as_dict() for c in categories],
        }

    # ------------------------------------------------------------------
    # 1. 構造解析（アンサーファースト）
    # ------------------------------------------------------------------
    def _analyze_structure(self) -> Category:
        cat = Category(id="structure", name="構造解析（アンサーファースト）")

        cat.checks.append(self._check_answer_first())
        cat.checks.append(self._check_heading_paragraph_shape())
        cat.checks.append(self._check_list_table_usage())
        return cat

    def _check_answer_first(self) -> Check:
        text = self.full_text
        total_len = len(text)
        if total_len == 0:
            return Check(
                "answer_first", "結論の早期提示", "error",
                "本文テキストが取得できませんでした。",
                "AIは記事冒頭の情報を要約に使う傾向が強く、本文が空だと引用されません。",
            )

        title = self.soup.title.get_text(strip=True) if self.soup.title else ""
        h1 = self.soup.find("h1")
        h1_text = h1.get_text(strip=True) if h1 else ""
        keyword_source = f"{title} {h1_text}"
        keywords = [w for w in re.split(r"[\s　/|｜\-–―・、,。]+", keyword_source) if len(w) >= 2]

        lead_len = max(int(total_len * 0.3), 1)
        lead_text = text[:lead_len]

        hits = [kw for kw in keywords if kw and kw in lead_text]
        hit_ratio = len(hits) / len(keywords) if keywords else 0

        if not keywords:
            return Check(
                "answer_first", "結論の早期提示", "warning",
                "タイトル/見出しからキーワードを抽出できず、判定できませんでした。",
                "title・h1に主要キーワードを含めることで、AIがページの主題を早期に把握できます。",
                detail=f"本文文字数: {total_len}字",
            )

        if hit_ratio >= 0.5:
            status, message = "pass", "主要キーワード・結論が本文冒頭30%以内に含まれています。"
        elif hit_ratio > 0:
            status, message = "warning", "主要キーワードの一部のみが冒頭30%以内に含まれています。"
        else:
            status, message = "error", "主要キーワードが本文冒頭30%以内に含まれていません。"

        return Check(
            "answer_first", "結論の早期提示", status, message,
            "生成AIは記事の冒頭部分を回答生成の根拠として優先的に参照します。"
            "結論・主要キーワードを前半に配置することで引用されやすくなります（アンサーファースト）。",
            detail=f"本文文字数: {total_len}字 / 冒頭{lead_len}字 / 一致キーワード: {', '.join(hits) or 'なし'}",
        )

    def _check_heading_paragraph_shape(self) -> Check:
        headings = self.soup.find_all(["h2", "h3"])
        if not headings:
            return Check(
                "heading_paragraph", "見出し直下の結論文", "warning",
                "h2/h3見出しが見つかりませんでした。",
                "見出しごとに要点を40〜60文字程度で先出しすると、AIが見出し単位で内容を抽出しやすくなります。",
            )

        ideal_count = 0
        sample_lengths: list[int] = []
        for heading in headings:
            p = heading.find_next_sibling("p")
            if p is None:
                # fall back to the first following <p> before the next heading
                for sib in heading.find_next_siblings():
                    if sib.name in ("h2", "h3"):
                        break
                    if sib.name == "p":
                        p = sib
                        break
            if p is None:
                continue
            length = len(p.get_text(strip=True))
            sample_lengths.append(length)
            if 40 <= length <= 60:
                ideal_count += 1

        total_with_p = len(sample_lengths)
        if total_with_p == 0:
            return Check(
                "heading_paragraph", "見出し直下の結論文", "error",
                "見出し直下に本文段落（p）が見つかりませんでした。",
                "見出し直後に結論を要約した短い段落を置くと、AIがそのまま回答に転用しやすくなります。",
            )

        ratio = ideal_count / total_with_p
        avg_len = round(sum(sample_lengths) / total_with_p)
        if ratio >= 0.6:
            status, message = "pass", "見出し直下の段落が簡潔（40〜60文字目安）にまとまっています。"
        elif ratio >= 0.3:
            status, message = "warning", "簡潔な結論文になっている見出しと、そうでない見出しが混在しています。"
        else:
            status, message = "error", "見出し直下の段落が長すぎる/短すぎるものが大半です。"

        return Check(
            "heading_paragraph", "見出し直下の結論文", status, message,
            "AIは見出し＋直後の短い説明文をセットで抽出し要約に利用します。"
            "40〜60文字程度で結論を先出しすると、そのまま引用可能な粒度になります。",
            detail=f"対象見出し数: {len(headings)} / 判定対象: {total_with_p} / 理想範囲: {ideal_count}件 / 平均文字数: {avg_len}字",
        )

    def _check_list_table_usage(self) -> Check:
        ul_count = len(self.soup.find_all("ul"))
        ol_count = len(self.soup.find_all("ol"))
        table_count = len(self.soup.find_all("table"))
        total = ul_count + ol_count + table_count

        if total >= 2:
            status, message = "pass", "リスト/表構造が複数利用されており、情報が構造化されています。"
        elif total == 1:
            status, message = "warning", "リスト/表構造が1件のみです。情報の構造化を増やすと有利です。"
        else:
            status, message = "error", "リスト（ul/ol）や表（table）が使われていません。"

        return Check(
            "list_table", "リスト・表構造の活用", status, message,
            "箇条書きや表はAIが情報を要素単位でパースしやすく、"
            "AI Overviewsやチャット回答内で構造を保ったまま引用されやすくなります。",
            detail=f"ul: {ul_count} / ol: {ol_count} / table: {table_count}",
        )

    # ------------------------------------------------------------------
    # 2. テクニカル・アクセス性
    # ------------------------------------------------------------------
    def _analyze_technical(self) -> Category:
        cat = Category(id="technical", name="テクニカル・アクセス性")
        cat.checks.append(self._check_robots_txt())
        cat.checks.append(self._check_llms_txt())
        cat.checks.append(self._check_structured_data())
        return cat

    def _check_robots_txt(self) -> Check:
        robots_url = urljoin(self.root, "/robots.txt")
        try:
            resp = requests.get(robots_url, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT)
        except requests.RequestException:
            return Check(
                "robots_txt", "AIクローラーのアクセス許可 (robots.txt)", "warning",
                "robots.txtの取得中にエラーが発生しました。",
                "robots.txtが存在しない場合、多くのAIクローラーはデフォルトでアクセス許可とみなしますが、"
                "明示設定を確認できないためWarningとしています。",
            )

        if resp.status_code >= 400:
            return Check(
                "robots_txt", "AIクローラーのアクセス許可 (robots.txt)", "warning",
                f"robots.txtが見つかりません（HTTP {resp.status_code}）。",
                "robots.txt未設置の場合、AIクローラーは基本的にクロール可能と解釈しますが、"
                "明示的に許可/ブロックを管理するために設置を推奨します。",
            )

        parser = RobotFileParser()
        parser.parse(resp.text.splitlines())

        blocked = [bot for bot in AI_BOTS if not parser.can_fetch(bot, self.url)]

        if not blocked:
            status, message = "pass", "主要なAI検索クローラーはDisallowされていません。"
        elif len(blocked) < len(AI_BOTS):
            status = "warning"
            message = f"一部のAIクローラーがDisallowされています: {', '.join(blocked)}"
        else:
            status = "error"
            message = "主要なAIクローラーがすべてDisallowされています。"

        return Check(
            "robots_txt", "AIクローラーのアクセス許可 (robots.txt)", status, message,
            "GPTBotやPerplexityBot等がDisallowされていると、そもそもAIにページ内容を取得・引用してもらえません。"
            "GEOの大前提となる設定です。",
            detail=f"確認対象: {', '.join(AI_BOTS)} / ブロック: {', '.join(blocked) or 'なし'}",
        )

    def _check_llms_txt(self) -> Check:
        llms_url = urljoin(self.root, "/llms.txt")
        try:
            resp = requests.get(llms_url, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT)
            exists = resp.status_code == 200
        except requests.RequestException:
            exists = False

        if exists:
            status, message = "pass", "/llms.txt が設置されています。"
        else:
            status, message = "warning", "/llms.txt が見つかりませんでした。"

        return Check(
            "llms_txt", "llms.txt の設置", status, message,
            "llms.txtはLLM向けにサイトの要約や重要ページを伝える新しい標準です。"
            "必須ではありませんが、設置するとAIがサイト構造を効率的に理解できます。",
        )

    def _check_structured_data(self) -> Check:
        scripts = self.soup.find_all("script", attrs={"type": "application/ld+json"})
        found_types: set[str] = set()

        for script in scripts:
            if not script.string:
                continue
            try:
                data = json.loads(script.string)
            except (json.JSONDecodeError, TypeError):
                continue
            found_types |= self._collect_json_ld_types(data)

        matched = sorted(found_types & set(STRUCTURED_DATA_TYPES))

        if matched:
            status = "pass" if len(matched) >= 2 else "warning"
            message = f"構造化データを検出しました: {', '.join(matched)}"
        else:
            status, message = "error", "GEOに有効な構造化データ（JSON-LD）が見つかりませんでした。"

        return Check(
            "structured_data", "構造化データ (JSON-LD)", status, message,
            "FAQPageやHowTo, Article, Organizationなどのスキーママークアップは、"
            "AIがページの意味・信頼性を機械的に理解する手がかりになり、引用の精度を高めます。",
            detail=f"検出された@type: {', '.join(sorted(found_types)) or 'なし'} / JSON-LDブロック数: {len(scripts)}",
        )

    @classmethod
    def _collect_json_ld_types(cls, data) -> set[str]:
        types: set[str] = set()
        if isinstance(data, list):
            for item in data:
                types |= cls._collect_json_ld_types(item)
        elif isinstance(data, dict):
            raw_type = data.get("@type")
            if isinstance(raw_type, str):
                types.add(raw_type)
            elif isinstance(raw_type, list):
                types.update(t for t in raw_type if isinstance(t, str))
            if "@graph" in data:
                types |= cls._collect_json_ld_types(data["@graph"])
        return types

    # ------------------------------------------------------------------
    # 3. E-E-A-Tと一次情報
    # ------------------------------------------------------------------
    def _analyze_eeat(self) -> Category:
        cat = Category(id="eeat", name="E-E-A-Tと一次情報")
        cat.checks.append(self._check_author_signals())
        cat.checks.append(self._check_primary_source_signals())
        return cat

    def _check_author_signals(self) -> Check:
        keyword_hit = any(kw in self.full_text for kw in AUTHOR_KEYWORDS)

        author_links = []
        for a in self.soup.find_all("a", href=True):
            href = a["href"]
            if any(domain in href for domain in AUTHOR_LINK_DOMAINS):
                author_links.append(href)

        if self.use_llm:
            llm_result = self._llm_judge(
                "author_signals",
                "このページに、著者・監修者の情報（氏名・肩書き・経歴・SNS等）が明記されているか判定してください。",
            )
            if llm_result is not None:
                return llm_result

        if keyword_hit and author_links:
            status, message = "pass", "著者・監修者を示すキーワードとプロフィールリンクの両方が見つかりました。"
        elif keyword_hit or author_links:
            status, message = "warning", "著者情報の一部（キーワードまたはリンク）のみ見つかりました。"
        else:
            status, message = "error", "著者・監修者を示す情報が見つかりませんでした。"

        return Check(
            "author_signals", "著者・監修者情報", status, message,
            "E-E-A-T（経験・専門性・権威性・信頼性）の観点で、誰が書いたかが明確なコンテンツほど"
            "AIに信頼できる情報源として引用されやすくなります。",
            detail=f"キーワード検出: {keyword_hit} / プロフィールリンク数: {len(author_links)}",
        )

    def _check_primary_source_signals(self) -> Check:
        hits = [kw for kw in PRIMARY_SOURCE_KEYWORDS if kw in self.full_text]

        if self.use_llm:
            llm_result = self._llm_judge(
                "primary_source",
                "このページに、独自調査・アンケート・実体験などの一次情報/オリジナルデータが含まれているか判定してください。",
            )
            if llm_result is not None:
                return llm_result

        if len(hits) >= 2:
            status, message = "pass", "一次情報・実体験を示すシグナルが複数見つかりました。"
        elif len(hits) == 1:
            status, message = "warning", "一次情報・実体験を示すシグナルが1件のみ見つかりました。"
        else:
            status, message = "error", "一次情報・実体験（独自調査、体験談など）を示すシグナルが見つかりませんでした。"

        return Check(
            "primary_source", "一次情報・実体験シグナル", status, message,
            "他サイトの要約ではなく、独自データや実体験に基づく一次情報はAIにとって高い引用価値を持ちます。"
            "一般論のみのコンテンツは他の同様な記事と差別化されず、引用されにくくなります。",
            detail=f"検出キーワード: {', '.join(hits) or 'なし'}",
        )

    def _llm_judge(self, check_id: str, question: str) -> Check | None:
        """Optional nuanced judgment via the OpenAI API. Returns None on any failure
        so callers can fall back to the keyword-based heuristic."""
        try:
            from openai import OpenAI
        except ImportError:
            return None

        try:
            client = OpenAI()
            excerpt = self.full_text[:4000]
            completion = client.chat.completions.create(
                model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "あなたはSEO/GEO(生成エンジン最適化)の専門家です。"
                            "与えられたページ本文の抜粋を読み、質問に対してJSON形式で"
                            '{"status": "pass|warning|error", "message": "一文で理由"} のみを返してください。'
                        ),
                    },
                    {"role": "user", "content": f"質問: {question}\n\nページ本文抜粋:\n{excerpt}"},
                ],
                response_format={"type": "json_object"},
                temperature=0,
            )
            payload = json.loads(completion.choices[0].message.content)
            status = payload.get("status")
            message = payload.get("message", "")
            if status not in ("pass", "warning", "error"):
                return None
        except Exception:
            return None

        title_map = {
            "author_signals": ("著者・監修者情報", "E-E-A-T（経験・専門性・権威性・信頼性）の観点で、誰が書いたかが明確なコンテンツほど"
                                "AIに信頼できる情報源として引用されやすくなります。"),
            "primary_source": ("一次情報・実体験シグナル", "他サイトの要約ではなく、独自データや実体験に基づく一次情報はAIにとって高い引用価値を持ちます。"),
        }
        title, explanation = title_map[check_id]
        return Check(check_id, title, status, message or "LLMによる判定結果です。", explanation, detail="判定方法: OpenAI API")

    # ------------------------------------------------------------------
    # 4. トピッククラスター・内部リンク
    # ------------------------------------------------------------------
    def _analyze_topic_links(self) -> Category:
        cat = Category(id="topic_links", name="トピッククラスター・内部リンク")

        internal_links = []
        for a in self.soup.find_all("a", href=True):
            href = a["href"].strip()
            if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
                continue
            resolved = urljoin(self.url, href)
            if urlparse(resolved).netloc != self.parsed_url.netloc:
                continue
            internal_links.append((resolved, a.get_text(strip=True)))

        link_count = len(internal_links)
        if link_count >= 8:
            count_status, count_message = "pass", f"内部リンクが{link_count}件あり、トピッククラスターを形成できています。"
        elif link_count >= 3:
            count_status, count_message = "warning", f"内部リンクは{link_count}件です。関連トピックへの導線を増やすと有利です。"
        else:
            count_status, count_message = "error", f"内部リンクが{link_count}件しかなく、極端に少ない状態です。"

        cat.checks.append(Check(
            "internal_link_count", "内部リンク数", count_status, count_message,
            "内部リンクはサイト内のトピック同士の関連性をAIに伝え、"
            "専門特化サイト（トピッククラスター）としての評価・引用可能性を高めます。",
            detail=f"内部リンク総数: {link_count}",
        ))

        generic = [text for _, text in internal_links if self._is_generic_anchor(text)]
        meaningful = link_count - len(generic)
        relevance_ratio = meaningful / link_count if link_count else 0

        if link_count == 0:
            rel_status, rel_message = "error", "内部リンクが存在しないため、アンカーテキストの評価ができません。"
        elif relevance_ratio >= 0.8:
            rel_status, rel_message = "pass", "ほとんどのアンカーテキストが具体的でトピックとの関連性が高いです。"
        elif relevance_ratio >= 0.5:
            rel_status, rel_message = "warning", "「こちら」等の汎用的なアンカーテキストが一部見られます。"
        else:
            rel_status, rel_message = "error", "汎用的なアンカーテキストが多く、リンク先の内容がAIに伝わりにくい状態です。"

        cat.checks.append(Check(
            "anchor_text_relevance", "アンカーテキストの関連性", rel_status, rel_message,
            "「こちら」のような汎用的なリンク文言ではなく、リンク先の内容を表す具体的なアンカーテキストにすることで、"
            "AIがリンク先トピックとの関連性を正しく理解できます。",
            detail=f"具体的なアンカー: {meaningful}/{link_count}",
        ))

        return cat

    @staticmethod
    def _is_generic_anchor(text: str) -> bool:
        normalized = text.strip().lower()
        return (not normalized) or (normalized in GENERIC_ANCHOR_TEXTS) or len(normalized) <= 1
