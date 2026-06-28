"""Session Store — 内存中管理 session 实时态 + SQLite 持久化已结束 session 的快照。

实时数据(state / event_queue / 断点)在内存,SSE 长连接靠 event_queue 推。
结束后通过 finalize_session() 把 state / report / 时长写入 SQLite,
供 Battle Record / Challenger Stats / Continue Card 查询。
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

from src.graph.state import InterviewState, make_initial_state
from src.persistence import db

logger = logging.getLogger(__name__)


@dataclass
class Session:
    session_id: str
    state: InterviewState
    created_at: float = field(default_factory=time.time)
    status: str = "created"  # created | ready | running | ended
    mode: str = "jd_paste"   # jd_paste | curated | coffee_chat
    curated_job_id: Optional[str] = None
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

    async def create(
        self,
        jd_text: str,
        *,
        mode: str = "jd_paste",
        curated_job_id: Optional[str] = None,
        jd_title: Optional[str] = None,
    ) -> Session:
        sid = str(uuid.uuid4())
        sess = Session(
            session_id=sid,
            state=make_initial_state(sid, jd_text),
            mode=mode,
            curated_job_id=curated_job_id,
        )
        async with self._lock:
            self._sessions[sid] = sess
        # 立刻写一行到 DB(persona 未定,稍后 start 时 update)
        try:
            db.insert_session(
                session_id=sid,
                mode=mode,
                persona_id=None,
                curated_job_id=curated_job_id,
                jd_title=jd_title,
            )
        except Exception as e:
            logger.exception("DB insert_session failed: %s", e)
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

    def mark_persona(self, sid: str, persona_id: str) -> None:
        """start 接口确认人格后,回写 DB。"""
        try:
            db.update_session_persona(sid, persona_id)
        except Exception as e:
            logger.exception("DB update_session_persona failed: %s", e)

    def finalize(self, sess: Session, status: str = "ended") -> None:
        """session_ended 后调用:把 state / report 落盘。"""
        try:
            topics = sess.state.get("topics_covered", []) or []
            sat = sess.state.get("current_satisfaction")
            db.finalize_session(
                session_id=sess.session_id,
                status=status,
                state_json=json.dumps(sess.state, ensure_ascii=False, default=str),
                report_json=json.dumps(sess.report, ensure_ascii=False) if sess.report else None,
                topics_count=len(topics),
                satisfaction_final=int(sat) if isinstance(sat, (int, float)) else None,
            )
        except Exception as e:
            logger.exception("DB finalize_session failed: %s", e)


# 全局单例
_store = SessionStore()


def get_store() -> SessionStore:
    return _store
