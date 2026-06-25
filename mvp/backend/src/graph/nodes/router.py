"""Router — 纯逻辑决策,无 LLM。

读 last_eval / current_depth / current_satisfaction → 写 next_action
"""
from __future__ import annotations

from typing import Any, Dict


MAX_DEPTH = 4
SATISFACTION_HIGH = 80
SATISFACTION_LOW = 20


def decide_next_action(state: Dict[str, Any]) -> str:
    """返回 'drill_down' | 'next_topic' | 'end'。"""
    last_eval = state.get("last_eval") or {}
    sat = state.get("current_satisfaction", 50)
    depth = state.get("current_depth", 0)

    # 用户主动结束 → end
    if state.get("user_requested_end", False):
        return "end"

    # topic_finish_signal 显式信号
    if last_eval.get("topic_finish_signal") in ("user_excellent", "user_hopeless", "exhausted"):
        return "next_topic"

    # depth 用尽
    if depth >= MAX_DEPTH:
        return "next_topic"

    # 满意度触顶/触底
    if sat >= SATISFACTION_HIGH:
        return "next_topic"
    if sat <= SATISFACTION_LOW:
        return "next_topic"

    # 否则追问
    return "drill_down"


def detect_topic_finish_reason(state: Dict[str, Any]) -> str:
    """给 topic_finished 事件用的 reason 字符串。"""
    last_eval = state.get("last_eval") or {}
    sat = state.get("current_satisfaction", 50)
    depth = state.get("current_depth", 0)

    signal = last_eval.get("topic_finish_signal")
    if signal == "user_excellent" or sat >= SATISFACTION_HIGH:
        return "satisfaction_reached"
    if signal == "user_hopeless" or sat <= SATISFACTION_LOW:
        return "user_hopeless"
    if signal == "exhausted":
        return "exhausted"
    if depth >= MAX_DEPTH:
        return "depth_limit"
    return "exhausted"
