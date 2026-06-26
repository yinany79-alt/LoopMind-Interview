"""FastAPI 入口 — uvicorn src.main:app --port 8000 --reload"""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

# 必须在导入 llm.py 之前 load .env,override=True 让 .env 覆盖 shell 已有环境变量
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if _ENV_PATH.exists():
    load_dotenv(_ENV_PATH, override=True)
else:
    load_dotenv(override=True)

from src.api.routes_debug import router as debug_router  # noqa: E402
from src.api.routes_personas import router as personas_router  # noqa: E402
from src.api.routes_report import router as report_router  # noqa: E402
from src.api.routes_sessions import router as sessions_router  # noqa: E402
from src.api.routes_stream import router as stream_router  # noqa: E402
from src.llm import llm_label  # noqa: E402


logging.basicConfig(
    level=logging.INFO if os.getenv("DEBUG_LOG", "true").lower() in ("1", "true", "yes") else logging.WARNING,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("启动赛博面试官后端 v0.1")
    logger.info("LLM 配置: %s", llm_label())
    yield
    logger.info("关闭后端")


app = FastAPI(
    title="赛博面试官 — Backend",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in origins_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 统一错误响应
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    # 自定义错误已经按 {error: {...}} 格式塞在 detail 里
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": "INTERNAL", "message": str(exc.detail), "details": {}}},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": "INVALID_JD" if "jd_text" in str(exc) else "PERSONA_INVALID",
                "message": "请求参数校验失败",
                "details": {"errors": exc.errors()},
            }
        },
    )


# 路由
app.include_router(personas_router)
app.include_router(sessions_router)
app.include_router(stream_router)
app.include_router(report_router)
app.include_router(debug_router)


@app.get("/healthz")
async def healthz():
    return {"ok": True, "llm": llm_label()}
