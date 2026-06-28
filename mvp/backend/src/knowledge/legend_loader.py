"""Legend 大佬 skill 加载器。

加载 nuwa 格式 SKILL.md(去 frontmatter)和可选 examples,缓存内存。
路径相对于项目根的 leaders_persona/ 目录。
"""
from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path
from typing import Optional


# 项目根:.../interview/(leaders_persona/ 在这里)
# 当前文件 .../interview/mvp/backend/src/knowledge/legend_loader.py
# 往上 4 级 = .../interview/
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
_BASE = _PROJECT_ROOT / "leaders_persona"


# 5 位大佬的 SKILL 主文件
_SKILL_PATHS: dict[str, Path] = {
    "liang-wenfeng": _BASE / "梁文锋" / "梁文锋-skill.md",
    "yang-zhilin":   _BASE / "杨植麟" / "杨植麟.md",
    "zhang-yiming":  _BASE / "张一鸣" / "SKILL.md",
    "karpathy":      _BASE / "karpathy-skill-master" / "SKILL.md",
    "elon-musk":     _BASE / "elon-musk-skill-main" / "SKILL.md",
}


# 可选的范例对话(模仿口吻用)。没有的不影响。
_EXAMPLE_PATHS: dict[str, Path] = {
    "zhang-yiming": _BASE / "张一鸣" / "examples" / "demo-conversation-2026-04-07.md",
    "karpathy":     _BASE / "karpathy-skill-master" / "examples" / "demo-conversation-2026-04-07.md",
    "elon-musk":    _BASE / "elon-musk-skill-main" / "examples" / "demo-conversation.md",
}


_FRONTMATTER_RE = re.compile(r"^---\s*\n.*?\n---\s*\n+", flags=re.DOTALL)


def _strip_frontmatter(md: str) -> str:
    """去掉 YAML frontmatter(---\n...\n---)。"""
    return _FRONTMATTER_RE.sub("", md, count=1)


@lru_cache(maxsize=10)
def load_legend_skill(persona_id: str) -> str:
    """读取 SKILL.md 全文,去 frontmatter。结果缓存。"""
    path = _SKILL_PATHS.get(persona_id)
    if not path or not path.exists():
        raise ValueError(f"未知 legend persona_id: {persona_id} (path={path})")
    return _strip_frontmatter(path.read_text(encoding="utf-8")).strip()


@lru_cache(maxsize=10)
def load_legend_examples(persona_id: str) -> Optional[str]:
    """读取可选 examples。没有就返回 None。"""
    path = _EXAMPLE_PATHS.get(persona_id)
    if not path or not path.exists():
        return None
    return path.read_text(encoding="utf-8").strip()


def legend_ids() -> list[str]:
    """返回所有 legend persona_id 列表。"""
    return list(_SKILL_PATHS.keys())
