"""SSE 格式化工具 + 统一事件 schema。

事件名 / data 字段严格按 接口规范.md §3 实现,任何字段都不能擅自加。
"""
from __future__ import annotations

import json
from typing import Any, Dict


def format_sse(event_name: str, data: Dict[str, Any], event_id: str | None = None) -> str:
    """SSE 标准格式:event/id/data 三行,末尾 \\n\\n。"""
    payload = json.dumps(data, ensure_ascii=False)
    lines = [f"event: {event_name}"]
    if event_id:
        lines.append(f"id: {event_id}")
    lines.append(f"data: {payload}")
    return "\n".join(lines) + "\n\n"


def evt(event: str, data: Dict[str, Any], event_id: str | None = None) -> Dict[str, Any]:
    """统一封装(供 LangGraph 节点 yield)。"""
    return {"event": event, "data": data, "id": event_id}
