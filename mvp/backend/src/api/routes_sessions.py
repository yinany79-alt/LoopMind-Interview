"""Session 生命周期接口:
- POST /api/sessions             创建 + 解析 JD(支持 3 mode: jd_paste / curated / coffee_chat)
- GET  /api/sessions/{id}        拿元信息
- POST /api/sessions/{id}/start  确认人格 + 启动
- POST /api/sessions/{id}/answer 提交回答(立即返回,后续走 SSE)
- POST /api/sessions/{id}/end    结束面试
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Literal, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from src.api.errors import error_response
from src.data.curated_jobs import get_cached_parse, get_curated_job
from src.graph.graph import on_user_answer, on_user_end
from src.graph.nodes.jd_parser import parse_jd
from src.knowledge.personas import get_card
from src.session_store import get_store

logger = logging.getLogger(__name__)
router = APIRouter()


# ===== Schemas =====

class CreateSessionRequest(BaseModel):
    """支持 3 种 mode:
    - jd_paste(默认):jd_text 必填,跑 jd_parser
    - curated:curated_job_id 必填,从缓存取 skill_tree
    - coffee_chat:都不需要,注入单节点 synthetic skill_tree
    """
    mode: Literal["jd_paste", "curated", "coffee_chat"] = "jd_paste"
    jd_text: Optional[str] = Field(None, max_length=10000)
    curated_job_id: Optional[str] = None


class PersonaDimensionsBody(BaseModel):
    warmth: int = Field(..., ge=0, le=100)
    depth_preference: int = Field(..., ge=0, le=100)
    pace: int = Field(..., ge=0, le=100)
    vision: int = Field(..., ge=0, le=100)


class PersonaBody(BaseModel):
    card_id: str
    dimensions: PersonaDimensionsBody


class StartSessionRequest(BaseModel):
    persona: PersonaBody


class AnswerRequest(BaseModel):
    content: str = Field(..., min_length=1)


class EndRequest(BaseModel):
    reason: str = "user_initiated"


# ===== Helpers =====

def _make_free_chat_skill_tree(persona_name: str = "面试官") -> Dict[str, Any]:
    """Coffee Chat 模式:伪 skill_tree,单节点。"""
    return {
        "root": f"与 {persona_name} 的自由对话",
        "dimensions": ["open_chat"],
        "nodes": [{
            "id": "free_chat",
            "topic": "自由话题",
            "weight": 5.0,
            "depth_level": "shallow",
            "dimensions": ["open_chat"],
        }],
    }


# ===== Routes =====

@router.post("/api/sessions")
async def create_session(body: CreateSessionRequest) -> Dict[str, Any]:
    store = get_store()

    if body.mode == "curated":
        if not body.curated_job_id:
            raise error_response("INVALID_REQUEST", "curated 模式需要 curated_job_id", 400)
        job = get_curated_job(body.curated_job_id)
        if not job:
            raise error_response("JOB_NOT_FOUND", f"未知 curated job: {body.curated_job_id}", 404)
        cached = get_cached_parse(body.curated_job_id)
        if not cached:
            # 缓存未命中(冷启动) — 现场跑 jd_parser
            logger.warning("curated %s 缓存未命中,现场跑 jd_parser", body.curated_job_id)
            cached = await parse_jd(job["jd_text"])

        session = await store.create(
            jd_text=job["jd_text"],
            mode="curated",
            curated_job_id=body.curated_job_id,
            jd_title=job["title"],
        )
        session.state["jd_summary"] = cached.get("jd_summary", {})
        session.state["skill_tree"] = cached.get("skill_tree", {})

    elif body.mode == "coffee_chat":
        session = await store.create(
            jd_text="",
            mode="coffee_chat",
            jd_title="Coffee Chat",
        )
        session.state["_coffee_chat"] = True
        session.state["jd_summary"] = {"title": "自由对话", "company": "—", "location": "—"}
        session.state["skill_tree"] = _make_free_chat_skill_tree()

    else:  # jd_paste
        if not body.jd_text or not body.jd_text.strip():
            raise error_response("INVALID_JD", "jd_paste 模式需要 jd_text", 400)
        session = await store.create(
            jd_text=body.jd_text,
            mode="jd_paste",
            jd_title=(body.jd_text[:40] + "...") if len(body.jd_text) > 40 else body.jd_text,
        )
        try:
            parsed = await parse_jd(body.jd_text)
        except Exception as e:
            logger.exception("JD 解析异常: %s", e)
            raise error_response("INTERNAL", "JD 解析失败", 500, error=str(e))
        session.state["jd_summary"] = parsed.get("jd_summary", {})
        session.state["skill_tree"] = parsed.get("skill_tree", {})

    return {
        "session_id": session.session_id,
        "mode": session.mode,
        "created_at": datetime.fromtimestamp(session.created_at, tz=timezone.utc)
        .isoformat()
        .replace("+00:00", "Z"),
        "jd_summary": session.state["jd_summary"],
        "skill_tree": session.state["skill_tree"],
    }


@router.get("/api/sessions/{session_id}")
async def get_session(session_id: str) -> Dict[str, Any]:
    sess = get_store().get(session_id)
    if not sess:
        raise error_response("SESSION_NOT_FOUND", "session 不存在", 404)
    return {
        "session_id": sess.session_id,
        "status": sess.status,
        "mode": sess.mode,
        "persona": {
            "card_id": sess.state.get("persona_card_id", ""),
            "dimensions": sess.state.get("persona_dimensions", {}),
        },
        "jd_summary": sess.state.get("jd_summary", {}),
        "skill_tree": sess.state.get("skill_tree", {}),
        "topics_covered_count": len(sess.state.get("topics_covered", [])),
    }


@router.post("/api/sessions/{session_id}/start")
async def start_session(session_id: str, body: StartSessionRequest) -> Dict[str, Any]:
    sess = get_store().get(session_id)
    if not sess:
        raise error_response("SESSION_NOT_FOUND", "session 不存在", 404)

    card = get_card(body.persona.card_id)
    if not card:
        raise error_response(
            "PERSONA_INVALID", f"未知人格卡片: {body.persona.card_id}", 400
        )

    sess.state["persona_card_id"] = body.persona.card_id
    sess.state["persona_dimensions"] = body.persona.dimensions.model_dump()
    sess.status = "ready"
    # DB 回写 persona_id
    get_store().mark_persona(session_id, body.persona.card_id)

    return {
        "session_id": sess.session_id,
        "status": "ready",
        "stream_url": f"/api/sessions/{sess.session_id}/stream",
    }


@router.post("/api/sessions/{session_id}/answer")
async def submit_answer(session_id: str, body: AnswerRequest) -> Dict[str, Any]:
    sess = get_store().get(session_id)
    if not sess:
        raise error_response("SESSION_NOT_FOUND", "session 不存在", 404)
    if sess.status == "ended":
        raise error_response("SESSION_ALREADY_ENDED", "会话已结束", 409)

    turn_id = f"t_{uuid.uuid4().hex[:8]}"

    # 异步触发主图,不阻塞
    asyncio.create_task(on_user_answer(sess, body.content, turn_id))

    return {"accepted": True, "turn_id": turn_id}


@router.post("/api/sessions/{session_id}/end")
async def end_session(session_id: str, body: EndRequest) -> Dict[str, Any]:
    sess = get_store().get(session_id)
    if not sess:
        raise error_response("SESSION_NOT_FOUND", "session 不存在", 404)

    # 异步触发收尾 + 报告生成
    asyncio.create_task(on_user_end(sess, reason=body.reason or "user_initiated"))

    below_min = (
        len(sess.state.get("topics_covered", [])) < sess.state.get("min_topics_threshold", 5)
    )
    return {
        "session_id": sess.session_id,
        "status": "ended",
        "report_url": f"/api/sessions/{sess.session_id}/report",
        "topics_covered_count": len(sess.state.get("topics_covered", [])),
        "below_minimum": below_min,
    }
