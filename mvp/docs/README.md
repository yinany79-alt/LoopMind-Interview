# 赛博面试官 MVP — 文档总览

> 这是项目所有文档的导航入口。开干前请按顺序通读这几份文件。

---

## 📚 文档地图

### 项目根目录(产品 / 战略层)

| 文件 | 读者 | 作用 |
|---|---|---|
| [背景.md(background.md)](../../background.md) | 所有人 | 项目缘起、和宇哥/博文的讨论历史 |
| [产品方案.md](../../产品方案.md) | 所有人 | 产品定位、拟真感四机制、Agent 架构、**人格矩阵 Prompt 设计** |
| [Plan 文件](/Users/yangyinan.8/.claude/plans/a-2-b-jd-tree-1-drill-down-loop-pure-star.md) | 后端 agent | 后端 LangGraph + ReAct 内核技术设计 |
| [知识库.md](../../知识库.md) | 后续维护 | 参考资源链接 |

### mvp/docs/(开发执行层)

| 文件 | 读者 | 作用 |
|---|---|---|
| **本文件(README.md)** | 主操盘人 | 文档地图、阅读顺序、协作启动 |
| [前端设计.md](./前端设计.md) | 前端 agent | 4 个页面结构、视觉风格、组件清单、交互细节、Mock 模式 |
| [接口规范.md](./接口规范.md) | **前后端双方** | REST + SSE 完整合同;**前后端协作的唯一真相** |
| [并行开发指南.md](./并行开发指南.md) | 主操盘人 + 双 agent | git worktree 设置、agent 启动话术、联调流程 |

---

## 🚦 阅读顺序

### 你(主操盘人)

1. [产品方案.md](../../产品方案.md) — 产品和架构的全貌
2. [本文件](#)
3. [并行开发指南.md](./并行开发指南.md) — 怎么开两个 agent 并行干活
4. [接口规范.md](./接口规范.md) — 当 agent 提问时你要能拍板

### 前端 Agent(第一次启动时)

按顺序读:
1. [并行开发指南.md](./并行开发指南.md) §2.1(知道自己的工作边界)
2. [前端设计.md](./前端设计.md)(完整读)
3. [接口规范.md](./接口规范.md) §3、§4、§5(SSE 事件 + TypeScript 类型 + 接入示例)

### 后端 Agent(第一次启动时)

按顺序读:
1. [并行开发指南.md](./并行开发指南.md) §2.2(知道自己的工作边界)
2. [产品方案.md](../../产品方案.md) §3.6(人格矩阵 Prompt 拼接)
3. [Plan 文件](/Users/yangyinan.8/.claude/plans/a-2-b-jd-tree-1-drill-down-loop-pure-star.md)(LangGraph 内核设计)
4. [接口规范.md](./接口规范.md) §2、§3、§6(REST + SSE 推送实现)
5. [前端设计.md](./前端设计.md)(理解前端期望什么,反推接口要支持什么)

---

## 🚀 启动开发流程

### Step 1: 初始化仓库(主操盘人)

按 [并行开发指南.md §1](./并行开发指南.md#1-第-0-步初始化-git-仓库主操盘人手动跑一次) 一次性跑完 git init + worktree 设置。

### Step 2: 启动前端 Agent

按 [并行开发指南.md §3.1](./并行开发指南.md#31-启动前端-agent) 给的话术开会话。

### Step 3: 启动后端 Agent(另开终端)

按 [并行开发指南.md §3.2](./并行开发指南.md#32-启动后端-agent) 给的话术开会话。

### Step 4: 联调

双方完成后,按 [并行开发指南.md §4](./并行开发指南.md#4-联调流程双方完成后) 合并分支并联调。

---

## 🧭 关键决策回顾(已敲定)

| 类别 | 决策 |
|---|---|
| 产品路线 | A(JD 拟真)为内核;B(大咖镜像)作为二面人格皮肤 |
| MVP 种子岗位 | DeepSeek Agent Harness 产品经理(资深 PM) |
| 模型分工 | Evaluator/JD Parser: Claude Opus 4.8;Interviewer: DeepSeek V4 Pro |
| 前端栈 | React 18 + Vite + TailwindCSS + Zustand + Framer Motion |
| 后端栈 | FastAPI + LangGraph + LangChain + Pydantic |
| 通信协议 | REST + SSE(长连接流式) |
| 视觉风格 | 浅色系 + Inter/Source Serif 4 + 类 Claude.ai |
| 人格选择 | 4 张卡片 + 4 滑块 + 随机;后端 Prompt 双层拼接 |
| 结束逻辑 | 软下限 5 题,<5 题点结束弹窗,≥5 题直接出报告 |
| 简历 | MVP 不做,占位灰显 |
| Debug 模式 | URL `?debug=1` 或 `Cmd+Shift+D`,右侧抽屉 4 Tab |
| 协作方式 | git worktree 隔离开发,主目录联调 |
| LangGraph 核心 | 内层+中层双闭环 + ReAct 子图(Interviewer + Evaluator) |
| 状态机关键字段 | current_satisfaction(0-100,阈值 20/80)、current_depth(上限 4)、dimension_deltas(±5) |

---

## ⚠️ 一致性原则

如果发现**多份文档之间互相矛盾**,优先级如下:

```
接口规范.md(合同)  >  前端设计.md  >  Plan 文件  >  产品方案.md  >  background.md
                  ↑                                                          ↑
              最严谨,最新                                            最早的讨论原文
```

发现矛盾时:
1. 不要靠 agent 自行猜,**立刻找主操盘人拍板**
2. 主操盘人修改最高优先级文件后,通知双方 agent 拉取最新文档

---

## 🤝 联系机制

- agent 有歧义或不确定时,**必须先问,不要赌**
- 主操盘人收到问题后,如果是协作影响双方的,改文档;如果是单边的,直接拍板
- 任何接口改动,**先改 [接口规范.md](./接口规范.md),再改代码**

---

## 📦 最终交付物预期

完成 MVP 后,主目录应有:

```
interview/
├── background.md
├── 产品方案.md
├── 知识库.md
└── mvp/
    ├── docs/        ← 已完成(本目录)
    ├── frontend/    ← 前端 agent 交付
    │   └── (React 项目可跑)
    └── backend/     ← 后端 agent 交付
        └── (FastAPI 项目可跑)
```

启动后:
- 后端 `uvicorn src.main:app --port 8000` 启动
- 前端 `npm run dev` 启动在 5173
- 浏览器打开 `http://localhost:5173`,能完整跑一场 5 题面试,看到打字机、思考链、彩蛋、报告
