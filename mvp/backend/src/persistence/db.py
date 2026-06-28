"""SQLite 持久化:session 历史、报告、统计聚合。

对外只暴露同步函数(在 asyncio worker 里直接调,因为 sqlite3 单连接 fast enough)。
session 实时态(state/event_queue)仍在内存,这里只持久化"已结束/收尾后"的快照,
以及创建时的元信息(供 Continue Card 和 Battle Record 显示)。
"""
from __future__ import annotations

import json
import logging
import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional


logger = logging.getLogger(__name__)

# 项目根 / mvp/backend / data / interviews.db
_DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "interviews.db"
_DB_PATH.parent.mkdir(exist_ok=True)

# 单线程互斥(uvicorn worker 单进程;asyncio 任务并发但 sqlite 单 conn 安全)
_LOCK = Lock()
_CONN: Optional[sqlite3.Connection] = None


def _conn() -> sqlite3.Connection:
    global _CONN
    if _CONN is None:
        _CONN = sqlite3.connect(_DB_PATH, check_same_thread=False, isolation_level=None)
        _CONN.row_factory = sqlite3.Row
        _CONN.execute("PRAGMA journal_mode = WAL")
        _CONN.execute("PRAGMA synchronous = NORMAL")
    return _CONN


@contextmanager
def _cursor():
    """加锁拿 cursor。"""
    with _LOCK:
        c = _conn()
        cur = c.cursor()
        try:
            yield cur
        finally:
            cur.close()


def init_db() -> None:
    """启动时调用,创建表。已存在的不动。"""
    with _cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id          TEXT PRIMARY KEY,
                created_at          INTEGER NOT NULL,
                ended_at            INTEGER,
                mode                TEXT NOT NULL DEFAULT 'jd_paste',
                status              TEXT NOT NULL DEFAULT 'created',
                persona_id          TEXT,
                curated_job_id      TEXT,
                jd_title            TEXT,
                state_json          TEXT,
                report_json         TEXT,
                topics_count        INTEGER DEFAULT 0,
                satisfaction_final  INTEGER,
                duration_seconds    INTEGER
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_sessions_persona ON sessions(persona_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_sessions_curated ON sessions(curated_job_id)")
    logger.info("SQLite 持久化已就绪: %s", _DB_PATH)


# ===== 写 =====

def insert_session(
    *,
    session_id: str,
    mode: str,
    persona_id: Optional[str],
    curated_job_id: Optional[str] = None,
    jd_title: Optional[str] = None,
) -> None:
    with _cursor() as cur:
        cur.execute(
            """INSERT INTO sessions
               (session_id, created_at, mode, status, persona_id, curated_job_id, jd_title)
               VALUES (?, ?, ?, 'created', ?, ?, ?)""",
            (session_id, int(time.time()), mode, persona_id, curated_job_id, jd_title),
        )


def update_session_persona(session_id: str, persona_id: str) -> None:
    with _cursor() as cur:
        cur.execute("UPDATE sessions SET persona_id=?, status='ready' WHERE session_id=?",
                    (persona_id, session_id))


def finalize_session(
    *,
    session_id: str,
    status: str,
    state_json: str,
    report_json: Optional[str],
    topics_count: int,
    satisfaction_final: Optional[int],
) -> None:
    """session ended 时回写:state / report / 时长 / 状态。"""
    now = int(time.time())
    with _cursor() as cur:
        row = cur.execute("SELECT created_at FROM sessions WHERE session_id=?", (session_id,)).fetchone()
        duration = (now - row["created_at"]) if row else 0
        cur.execute(
            """UPDATE sessions
               SET ended_at=?, status=?, state_json=?, report_json=?,
                   topics_count=?, satisfaction_final=?, duration_seconds=?
               WHERE session_id=?""",
            (now, status, state_json, report_json,
             topics_count, satisfaction_final, duration, session_id),
        )


# ===== 读 =====

def get_session_row(session_id: str) -> Optional[Dict[str, Any]]:
    with _cursor() as cur:
        row = cur.execute("SELECT * FROM sessions WHERE session_id=?", (session_id,)).fetchone()
        return dict(row) if row else None


def list_history(limit: int = 20) -> List[Dict[str, Any]]:
    """最近 N 场,Battle Record 用。"""
    with _cursor() as cur:
        rows = cur.execute(
            """SELECT session_id, created_at, ended_at, mode, status,
                      persona_id, curated_job_id, jd_title,
                      topics_count, satisfaction_final, duration_seconds
               FROM sessions
               WHERE status IN ('ended','aborted')
               ORDER BY created_at DESC
               LIMIT ?""",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]


def get_journey_stats() -> Dict[str, Any]:
    """Lv / 总场次 / 通过 / 平均分 / 击败 persona_id 列表。

    Lv 简单算法:每 5 场升 1 级。
    通过 = satisfaction_final >= 70。
    """
    with _cursor() as cur:
        total = cur.execute(
            "SELECT COUNT(*) AS c FROM sessions WHERE status='ended'"
        ).fetchone()["c"]
        passed_row = cur.execute(
            "SELECT COUNT(*) AS c FROM sessions WHERE status='ended' AND satisfaction_final >= 70"
        ).fetchone()
        avg_row = cur.execute(
            "SELECT AVG(satisfaction_final) AS a FROM sessions WHERE status='ended' AND satisfaction_final IS NOT NULL"
        ).fetchone()
        defeated_rows = cur.execute(
            """SELECT DISTINCT persona_id FROM sessions
               WHERE status='ended' AND satisfaction_final >= 70 AND persona_id IS NOT NULL"""
        ).fetchall()

    avg = int(round(avg_row["a"])) if avg_row["a"] is not None else 0
    return {
        "level": (total // 5) + 1,
        "total": total,
        "passed": passed_row["c"],
        "avg_score": avg,
        "defeated": [r["persona_id"] for r in defeated_rows],
    }


def get_challenger_stats(persona_id: str) -> Dict[str, Any]:
    """单个 challenger 的统计:挑战人数 / 平均时长 / 通过率。"""
    with _cursor() as cur:
        row = cur.execute(
            """SELECT
                 COUNT(*) AS c,
                 AVG(duration_seconds) AS avg_d,
                 SUM(CASE WHEN satisfaction_final >= 70 THEN 1 ELSE 0 END) AS passed
               FROM sessions
               WHERE persona_id=? AND status='ended'""",
            (persona_id,),
        ).fetchone()
    cnt = row["c"] or 0
    return {
        "challenged_count": cnt,
        "avg_duration_min": int((row["avg_d"] or 0) / 60),
        "pass_rate": int((row["passed"] or 0) * 100 / cnt) if cnt > 0 else 0,
    }


def get_curated_job_counts() -> Dict[str, int]:
    """每个 curated_job 被挑战的次数,Home 热门挑战卡片用。"""
    with _cursor() as cur:
        rows = cur.execute(
            """SELECT curated_job_id, COUNT(*) AS c FROM sessions
               WHERE curated_job_id IS NOT NULL
               GROUP BY curated_job_id"""
        ).fetchall()
    return {r["curated_job_id"]: r["c"] for r in rows}
