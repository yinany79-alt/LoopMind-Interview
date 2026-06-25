"""主图编排 — 用 async coroutine 直接驱动各节点,事件 push 进 session.event_queue。

主图状态机:
  start()                  # SSE 连上后调
    └── 选第一题 → run_opening → idle
  on_answer(answer)        # 收到用户回答
    └── run_evaluator → router 决策
        ├── drill_down → run_drilldown → idle
        └── next_topic → 选下一题 → run_opening / 或 end
"""
from __future__ import annotations

import asyncio
import logging
import re
import uuid
from typing import Any, Dict, List, Optional

from src.graph.nodes.evaluator_subgraph import run_evaluator
from src.graph.nodes.interviewer_subgraph import run_interviewer
from src.graph.nodes.next_topic_generator import pick_next_topic
from src.graph.nodes.router import (
    MAX_DEPTH,
    SATISFACTION_HIGH,
    SATISFACTION_LOW,
    decide_next_action,
    detect_topic_finish_reason,
)
from src.graph.nodes.reporter import generate_report
from src.graph.state import DIMENSIONS
from src.knowledge.personas import get_card
from src.session_store import Session

logger = logging.getLogger(__name__)


# 打字机模拟参数
TYPEWRITER_CHUNK = 2  # 每个 delta 推几个字
TYPEWRITER_INTERVAL = 0.03  # 每个 delta 间隔(秒)


async def _stream_message(
    session: Session,
    message_id: str,
    full_text: str,
    mode: str,
    topic_id: str,
    topic_name: str,
    depth: int,
    thinking_steps_count: int,
) -> None:
    """模拟打字机:把完整文本切成小块,以 delta 事件推送。"""
    await session.push_event({
        "event": "assistant_message_start",
        "data": {
            "message_id": message_id,
            "mode": mode,
            "topic_id": topic_id,
            "topic_name": topic_name,
            "depth": depth,
        },
    })
    # 按字切
    text = full_text
    i = 0
    while i < len(text):
        chunk = text[i : i + TYPEWRITER_CHUNK]
        i += TYPEWRITER_CHUNK
        await session.push_event({
            "event": "assistant_message_delta",
            "data": {"message_id": message_id, "delta": chunk},
        })
        await asyncio.sleep(TYPEWRITER_INTERVAL)
    await session.push_event({
        "event": "assistant_message_end",
        "data": {
            "message_id": message_id,
            "full_text": full_text,
            "thinking_steps_count": thinking_steps_count,
        },
    })
    await session.push_event({
        "event": "interviewer_state",
        "data": {"state_id": "idle", "state_text": "等待回答", "ttl_ms": 0},
    })


async def _emit_subgraph(session: Session, gen) -> Dict[str, Any]:
    """跑一个 ReAct 子图 async generator,把事件 push,最后返回 _done.data。"""
    done_data: Dict[str, Any] = {}
    async for event in gen:
        if event.get("event") == "_done":
            done_data = event.get("data", {})
            break
        await session.push_event(event)
    return done_data


async def _start_topic(
    session: Session,
    topic_node: Dict[str, Any],
    is_red_flag_hunt: bool,
    is_first: bool,
) -> None:
    """切到新题:更新 state、推 topic_started、跑 OPENING/SWITCH 子图、打字机推消息。"""
    state = session.state
    # 把已结束的题存档
    if state.get("current_topic_id") and state.get("current_topic_turns"):
        cov = {
            "topic_id": state.get("current_topic_id"),
            "topic_name": state.get("current_topic_name"),
            "topic_weight": state.get("current_topic_weight"),
            "turns": list(state.get("current_topic_turns", [])),
            "final_satisfaction": state.get("current_satisfaction"),
            "evaluator_comment": (state.get("last_eval") or {}).get("drill_down_hint") or "",
        }
        state.setdefault("topics_covered", []).append(cov)

    # 更新 current_*
    state["current_topic_id"] = topic_node.get("id", "")
    state["current_topic_name"] = topic_node.get("topic", "")
    state["current_topic_weight"] = float(topic_node.get("weight", 1.0))
    state["current_topic_dimensions"] = list(topic_node.get("dimensions", []))
    state["current_depth"] = 0
    state["current_topic_turns"] = []
    state["current_satisfaction"] = 50
    state["last_eval"] = None
    state["next_action"] = ""

    await session.push_event({
        "event": "topic_started",
        "data": {
            "topic_id": topic_node.get("id"),
            "topic_name": topic_node.get("topic"),
            "weight": topic_node.get("weight"),
            "depth_level": topic_node.get("depth_level"),
            "is_red_flag_hunt": is_red_flag_hunt,
        },
    })

    # 5 题门槛检查
    covered = len(state.get("topics_covered", []))
    if covered == state.get("min_topics_threshold", 5):
        await session.push_event({
            "event": "min_topics_reached",
            "data": {"covered_count": covered},
        })

    message_id = f"m_{uuid.uuid4().hex[:8]}"
    mode = "OPENING" if is_first else "SWITCH_TOPIC"

    # 跑子图
    if mode == "OPENING":
        gen = run_interviewer(state, "OPENING", message_id=message_id)
    else:
        # SWITCH_TOPIC 需要 prev_*
        prev = (state.get("topics_covered") or [{}])[-1]
        gen = run_interviewer(
            state,
            "SWITCH_TOPIC",
            message_id=message_id,
            prev_topic=prev.get("topic_name", ""),
            prev_satisfaction=prev.get("final_satisfaction", 0),
            next_topic=topic_node.get("topic"),
            next_topic_weight=float(topic_node.get("weight", 1.0)),
            next_depth_level=topic_node.get("depth_level", "medium"),
            next_topic_dimensions=topic_node.get("dimensions", []),
            is_red_flag_hunt=is_red_flag_hunt,
        )

    done = await _emit_subgraph(session, gen)
    question = done.get("question") or "(模型无响应,请重试)"
    thinking_count = len(done.get("thinking_steps") or [])

    state["current_question"] = question
    state.setdefault("current_topic_turns", []).append({
        "role": "interviewer",
        "content": question,
        "message_id": message_id,
        "thinking_steps_count": thinking_count,
    })
    state.setdefault("chat_history", []).append({
        "role": "interviewer",
        "content": question,
        "message_id": message_id,
        "topic_id": topic_node.get("id"),
    })

    await _stream_message(
        session,
        message_id=message_id,
        full_text=question,
        mode=mode,
        topic_id=topic_node.get("id", ""),
        topic_name=topic_node.get("topic", ""),
        depth=0,
        thinking_steps_count=thinking_count,
    )


async def start_interview(session: Session) -> None:
    """SSE 连上后启动:推 session_started + 第一题。"""
    if session.graph_started:
        return
    session.graph_started = True

    state = session.state
    card = get_card(state.get("persona_card_id", ""))
    persona_payload = {
        "card_id": state.get("persona_card_id", ""),
        "name": (card or {}).get("name", ""),
        "dimensions": state.get("persona_dimensions", {}),
    }
    await session.push_event({
        "event": "session_started",
        "data": {"session_id": session.session_id, "persona": persona_payload},
    })

    # 选第一题
    pick = await pick_next_topic(state)
    if not pick:
        await session.push_event({
            "event": "error",
            "data": {
                "error_code": "INTERNAL",
                "message": "skill_tree 为空,无法开始面试",
                "recoverable": False,
            },
        })
        return

    await _start_topic(
        session,
        pick["node"],
        is_red_flag_hunt=pick.get("is_red_flag_hunt", False),
        is_first=True,
    )
    session.status = "running"


def _apply_evaluation(state: Dict[str, Any], evaluation: Dict[str, Any]) -> Dict[str, Any]:
    """把 Evaluator 输出累积到 state(dimension_scores / red_flags / bright_spots)。"""
    prev_sat = state.get("current_satisfaction", 50)
    weight = float(state.get("current_topic_weight", 1.0))

    # 累积 dimension_deltas
    ds = state.setdefault("dimension_scores", {d: 0.0 for d in DIMENSIONS})
    for d in DIMENSIONS:
        ds[d] = float(ds.get(d, 0.0)) + float(evaluation["dimension_deltas"].get(d, 0)) * weight

    # 更新满意度
    state["current_satisfaction"] = evaluation["current_satisfaction"]

    # 累积红牌 / 亮点
    new_flags = evaluation.get("red_flags_to_add") or []
    new_spots = evaluation.get("bright_spots_to_add") or []
    state.setdefault("red_flags", []).extend(new_flags)
    state.setdefault("bright_spots", []).extend(new_spots)

    state["last_eval"] = evaluation
    return {
        "previous_satisfaction": prev_sat,
        "current_satisfaction": evaluation["current_satisfaction"],
        "new_flags": new_flags,
        "new_spots": new_spots,
    }


async def on_user_answer(session: Session, content: str, turn_id: str) -> None:
    """用户提交回答后的整条流水:evaluator → router → drill_down / next_topic / end。"""
    state = session.state
    last_question = state.get("current_question", "")
    user_msg_id = f"u_{uuid.uuid4().hex[:8]}"

    # 把回答存入历史
    state.setdefault("chat_history", []).append({
        "role": "user",
        "content": content,
        "message_id": user_msg_id,
        "topic_id": state.get("current_topic_id"),
    })
    state.setdefault("current_topic_turns", []).append({
        "role": "user",
        "content": content,
        "message_id": user_msg_id,
    })

    # 打断检测
    is_interrupted = len(content) > 500
    state["is_interrupted"] = is_interrupted

    # 短暂"沉默"
    await session.push_event({
        "event": "interviewer_state",
        "data": {"state_id": "silent_pause", "state_text": "面试官沉默了几秒...", "ttl_ms": 2000},
    })

    # ===== Evaluator =====
    prev_sat = state.get("current_satisfaction", 50)
    eval_gen = run_evaluator(
        state,
        turn_id=turn_id,
        last_question=last_question,
        user_answer=content,
        previous_satisfaction=prev_sat,
    )
    eval_done = await _emit_subgraph(session, eval_gen)
    evaluation = eval_done.get("evaluation") or {}

    applied = _apply_evaluation(state, evaluation)
    # satisfaction_update
    new_sat = applied["current_satisfaction"]
    await session.push_event({
        "event": "satisfaction_update",
        "data": {
            "topic_id": state.get("current_topic_id"),
            "previous_value": applied["previous_satisfaction"],
            "new_value": new_sat,
            "delta": new_sat - applied["previous_satisfaction"],
        },
    })
    # 红牌 / 亮点动画
    for f in applied["new_flags"]:
        await session.push_event({"event": "red_flag_added", "data": {"flag": f}})
    for s in applied["new_spots"]:
        await session.push_event({"event": "bright_spot_added", "data": {"spot": s}})

    # 满意度跨阈值的"心情"切换
    if applied["previous_satisfaction"] < 80 <= new_sat:
        await session.push_event({
            "event": "interviewer_state",
            "data": {"state_id": "leaning_forward", "state_text": "面试官身体前倾...", "ttl_ms": 3000},
        })
    elif applied["previous_satisfaction"] > 20 >= new_sat:
        await session.push_event({
            "event": "interviewer_state",
            "data": {"state_id": "frowning", "state_text": "面试官在皱眉...", "ttl_ms": 3000},
        })

    # ===== Router =====
    action = decide_next_action(state)
    state["next_action"] = action

    if action == "drill_down":
        state["current_depth"] = state.get("current_depth", 0) + 1
        message_id = f"m_{uuid.uuid4().hex[:8]}"
        gen = run_interviewer(
            state,
            "DRILL_DOWN",
            message_id=message_id,
            last_question=last_question,
            user_answer=content,
            found_gaps=evaluation.get("found_gaps", []),
            drill_down_target=evaluation.get("drill_down_target") or "",
            drill_down_hint=evaluation.get("drill_down_hint") or "",
            previous_satisfaction=applied["previous_satisfaction"],
            current_satisfaction=new_sat,
            is_interrupted=is_interrupted,
        )
        done = await _emit_subgraph(session, gen)
        question = done.get("question") or "(模型无响应)"
        thinking_count = len(done.get("thinking_steps") or [])

        state["current_question"] = question
        state.setdefault("current_topic_turns", []).append({
            "role": "interviewer",
            "content": question,
            "message_id": message_id,
            "thinking_steps_count": thinking_count,
        })
        state.setdefault("chat_history", []).append({
            "role": "interviewer",
            "content": question,
            "message_id": message_id,
            "topic_id": state.get("current_topic_id"),
        })
        await _stream_message(
            session,
            message_id=message_id,
            full_text=question,
            mode="INTERRUPT" if is_interrupted else "DRILL_DOWN",
            topic_id=state.get("current_topic_id", ""),
            topic_name=state.get("current_topic_name", ""),
            depth=state["current_depth"],
            thinking_steps_count=thinking_count,
        )
        return

    if action == "next_topic":
        # 收尾本题
        reason = detect_topic_finish_reason(state)
        await session.push_event({
            "event": "topic_finished",
            "data": {
                "topic_id": state.get("current_topic_id"),
                "reason": reason,
                "final_satisfaction": new_sat,
            },
        })
        await session.push_event({
            "event": "interviewer_state",
            "data": {"state_id": "pen_down", "state_text": "面试官放下了笔...", "ttl_ms": 2000},
        })
        # 选下一题
        pick = await pick_next_topic(state)
        if not pick:
            # 题目用尽 → 自然结束
            await _natural_end(session)
            return
        await _start_topic(
            session,
            pick["node"],
            is_red_flag_hunt=pick.get("is_red_flag_hunt", False),
            is_first=False,
        )
        return

    if action == "end":
        await _natural_end(session)
        return


async def _natural_end(session: Session) -> None:
    """题目耗尽 / Router 决定 end 时调。不立即生成报告,等 /end 接口触发。"""
    # 把当前 topic 也存档
    state = session.state
    if state.get("current_topic_id") and state.get("current_topic_turns"):
        cov = {
            "topic_id": state.get("current_topic_id"),
            "topic_name": state.get("current_topic_name"),
            "topic_weight": state.get("current_topic_weight"),
            "turns": list(state.get("current_topic_turns", [])),
            "final_satisfaction": state.get("current_satisfaction"),
        }
        # 避免重复(start_topic 会再存一次)
        if not any(
            c.get("topic_id") == cov["topic_id"]
            and c.get("turns") == cov["turns"]
            for c in state.get("topics_covered", [])
        ):
            state.setdefault("topics_covered", []).append(cov)

    below_min = len(state.get("topics_covered", [])) < state.get("min_topics_threshold", 5)
    await session.push_event({
        "event": "session_ended",
        "data": {
            "reason": "natural_end",
            "report_ready_eta_ms": 5000,
            "below_minimum": below_min,
        },
    })
    session.status = "ended"


async def on_user_end(session: Session, reason: str = "user_initiated") -> None:
    """/end 接口触发:推 session_ended,异步生成 report。"""
    state = session.state
    state["user_requested_end"] = True
    # 把 current topic 存档
    if state.get("current_topic_id") and state.get("current_topic_turns") and not _topic_archived(state):
        state.setdefault("topics_covered", []).append({
            "topic_id": state.get("current_topic_id"),
            "topic_name": state.get("current_topic_name"),
            "topic_weight": state.get("current_topic_weight"),
            "turns": list(state.get("current_topic_turns", [])),
            "final_satisfaction": state.get("current_satisfaction"),
        })

    below_min = len(state.get("topics_covered", [])) < state.get("min_topics_threshold", 5)
    if session.status != "ended":
        await session.push_event({
            "event": "session_ended",
            "data": {
                "reason": reason,
                "report_ready_eta_ms": 5000,
                "below_minimum": below_min,
            },
        })
        session.status = "ended"

    # 异步生成报告
    if session.report_status in ("pending", "failed"):
        session.report_status = "generating"
        asyncio.create_task(_run_report(session))


def _topic_archived(state: Dict[str, Any]) -> bool:
    tid = state.get("current_topic_id")
    turns = state.get("current_topic_turns", [])
    for c in state.get("topics_covered", []):
        if c.get("topic_id") == tid and c.get("turns") == turns:
            return True
    return False


async def _run_report(session: Session) -> None:
    try:
        report = await generate_report(session.state)
        session.report = report
        session.report_status = "ready"
    except Exception as e:
        logger.exception("Report 生成失败: %s", e)
        session.report = {
            "session_id": session.session_id,
            "status": "failed",
            "error": str(e),
        }
        session.report_status = "failed"
