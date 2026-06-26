"""Debug API — 设置/移除断点、resume、step。"""
from __future__ import annotations

import logging
from typing import Any, Dict, Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from src.api.errors import error_response
from src.session_store import get_store

logger = logging.getLogger(__name__)
router = APIRouter()


# 允许设断点的节点白名单(与 graph.build_graph 一致)
_NODES = {"dispatch", "interviewer", "evaluator", "router", "next_topic"}


class BreakpointReq(BaseModel):
    node_id: str = Field(..., description="节点名")
    action: Literal["add", "remove"]


class ResumeReq(BaseModel):
    step: bool = False  # True: 跑一个节点再停;False: 跑到下一个断点


@router.post("/api/sessions/{session_id}/debug/breakpoints")
async def set_breakpoint(session_id: str, body: BreakpointReq) -> Dict[str, Any]:
    sess = get_store().get(session_id)
    if not sess:
        raise error_response("SESSION_NOT_FOUND", "session 不存在", 404)
    if body.node_id not in _NODES:
        raise error_response(
            "INVALID_NODE",
            f"未知节点 {body.node_id};可选: {sorted(_NODES)}",
            400,
        )
    if body.action == "add":
        sess.breakpoints.add(body.node_id)
    else:
        sess.breakpoints.discard(body.node_id)
    return {
        "ok": True,
        "breakpoints": sorted(sess.breakpoints),
    }


@router.get("/api/sessions/{session_id}/debug/state")
async def debug_state(session_id: str) -> Dict[str, Any]:
    sess = get_store().get(session_id)
    if not sess:
        raise error_response("SESSION_NOT_FOUND", "session 不存在", 404)
    return {
        "breakpoints": sorted(sess.breakpoints),
        "paused_at": sess.paused_at,
        "step_mode": sess.step_mode,
        "available_nodes": sorted(_NODES),
    }


@router.post("/api/sessions/{session_id}/debug/resume")
async def resume(session_id: str, body: ResumeReq) -> Dict[str, Any]:
    sess = get_store().get(session_id)
    if not sess:
        raise error_response("SESSION_NOT_FOUND", "session 不存在", 404)
    if sess.paused_at is None:
        return {"ok": False, "reason": "not_paused"}
    sess.step_mode = body.step
    sess.resume_event.set()
    return {"ok": True, "step": body.step}
