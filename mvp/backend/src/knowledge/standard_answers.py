"""标准答案知识库(MVP 阶段 hardcoded,后续接 RAG)。

供 Evaluator 的 query_standard_answer Tool 调用。
覆盖 DeepSeek Agent Harness PM JD 解构出的主要技术点。
"""
from __future__ import annotations

from typing import Optional


STANDARD_ANSWERS = {
    "agent_loop": {
        "stop_condition": (
            "Agent Loop 的 stop condition 是产品决策点而非纯技术问题。"
            "好的设计应该有:1) 显式 final_answer tool;2) max_iterations 兜底;"
            "3) 模型自我判断是否 done;4) 用户中断信号。Claude Code 的做法是让模型主动调 finish。"
        ),
        "product_form": (
            "Agent Loop 的产品形态决定了用户的心智:是 chatbot(同步问答)、协作 IDE(异步任务)、"
            "还是工作流引擎(批处理)。Claude Code 用'流式 + 可中断 + 思考可见'打造了一种新的'结对编程'体感,"
            "区别于 Cursor 的'补全 + 接受/拒绝'范式。"
        ),
        "default": (
            "Agent Loop 是 Reason → Act → Observe 的循环。关键产品决策包括:"
            "stop condition、tool 错误的恢复策略、模型 thinking 是否可见、用户能否中断和修正。"
        ),
    },
    "tool_use": {
        "default": (
            "Tool Use 的核心是契约设计:工具签名要让模型理解什么时候该调、参数怎么填。"
            "好的工具集应该正交、命名清晰、有 idempotency、错误信息可读。"
            "MCP 把工具协议标准化,让任意 Agent host 能消费任意 MCP server 的工具。"
        ),
    },
    "mcp": {
        "default": (
            "MCP(Model Context Protocol)是 Anthropic 推的 Agent 工具标准化协议。"
            "transport 支持 stdio / SSE / HTTP。客户端发现工具、调用工具,服务端实现工具。"
            "本质是把'Agent 怎么连工具'从每家自己造轮子变成统一协议,类似 LSP 之于 IDE。"
        ),
    },
    "memory": {
        "default": (
            "Agent Memory 分短期(context window)、长期(向量库 / KV)、工作记忆(scratchpad)。"
            "好的设计要区分'要记住什么'和'要忘记什么',Claude Code 用 CLAUDE.md + 显式 memory tool 让用户控制。"
        ),
    },
    "planning": {
        "default": (
            "Planning 的几种范式:ReAct(边想边做)、Plan-then-Execute(先列计划)、Tree-of-Thoughts。"
            "实战中纯 Plan-then-Execute 经常 plan 跑偏,ReAct 更适合开放任务。"
            "Manus 用 plan 文件让用户能 review 长任务的步骤,这是产品力的体现。"
        ),
    },
    "developer_experience": {
        "default": (
            "面向开发者的 Agent 产品,核心是降低'调试 Agent 的痛苦'。"
            "可观测性(thinking 可见、tool call trace、错误回溯)是第一位。"
            "其次是确定性(同样输入 → 类似行为)和可控性(用户能中断、改方向)。"
        ),
    },
    "evaluation": {
        "default": (
            "Agent 评测难在没有标准答案。常见做法:1) 端到端 task success rate(SWE-bench 风格);"
            "2) 中间步骤的 LLM-as-judge;3) 真实用户日志的 retention / 重试率;"
            "4) Adversarial probing。'Agent 行为有品味'本质要靠人评 + 用户反馈。"
        ),
    },
    "scaling_law": {
        "default": (
            "Scaling Law 告诉我们 loss 怎么随算力/数据/参数下降,但不直接告诉你 Agent 能力。"
            "Agent 能力更依赖 post-training(SFT + RL)+ Harness 工程,而不是纯 base model 规模。"
            "DeepSeek 的赌注是:小模型 + 强 post-training + 好 Harness 能打过大模型 + 弱 scaffold。"
        ),
    },
}


def query_standard_answer(topic: str, sub_question: str = "") -> str:
    """供 Evaluator Tool 调用。模糊匹配 topic,返回最相关的标准答案片段。"""
    topic_l = topic.lower().strip()
    sub_l = sub_question.lower().strip()

    # 直接命中
    for key, subdict in STANDARD_ANSWERS.items():
        if key in topic_l or topic_l in key:
            # 子问题命中
            for sk, sv in subdict.items():
                if sk != "default" and sk in sub_l:
                    return sv
            return subdict.get("default", "")

    # 关键词模糊匹配
    aliases = {
        "agent": "agent_loop",
        "loop": "agent_loop",
        "工具": "tool_use",
        "tool": "tool_use",
        "记忆": "memory",
        "规划": "planning",
        "plan": "planning",
        "评估": "evaluation",
        "eval": "evaluation",
        "scaling": "scaling_law",
        "开发者": "developer_experience",
        "devx": "developer_experience",
        "mcp": "mcp",
        "协议": "mcp",
    }
    for alias, key in aliases.items():
        if alias in topic_l:
            return STANDARD_ANSWERS[key].get("default", "")

    return f"(没有针对 '{topic}' 的预置标准答案。请按通用面试直觉评估候选人回答的质量。)"
