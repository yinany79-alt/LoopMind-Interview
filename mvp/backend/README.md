# 赛博面试官 — Backend

FastAPI + LangGraph + LangChain 后端,提供 REST + SSE 接口给前端。

## 快速开始

```bash
# 1. 创建虚拟环境
python -m venv .venv
source .venv/bin/activate

# 2. 装依赖
pip install -r requirements.txt

# 3. 配置环境
cp .env.example .env
# 编辑 .env,填入 ANTHROPIC_AUTH_TOKEN(必需)、DEEPSEEK_API_KEY(可选)

# 4. 启动
uvicorn src.main:app --port 8000 --reload
```

启动后:
- API base: `http://localhost:8000`
- 健康检查: `GET /healthz`
- 接口规范见 `mvp/docs/接口规范.md`

## 模型分工

| 模块 | 模型 | 走哪个网关 | env 字段 |
|---|---|---|---|
| JD Parser / Evaluator / Reporter | Claude Opus 4.7 | 京东云中转 | `ANTHROPIC_AUTH_TOKEN` / `ANTHROPIC_BASE_URL` / `ANTHROPIC_OPUS_MODEL` |
| Interviewer / Drill-down | 小米 MiMo (`mimo-v2.5-pro`) | MiMo Anthropic 兼容 | `MIMO_AUTH_TOKEN` / `MIMO_BASE_URL` / `MIMO_MODEL` |

两个网关都实现 Anthropic Messages API,代码上是两份 `ChatAnthropic` 实例;
如果没配 `MIMO_AUTH_TOKEN`,Interviewer 自动回落到 Claude(联调期无 MiMo 可用时方便)。

## 目录结构

```
src/
├── main.py                  FastAPI 入口
├── api/                     路由层
├── graph/                   LangGraph 节点 + 主图
│   ├── nodes/
│   ├── state.py
│   └── graph.py
├── tools/                   ReAct Tool 实现
├── prompts/                 Prompt 模板
├── knowledge/               静态知识(personas/standard_answers)
├── jd_samples/              示例 JD
├── llm.py                   LLM 工厂
├── session_store.py         内存 session 管理
└── sse.py                   SSE 格式化
```

## 端到端测试

```bash
python -m src.scripts.e2e_test
```
