"""统一错误响应工具。"""
from __future__ import annotations

from typing import Any, Dict

from fastapi import HTTPException


def error_response(code: str, message: str, http_status: int = 400, **details) -> HTTPException:
    return HTTPException(
        status_code=http_status,
        detail={"error": {"code": code, "message": message, "details": details}},
    )
