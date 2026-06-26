# 赛博面试官 · LoopMind Interview

> **基于真实 JD 解构 + Agent 拟人追问的高压模拟面试平台。**
> 让普通求职者在家被"顶级大厂面试官"以 1:1 的强度拷打。

[![demo](https://img.shields.io/badge/status-MVP%20alpha-orange)](#)
[![stack](https://img.shields.io/badge/stack-LangGraph%20%2B%20FastAPI%20%2B%20Vite%2BReact-blue)](#)
[![llm](https://img.shields.io/badge/LLM-DeepSeek%20%C2%B7%20Mimo%20%C2%B7%20Claude%20Opus-purple)](#)

---

## 目录

- [一、产品定位](#一产品定位)
- [二、设计哲学](#二设计哲学)
- [三、Agent 拓扑（DAG）](#三agent-拓扑dag)
- [四、技术架构](#四技术架构)
- [五、快速开始](#五快速开始)
- [六、环境变量配置](#六环境变量配置)
- [七、使用方法](#七使用方法)
- [八、Debug 抽屉](#八debug-抽屉)
- [九、目录结构](#九目录结构)

---

## 一、产品定位

### 一句话

> 把你简历投的那个岗位的真实面试 1:1 还原，把面试官调到"前 Google Tech Lead"或"Sam Altman"的人格，给你一次压力测试。

### 不是什么

- ❌ 不是题库随机抽题 chatbot
- ❌ 不是把 JD 关键词喂给 GPT 让它问"什么是 Transformer"
- ❌ 不是一问一答的八股文模拟器

### 是什么

一面（技术初面）：**JD 拟真，追求"准"**
- AI 把你贴的 JD 拆成 4-6 个核心技能点 → 围绕这些技能点设计场景化提问
- 你每答一句，隐藏的 Evaluator 都在打分；流于表面会被追问到底，触及核心会换题
- 全程模拟真实大厂初面的节奏与压迫感

二面（人格皮肤）：**大咖镜像，追求"狠"**
- 可换上 4 种面试官人格：冷酷 Tech Lead / OpenAI 视野流大咖 / 资深产品 Mentor / 直接的研究员
- 人格不止影响语气——会改变提问的角度（细节 vs 视野）、追问的方式（抠数字 vs 问哲学）

### 目标用户

- 准备一面/复试，想找强度对得上的练习对象
- 面前一晚想突击查漏补缺
- 想知道"如果是 Sam Altman 来面我，我会被问到什么"

---

## 二、设计哲学

四条铁律——拟真感的来源，缺一不可。

### 1. 业务情境化提问（反八股文）

不问 _"什么是 Transformer"_，而是问：

> _"现在要在单卡 A10（24G）上部署 70B Llama 3，要求推理延迟 < 100ms。
> 你选什么量化方案？还溢出的话，从算子融合还是 KV Cache 入手？"_

每个问题都被强制嵌入岗位真实场景的约束。

### 2. 动态追问（Drill-down Loop）

```
用户回答 → Evaluator 评估含金量 →
                ├ 流于表面 ── 追问深一层（最多 3 层）
                ├ 触及核心 ── 换新课题
                └ 明显漏洞 ── 针对漏洞反将一军
```

这是消除"一问一答八股文感"的核心机制。整个回路对用户不可见，但每次切换都自然得像真人。

### 3. 隐藏小本子（Red Flags / Bright Spots）

面试官在心里持续打分，不是结束才回想：
- 你说错一个数量级 → 隐藏 red_flag 累积
- 你给出超预期的细节 → 隐藏 bright_spot 累积
- 满意度（0-100）实时变化，最终影响报告结论

### 4. 终局诚实评价

报告不是鼓励式总结。会明确告诉你：
- 总分 + 4 维度雷达图
- 每个话题的回答质量分级（surface / concept / hands_on / insight）
- Red flags 全部列出，不藏着
- 与该岗位 senior 候选人的真实差距

---

## 三、Agent 拓扑（DAG）

整个面试是一个 LangGraph StateGraph，5 个节点 + 1 个 END。

```
                          ┌────────────┐
                  START ─►│  dispatch  │ (路由分发)
                          └─────┬──────┘
                                │
            ┌───────────────────┴───────────────────┐
            │                                       │
   (有用户回答)                              (首次 / 换题)
            │                                       │
            ▼                                       ▼
      ┌──────────┐                          ┌──────────────┐
      │ evaluator│ (评估上一轮回答)          │  next_topic  │ (选下一个 topic)
      └─────┬────┘                          └──────┬───────┘
            │                                      │
            ▼                                      │
      ┌──────────┐                                 │
      │  router  │ ──── all_done ──► END           │
      └─────┬────┘                                 │
            │                                      │
   ┌────────┴─────────┐                            │
drill_down       next_topic                        │
   │                  │                            │
   │                  └──────────────►─────────────┤
   │                                               │
   └──────────────────────────────►────────────────┤
                                                   ▼
                                          ┌────────────────┐
                                          │  interviewer   │ (出题 / 追问)
                                          └────────┬───────┘
                                                   │
                                                   ▼
                                                  END (等用户回答)
```

### 节点职责

| 节点 | 职责 | 模型 |
|---|---|---|
| `dispatch` | 入口路由，根据是否有 user_answer 决定走 evaluator 还是 next_topic | — |
| `next_topic` | 从技能树挑选下一个话题（加权 + 红牌驱动） | DeepSeek |
| `interviewer` | ReAct 循环生成开场题 / 追问题 / 换题问，最多 5 轮迭代 | DeepSeek |
| `evaluator` | ReAct 循环评估用户回答：打分、识别 gap、决定 drill / switch | DeepSeek |
| `router` | 根据 evaluator 输出决定 drill_down / next_topic / end | — |

> 完整代码：[mvp/backend/src/graph/graph.py](mvp/backend/src/graph/graph.py)

### 两个隐藏子图（在 `interviewer` / `evaluator` 内部）

- **Interviewer Subgraph**：ReAct 循环（Thought → Action(check_resume / get_standard_answer / ...) → Observation → Final Question）
- **Evaluator Subgraph**：ReAct 循环（评估回答 → 调标准答案对比 → 输出 EvaluatorResult JSON）

---

## 四、技术架构

```
┌────────────────────────────────────────┐
│  浏览器 (Vite + React + TS + Tailwind)│
│  ┌──────────────────────────────────┐  │
│  │ Zustand store  +  EventSource    │  │
│  └──────────────────────────────────┘  │
└────────────────────┬───────────────────┘
                     │ REST (JD/session/answer/report)
                     │ SSE  (assistant_message_delta, thinking_step,
                     │       graph_node_enter/exit, graph_paused, ...)
                     ▼
┌────────────────────────────────────────┐
│  FastAPI                                │
│  ┌──────────────────────────────────┐  │
│  │ routes_sessions / routes_stream  │  │
│  │ routes_personas / routes_report  │  │
│  │ routes_debug (断点 API)          │  │
│  └──────────────────────────────────┘  │
│                                         │
│  LangGraph StateGraph (见上图)          │
│   ├ wrap_node()  注入生命周期事件        │
│   ├ ContextVar   透传 session / sink   │
│   └ MemorySaver  per-session 状态持久化 │
│                                         │
│  LLM 工厂 (优先级 DeepSeek > Mimo > Opus) │
└────────────────────┬───────────────────┘
                     │ OpenAI 协议
                     │ Anthropic 协议
                     ▼
        DeepSeek / Mimo / Claude Opus
```

### 关键设计选择

- **SSE 推送 + 单消费者锁**：每个 session 同时只允许一个 SSE generator 消费事件队列。新连入会把旧 generator 踢掉，避免 React StrictMode 双 mount 时事件被两个 generator 抢分导致首题丢失。
- **wrap_node 装饰器**：不改 LangGraph 内核，在每个节点入口/出口注入 `graph_node_enter` / `graph_node_exit` SSE 事件 + 断点 `await session.resume_event.wait()`。Debug 抽屉的 Graph Tab 直接消费这些事件可视化。
- **LLM 工厂分层**：evaluator 与 interviewer 共用 `_make_llm(role)`，但 role 决定 max_tokens / temperature；任一 provider 挂掉自动回落下一档。
- **ReAct 用纯文本协议**：不依赖各家 LLM 的 tool calling 格式差异，直接 `Thought: / Action: / Final:` 文本解析。DeepSeek / Mimo / Claude 全兼容。

---

## 五、快速开始

### 前置要求

- Python 3.11+
- Node.js 18+
- 至少一个 LLM provider 的 API key（推荐 DeepSeek，便宜 + 快）

### 一次性安装

```bash
# 克隆
git clone https://github.com/yinany79-alt/LoopMind-Interview.git
cd LoopMind-Interview

# 后端
cd mvp/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 然后按下一节配置 API key

# 前端
cd ../frontend
npm install
cp .env.example .env.local   # 默认 VITE_API_BASE=http://localhost:8000
```

### 启动（开两个终端）

终端 1（后端）：
```bash
cd mvp/backend && source .venv/bin/activate
uvicorn src.main:app --port 8000 --reload
```

终端 2（前端）：
```bash
cd mvp/frontend && npm run dev
```

打开 [http://localhost:5173](http://localhost:5173)，开始面试。

---

## 六、环境变量配置

### 后端 `mvp/backend/.env`

LLM provider 配一项就能跑，优先级 **DeepSeek > Mimo > Claude Opus**（任意层挂掉自动回落下一档）。

```bash
# ===== 推荐：DeepSeek（OpenAI 协议，快 + 便宜）=====
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# ===== 备选：小米 Mimo（OpenAI 协议）=====
# 没配 DeepSeek 时回落到 Mimo
MIMO_API_KEY=
MIMO_BASE_URL=https://api.xiaomimimo.com/v1
MIMO_MODEL=mimo-v2.5-pro

# ===== 兜底：Claude Opus 京东云中转（Anthropic 协议）=====
# 两者都没配时才走这里
ANTHROPIC_AUTH_TOKEN=
ANTHROPIC_BASE_URL=https://modelservice.jdcloud.com/anthropic
ANTHROPIC_OPUS_MODEL=Claude-Opus-4.7
# 直连 Anthropic 时可打开 temperature 支持
# CLAUDE_SUPPORTS_TEMPERATURE=false

# ===== 后端配置 =====
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:5173
DEBUG_LOG=true
```

### 前端 `mvp/frontend/.env.local`

```bash
VITE_API_BASE=http://localhost:8000
VITE_USE_MOCK=false   # 想脱机看 UI 改 true,会用本地 mock SSE 引擎
```

### 怎么拿 API key

| Provider | 申请地址 | 备注 |
|---|---|---|
| **DeepSeek** | https://platform.deepseek.com/ | 注册即送额度，价格最便宜，强烈推荐 |
| Mimo（小米） | https://api.xiaomimimo.com/ | 内部 / 受邀，速度稳定但贵 |
| Claude Opus | 京东云中转或 Anthropic 直连 | Opus 最强但最慢，只建议做兜底 |

### 安全提示

- `.env` 已在 `.gitignore`，**永远不会被 commit**
- `.env.example` 是空 placeholder 模板，可以放心提交
- 千万别把真实 key 写进 `.env.example`

---

## 七、使用方法

### 完整流程（≈ 5 分钟）

1. **首页**：贴一份真实 JD（例如 BOSS 直聘上你心仪那个岗位的全文）→ 点 **「开始解构 →」**
   - 后端 DeepSeek 跑 JD parser，约 4-6s 生成技能树（4-6 个核心技能点 + 权重 + 维度）
   - Loading 文案分阶段：解析 JD → 提取技能维度 → 构建技能树 → 校准面试官 → 等待面试官就位

2. **准备页**：
   - 左侧看 AI 解析出的 JD 摘要 + 技能树
   - 右侧选面试官 persona（4 种），调"温度/严苛度/节奏/视野"4 维滑块
   - 点 **「开始面试 →」**

3. **面试页**：
   - 面试官出第一题，气泡里能看到实时的思考过程
   - 头像右上角绿色脉冲点 = 面试官正在思考；头像旁的文字描述当前状态（沉思 / 翻看资料 / 记录笔记…）
   - 至少 5 个 topic 之后可以主动结束；少于 5 会出现 EndDialog 让你确认

4. **报告页**：
   - 总分 + 4 维度雷达图
   - 每个话题的回答质量分级、red flags、bright spots
   - 与"标准 senior"答案的差距

### 4 种面试官人格

| ID | 名字 | 风格 |
|---|---|---|
| `cold_techlead` | 冷酷大厂 Tech Lead | 不寒暄，抠细节，看落地 |
| `vision_master` | OpenAI 视野流大咖 | 看认知，谈格局，问哲学 |
| `product_mentor` | 资深产品 Mentor | 看方法论，问用户共情 |
| `researcher` | 直接的研究员 | 看一手经验，问技术 trade-off |

---

## 八、Debug 抽屉

为开发者准备的"面试官内部视图"——把 Agent 内部的思考、状态、节点流转全部摊开。

### 怎么打开

- 点 TopNav 右侧 **「🔬 调试面板」** 按钮（最直观）
- 按 **⌘/Ctrl + Shift + D**
- URL 加 `?debug=1`

### 7 个 Tab

| Tab | 作用 |
|---|---|
| **Graph** | SVG 拓扑图，实时高亮当前运行的节点（蓝色脉冲）。点节点看 input/output/duration 快照，点"🔴 设断点"挂断点，命中后能 ▶ Resume 或 ⏭ Step |
| **Memory** | 技能树覆盖进度 + 实时满意度 + Red flags / Bright spots + 最近 6 次 evaluator 评估 |
| **Log** | 所有 SSE 事件按时间倒序，按事件名过滤；点开看完整 JSON。排查"为什么这个事件没触发"的利器 |
| **ReAct** | Interviewer / Evaluator 子图的 ReAct 步骤明细 |
| **Evaluator** | 最近一次 evaluator 输出的完整 JSON |
| **State** | LangGraph state 全字段 dump |
| **对话** | messages 数组原始 JSON |

### 断点用法

1. Graph Tab 点任意节点 → 点 **🔴 设断点**
2. 发送下一条用户回答 → 图执行到该节点时 paused（节点变橙色，工具栏显示 `🔴 paused @ evaluator`）
3. 点 ▶ **Resume** 继续跑到下一个断点 / END
4. 点 ⏭ **Step** 只跑一个节点再停（单步调试）

后端实现：[mvp/backend/src/graph/graph.py](mvp/backend/src/graph/graph.py) 的 `wrap_node()` 装饰器 + [mvp/backend/src/api/routes_debug.py](mvp/backend/src/api/routes_debug.py)。

---

## 九、目录结构

```
LoopMind-Interview/
├── README.md                  ← 你正在读
├── 产品方案.md                ← 产品方案与技术架构「作战地图」
└── mvp/
    ├── docs/
    │   ├── 前端设计.md
    │   ├── 接口规范.md         ← SSE 事件 + REST 字段精确定义
    │   └── 并行开发指南.md
    │
    ├── backend/                ← Python FastAPI + LangGraph
    │   ├── .env.example
    │   ├── requirements.txt
    │   └── src/
    │       ├── main.py
    │       ├── llm.py          ← provider 工厂（DeepSeek > Mimo > Opus）
    │       ├── session_store.py
    │       ├── api/
    │       │   ├── routes_sessions.py
    │       │   ├── routes_stream.py    ← SSE 主通道（单消费者锁）
    │       │   ├── routes_debug.py     ← 断点 API
    │       │   ├── routes_personas.py
    │       │   └── routes_report.py
    │       ├── graph/
    │       │   ├── graph.py            ← LangGraph 主图 + wrap_node
    │       │   ├── state.py
    │       │   └── nodes/
    │       │       ├── interviewer_subgraph.py
    │       │       ├── evaluator_subgraph.py
    │       │       ├── next_topic_generator.py
    │       │       ├── router.py
    │       │       ├── jd_parser.py
    │       │       └── reporter.py
    │       ├── prompts/        ← 全部 prompt 都是 .txt 模板
    │       ├── tools/          ← interviewer / evaluator 的工具(简历查询、标准答案对照)
    │       └── knowledge/      ← personas / 标准答案 / 简历
    │
    └── frontend/               ← Vite + React + TS + Tailwind
        ├── .env.example
        ├── package.json
        └── src/
            ├── App.tsx
            ├── api/            ← rest / sse / mock
            ├── store/          ← Zustand
            ├── hooks/          ← useSSE / useDebugMode(全局 zustand store)
            ├── pages/          ← Home / Prepare / Interview / Report
            └── components/
                ├── home/       ← JD 输入 / persona 画廊 / 热门岗位
                ├── prepare/    ← JD summary / persona picker / 滑块
                ├── interview/  ← 聊天流 / 头部 / 思考折叠 / 彩蛋
                ├── report/     ← 总分 / 雷达 / 重放
                └── debug/      ← Graph / Memory / Log / ReAct / ...
```

---

## 致谢与说明

- **LangGraph** 提供了优雅的状态机抽象，[wrap_node](mvp/backend/src/graph/graph.py) 的装饰器模式得益于它的开放性
- **DeepSeek** 让这个项目跑得起：Opus 单次 30s → DeepSeek 单次 1-2s
- 这是一个 MVP，bug 与 rough edges 不可避免。报 issue 比客气更有用。

---

**License**: MIT
