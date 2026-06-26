"""SSE 主推送通道 — GET /api/sessions/{id}/stream"""
from __future__ import annotations

import asyncio
import logging
from typing import AsyncGenerator

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from src.api.errors import error_response
from src.graph.graph import start_interview
from src.session_store import Session, get_store
from src.sse import format_sse

logger = logging.getLogger(__name__)
router = APIRouter()


async def _event_generator(request: Request, session: Session) -> AsyncGenerator[str, None]:
    """长连接,把 session.event_queue 里的事件吐出来。

    单消费者保证:同一 session 只能有一个 generator 在消费队列。新连入时把
    active_stream_id +1,旧 generator 每轮 check,发现自己不是当前 id 就退出,
    避免 StrictMode 双 mount / 浏览器开多 tab 时事件被多个消费者抢分。
    """
    session.active_stream_id += 1
    my_stream_id = session.active_stream_id
    logger.info("SSE connect session=%s stream_id=%d", session.session_id, my_stream_id)

    # 重连:Last-Event-ID
    last_id = request.headers.get("last-event-id")
    if last_id:
        for e in session.replay_after(last_id):
            yield format_sse(e["event"], e["data"], event_id=e.get("id"))

    # 首次连上才启动主图
    if not session.graph_started:
        asyncio.create_task(start_interview(session))

    # 心跳定时器(防止前端 EventSource 因为长 idle 断开)
    HEARTBEAT_INTERVAL = 15.0

    while True:
        if session.active_stream_id != my_stream_id:
            # 有更新的连接进来了,主动让位
            logger.info(
                "SSE generator stream_id=%d superseded by %d, exiting",
                my_stream_id, session.active_stream_id,
            )
            break
        if await request.is_disconnected():
            break
        try:
            event = await asyncio.wait_for(
                session.event_queue.get(), timeout=HEARTBEAT_INTERVAL
            )
        except asyncio.TimeoutError:
            # 心跳:发一条注释行(不会触发前端事件)
            yield ": keepalive\n\n"
            continue
        # 拿到事件后再 check 一次:可能在 wait 期间被取代了,这个事件不该消费
        if session.active_stream_id != my_stream_id:
            # 把事件塞回队列让新 generator 拿到
            await session.event_queue.put(event)
            break
        yield format_sse(event["event"], event["data"], event_id=event.get("id"))
        if event.get("event") == "session_ended":
            # 允许多发几条等队列空了
            await asyncio.sleep(0.2)
            # 仍然不主动关闭,让前端自己 close,避免 'session_ended' 后还有事件丢失
            break


@router.get("/api/sessions/{session_id}/stream")
async def stream(session_id: str, request: Request) -> StreamingResponse:
    sess = get_store().get(session_id)
    if not sess:
        raise error_response("SESSION_NOT_FOUND", "session 不存在", 404)
    if not sess.state.get("persona_card_id"):
        raise error_response(
            "PERSONA_INVALID",
            "session 未配置 persona,需先调用 /start",
            409,
        )

    return StreamingResponse(
        _event_generator(request, sess),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
