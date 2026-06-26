"""Session Store — 内存中管理所有 session,每个 session 有一个事件队列。

不上 DB(MVP)。事件队列用 asyncio.Queue 实现 SSE 长连接的事件推送。
"""
from __future__ import annotations

import asyncio
import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

from src.graph.state import InterviewState, make_initial_state

logger = logging.getLogger(__name__)


@dataclass
class Session:
    session_id: str
    state: InterviewState
    created_at: float = field(default_factory=time.time)
    status: str = "created"  # created | ready | running | ended
    event_queue: asyncio.Queue = field(default_factory=asyncio.Queue)
    history_events: List[Dict[str, Any]] = field(default_factory=list)  # 用于 Last-Event-ID 续推
    seq: int = 0
    report: Optional[Dict[str, Any]] = None  # 异步生成的报告
    report_status: str = "pending"  # pending | generating | ready | failed
    graph_started: bool = False  # SSE 连上后才启动主图
    # ===== Debug: 断点 / step / 节点流转追踪 =====
    breakpoints: Set[str] = field(default_factory=set)  # 节点名集合
    resume_event: asyncio.Event = field(default_factory=asyncio.Event)
    step_mode: bool = False  # True: 每个节点都暂停(单步执行)
    paused_at: Optional[str] = None  # 当前停在哪个节点(None 表示未暂停)
    # ===== SSE 单消费者:同一 session 只允许一个 stream generator 消费队列 =====
    # 新连进来时把这个号 +1,所有旧 generator 看到 active_stream_id != 自己,立刻退出
    active_stream_id: int = 0

    async def push_event(self, event: Dict[str, Any]) -> None:
        """统一事件入口:加 id、入队、入历史。"""
        self.seq += 1
        eid = f"{self.session_id}-{self.seq}"
        event = dict(event)
        event["id"] = eid
        self.history_events.append(event)
        await self.event_queue.put(event)

    def replay_after(self, last_event_id: str | None) -> List[Dict[str, Any]]:
        """SSE 重连用:把指定 id 之后的事件吐出来。"""
        if not last_event_id:
            return []
        out = []
        found = False
        for e in self.history_events:
            if found:
                out.append(e)
                continue
            if e.get("id") == last_event_id:
                found = True
        return out

    def should_pause_at(self, node_id: str) -> bool:
        """是否应该在该节点暂停:命中 breakpoint 或处于 step 模式。"""
        return node_id in self.breakpoints or self.step_mode


class SessionStore:
    def __init__(self) -> None:
        self._sessions: Dict[str, Session] = {}
        self._lock = asyncio.Lock()

    async def create(self, jd_text: str) -> Session:
        sid = str(uuid.uuid4())
        sess = Session(session_id=sid, state=make_initial_state(sid, jd_text))
        async with self._lock:
            self._sessions[sid] = sess
        return sess

    def get(self, sid: str) -> Optional[Session]:
        return self._sessions.get(sid)

    def require(self, sid: str) -> Session:
        s = self._sessions.get(sid)
        if not s:
            raise KeyError(sid)
        return s

    def remove(self, sid: str) -> None:
        self._sessions.pop(sid, None)

    def all(self) -> Dict[str, Session]:
        return dict(self._sessions)


# 全局单例
_store = SessionStore()


def get_store() -> SessionStore:
    return _store
