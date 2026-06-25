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

| 模块 | 模型 | 备注 |
|---|---|---|
| JD Parser | Claude Opus 4.8 | 结构化输出,判断要稳 |
| Evaluator | Claude Opus 4.8 | 评估的灵魂,不能省 |
| Reporter | Claude Opus 4.8 | 最终报告 |
| Interviewer | DeepSeek V4 Pro(可选) / Claude Opus 4.8 | 默认 Claude,有 DEEPSEEK_API_KEY 时切换 |

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
