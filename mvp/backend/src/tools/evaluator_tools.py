"""Evaluator ReAct 子图可用的 3 个 Tool。"""
from __future__ import annotations

import json
from typing import Any, Dict

from src.knowledge.standard_answers import query_standard_answer as _query_sa


def query_standard_answer(state: Dict[str, Any], topic: str = "", sub_question: str = "") -> str:
    if not topic:
        topic = state.get("current_topic_name", "") or state.get("current_topic_id", "")
    return _query_sa(topic, sub_question)


def get_topic_weight(state: Dict[str, Any], topic: str = "") -> str:
    target = (topic or state.get("current_topic_name", "")).strip()
    if not target or target == state.get("current_topic_name", ""):
        return str(state.get("current_topic_weight", 1.0))
    for n in state.get("skill_tree", {}).get("nodes", []):
        if n.get("topic") == target or n.get("id") == target:
            return str(n.get("weight", 1.0))
    return "1.0"


def get_topic_history(state: Dict[str, Any], topic: str = "") -> str:
    """同 interviewer 版,简化。"""
    target = (topic or state.get("current_topic_name", "")).strip()
    if not target or target == state.get("current_topic_name", ""):
        turns = state.get("current_topic_turns", [])
        brief = [
            {"role": t.get("role"), "content": t.get("content", "")[:200]}
            for t in turns
        ]
        return json.dumps(brief, ensure_ascii=False)
    for cov in state.get("topics_covered", []):
        if cov.get("topic_name") == target or cov.get("topic_id") == target:
            return json.dumps(cov.get("turns", []), ensure_ascii=False)
    return "[]"


EVALUATOR_TOOLS = {
    "query_standard_answer": query_standard_answer,
    "get_topic_weight": get_topic_weight,
    "get_topic_history": get_topic_history,
}


def call_evaluator_tool(state: Dict[str, Any], tool_name: str, tool_args: Dict[str, Any]) -> str:
    fn = EVALUATOR_TOOLS.get(tool_name)
    if not fn:
        return f"(unknown tool: {tool_name})"
    try:
        return fn(state, **(tool_args or {}))
    except TypeError as e:
        return f"(tool arg error: {e})"
    except Exception as e:
        return f"(tool runtime error: {e})"
