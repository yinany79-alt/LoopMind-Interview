"""Prompt 加载 + ReAct 文本解析。"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


_PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"


def load_prompt(name: str) -> str:
    """name 不带 .txt 扩展名。"""
    path = _PROMPT_DIR / f"{name}.txt"
    return path.read_text(encoding="utf-8")


# ===== LLM 响应内容提取 =====

def llm_text(resp_content: Any) -> str:
    """从 LangChain 响应的 content 字段提取**正文文本**(不含 thinking blocks)。

    Anthropic 的 thinking 模型会返回 content blocks list,如:
      [{'type': 'thinking', 'thinking': '...'}, {'type': 'text', 'text': '...'}]
    我们只要 text 部分。thinking 单独走 extract_thinking_text。
    """
    if isinstance(resp_content, str):
        return resp_content
    if isinstance(resp_content, list):
        parts: List[str] = []
        for blk in resp_content:
            if isinstance(blk, dict):
                if blk.get("type") == "text" and "text" in blk:
                    parts.append(str(blk["text"]))
                elif blk.get("type") in (None, "") and "text" in blk:
                    # 兼容某些 provider 不带 type 字段
                    parts.append(str(blk["text"]))
            elif isinstance(blk, str):
                parts.append(blk)
        return "\n".join(p for p in parts if p)
    return str(resp_content)


def extract_thinking_text(resp_content: Any) -> str:
    """提取 thinking blocks 的内容(供 ReAct thinking_step 展示用)。"""
    if isinstance(resp_content, list):
        parts: List[str] = []
        for blk in resp_content:
            if isinstance(blk, dict) and blk.get("type") == "thinking":
                parts.append(str(blk.get("thinking", "")))
        return "\n".join(p for p in parts if p)
    return ""


# ===== ReAct 文本解析 =====

_ACTION_RE = re.compile(
    r"Action:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)\s*$",
    re.MULTILINE | re.DOTALL,
)


def parse_action_line(line: str) -> Optional[Tuple[str, Dict[str, Any]]]:
    """从一行 'Action: foo(a=1, b=\"x\")' 解析出 (tool_name, kwargs)。"""
    m = _ACTION_RE.search(line.strip())
    if not m:
        return None
    name = m.group(1).strip()
    args_str = m.group(2).strip()
    return name, _parse_kwargs(args_str)


def _parse_kwargs(s: str) -> Dict[str, Any]:
    """粗暴解析 'topic="agent_loop", sub_question="stop"' 这类参数。"""
    if not s.strip():
        return {}
    # 尝试当 JSON 解析(模型有时会输出 {"topic": ...})
    try:
        if s.strip().startswith("{"):
            return json.loads(s)
    except Exception:
        pass
    kwargs: Dict[str, Any] = {}
    # 简单 key="value" 或 key=value 解析
    for chunk in _split_args(s):
        if "=" not in chunk:
            continue
        k, v = chunk.split("=", 1)
        k = k.strip()
        v = v.strip().strip("\"'")
        kwargs[k] = v
    return kwargs


def _split_args(s: str) -> List[str]:
    """按逗号切,但不切引号里的逗号。"""
    out, buf, in_str, quote = [], "", False, ""
    for ch in s:
        if in_str:
            buf += ch
            if ch == quote:
                in_str = False
            continue
        if ch in ('"', "'"):
            in_str = True
            quote = ch
            buf += ch
            continue
        if ch == ",":
            if buf.strip():
                out.append(buf.strip())
            buf = ""
            continue
        buf += ch
    if buf.strip():
        out.append(buf.strip())
    return out


# ===== 提取 JSON 块 =====

def extract_json_block(text: str) -> Optional[Dict[str, Any]]:
    """从 LLM 输出中提取第一个有效 JSON 对象。"""
    # 去掉 markdown code fence
    cleaned = re.sub(r"```(?:json)?\s*", "", text)
    cleaned = cleaned.replace("```", "")
    # 找第一个 { 到匹配的 } 的子串
    start = cleaned.find("{")
    if start == -1:
        return None
    depth = 0
    in_str = False
    quote = ""
    for i in range(start, len(cleaned)):
        ch = cleaned[i]
        if in_str:
            if ch == "\\":
                continue
            if ch == quote:
                in_str = False
            continue
        if ch in ('"', "'"):
            in_str = True
            quote = ch
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                snippet = cleaned[start : i + 1]
                try:
                    return json.loads(snippet)
                except Exception:
                    return None
    return None


# ===== 提取 Final 之后的文本(用作 Interviewer 最终问题)=====

_FINAL_PATTERNS = [
    re.compile(r"Final\s+Question:\s*(.+?)(?:\Z|\nThought:|\nAction:)", re.DOTALL | re.IGNORECASE),
    re.compile(r"Final:\s*(.+?)(?:\Z|\nThought:|\nAction:)", re.DOTALL | re.IGNORECASE),
]


def extract_final_text(text: str) -> str:
    for p in _FINAL_PATTERNS:
        m = p.search(text)
        if m:
            return m.group(1).strip()
    # 兜底:去掉所有 Thought/Action/Observation 行后取最后一段
    lines = []
    skip_prefixes = ("Thought:", "Action:", "Observation:")
    for ln in text.splitlines():
        if any(ln.strip().startswith(p) for p in skip_prefixes):
            continue
        lines.append(ln)
    return "\n".join(lines).strip()
