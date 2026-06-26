"""主图编排 — LangGraph StateGraph(正式版,无手工调度)。

拓扑:
                        ┌── _user_answer 已设 ──→ evaluator → router ─┐
   START → dispatch ────┤                                              ├── drill_down → interviewer → END(等用户)
                        └── 未设(首次/换题) ──→ next_topic ─→ interviewer → END
                                                          │
                                                          └── all_done ─→ END

   router: ── drill_down ─→ interviewer → END
           ── next_topic ─→ next_topic ─→ interviewer → END  (或 all_done → END)
           ── end         ─→ END

每次 ainvoke 跑一段(到 interviewer 后退出 / 或 END),由 orchestrator 决定何时再喂一次。
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from contextvars import ContextVar
from typing import Any, Dict, Literal

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from src.graph.nodes.evaluator_subgraph import run_evaluator
from src.graph.nodes.interviewer_subgraph import run_interviewer
from src.graph.nodes.next_topic_generator import pick_next_topic
from src.graph.nodes.router import (
    decide_next_action,
    detect_topic_finish_reason,
)
from src.graph.nodes.reporter import generate_report
from src.graph.state import DIMENSIONS, InterviewState
from src.knowledge.personas import get_card
from src.session_store import Session

logger = logging.getLogger(__name__)

TYPEWRITER_CHUNK = 2
TYPEWRITER_INTERVAL = 0.03

# 事件 sink 用 ContextVar 透传,避免 LangGraph checkpointer 尝试序列化 asyncio.Queue
_EVENT_SINK: ContextVar[asyncio.Queue | None] = ContextVar("_EVENT_SINK", default=None)


# ===== 事件辅助 =====

async def _emit(event: str, data: Dict[str, Any]) -> None:
    sink = _EVENT_SINK.get()
    if sink is not None:
        await sink.put({"event": event, "data": data})


async def _stream_message(
    message_id: str,
    full_text: str,
    mode: str,
    topic_id: str,
    topic_name: str,
    depth: int,
    thinking_count: int,
) -> None:
    await _emit("assistant_message_start", {
        "message_id": message_id, "mode": mode,
        "topic_id": topic_id, "topic_name": topic_name, "depth": depth,
    })
    i = 0
    while i < len(full_text):
        chunk = full_text[i : i + TYPEWRITER_CHUNK]
        i += TYPEWRITER_CHUNK
        await _emit("assistant_message_delta", {"message_id": message_id, "delta": chunk})
        await asyncio.sleep(TYPEWRITER_INTERVAL)
    await _emit("assistant_message_end", {
        "message_id": message_id, "full_text": full_text,
        "thinking_steps_count": thinking_count,
    })
    await _emit("interviewer_state", {
        "state_id": "idle", "state_text": "等待回答", "ttl_ms": 0,
    })


async def _drain_subgraph(gen) -> Dict[str, Any]:
    done: Dict[str, Any] = {}
    async for event in gen:
        if event.get("event") == "_done":
            done = event.get("data", {})
            break
        await _emit(event["event"], event["data"])
    return done


# ===================== StateGraph 节点 =====================

async def dispatch_node(state: InterviewState) -> Dict[str, Any]:
    """入口分发节点,纯路由。LangGraph 要求 node 至少写一个字段,这里只是续 turn_count。"""
    return {"turn_count": state.get("turn_count", 0) + 1}


async def interviewer_node(state: InterviewState) -> Dict[str, Any]:
    mode = state.get("_interviewer_mode", "OPENING")  # type: ignore[arg-type]
    message_id = f"m_{uuid.uuid4().hex[:8]}"
    kwargs: Dict[str, Any] = {"message_id": message_id}

    if mode == "DRILL_DOWN":
        last_eval = state.get("last_eval") or {}
        kwargs.update(
            last_question=state.get("current_question", ""),
            user_answer=state.get("_user_answer", ""),  # type: ignore[arg-type]
            found_gaps=last_eval.get("found_gaps", []),
            drill_down_target=last_eval.get("drill_down_target") or "",
            drill_down_hint=last_eval.get("drill_down_hint") or "",
            previous_satisfaction=state.get("_previous_satisfaction", 50),  # type: ignore[arg-type]
            current_satisfaction=state.get("current_satisfaction", 50),
            is_interrupted=state.get("is_interrupted", False),
        )
    elif mode == "SWITCH_TOPIC":
        prev = (state.get("topics_covered") or [{}])[-1]
        node = state.get("_pending_topic_node", {})  # type: ignore[arg-type]
        kwargs.update(
            prev_topic=prev.get("topic_name", ""),
            prev_satisfaction=prev.get("final_satisfaction", 0),
            next_topic=node.get("topic", ""),
            next_topic_weight=float(node.get("weight", 1.0)),
            next_depth_level=node.get("depth_level", "medium"),
            next_topic_dimensions=node.get("dimensions", []),
            is_red_flag_hunt=state.get("_is_red_flag_hunt", False),  # type: ignore[arg-type]
        )

    gen = run_interviewer(state, mode, **kwargs)
    done = await _drain_subgraph(gen)
    question = done.get("question") or "(模型无响应,我们换个方向。)"
    thinking_count = len(done.get("thinking_steps") or [])

    turns = list(state.get("current_topic_turns", []))
    turns.append({
        "role": "interviewer", "content": question,
        "message_id": message_id, "thinking_steps_count": thinking_count,
    })
    history = list(state.get("chat_history", []))
    history.append({
        "role": "interviewer", "content": question, "message_id": message_id,
        "topic_id": state.get("current_topic_id"),
    })

    # 写入 state 后再推消息(打字机依赖正确的 topic_id)
    state["current_question"] = question
    state["current_topic_turns"] = turns
    state["chat_history"] = history

    await _stream_message(
        message_id=message_id,
        full_text=question,
        mode=("INTERRUPT" if state.get("is_interrupted") and mode == "DRILL_DOWN" else mode),
        topic_id=state.get("current_topic_id", ""),
        topic_name=state.get("current_topic_name", ""),
        depth=state.get("current_depth", 0),
        thinking_count=thinking_count,
    )

    return {
        "current_question": question,
        "current_topic_turns": turns,
        "chat_history": history,
        # 重置 _user_answer 占位,等下次用户回答
        "_user_answer": "",
        "_interviewer_done": True,
    }


async def evaluator_node(state: InterviewState) -> Dict[str, Any]:
    user_answer = state.get("_user_answer", "")  # type: ignore[arg-type]
    last_question = state.get("current_question", "")
    turn_id = state.get("_current_turn_id", f"t_{uuid.uuid4().hex[:8]}")  # type: ignore[arg-type]
    prev_sat = state.get("current_satisfaction", 50)

    await _emit("interviewer_state", {
        "state_id": "silent_pause", "state_text": "面试官沉默了几秒...", "ttl_ms": 2000,
    })

    history = list(state.get("chat_history", []))
    history.append({"role": "user", "content": user_answer,
                    "topic_id": state.get("current_topic_id")})
    turns = list(state.get("current_topic_turns", []))
    turns.append({"role": "user", "content": user_answer})

    is_interrupted = len(user_answer) > 500

    gen = run_evaluator(
        state,
        turn_id=turn_id, last_question=last_question,
        user_answer=user_answer, previous_satisfaction=prev_sat,
    )
    done = await _drain_subgraph(gen)
    evaluation = done.get("evaluation") or {}

    weight = float(state.get("current_topic_weight", 1.0))
    ds = dict(state.get("dimension_scores") or {d: 0.0 for d in DIMENSIONS})
    for d in DIMENSIONS:
        ds[d] = float(ds.get(d, 0.0)) + float(evaluation.get("dimension_deltas", {}).get(d, 0)) * weight

    new_sat = int(evaluation.get("current_satisfaction", prev_sat))

    new_flags = list(state.get("red_flags") or []) + list(evaluation.get("red_flags_to_add") or [])
    new_spots = list(state.get("bright_spots") or []) + list(evaluation.get("bright_spots_to_add") or [])

    await _emit("satisfaction_update", {
        "topic_id": state.get("current_topic_id"),
        "previous_value": prev_sat, "new_value": new_sat,
        "delta": new_sat - prev_sat,
    })
    for f in evaluation.get("red_flags_to_add") or []:
        await _emit("red_flag_added", {"flag": f})
    for s in evaluation.get("bright_spots_to_add") or []:
        await _emit("bright_spot_added", {"spot": s})

    if prev_sat < 80 <= new_sat:
        await _emit("interviewer_state", {
            "state_id": "leaning_forward", "state_text": "面试官身体前倾...", "ttl_ms": 3000,
        })
    elif prev_sat > 20 >= new_sat:
        await _emit("interviewer_state", {
            "state_id": "frowning", "state_text": "面试官在皱眉...", "ttl_ms": 3000,
        })

    return {
        "chat_history": history,
        "current_topic_turns": turns,
        "current_satisfaction": new_sat,
        "last_eval": evaluation,
        "dimension_scores": ds,
        "red_flags": new_flags,
        "bright_spots": new_spots,
        "is_interrupted": is_interrupted,
        "_previous_satisfaction": prev_sat,
        "_user_answer": "",  # 清空,避免 dispatch 路由重复进入 evaluator
    }


async def router_node(state: InterviewState) -> Dict[str, Any]:
    action = decide_next_action(state)
    out: Dict[str, Any] = {"next_action": action}
    if action == "drill_down":
        out["current_depth"] = state.get("current_depth", 0) + 1
        out["_interviewer_mode"] = "DRILL_DOWN"
    return out


async def next_topic_node(state: InterviewState) -> Dict[str, Any]:
    new_sat = state.get("current_satisfaction", 50)

    # 归档本题(只在已有 current_topic 时归档)
    covered = list(state.get("topics_covered", []))
    if state.get("current_topic_id"):
        reason = detect_topic_finish_reason(state)
        cov = {
            "topic_id": state.get("current_topic_id"),
            "topic_name": state.get("current_topic_name"),
            "topic_weight": state.get("current_topic_weight"),
            "turns": list(state.get("current_topic_turns", [])),
            "final_satisfaction": new_sat,
            "evaluator_comment": (state.get("last_eval") or {}).get("drill_down_hint") or "",
        }
        covered.append(cov)
        await _emit("topic_finished", {
            "topic_id": cov["topic_id"], "reason": reason, "final_satisfaction": new_sat,
        })

    if len(covered) == state.get("min_topics_threshold", 5):
        await _emit("min_topics_reached", {"covered_count": len(covered)})

    if state.get("current_topic_id"):
        await _emit("interviewer_state", {
            "state_id": "pen_down", "state_text": "面试官放下了笔...", "ttl_ms": 2000,
        })

    # 选下一题(用 state 副本带 topics_covered 给 picker)
    state_copy = dict(state)
    state_copy["topics_covered"] = covered
    pick = await pick_next_topic(state_copy)

    if not pick:
        return {
            "topics_covered": covered,
            "_all_done": True,
            "next_action": "end",
        }

    node = pick["node"]
    is_first = len(covered) == 0

    await _emit("topic_started", {
        "topic_id": node.get("id"), "topic_name": node.get("topic"),
        "weight": node.get("weight"), "depth_level": node.get("depth_level"),
        "is_red_flag_hunt": pick.get("is_red_flag_hunt", False),
    })

    return {
        "topics_covered": covered,
        "current_topic_id": node.get("id", ""),
        "current_topic_name": node.get("topic", ""),
        "current_topic_weight": float(node.get("weight", 1.0)),
        "current_topic_dimensions": list(node.get("dimensions", [])),
        "current_depth": 0,
        "current_topic_turns": [],
        "current_satisfaction": 50,
        "last_eval": None,
        "_pending_topic_node": node,
        "_is_red_flag_hunt": pick.get("is_red_flag_hunt", False),
        "_interviewer_mode": "OPENING" if is_first else "SWITCH_TOPIC",
        "_all_done": False,
        "next_action": "",
    }


# ===================== 条件边路由 =====================

def _route_from_dispatch(state: InterviewState) -> Literal["evaluator", "next_topic"]:
    """有 _user_answer → evaluator(续推);否则 → next_topic(开场/换题)。"""
    if state.get("_user_answer"):
        return "evaluator"
    return "next_topic"


def _route_after_router(state: InterviewState) -> Literal["drill_down", "next_topic", "end"]:
    action = state.get("next_action") or "drill_down"
    if action == "drill_down":
        return "drill_down"
    if action == "next_topic":
        return "next_topic"
    return "end"


def _route_after_next_topic(state: InterviewState) -> Literal["interview", "end"]:
    return "end" if state.get("_all_done") else "interview"


# ===================== Graph 构建 =====================

def build_graph():
    g = StateGraph(InterviewState)

    g.add_node("dispatch", dispatch_node)
    g.add_node("interviewer", interviewer_node)
    g.add_node("evaluator", evaluator_node)
    g.add_node("router", router_node)
    g.add_node("next_topic", next_topic_node)

    g.add_edge(START, "dispatch")
    g.add_conditional_edges(
        "dispatch", _route_from_dispatch,
        {"evaluator": "evaluator", "next_topic": "next_topic"},
    )

    # evaluator → router
    g.add_edge("evaluator", "router")
    g.add_conditional_edges(
        "router", _route_after_router,
        {"drill_down": "interviewer", "next_topic": "next_topic", "end": END},
    )

    # next_topic → interviewer (or END)
    g.add_conditional_edges(
        "next_topic", _route_after_next_topic,
        {"interview": "interviewer", "end": END},
    )

    # interviewer 之后:每次跑到 END(等用户输入)
    g.add_edge("interviewer", END)

    return g.compile(checkpointer=MemorySaver())


_GRAPH = None


def get_graph():
    global _GRAPH
    if _GRAPH is None:
        _GRAPH = build_graph()
    return _GRAPH


# ===================== Orchestrator =====================

def _thread_config(session: Session) -> Dict[str, Any]:
    return {"configurable": {"thread_id": session.session_id}, "recursion_limit": 50}


async def _pump_sink(session: Session, sink: asyncio.Queue, stop: asyncio.Event) -> None:
    while True:
        try:
            ev = await asyncio.wait_for(sink.get(), timeout=0.3)
        except asyncio.TimeoutError:
            if stop.is_set():
                while not sink.empty():
                    ev = sink.get_nowait()
                    await session.push_event(ev)
                return
            continue
        await session.push_event(ev)


async def _run_graph(session: Session, inputs: Dict[str, Any]) -> None:
    graph = get_graph()
    cfg = _thread_config(session)
    sink: asyncio.Queue = asyncio.Queue()
    stop = asyncio.Event()
    pump = asyncio.create_task(_pump_sink(session, sink, stop))

    token = _EVENT_SINK.set(sink)
    try:
        result = await graph.ainvoke(inputs, config=cfg)
        for k, v in result.items():
            session.state[k] = v
    finally:
        _EVENT_SINK.reset(token)
        stop.set()
        await pump


async def start_interview(session: Session) -> None:
    """SSE 连上后:推 session_started,跑 graph 从 START → next_topic → interviewer → END。"""
    if session.graph_started:
        return
    session.graph_started = True

    state = session.state
    card = get_card(state.get("persona_card_id", ""))
    await session.push_event({
        "event": "session_started",
        "data": {
            "session_id": session.session_id,
            "persona": {
                "card_id": state.get("persona_card_id", ""),
                "name": (card or {}).get("name", ""),
                "dimensions": state.get("persona_dimensions", {}),
            },
        },
    })

    # 首次:把整份 state 喂进去
    await _run_graph(session, dict(state))
    session.status = "running"


async def on_user_answer(session: Session, content: str, turn_id: str) -> None:
    """用户回答:从 START 再跑一遍,dispatch 会因 _user_answer 走 evaluator。

    checkpointer 保证 thread_id 对应的 state 被持续累积;
    我们只把"本轮新增"字段当 inputs 喂进去,LangGraph 默认 merge。
    """
    inputs = {
        "_user_answer": content,
        "_current_turn_id": turn_id,
        # 这些是新一轮的 transient 输入,LangGraph 的 default reducer 会替换它们
    }
    await _run_graph(session, inputs)
    # 跑完后:可能停在 interviewer(等下一次用户输入)或 END(_all_done)
    if session.state.get("_all_done"):
        await _natural_end(session)


async def _natural_end(session: Session) -> None:
    state = session.state
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
                "reason": "natural_end",
                "report_ready_eta_ms": 5000,
                "below_minimum": below_min,
            },
        })
        session.status = "ended"


def _topic_archived(state: Dict[str, Any]) -> bool:
    tid = state.get("current_topic_id")
    turns = state.get("current_topic_turns", [])
    for c in state.get("topics_covered", []):
        if c.get("topic_id") == tid and c.get("turns") == turns:
            return True
    return False


async def on_user_end(session: Session, reason: str = "user_initiated") -> None:
    state = session.state
    state["user_requested_end"] = True

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

    if session.report_status in ("pending", "failed"):
        session.report_status = "generating"
        asyncio.create_task(_run_report(session))


async def _run_report(session: Session) -> None:
    try:
        session.report = await generate_report(session.state)
        session.report_status = "ready"
    except Exception as e:
        logger.exception("Report 生成失败: %s", e)
        session.report = {
            "session_id": session.session_id,
            "status": "failed",
            "error": str(e),
        }
        session.report_status = "failed"
