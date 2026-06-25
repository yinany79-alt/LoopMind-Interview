"""LLM 工厂 — 区分 Evaluator(强模型)和 Interviewer(快模型)。

策略:
- Evaluator / JD Parser / Reporter:Claude Opus 4.8(判断要稳)
- Interviewer / Drill-down:DeepSeek V4 Pro(有 key 时);
  没 key 或 USE_CLAUDE_FOR_INTERVIEWER=true 时回落到 Claude
"""
from __future__ import annotations

import os
from functools import lru_cache

from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_core.language_models.chat_models import BaseChatModel


def _claude_kwargs() -> dict:
    kwargs = {
        "model": os.getenv("ANTHROPIC_OPUS_MODEL", "claude-opus-4-8"),
        "temperature": 0.3,
        "max_tokens": 4096,
        "timeout": 60,
    }
    # 中转网关:同时支持 ANTHROPIC_AUTH_TOKEN(京东云)和 ANTHROPIC_API_KEY(原生)
    base_url = os.getenv("ANTHROPIC_BASE_URL")
    auth_token = os.getenv("ANTHROPIC_AUTH_TOKEN")
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if base_url:
        kwargs["base_url"] = base_url
    if api_key:
        kwargs["api_key"] = api_key
    elif auth_token:
        kwargs["api_key"] = auth_token
    return kwargs


def _has_deepseek() -> bool:
    return bool(os.getenv("DEEPSEEK_API_KEY", "").strip())


def _use_claude_for_interviewer() -> bool:
    flag = os.getenv("USE_CLAUDE_FOR_INTERVIEWER", "false").strip().lower()
    return flag in ("1", "true", "yes")


@lru_cache(maxsize=1)
def get_evaluator_llm() -> BaseChatModel:
    """Evaluator / JD Parser / Reporter 共用,强模型。"""
    kwargs = _claude_kwargs()
    kwargs["temperature"] = 0.1  # 评估要稳
    return ChatAnthropic(**kwargs)


@lru_cache(maxsize=1)
def get_interviewer_llm() -> BaseChatModel:
    """Interviewer / Drill-down。优先 DeepSeek,否则 Claude。"""
    if _has_deepseek() and not _use_claude_for_interviewer():
        return ChatOpenAI(
            model=os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
            base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1"),
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            temperature=0.7,
            max_tokens=2048,
            timeout=60,
        )
    kwargs = _claude_kwargs()
    kwargs["temperature"] = 0.7
    return ChatAnthropic(**kwargs)


def llm_label() -> dict[str, str]:
    """调试用:返回当前各模型的实际标识。"""
    return {
        "evaluator": os.getenv("ANTHROPIC_OPUS_MODEL", "claude-opus-4-8"),
        "interviewer": (
            os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
            if _has_deepseek() and not _use_claude_for_interviewer()
            else os.getenv("ANTHROPIC_OPUS_MODEL", "claude-opus-4-8")
        ),
    }
