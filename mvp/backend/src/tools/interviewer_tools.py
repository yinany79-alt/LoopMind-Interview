"""Interviewer ReAct 子图可用的 4 个 Tool。

每个 Tool 都接收当前 InterviewState(从主图传入),返回字符串结果。
ReAct 文本解析器(在 nodes/interviewer_subgraph.py)会调用这些。
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, List


_RESUME_CACHE: str | None = None


def _resume() -> str:
    global _RESUME_CACHE
    if _RESUME_CACHE is None:
        path = Path(__file__).resolve().parent.parent / "knowledge" / "user_resume.txt"
        try:
            _RESUME_CACHE = path.read_text(encoding="utf-8")
        except Exception:
            _RESUME_CACHE = ""
    return _RESUME_CACHE


def get_skill_tree(state: Dict[str, Any]) -> str:
    """返回完整技能树(简化版,只保留 topic / weight / depth_level)。"""
    tree = state.get("skill_tree", {})
    nodes = tree.get("nodes", [])
    brief = [
        {
            "id": n.get("id"),
            "topic": n.get("topic"),
            "weight": n.get("weight"),
            "depth_level": n.get("depth_level"),
            "covered": any(c.get("topic_id") == n.get("id") for c in state.get("topics_covered", [])),
        }
        for n in nodes
    ]
    return json.dumps(brief, ensure_ascii=False)


def get_red_flags_history(state: Dict[str, Any]) -> str:
    flags = state.get("red_flags", [])
    return json.dumps(flags, ensure_ascii=False) if flags else "[]"


def get_topic_history(state: Dict[str, Any], topic: str = "") -> str:
    """拿本题已问过的所有轮。topic 为空时用 current_topic_name。"""
    target = (topic or state.get("current_topic_name", "")).strip()
    turns = state.get("current_topic_turns", [])
    # MVP:current_topic_turns 已经只存当前题
    if not target or target == state.get("current_topic_name", ""):
        brief = [
            {"role": t.get("role"), "content": t.get("content", "")[:200]}
            for t in turns
        ]
        return json.dumps(brief, ensure_ascii=False)
    # 历史题:从 topics_covered 找
    for cov in state.get("topics_covered", []):
        if cov.get("topic_name") == target or cov.get("topic_id") == target:
            return json.dumps(cov.get("turns", []), ensure_ascii=False)
    return "[]"


def get_user_resume_snippet(state: Dict[str, Any], keyword: str = "") -> str:
    text = _resume()
    if not keyword:
        return text[:600]
    k = keyword.strip().lower()
    lines = text.splitlines()
    hits: List[str] = []
    for i, ln in enumerate(lines):
        if k in ln.lower():
            ctx = lines[max(0, i - 1) : i + 3]
            hits.extend(ctx)
    if not hits:
        return f"(简历中未命中 '{keyword}')"
    return "\n".join(hits[:30])


# ===== 工具调度表 =====

INTERVIEWER_TOOLS = {
    "get_skill_tree": get_skill_tree,
    "get_red_flags_history": get_red_flags_history,
    "get_topic_history": get_topic_history,
    "get_user_resume_snippet": get_user_resume_snippet,
}


def call_interviewer_tool(state: Dict[str, Any], tool_name: str, tool_args: Dict[str, Any]) -> str:
    fn = INTERVIEWER_TOOLS.get(tool_name)
    if not fn:
        return f"(unknown tool: {tool_name})"
    try:
        # 所有 tool 第一个参数都是 state,后面是 kwargs
        return fn(state, **(tool_args or {}))
    except TypeError as e:
        return f"(tool arg error: {e})"
    except Exception as e:
        return f"(tool runtime error: {e})"
