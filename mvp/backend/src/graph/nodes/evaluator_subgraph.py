"""Evaluator ReAct 子图。

输入:current_topic / last_question / user_answer / 各种 state
输出:async generator,yield SSE 事件;最后 yield {"event": "_done", "data": {"evaluation": {...}, "thinking_steps": [...]}}
"""
from __future__ import annotations

import logging
import uuid
from typing import Any, AsyncGenerator, Dict, List

from langchain_core.messages import HumanMessage, AIMessage

from src.graph.prompt_utils import (
    extract_json_block,
    extract_thinking_text,
    llm_text,
    load_prompt,
    parse_action_line,
)
from src.graph.state import DIMENSIONS
from src.llm import get_evaluator_llm
from src.tools.evaluator_tools import call_evaluator_tool

logger = logging.getLogger(__name__)

MAX_REACT_ITERS = 4


def _brief_red_flags(flags: List[Dict[str, Any]]) -> str:
    if not flags:
        return "(无)"
    return "; ".join(
        f"{f.get('topic')}: {f.get('evidence')}({f.get('severity')})"
        for f in flags[-5:]
    )


def _build_prompt(
    state: Dict[str, Any],
    last_question: str,
    user_answer: str,
    previous_satisfaction: int,
) -> str:
    tpl = load_prompt("evaluator_react")
    return tpl.format(
        current_topic=state.get("current_topic_name", ""),
        current_topic_weight=state.get("current_topic_weight", 1.0),
        current_depth=state.get("current_depth", 0),
        previous_satisfaction=previous_satisfaction,
        red_flags_brief=_brief_red_flags(state.get("red_flags", [])),
        last_question=last_question,
        user_answer=user_answer,
    )


def _normalize_eval(raw: Dict[str, Any], previous_satisfaction: int) -> Dict[str, Any]:
    """补齐缺失字段、收口数值范围。"""
    deltas_in = raw.get("dimension_deltas", {}) or {}
    deltas = {d: int(deltas_in.get(d, 0) or 0) for d in DIMENSIONS}
    # clamp to [-5, 5]
    deltas = {k: max(-5, min(5, v)) for k, v in deltas.items()}

    sat = raw.get("current_satisfaction", previous_satisfaction)
    try:
        sat = int(sat)
    except Exception:
        sat = previous_satisfaction
    sat = max(0, min(100, sat))

    aq = raw.get("answer_quality", "concept")
    if aq not in ("surface", "concept", "hands_on", "insight"):
        aq = "concept"

    tfs = raw.get("topic_finish_signal", None)
    if tfs not in (None, "exhausted", "user_excellent", "user_hopeless"):
        tfs = None

    flags = raw.get("red_flags_to_add", []) or []
    flags_norm = []
    for f in flags:
        if not isinstance(f, dict):
            continue
        sev = f.get("severity", "medium")
        if sev not in ("low", "medium", "high"):
            sev = "medium"
        flags_norm.append({
            "topic": str(f.get("topic", "")),
            "evidence": str(f.get("evidence", "")),
            "severity": sev,
        })

    spots = raw.get("bright_spots_to_add", []) or []
    spots_norm = [
        {"topic": str(s.get("topic", "")), "evidence": str(s.get("evidence", ""))}
        for s in spots if isinstance(s, dict)
    ]

    return {
        "answer_quality": aq,
        "dimension_deltas": deltas,
        "current_satisfaction": sat,
        "found_gaps": [str(g) for g in (raw.get("found_gaps") or [])],
        "found_strengths": [str(s) for s in (raw.get("found_strengths") or [])],
        "drill_down_target": raw.get("drill_down_target") or None,
        "drill_down_hint": raw.get("drill_down_hint") or None,
        "red_flags_to_add": flags_norm,
        "bright_spots_to_add": spots_norm,
        "topic_finish_signal": tfs,
    }


def _fallback_eval(previous_satisfaction: int) -> Dict[str, Any]:
    """LLM 解析失败时的兜底,不让流程卡死。"""
    return {
        "answer_quality": "concept",
        "dimension_deltas": {d: 0 for d in DIMENSIONS},
        "current_satisfaction": max(0, previous_satisfaction - 5),
        "found_gaps": ["评估器解析异常,本轮跳过"],
        "found_strengths": [],
        "drill_down_target": None,
        "drill_down_hint": "(评估器无输出)",
        "red_flags_to_add": [],
        "bright_spots_to_add": [],
        "topic_finish_signal": None,
    }


async def run_evaluator(
    state: Dict[str, Any],
    turn_id: str,
    last_question: str,
    user_answer: str,
    previous_satisfaction: int,
    message_id: str | None = None,
) -> AsyncGenerator[Dict[str, Any], None]:
    if message_id is None:
        message_id = f"e_{uuid.uuid4().hex[:8]}"

    # Coffee Chat 旁路:返回中性评估,不打分、不生成 red_flag、不强制 switch
    if state.get("_coffee_chat"):
        neutral = {
            "answer_quality": "concept",
            "dimension_deltas": {},
            "current_satisfaction": previous_satisfaction,  # 不动
            "found_gaps": [],
            "found_strengths": [],
            "drill_down_target": None,
            "drill_down_hint": None,
            "red_flags_to_add": [],
            "bright_spots_to_add": [],
            "topic_finish_signal": None,
        }
        yield {"event": "evaluator_started", "data": {"turn_id": turn_id}}
        yield {
            "event": "evaluator_result",
            "data": {
                "turn_id": turn_id,
                "evaluation": neutral,
                "thinking_steps": [],
            },
        }
        yield {"event": "_done", "data": {"evaluation": neutral, "thinking_steps": []}}
        return

    yield {
        "event": "interviewer_state",
        "data": {"state_id": "note_taking", "state_text": "面试官正在记录笔记...", "ttl_ms": 4000},
    }
    yield {"event": "evaluator_started", "data": {"turn_id": turn_id}}

    prompt = _build_prompt(state, last_question, user_answer, previous_satisfaction)
    llm = get_evaluator_llm()
    messages = [HumanMessage(content=prompt)]
    thinking_steps: List[Dict[str, Any]] = []
    step_index = 0
    raw_eval: Dict[str, Any] | None = None

    for _ in range(MAX_REACT_ITERS):
        try:
            resp = await llm.ainvoke(messages)
        except Exception as e:
            logger.exception("Evaluator LLM 调用失败: %s", e)
            break
        text = llm_text(resp.content)
        # Anthropic thinking blocks → 推 thinking_step
        anth_thinking = extract_thinking_text(resp.content)
        if anth_thinking:
            step = {
                "message_id": message_id,
                "step_index": step_index,
                "step_type": "thought",
                "content": anth_thinking[:1000],
                "tool_name": None,
                "tool_args": None,
            }
            thinking_steps.append(step)
            yield {"event": "thinking_step", "data": step}
            step_index += 1

        # 优先看是否给了 Final JSON
        if "Final" in text or text.strip().startswith("{"):
            data = extract_json_block(text)
            if data:
                raw_eval = data
                # 把 Thought 步骤都推一下
                for ln in text.splitlines():
                    lns = ln.strip()
                    if lns.startswith("Thought:"):
                        step = {
                            "message_id": message_id,
                            "step_index": step_index,
                            "step_type": "thought",
                            "content": lns[len("Thought:") :].strip(),
                            "tool_name": None,
                            "tool_args": None,
                        }
                        thinking_steps.append(step)
                        yield {"event": "thinking_step", "data": step}
                        step_index += 1
                # 推 final step
                final_step = {
                    "message_id": message_id,
                    "step_index": step_index,
                    "step_type": "final",
                    "content": "(evaluation JSON ready)",
                    "tool_name": None,
                    "tool_args": None,
                }
                thinking_steps.append(final_step)
                yield {"event": "thinking_step", "data": final_step}
                step_index += 1
                break

        # 否则:解析 Thought/Action
        action_found = False
        for ln in text.splitlines():
            lns = ln.strip()
            if lns.startswith("Thought:"):
                step = {
                    "message_id": message_id,
                    "step_index": step_index,
                    "step_type": "thought",
                    "content": lns[len("Thought:") :].strip(),
                    "tool_name": None,
                    "tool_args": None,
                }
                thinking_steps.append(step)
                yield {"event": "thinking_step", "data": step}
                step_index += 1
            elif lns.startswith("Action:"):
                parsed = parse_action_line(lns)
                if not parsed:
                    continue
                tool_name, tool_args = parsed
                tc_step = {
                    "message_id": message_id,
                    "step_index": step_index,
                    "step_type": "tool_call",
                    "content": "",
                    "tool_name": tool_name,
                    "tool_args": tool_args,
                }
                thinking_steps.append(tc_step)
                yield {"event": "thinking_step", "data": tc_step}
                step_index += 1
                observation = call_evaluator_tool(state, tool_name, tool_args)
                obs_step = {
                    "message_id": message_id,
                    "step_index": step_index,
                    "step_type": "observation",
                    "content": observation[:500],
                    "tool_name": tool_name,
                    "tool_args": None,
                }
                thinking_steps.append(obs_step)
                yield {"event": "thinking_step", "data": obs_step}
                step_index += 1
                messages.append(AIMessage(content=text))
                messages.append(
                    HumanMessage(
                        content=f"Observation: {observation[:1000]}\n\n基于这个 Observation,继续 Thought,想清楚后输出 Final: <完整 JSON>。"
                    )
                )
                action_found = True
                break

        if not action_found:
            data = extract_json_block(text)
            if data:
                raw_eval = data
            break

    eval_norm = _normalize_eval(raw_eval, previous_satisfaction) if raw_eval else _fallback_eval(previous_satisfaction)

    yield {
        "event": "evaluator_result",
        "data": {"turn_id": turn_id, "evaluation": eval_norm},
    }
    yield {
        "event": "_done",
        "data": {"evaluation": eval_norm, "thinking_steps": thinking_steps},
    }
