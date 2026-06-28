"""精选 JD 库 - Trending Missions 数据源。

每条 JD 启动时跑 jd_parser,结果写入 curated_jobs_cache.json,加速创建 session。
"""
from __future__ import annotations

import hashlib
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional


logger = logging.getLogger(__name__)

_CACHE_PATH = Path(__file__).resolve().parent / "curated_jobs_cache.json"


# ====== 精选 JD 库 ======

CURATED_JOBS: List[Dict[str, Any]] = [
    {
        "id": "deepseek-agent-harness-pm",
        "title": "Agent Harness 产品经理",
        "company": "DeepSeek",
        "company_slug": "deepseek",
        "location": "杭州 / 北京",
        "salary_range": "60-100K · 16薪",
        "difficulty": 4,
        "tags": ["Agent", "PM", "AI Native"],
        "jd_text": """Agent Harness 产品经理 · DeepSeek (杭州/北京)

团队使命:Model + Harness = Agent。我们相信下一代 AI 产品形态不是 chatbot,
而是能在循环中持续完成任务的 Agent。Harness 团队负责设计这一层把模型变成
真正能干活的「载体」——从 Tool Use、MCP、上下文工程,到端到端的产品体验。

你将负责:
- 主导 DeepSeek Agent 产品形态的产品决策
- 与研究 / 工程团队一起设计 Agent Loop 关键交互
- 定义指标体系,推动产品迭代
- 跟踪 Cursor / Claude Code / Devin 等竞品,形成判断

要求:
- 5 年以上 to-C / to-Developer 产品经验
- 对 Agent / LLM 有第一手使用经验,能从原理层理解产品权衡
- 强工程 sense,能和 research engineer 深度对话""",
    },
    {
        "id": "openai-applied-researcher",
        "title": "Applied Researcher",
        "company": "OpenAI",
        "company_slug": "openai",
        "location": "San Francisco / Remote",
        "salary_range": "$240k-$420k · stock",
        "difficulty": 5,
        "tags": ["Research", "RLHF", "Post-training"],
        "jd_text": """Applied Researcher · OpenAI

We're looking for applied researchers who can bridge frontier research and
production deployment. You will work on improving the next generation of GPT
and Codex models — focusing on post-training, alignment, and capability evals.

Responsibilities:
- Design and run experiments on RLHF / DPO / synthetic data pipelines
- Build evals that catch regressions before launch
- Work cross-functionally with product to ship safer, more capable models

Requirements:
- PhD or equivalent industry experience in ML
- Strong publications or shipped work in LLM training / alignment
- Hands-on with PyTorch and distributed training (8+ GPU node experience)
- Comfort writing high-quality production Python""",
    },
    {
        "id": "bytedance-algorithm-engineer",
        "title": "推荐算法工程师",
        "company": "字节跳动",
        "company_slug": "bytedance",
        "location": "北京 / 上海",
        "salary_range": "40-80K · 14薪",
        "difficulty": 4,
        "tags": ["推荐", "深度学习", "大规模"],
        "jd_text": """推荐算法工程师 · 字节跳动 (北京/上海)

抖音 / 头条 / TikTok 主站推荐团队招聘资深算法工程师,负责亿级 DAU 场景的
召回 / 粗排 / 精排 / 重排 全链路优化。

你将做什么:
- 优化召回 / 排序模型,直接为 GMV / 留存负责
- 推动 SOTA 模型在生产环境落地(DIN / Transformer4Rec / 大模型 召回 等)
- 设计 A/B 实验,做出可解释的业务判断

我们期望:
- 3 年以上推荐 / 搜索 / 广告算法经验
- 深入理解 一种以上 工业级推荐系统(具备从 0 搭起 / 优化 / 上线 的能力)
- 熟悉 PyTorch / TF,有 大规模分布式训练 经验
- 能用 SQL 自如探查数据,从数据中找到业务问题""",
    },
    {
        "id": "tencent-product-manager",
        "title": "产品经理(AI 方向)",
        "company": "腾讯",
        "company_slug": "tencent",
        "location": "深圳",
        "salary_range": "30-60K · 16薪",
        "difficulty": 3,
        "tags": ["AI", "PM", "C 端"],
        "jd_text": """产品经理(AI 方向) · 腾讯 (深圳)

CSIG / WXG 战略业务线,招聘 AI 方向产品经理,主导 AI Agent / Copilot 类
产品的从 0 到 1 落地。

工作内容:
- 调研 AI Agent / Copilot 场景,识别真实用户痛点
- 与算法 / 工程团队协作,定义产品需求文档
- 上线后跟踪数据,推动产品迭代

任职要求:
- 3 年以上 C 端 / B 端产品经验,有从 0-1 经验优先
- 对 LLM 应用有第一手使用经验,理解能力边界
- 熟悉数据驱动方法,会 SQL / Tableau 优先
- 有强同理心,能与算法 / 设计 / 工程顺畅协作""",
    },
    {
        "id": "anthropic-product-engineer",
        "title": "Product Engineer · Claude API",
        "company": "Anthropic",
        "company_slug": "anthropic",
        "location": "San Francisco",
        "salary_range": "$250k-$420k · equity",
        "difficulty": 5,
        "tags": ["Full-stack", "Claude", "Developer Tools"],
        "jd_text": """Product Engineer · Claude API · Anthropic

Anthropic's API platform serves Claude to thousands of developers and enterprises.
We're looking for a Product Engineer to ship features end-to-end on console.anthropic.com
and the Claude API.

What you'll do:
- Build features that delight developers (workbench, prompt caching UX, MCP, batch API, etc.)
- Own a feature from design discussion → code → ship → measure → iterate
- Write production TypeScript / React + Python / FastAPI
- Work directly with research to expose new model capabilities through good API design

We're looking for:
- 5+ years shipping production web apps end-to-end
- Strong product taste — you've made a developer tool that someone loved
- Comfort with backend (Python preferred) AND frontend (React / TypeScript)
- Care about reliability and observability of the systems you ship""",
    },
]


def list_curated_jobs() -> List[Dict[str, Any]]:
    """前端 list 用,不含 jd_text。"""
    out = []
    for j in CURATED_JOBS:
        out.append({k: v for k, v in j.items() if k != "jd_text"})
    return out


def get_curated_job(job_id: str) -> Optional[Dict[str, Any]]:
    for j in CURATED_JOBS:
        if j["id"] == job_id:
            return j
    return None


# ====== 预解析缓存 ======

def _jd_hash(jd_text: str) -> str:
    return hashlib.sha256(jd_text.encode("utf-8")).hexdigest()[:16]


def load_cache() -> Dict[str, Dict[str, Any]]:
    """返回 {job_id: {hash, jd_summary, skill_tree}}。"""
    if not _CACHE_PATH.exists():
        return {}
    try:
        return json.loads(_CACHE_PATH.read_text(encoding="utf-8"))
    except Exception as e:
        logger.warning("curated_jobs_cache.json 损坏,丢弃: %s", e)
        return {}


def save_cache(cache: Dict[str, Dict[str, Any]]) -> None:
    _CACHE_PATH.write_text(
        json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def get_cached_parse(job_id: str) -> Optional[Dict[str, Any]]:
    """如果 cache 命中且 hash 匹配,返回 {jd_summary, skill_tree};否则 None。"""
    job = get_curated_job(job_id)
    if not job:
        return None
    cache = load_cache()
    entry = cache.get(job_id)
    if not entry:
        return None
    if entry.get("hash") != _jd_hash(job["jd_text"]):
        return None
    return {"jd_summary": entry["jd_summary"], "skill_tree": entry["skill_tree"]}


async def warm_cache() -> None:
    """启动时跑,对每条 JD 检查 cache,缺的或过期的跑 jd_parser 重写入。"""
    from src.graph.nodes.jd_parser import parse_jd

    cache = load_cache()
    changed = False
    for job in CURATED_JOBS:
        h = _jd_hash(job["jd_text"])
        cached = cache.get(job["id"])
        if cached and cached.get("hash") == h:
            continue
        logger.info("预解析 curated job: %s ...", job["id"])
        try:
            parsed = await parse_jd(job["jd_text"])
            cache[job["id"]] = {
                "hash": h,
                "jd_summary": parsed.get("jd_summary", {}),
                "skill_tree": parsed.get("skill_tree", {}),
            }
            changed = True
            logger.info("  ✓ %s 解析成功", job["id"])
        except Exception as e:
            logger.exception("  ✗ %s 解析失败: %s", job["id"], e)
    if changed:
        save_cache(cache)
        logger.info("curated_jobs_cache.json 已更新")
