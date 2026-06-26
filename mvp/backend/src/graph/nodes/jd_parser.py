"""JD Parser — 把 JD 文本解构成 skill_tree(带 weight + depth_level + dimensions)。"""
from __future__ import annotations

import logging
from typing import Any, Dict

from langchain_core.messages import HumanMessage

from src.graph.prompt_utils import extract_json_block, llm_text, load_prompt
from src.llm import get_evaluator_llm

logger = logging.getLogger(__name__)


async def parse_jd(jd_text: str) -> Dict[str, Any]:
    """同步调 LLM,返回 {jd_summary, skill_tree}。失败时返回兜底 skill_tree。"""
    prompt = load_prompt("jd_parser").format(jd_text=jd_text.strip())
    llm = get_evaluator_llm()
    try:
        resp = await llm.ainvoke([HumanMessage(content=prompt)])
        text = llm_text(resp.content)
        data = extract_json_block(text)
        if not data or "skill_tree" not in data:
            logger.warning("JD Parser 解析失败,使用兜底 skill_tree。原始: %s", text[:300])
            return _fallback_skill_tree(jd_text)
        # 容错:确保字段齐全
        st = data.get("skill_tree", {})
        if not st.get("nodes"):
            return _fallback_skill_tree(jd_text)
        return data
    except Exception as e:
        logger.exception("JD Parser LLM 调用异常: %s", e)
        return _fallback_skill_tree(jd_text)


def _fallback_skill_tree(jd_text: str) -> Dict[str, Any]:
    """LLM 失败时的兜底 skill_tree(覆盖 DeepSeek Agent Harness PM 主要考察点)。"""
    return {
        "jd_summary": {
            "title": "Agent Harness 产品经理",
            "company": "DeepSeek",
            "location": "杭州 / 北京",
        },
        "skill_tree": {
            "root": "DeepSeek Agent Harness PM",
            "dimensions": [
                "agent_product_taste",
                "tech_understanding",
                "product_methodology",
                "user_empathy",
                "first_hand_experience",
            ],
            "nodes": [
                {
                    "id": "agent_loop",
                    "topic": "Agent Loop 与产品形态",
                    "weight": 2.5,
                    "depth_level": "deep",
                    "dimensions": ["agent_product_taste", "tech_understanding"],
                },
                {
                    "id": "tool_use",
                    "topic": "Tool Use 与 MCP",
                    "weight": 2.0,
                    "depth_level": "medium",
                    "dimensions": ["tech_understanding", "product_methodology"],
                },
                {
                    "id": "first_hand_use",
                    "topic": "Agent 产品第一手使用经验",
                    "weight": 2.5,
                    "depth_level": "deep",
                    "dimensions": ["first_hand_experience", "agent_product_taste"],
                },
                {
                    "id": "developer_experience",
                    "topic": "面向开发者的 DX 设计",
                    "weight": 2.0,
                    "depth_level": "medium",
                    "dimensions": ["user_empathy", "product_methodology"],
                },
                {
                    "id": "evaluation",
                    "topic": "Agent 评测与品味标准",
                    "weight": 1.5,
                    "depth_level": "medium",
                    "dimensions": ["product_methodology", "tech_understanding"],
                },
                {
                    "id": "scaling_law",
                    "topic": "Scaling Law 与模型能力边界",
                    "weight": 1.5,
                    "depth_level": "deep",
                    "dimensions": ["tech_understanding", "agent_product_taste"],
                },
                {
                    "id": "cross_role",
                    "topic": "跨算法-工程-产品协作",
                    "weight": 1.5,
                    "depth_level": "medium",
                    "dimensions": ["product_methodology", "user_empathy"],
                },
            ],
        },
    }
