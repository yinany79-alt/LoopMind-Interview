"""Reporter — 最终报告生成。

输入:state(整场面试完整数据)
输出:report dict,字段严格按 接口规范 §2.7
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List

from langchain_core.messages import HumanMessage

from src.graph.prompt_utils import extract_json_block, llm_text, load_prompt
from src.graph.state import DIMENSIONS
from src.llm import get_evaluator_llm

logger = logging.getLogger(__name__)


def _brief_topics_dialog(state: Dict[str, Any]) -> str:
    parts = []
    for cov in state.get("topics_covered", []):
        turns = cov.get("turns", [])
        snippet = []
        for t in turns[:6]:
            role = "面试官" if t.get("role") == "interviewer" else "候选人"
            snippet.append(f"{role}: {t.get('content', '')[:120]}")
        parts.append(
            f"- {cov.get('topic_name')} (final_sat={cov.get('final_satisfaction')}):\n  "
            + "\n  ".join(snippet)
        )
    return "\n".join(parts) or "(无)"


def _topics_satisfaction_brief(state: Dict[str, Any]) -> str:
    return "; ".join(
        f"{c.get('topic_name')}={c.get('final_satisfaction')}"
        for c in state.get("topics_covered", [])
    ) or "(无)"


def _persona_brief(state: Dict[str, Any]) -> str:
    cid = state.get("persona_card_id", "")
    dims = state.get("persona_dimensions", {})
    return f"{cid}; dims={dims}"


def _topic_replays(state: Dict[str, Any]) -> List[Dict[str, Any]]:
    out = []
    for cov in state.get("topics_covered", []):
        out.append({
            "topic_id": cov.get("topic_id"),
            "topic_name": cov.get("topic_name"),
            "turns": [
                {
                    "role": t.get("role"),
                    "content": t.get("content"),
                    "thinking": t.get("thinking"),
                }
                for t in cov.get("turns", [])
            ],
            "final_satisfaction": cov.get("final_satisfaction"),
            "evaluator_comment": cov.get("evaluator_comment", ""),
        })
    return out


async def generate_report(state: Dict[str, Any]) -> Dict[str, Any]:
    """同步生成完整报告 dict。"""
    topics_count = len(state.get("topics_covered", []))
    below_min = topics_count < state.get("min_topics_threshold", 5)

    prompt = load_prompt("reporter").format(
        job_root=state.get("skill_tree", {}).get("root", ""),
        topics_count=topics_count,
        below_minimum=below_min,
        persona_brief=_persona_brief(state),
        dimension_scores=json.dumps(state.get("dimension_scores", {}), ensure_ascii=False),
        red_flags=json.dumps(state.get("red_flags", []), ensure_ascii=False),
        bright_spots=json.dumps(state.get("bright_spots", []), ensure_ascii=False),
        topics_satisfaction_brief=_topics_satisfaction_brief(state),
        topics_dialog_brief=_brief_topics_dialog(state),
    )

    llm = get_evaluator_llm()
    try:
        resp = await llm.ainvoke([HumanMessage(content=prompt)])
        text = llm_text(resp.content)
        data = extract_json_block(text)
    except Exception as e:
        logger.exception("Reporter LLM 失败: %s", e)
        data = None

    if not data:
        data = _fallback_report(state, below_min)

    # 补齐缺失字段
    verdict = data.get("verdict", {}) or {}
    verdict.setdefault("level", "P6")
    verdict.setdefault("level_confidence", "low")
    verdict.setdefault("overall_score", 60)
    verdict.setdefault(
        "summary",
        ("早退场,数据有限,定级仅供参考。" if below_min else "整体表现尚可,但缺乏第一手深度场景。"),
    )

    dim_scores = data.get("dimension_scores") or {}
    dim_scores = {d: int(dim_scores.get(d, _normalize_dim(state, d))) for d in DIMENSIONS}

    comments = data.get("comments") or []
    if not comments:
        comments = [
            {"type": "weakness", "text": "回答缺乏具体场景与数据支撑"},
        ]

    return {
        "session_id": state.get("session_id"),
        "status": "ready",
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "verdict": verdict,
        "dimension_scores": dim_scores,
        "comments": comments,
        "topic_replays": _topic_replays(state),
        "below_minimum": below_min,
    }


def _normalize_dim(state: Dict[str, Any], dim: str) -> int:
    """把累积 dimension_scores 标准化到 0-100。"""
    raw = state.get("dimension_scores", {}).get(dim, 0)
    # 经验值:累积 -25 ~ +25 映射到 0-100,起点 50
    score = int(50 + raw * 2)
    return max(0, min(100, score))


def _fallback_report(state: Dict[str, Any], below_min: bool) -> Dict[str, Any]:
    return {
        "verdict": {
            "level": "P6",
            "level_confidence": "low",
            "overall_score": 60,
            "summary": (
                "(报告生成异常,以下是兜底数据)早退场,数据有限,定级仅供参考。"
                if below_min
                else "(报告生成异常,以下是兜底数据)整体平稳,缺乏亮点。"
            ),
        },
        "dimension_scores": {d: _normalize_dim(state, d) for d in DIMENSIONS},
        "comments": [
            {"type": "weakness", "text": "报告生成器异常,请检查后端日志"},
        ],
    }
