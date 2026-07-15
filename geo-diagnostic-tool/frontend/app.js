const API_ENDPOINT = "/api/analyze";

const form = document.getElementById("analyze-form");
const urlInput = document.getElementById("url-input");
const submitBtn = document.getElementById("submit-btn");
const loadingEl = document.getElementById("loading");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error-message");
const categoriesEl = document.getElementById("categories");
const overallScoreValueEl = document.getElementById("overall-score-value");
const overallUrlEl = document.getElementById("overall-url");
const scoreRingFg = document.getElementById("score-ring-fg");

const STATUS_LABEL = { pass: "Pass", warning: "Warning", error: "Error" };
const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;

  setLoading(true);
  hideError();
  resultEl.hidden = true;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "解析に失敗しました。");
    }

    renderResult(data);
  } catch (err) {
    showError(err.message || "予期しないエラーが発生しました。");
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  loadingEl.hidden = !isLoading;
  submitBtn.disabled = isLoading;
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function hideError() {
  errorEl.hidden = true;
  errorEl.textContent = "";
}

function renderResult(data) {
  overallScoreValueEl.textContent = data.overall_score;
  overallUrlEl.textContent = data.url;

  const offset = RING_CIRCUMFERENCE * (1 - data.overall_score / 100);
  scoreRingFg.style.strokeDashoffset = offset;
  scoreRingFg.style.stroke = scoreColor(data.overall_score);

  categoriesEl.innerHTML = "";
  data.categories.forEach((category) => {
    categoriesEl.appendChild(renderCategory(category));
  });

  resultEl.hidden = false;
  resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderCategory(category) {
  const card = document.createElement("div");
  card.className = "category-card";

  const header = document.createElement("div");
  header.className = "category-header";
  header.innerHTML = `
    <h2>${escapeHtml(category.name)}</h2>
    <span class="category-score">${category.score}点</span>
  `;
  card.appendChild(header);

  const list = document.createElement("div");
  list.className = "check-list";
  category.checks.forEach((check) => {
    list.appendChild(renderCheck(check));
  });
  card.appendChild(list);

  return card;
}

function renderCheck(check) {
  const item = document.createElement("div");
  item.className = "check-item";

  const detailHtml = check.detail
    ? `<p class="check-detail">${escapeHtml(check.detail)}</p>`
    : "";

  item.innerHTML = `
    <div class="check-item-head">
      <span class="badge badge-${check.status}">${STATUS_LABEL[check.status] || check.status}</span>
      <span class="check-title">${escapeHtml(check.title)}</span>
    </div>
    <p class="check-message">${escapeHtml(check.message)}</p>
    <p class="check-explanation">${escapeHtml(check.explanation)}</p>
    ${detailHtml}
  `;
  return item;
}

function scoreColor(score) {
  if (score >= 80) return "#15803d";
  if (score >= 50) return "#b45309";
  return "#b91c1c";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
