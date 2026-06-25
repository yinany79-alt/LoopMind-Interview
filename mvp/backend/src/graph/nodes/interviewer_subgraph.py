"""Interviewer ReAct 子图。

伪 ReAct 实现:让 LLM 一次性输出整个 ReAct 链(Thought/Action/Observation/Final),
我们解析文本、把 Tool 调用插队执行、Observation 回写 prompt 继续生成。
最多 5 轮迭代。每一步都通过 yield 推 thinking_step / interviewer_state SSE 事件。

输出:async generator,最后一个 yield 是 {"event": "_done", "data": {"question": str, "thinking_steps": [...]}}
主图节点用这个 done 事件拿到最终问题。
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any, AsyncGenerator, Dict, List

from langchain_core.messages import HumanMessage, AIMessage

from src.graph.prompt_utils import (
    extract_final_text,
    load_prompt,
    parse_action_line,
)
from src.knowledge.personas import build_persona_block
from src.llm import get_interviewer_llm
from src.tools.interviewer_tools import call_interviewer_tool

logger = logging.getLogger(__name__)

MAX_REACT_ITERS = 4  # ReAct 最大轮数(超过强制取 Final)


def _brief_red_flags(flags: List[Dict[str, Any]]) -> str:
    if not flags:
        return "(无)"
    return "; ".join(
        f"{f.get('topic')}: {f.get('evidence')}({f.get('severity')})"
        for f in flags[-5:]
    )


def _format_prompt(state: Dict[str, Any], mode: str, **extra) -> str:
    persona_block = build_persona_block(
        state.get("persona_card_id", ""),
        state.get("persona_dimensions", {}),
    )
    common = {
        "persona_block": persona_block,
        "job_root": state.get("skill_tree", {}).get("root", ""),
        "current_topic": state.get("current_topic_name", ""),
        "current_topic_weight": state.get("current_topic_weight", 1.0),
        "depth_level": _depth_level_of(state),
        "current_topic_dimensions": ", ".join(state.get("current_topic_dimensions", [])),
        "red_flags_brief": _brief_red_flags(state.get("red_flags", [])),
        "current_depth": state.get("current_depth", 0),
    }
    common.update(extra)
    template_name = {
        "OPENING": "interviewer_opening_react",
        "DRILL_DOWN": "interviewer_drilldown_react",
        "SWITCH_TOPIC": "interviewer_switch_react",
    }.get(mode, "interviewer_opening_react")
    tpl = load_prompt(template_name)
    # safe format(允许缺字段)
    class _SafeDict(dict):
        def __missing__(self, key):
            return "(N/A)"
    return tpl.format_map(_SafeDict(common))


def _depth_level_of(state: Dict[str, Any]) -> str:
    """从 skill_tree 找当前题的 depth_level。"""
    tid = state.get("current_topic_id", "")
    for n in state.get("skill_tree", {}).get("nodes", []):
        if n.get("id") == tid:
            return n.get("depth_level", "medium")
    return "medium"


async def run_interviewer(
    state: Dict[str, Any],
    mode: str,
    message_id: str | None = None,
    *,
    last_question: str = "",
    user_answer: str = "",
    found_gaps: List[str] | None = None,
    drill_down_target: str = "",
    drill_down_hint: str = "",
    previous_satisfaction: int = 50,
    current_satisfaction: int = 50,
    is_interrupted: bool = False,
    prev_topic: str = "",
    prev_satisfaction: int = 0,
    next_topic: str = "",
    next_topic_weight: float = 1.0,
    next_depth_level: str = "medium",
    next_topic_dimensions: List[str] | None = None,
    is_red_flag_hunt: bool = False,
) -> AsyncGenerator[Dict[str, Any], None]:
    """ReAct loop,yield SSE 事件;最后 yield {"event": "_done", ...} 携带结果。"""
    if message_id is None:
        message_id = f"m_{uuid.uuid4().hex[:8]}"

    extra = {
        "last_question": last_question,
        "user_answer": user_answer,
        "found_gaps": "; ".join(found_gaps or []) or "(无)",
        "drill_down_target": drill_down_target or "(N/A)",
        "drill_down_hint": drill_down_hint or "(N/A)",
        "previous_satisfaction": previous_satisfaction,
        "current_satisfaction": current_satisfaction,
        "interrupt_hint": (
            "用户回答过长(超过 500 字),你需要打断他,要求直接说核心结论。"
            if is_interrupted
            else "正常追问即可。"
        ),
        "prev_topic": prev_topic,
        "prev_satisfaction": prev_satisfaction,
        "next_topic": next_topic,
        "next_topic_weight": next_topic_weight,
        "next_depth_level": next_depth_level,
        "next_topic_dimensions": ", ".join(next_topic_dimensions or []),
        "is_red_flag_hunt": "是" if is_red_flag_hunt else "否",
    }
    base_prompt = _format_prompt(state, mode, **extra)

    llm = get_interviewer_llm()
    messages = [HumanMessage(content=base_prompt)]
    thinking_steps: List[Dict[str, Any]] = []
    step_index = 0
    final_text = ""

    yield {
        "event": "interviewer_state",
        "data": {"state_id": "thinking", "state_text": "面试官正在沉思...", "ttl_ms": 3000},
    }

    for iter_idx in range(MAX_REACT_ITERS):
        try:
            resp = await llm.ainvoke(messages)
        except Exception as e:
            logger.exception("Interviewer LLM 调用失败: %s", e)
            final_text = "(模型暂时不可用,我们换一个题。)"
            break
        text = resp.content if isinstance(resp.content, str) else str(resp.content)

        # 检测 Final
        if "Final" in text and ("Final Question:" in text or "Final:" in text):
            final_text = extract_final_text(text)
            # 把 Thought 步骤也透传
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
                "content": final_text[:200],
                "tool_name": None,
                "tool_args": None,
            }
            thinking_steps.append(final_step)
            yield {"event": "thinking_step", "data": final_step}
            step_index += 1
            break

        # 没有 Final:解析 Thought / Action / Observation
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
                yield {
                    "event": "interviewer_state",
                    "data": {
                        "state_id": "reading_material",
                        "state_text": "面试官在翻看资料...",
                        "ttl_ms": 1500,
                    },
                }
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
                # 执行 Tool
                observation = call_interviewer_tool(state, tool_name, tool_args)
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
                # 继续对话:把模型刚才的输出 + Observation 反馈进去
                messages.append(AIMessage(content=text))
                messages.append(
                    HumanMessage(
                        content=f"Observation: {observation[:1000]}\n\n基于这个 Observation,继续你的 Thought,如果想清楚了就输出 Final Question。"
                    )
                )
                action_found = True
                break  # 重启 outer loop 重新调 LLM

        if not action_found:
            # 没有 Action 也没有 Final:把当前输出当作 Final
            final_text = extract_final_text(text) or text.strip()
            final_step = {
                "message_id": message_id,
                "step_index": step_index,
                "step_type": "final",
                "content": final_text[:200],
                "tool_name": None,
                "tool_args": None,
            }
            thinking_steps.append(final_step)
            yield {"event": "thinking_step", "data": final_step}
            step_index += 1
            break

    if not final_text:
        final_text = "我们换个方向。你怎么看 Agent 产品里 'thinking 是否可见' 这个设计决策?"

    yield {
        "event": "_done",
        "data": {
            "question": final_text,
            "thinking_steps": thinking_steps,
            "message_id": message_id,
        },
    }
