"""GET /api/sessions/{id}/report"""
from __future__ import annotations

from fastapi import APIRouter

from src.api.errors import error_response
from src.session_store import get_store

router = APIRouter()


@router.get("/api/sessions/{session_id}/report")
async def get_report(session_id: str) -> dict:
    sess = get_store().get(session_id)
    if not sess:
        raise error_response("SESSION_NOT_FOUND", "session 不存在", 404)

    if sess.report_status == "ready" and sess.report:
        return sess.report
    if sess.report_status == "failed":
        return {
            "session_id": sess.session_id,
            "status": "failed",
            "error": (sess.report or {}).get("error", "unknown"),
        }
    # pending / generating
    return {"session_id": sess.session_id, "status": "generating"}
