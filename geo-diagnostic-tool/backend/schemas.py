"""Pydantic models for the GEO diagnostic API."""
from typing import Literal, Optional

from pydantic import BaseModel, Field

Status = Literal["pass", "warning", "error"]


class AnalyzeRequest(BaseModel):
    url: str = Field(..., description="解析対象のURL")


class CheckResult(BaseModel):
    id: str
    title: str
    status: Status
    message: str
    explanation: str
    detail: Optional[str] = None


class CategoryResult(BaseModel):
    id: str
    name: str
    score: int
    checks: list[CheckResult]


class AnalyzeResponse(BaseModel):
    url: str
    overall_score: int
    categories: list[CategoryResult]
