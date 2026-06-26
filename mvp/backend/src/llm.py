"""LLM 工厂 — 全栈走 DeepSeek(OpenAI 协议),Mimo / Claude 仅 fallback。

Evaluator / JD Parser / Reporter:DEEPSEEK_API_KEY > MIMO_API_KEY > Claude Opus
Interviewer / Drill-down:DEEPSEEK_API_KEY > MIMO_API_KEY > Claude Opus
两边都同一优先级,但用不同的 max_tokens / temperature。

Mimo / DeepSeek 都走 OpenAI 协议,Claude Opus 走 Anthropic 协议。
"""
from __future__ import annotations

import os
from functools import lru_cache

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI


# ====== Claude Opus(京东云中转,Anthropic 协议)======

def _claude_kwargs(role: str) -> dict:
    kwargs = {
        "model": os.getenv("ANTHROPIC_OPUS_MODEL", "Claude-Opus-4.7"),
        "max_tokens": 4096 if role == "evaluator" else 2048,
        "timeout": 60,
    }
    if os.getenv("CLAUDE_SUPPORTS_TEMPERATURE", "false").strip().lower() in ("1", "true", "yes"):
        kwargs["temperature"] = 0.1 if role == "evaluator" else 0.7

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


# ====== Mimo(小米 OpenAI 协议)======

def _mimo_kwargs(role: str) -> dict:
    return {
        "model": os.getenv("MIMO_MODEL", "mimo-v2.5-pro"),
        "base_url": os.getenv("MIMO_BASE_URL", "https://api.xiaomimimo.com/v1"),
        "api_key": os.getenv("MIMO_API_KEY", ""),
        "max_tokens": 4096 if role == "evaluator" else 2048,
        "temperature": 0.2 if role == "evaluator" else 0.7,
        "timeout": 60,
    }


def _has_mimo() -> bool:
    return bool(os.getenv("MIMO_API_KEY", "").strip())


# ====== DeepSeek(OpenAI 协议)======

def _deepseek_kwargs(role: str) -> dict:
    return {
        "model": os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
        "base_url": os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1"),
        "api_key": os.getenv("DEEPSEEK_API_KEY", ""),
        "max_tokens": 4096 if role == "evaluator" else 2048,
        "temperature": 0.2 if role == "evaluator" else 0.7,
        "timeout": 60,
    }


def _has_deepseek() -> bool:
    return bool(os.getenv("DEEPSEEK_API_KEY", "").strip())


def _make_llm(role: str) -> BaseChatModel:
    """统一优先级:DeepSeek > Mimo > Claude。"""
    if _has_deepseek():
        return ChatOpenAI(**_deepseek_kwargs(role))
    if _has_mimo():
        return ChatOpenAI(**_mimo_kwargs(role))
    return ChatAnthropic(**_claude_kwargs(role))


# ====== 对外接口 ======

@lru_cache(maxsize=1)
def get_evaluator_llm() -> BaseChatModel:
    """Evaluator / JD Parser / Reporter:DeepSeek > Mimo > Claude Opus。"""
    return _make_llm("evaluator")


@lru_cache(maxsize=1)
def get_interviewer_llm() -> BaseChatModel:
    """Interviewer / Drill-down:DeepSeek > Mimo > Claude。"""
    return _make_llm("interviewer")


def _label(role: str) -> tuple[str, str]:
    if _has_deepseek():
        return (
            os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
            os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1"),
        )
    if _has_mimo():
        return (
            os.getenv("MIMO_MODEL", "mimo-v2.5-pro"),
            os.getenv("MIMO_BASE_URL", "https://api.xiaomimimo.com/v1"),
        )
    return (
        os.getenv("ANTHROPIC_OPUS_MODEL", "Claude-Opus-4.7"),
        os.getenv("ANTHROPIC_BASE_URL", "(default Anthropic)"),
    )


def llm_label() -> dict[str, str]:
    e_model, e_url = _label("evaluator")
    i_model, i_url = _label("interviewer")
    return {
        "evaluator": e_model,
        "evaluator_url": e_url,
        "interviewer": i_model,
        "interviewer_url": i_url,
    }
