"""LLM 工厂 — Evaluator 用京东云 Claude Opus,Interviewer 用小米 MiMo。

两个网关都实现 Anthropic Messages API,所以代码上是两份 ChatAnthropic 实例,
分别配自己的 base_url / token / model。
"""
from __future__ import annotations

import os
from functools import lru_cache

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models.chat_models import BaseChatModel


# ====== Evaluator / JD Parser / Reporter — Claude Opus ======

def _claude_kwargs() -> dict:
    """京东云中转 Claude Opus 配置。"""
    kwargs = {
        "model": os.getenv("ANTHROPIC_OPUS_MODEL", "Claude-Opus-4.7"),
        "max_tokens": 4096,
        "timeout": 60,
    }
    # 京东云 / Bedrock 中转不支持 temperature,直连 Anthropic 时才能设
    if os.getenv("CLAUDE_SUPPORTS_TEMPERATURE", "false").strip().lower() in ("1", "true", "yes"):
        kwargs["temperature"] = 0.1

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


@lru_cache(maxsize=1)
def get_evaluator_llm() -> BaseChatModel:
    """Evaluator / JD Parser / Reporter — Claude Opus(京东云中转)。"""
    return ChatAnthropic(**_claude_kwargs())


# ====== Interviewer / Drill-down — 小米 MiMo ======

def _mimo_kwargs() -> dict:
    """小米 MiMo 配置(Anthropic 协议)。如果没设 MIMO_AUTH_TOKEN,fallback 到 Claude。"""
    base_url = os.getenv("MIMO_BASE_URL", "https://api.xiaomimimo.com/anthropic")
    token = os.getenv("MIMO_AUTH_TOKEN", "").strip()
    model = os.getenv("MIMO_MODEL", "mimo-v2.5-pro")

    if not token:
        # 没配 MiMo 凭据 → 同 Claude 配置(fallback)
        return _claude_kwargs()

    kwargs = {
        "model": model,
        "base_url": base_url,
        "api_key": token,
        "max_tokens": 2048,
        "timeout": 60,
    }
    if os.getenv("MIMO_SUPPORTS_TEMPERATURE", "false").strip().lower() in ("1", "true", "yes"):
        kwargs["temperature"] = 0.7
    return kwargs


def _has_mimo() -> bool:
    return bool(os.getenv("MIMO_AUTH_TOKEN", "").strip())


@lru_cache(maxsize=1)
def get_interviewer_llm() -> BaseChatModel:
    """Interviewer / Drill-down — 小米 MiMo;没配 token 时回落 Claude Opus。"""
    return ChatAnthropic(**_mimo_kwargs())


def llm_label() -> dict[str, str]:
    """调试用:返回当前各模型的实际标识。"""
    if _has_mimo():
        interviewer = os.getenv("MIMO_MODEL", "mimo-v2.5-pro")
        interviewer_url = os.getenv("MIMO_BASE_URL", "https://api.xiaomimimo.com/anthropic")
    else:
        interviewer = os.getenv("ANTHROPIC_OPUS_MODEL", "Claude-Opus-4.7") + " (fallback)"
        interviewer_url = os.getenv("ANTHROPIC_BASE_URL", "(default Anthropic)")

    return {
        "evaluator": os.getenv("ANTHROPIC_OPUS_MODEL", "Claude-Opus-4.7"),
        "evaluator_url": os.getenv("ANTHROPIC_BASE_URL", "(default Anthropic)"),
        "interviewer": interviewer,
        "interviewer_url": interviewer_url,
    }
