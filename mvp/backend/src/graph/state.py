"""InterviewState — LangGraph 主图的全局状态。

严格按 Plan §D2 + 接口规范要求设计。前端只能看到对外字段,
hidden_scratchpad / scratch 等仅后端可见。
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional, TypedDict


# 五个维度,与接口规范 §2.1 一致
DIMENSIONS = [
    "agent_product_taste",
    "tech_understanding",
    "product_methodology",
    "user_empathy",
    "first_hand_experience",
]


class InterviewState(TypedDict, total=False):
    # === 元信息 ===
    session_id: str

    # === 对话历史(用户可见)===
    chat_history: List[Dict[str, Any]]
    # [{role: 'interviewer'|'user', content: str, message_id: str, topic_id?: str}]

    # === 当前题目状态 ===
    current_topic_id: str
    current_topic_name: str
    current_topic_weight: float
    current_topic_dimensions: List[str]
    current_question: str
    current_depth: int
    current_topic_turns: List[Dict[str, Any]]
    current_satisfaction: int  # 0-100

    # === 跨题积累 ===
    skill_tree: Dict[str, Any]
    topics_covered: List[Dict[str, Any]]  # [{topic_id, topic_name, final_satisfaction, ...}]
    topics_pending: List[Dict[str, Any]]  # 剩余可选题
    dimension_scores: Dict[str, float]
    red_flags: List[Dict[str, Any]]
    bright_spots: List[Dict[str, Any]]

    # === 控制信号 ===
    last_eval: Optional[Dict[str, Any]]
    next_action: str  # drill_down | next_topic | end
    turn_count: int
    is_interrupted: bool

    # === 人格矩阵 ===
    persona_card_id: str
    persona_dimensions: Dict[str, int]

    # === 结束逻辑 ===
    min_topics_threshold: int
    user_requested_end: bool

    # === 报告(/end 之后由 BackgroundTask 填充)===
    jd_text: str
    jd_summary: Dict[str, Any]


def make_initial_state(session_id: str, jd_text: str) -> InterviewState:
    return {
        "session_id": session_id,
        "chat_history": [],
        "current_topic_id": "",
        "current_topic_name": "",
        "current_topic_weight": 1.0,
        "current_topic_dimensions": [],
        "current_question": "",
        "current_depth": 0,
        "current_topic_turns": [],
        "current_satisfaction": 50,
        "skill_tree": {},
        "topics_covered": [],
        "topics_pending": [],
        "dimension_scores": {d: 0.0 for d in DIMENSIONS},
        "red_flags": [],
        "bright_spots": [],
        "last_eval": None,
        "next_action": "",
        "turn_count": 0,
        "is_interrupted": False,
        "persona_card_id": "",
        "persona_dimensions": {},
        "min_topics_threshold": 5,
        "user_requested_end": False,
        "jd_text": jd_text,
        "jd_summary": {},
    }
