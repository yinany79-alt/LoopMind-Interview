"""GET /api/personas — 返回 4 张人格卡片(hardcoded)。"""
from __future__ import annotations

from fastapi import APIRouter

from src.knowledge.personas import PERSONA_CARDS

router = APIRouter()


@router.get("/api/personas")
async def list_personas() -> dict:
    # 只暴露前端需要的字段
    personas = [
        {
            "id": c["id"],
            "name": c["name"],
            "tags": c["tags"],
            "description": c["description"],
            "default_dimensions": c["default_dimensions"],
        }
        for c in PERSONA_CARDS
    ]
    return {"personas": personas}
