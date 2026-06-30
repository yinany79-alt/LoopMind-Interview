"""GET /api/personas — 返回 mentor + legend 两档共 9 张人格卡片。"""
from __future__ import annotations

from fastapi import APIRouter

from src.knowledge.personas import PERSONA_CARDS

router = APIRouter()


# 给前端的字段白名单(不暴露内部 description / SKILL.md 内容)
_PUBLIC_FIELDS = (
    "id",
    "tier",
    "name",
    "role_title",
    "avatar",
    "trait_label",
    "one_liner",
    "tags",
    "default_dimensions",
    "affiliation",
    "affiliation_slug",
    "score",
    "first_principle",
)


@router.get("/api/personas")
async def list_personas() -> dict:
    personas = [
        {k: c[k] for k in _PUBLIC_FIELDS if k in c}
        for c in PERSONA_CARDS
    ]
    return {"personas": personas}
