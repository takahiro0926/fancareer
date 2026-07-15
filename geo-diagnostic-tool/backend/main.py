"""FastAPI application exposing the GEO diagnostic tool."""
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from analyzer import FetchError, GEOAnalyzer
from schemas import AnalyzeRequest, AnalyzeResponse

app = FastAPI(title="GEO Diagnostic Tool", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URLを入力してください。")

    try:
        analyzer = GEOAnalyzer(url)
        result = analyzer.analyze()
    except FetchError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - surface unexpected failures to the client
        raise HTTPException(status_code=500, detail=f"解析中にエラーが発生しました: {exc}") from exc

    return AnalyzeResponse(**result)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")
