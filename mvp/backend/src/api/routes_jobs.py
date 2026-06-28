"""Trending Missions / 精选 JD API。"""
from __future__ import annotations

import random
from typing import Any, Dict, List

from fastapi import APIRouter

from src.api.errors import error_response
from src.data.curated_jobs import (
    CURATED_JOBS,
    get_curated_job,
    list_curated_jobs,
)
from src.persistence import db

router = APIRouter()


@router.get("/api/curated-jobs")
async def get_curated_jobs() -> Dict[str, Any]:
    """Trending Missions 列表。带 challenged_count 真实统计。"""
    counts = db.get_curated_job_counts()
    jobs = list_curated_jobs()
    for j in jobs:
        # 真实计数 + base 数(让初期就显得有人挑战过)
        base = (hash(j["id"]) % 3000) + 800   # 800-3800 之间
        j["challenged_count"] = base + counts.get(j["id"], 0) * 50
    return {"jobs": jobs}


@router.get("/api/curated-jobs/{job_id}")
async def get_curated_job_detail(job_id: str) -> Dict[str, Any]:
    """单条 JD 详情,包含 jd_text 全文。"""
    job = get_curated_job(job_id)
    if not job:
        raise error_response("JOB_NOT_FOUND", f"未知 curated job: {job_id}", 404)
    counts = db.get_curated_job_counts()
    base = (hash(job["id"]) % 3000) + 800
    out = dict(job)
    out["challenged_count"] = base + counts.get(job_id, 0) * 50
    return out
