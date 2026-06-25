"""Next Topic Generator — 选下一道题。

输入:state
输出:next_topic_node(从 skill_tree.nodes 中选一个 dict)or None(题目用尽)
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage

from src.graph.prompt_utils import extract_json_block, load_prompt
from src.llm import get_evaluator_llm

logger = logging.getLogger(__name__)


def _pending_nodes(state: Dict[str, Any]) -> List[Dict[str, Any]]:
    covered_ids = {c.get("topic_id") for c in state.get("topics_covered", [])}
    return [
        n for n in state.get("skill_tree", {}).get("nodes", [])
        if n.get("id") not in covered_ids
    ]


def _brief_topics_covered(state: Dict[str, Any]) -> str:
    return "; ".join(
        f"{c.get('topic_id')}: sat={c.get('final_satisfaction')}"
        for c in state.get("topics_covered", [])
    ) or "(无)"


def _brief_topics_pending(pending: List[Dict[str, Any]]) -> str:
    return "; ".join(
        f"{n.get('id')}(w={n.get('weight')},{n.get('depth_level')})"
        for n in pending
    ) or "(无剩余题目)"


async def pick_next_topic(state: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """返回 {topic_id, is_red_flag_hunt, node} 或 None。"""
    pending = _pending_nodes(state)
    if not pending:
        return None

    # 简单规则兜底:按权重降序 + depth_level
    depth_order = {"deep": 3, "medium": 2, "shallow": 1}
    sorted_pending = sorted(
        pending,
        key=lambda n: (-float(n.get("weight", 1)), -depth_order.get(n.get("depth_level", "medium"), 2)),
    )

    # 先看红牌:如果某个红牌 topic 在 pending 里,优先选
    red_flag_topics = [f.get("topic") for f in state.get("red_flags", [])]
    for n in sorted_pending:
        if n.get("topic") in red_flag_topics or n.get("id") in red_flag_topics:
            return {"topic_id": n.get("id"), "is_red_flag_hunt": True, "node": n}

    # 否则调 LLM(可选)。MVP 阶段如果 LLM 失败就用规则兜底。
    try:
        tpl = load_prompt("next_topic_generator")
        vision = state.get("persona_dimensions", {}).get("vision", 50)
        prompt = tpl.format(
            topics_covered_brief=_brief_topics_covered(state),
            topics_pending_brief=_brief_topics_pending(pending),
            red_flags_brief="; ".join(
                f"{f.get('topic')}: {f.get('evidence')}" for f in state.get("red_flags", [])
            ) or "(无)",
            bright_spots_brief="; ".join(
                f"{s.get('topic')}: {s.get('evidence')}" for s in state.get("bright_spots", [])
            ) or "(无)",
            dimension_scores=json.dumps(state.get("dimension_scores", {}), ensure_ascii=False),
            vision_dim=vision,
        )
        llm = get_evaluator_llm()
        resp = await llm.ainvoke([HumanMessage(content=prompt)])
        text = resp.content if isinstance(resp.content, str) else str(resp.content)
        data = extract_json_block(text)
        if data and data.get("topic_id"):
            tid = data["topic_id"]
            for n in sorted_pending:
                if n.get("id") == tid:
                    return {
                        "topic_id": tid,
                        "is_red_flag_hunt": bool(data.get("is_red_flag_hunt")),
                        "node": n,
                    }
    except Exception as e:
        logger.warning("Next topic LLM 失败,用规则兜底: %s", e)

    # 兜底:规则第一名
    top = sorted_pending[0]
    return {"topic_id": top.get("id"), "is_red_flag_hunt": False, "node": top}
