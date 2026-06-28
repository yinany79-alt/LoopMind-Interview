"""Battle Record / Journey 历史接口 + Challenger 统计。"""
from __future__ import annotations

import random
from typing import Any, Dict, List

from fastapi import APIRouter

from src.api.errors import error_response
from src.knowledge.personas import PERSONA_CARDS, get_card
from src.persistence import db

router = APIRouter()


@router.get("/api/history/stats")
async def get_history_stats() -> Dict[str, Any]:
    """Home「我的战绩」+ Journey 页用。空 DB 时返回 0。"""
    return db.get_journey_stats()


@router.get("/api/history/list")
async def get_history_list(limit: int = 20) -> Dict[str, Any]:
    """Journey 页历史列表。"""
    rows = db.list_history(limit=limit)
    out = []
    for r in rows:
        persona = get_card(r["persona_id"]) if r["persona_id"] else None
        out.append({
            "session_id": r["session_id"],
            "created_at": r["created_at"],
            "ended_at": r["ended_at"],
            "mode": r["mode"],
            "persona_id": r["persona_id"],
            "persona_name": (persona or {}).get("name") if persona else None,
            "persona_avatar": (persona or {}).get("avatar") if persona else None,
            "jd_title": r["jd_title"],
            "topics_count": r["topics_count"],
            "satisfaction_final": r["satisfaction_final"],
            "duration_minutes": int((r["duration_seconds"] or 0) / 60),
        })
    return {"items": out}


# ===== Challenger 推荐 + 统计 =====

_PUBLIC_FIELDS = (
    "id", "tier", "name", "role_title", "avatar", "trait_label",
    "one_liner", "tags", "default_dimensions",
    "affiliation", "affiliation_slug", "score",
)


def _public_persona(c: Dict[str, Any]) -> Dict[str, Any]:
    return {k: c[k] for k in _PUBLIC_FIELDS if k in c}


@router.get("/api/challengers/recommended")
async def get_recommended_challengers(count: int = 4) -> Dict[str, Any]:
    """Home「推荐面试官」用。从 9 张里随机抽 count 张,优先 mentor + 至少 1 个 legend。

    随机但不暴露 random.seed 时间敏感性 —— 我们用 daily seed 让一天内固定。
    """
    import time
    seed = int(time.time() // 86400)
    rng = random.Random(seed)

    mentors = [c for c in PERSONA_CARDS if c.get("tier") == "mentor"]
    legends = [c for c in PERSONA_CARDS if c.get("tier") == "legend"]
    rng.shuffle(mentors)
    rng.shuffle(legends)

    # 优先 mentor,至少 1 legend
    picks = mentors[: max(1, count - 1)] + legends[:1]
    picks = picks[:count]
    return {"personas": [_public_persona(c) for c in picks]}


@router.get("/api/challengers/{persona_id}/stats")
async def get_challenger_stats(persona_id: str) -> Dict[str, Any]:
    """Challenger Detail 页「挑战记录」用。

    真实 DB 统计 + base 数(让冷启动有数字看)。
    """
    card = get_card(persona_id)
    if not card:
        raise error_response("PERSONA_NOT_FOUND", f"未知 persona: {persona_id}", 404)

    real = db.get_challenger_stats(persona_id)
    # base 数:legend 高 / mentor 中,随 score 和 tier 衍生
    score = card.get("score") or 4.8
    base_count = int(score * 1500) if card.get("tier") == "legend" else int(score * 2000)
    base_pass = 30 if card.get("tier") == "legend" else 55

    return {
        "persona_id": persona_id,
        "challenged_count": base_count + real["challenged_count"],
        "avg_duration_min": real["avg_duration_min"] or 14,
        "pass_rate": real["pass_rate"] or base_pass,
        "rating": score,
    }
