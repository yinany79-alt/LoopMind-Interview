# 赛博面试官 — 前端 (MVP)

> React 18 + Vite + TailwindCSS + Zustand + Framer Motion + Recharts
> 设计文档:`mvp/docs/前端设计.md`,接口合同:`mvp/docs/接口规范.md`

## 跑起来

```bash
cd mvp/frontend
npm install
npm run dev
```

默认开 `http://localhost:5173`(被占用会自动跳到 5174)。

## 环境变量

`.env.local`(已带默认值):

```
VITE_USE_MOCK=true                   # 用本地 mock 跑通全流程
VITE_API_BASE=http://localhost:8000  # 真后端联调时改成后端地址
```

切到真后端:`VITE_USE_MOCK=false`,重启 dev server。

## 完整 5 题面试 mock 流程

1. 首页 `/` → 在 JD 文本框里点"填入示例 JD"或自己粘贴 → 点"开始解构"
2. 准备页 `/prepare?sessionId=...` → 默认选了第一张卡(冷酷 Tech Lead)。
   - 想试随机卡,点 🎲;滑块会带过渡动画
3. 点"开始面试" → 进入 `/interview/:id`
4. mock SSE 会自动推第一题。在底部输入框里随便回答(Enter 提交)。
   每次提交后,mock 引擎会跑完整的事件流:
   - `silent_pause` → `evaluator_started` → ReAct thinking_steps
   - `evaluator_result` → `satisfaction_update`
   - 视题目可能 `red_flag_added` / `bright_spot_added`
   - 接 drill_down 或 `topic_finished` → `topic_started` → 下一题
5. 内置 6 个话题。在第 1 题(Agent Loop)、第 3 题(Claude Code)、第 5 题
   (指标体系)会分别演示**高分丝带彩蛋**、**低分震动 + ❗ 红牌角标**、
   **min_topics_reached toast**。
6. 任意时刻点"结束面试":
   - `<5` 题会弹"还没答完"对话框,选"仍然结束"
   - `>=5` 题直接调 `/end`,2 秒后跳 `/report/:id`
7. 报告页轮询 `/report`,2 秒拿到 ready,渲染雷达图 + 刻薄点评 + 逐题回放

## Debug 模式

- URL 加 `?debug=1`(任意页面),或按 **Cmd+Shift+D** / **Ctrl+Shift+D**
- 顶部 Nav 出现红色 `DEBUG ON`
- 面试房间右侧抽屉 4 个 Tab:对话流 / ReAct / Evaluator(带 diff) / State
- 开启后,每条面试官消息下的"思考过程"默认展开

## 目录结构

```
mvp/frontend/
├── src/
│   ├── api/
│   │   ├── rest.ts            # REST 客户端,env 切 mock / 真后端
│   │   ├── sse.ts             # 统一 SSE 接口,内部桥接 mock / EventSource
│   │   ├── mock.ts            # REST 桩 + 把 /answer 推给 mockScript
│   │   ├── mockScript.ts      # 6 话题完整面试事件生成器
│   │   └── mock/              # 静态 JSON fixture
│   ├── components/
│   │   ├── layout/            # TopNav, PageContainer
│   │   ├── home/              # 首页 4 块 + 3 步说明
│   │   ├── prepare/           # JD 摘要、卡片选人、4 滑块、简历占位
│   │   ├── interview/         # 头像/进度条/彩蛋/对话/输入/结束弹窗
│   │   ├── report/            # 评级头/雷达/点评/逐题回放
│   │   └── debug/             # 抽屉 + 4 Tabs + 简易 JSON 高亮
│   ├── hooks/
│   │   ├── useSSE.ts          # 订阅 SSE → dispatch 到 store
│   │   └── useDebugMode.ts    # ?debug=1 / 快捷键 / localStorage 持久化
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── PreparePage.tsx
│   │   ├── InterviewPage.tsx
│   │   └── ReportPage.tsx
│   ├── store/
│   │   └── interviewStore.ts  # Zustand 全局状态 + SSE 事件 reducer
│   ├── styles/
│   │   ├── tokens.css         # design tokens
│   │   └── global.css         # tailwind + utility classes
│   ├── types/
│   │   └── api.ts             # 严格按 接口规范.md §4 实现
│   ├── App.tsx                # 路由表
│   └── main.tsx               # 入口 + BrowserRouter
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md (本文件)
```

## 设计与接口合规

- 数据结构 100% 按 `mvp/docs/接口规范.md §4`(snake_case 不做转换)
- SSE 事件名严格使用规范 §3 的 16 种 + 不私自添加新事件
- 浅色系 + Inter + Source Serif 4,按 `前端设计.md §0.1` 的 design tokens
- 拟人状态 10 种、emoji 5 档、彩蛋 / 红牌 / 亮点 / toast 行为按 §4.4

## 验收 checklist 自查

- [x] 4 个页面路由正常,刷新不丢状态(状态在 Zustand store 内,刷新会
      回到首页 — 这是规范允许的 MVP 行为)
- [x] 浅色风格统一,字体由 Google Fonts 加载
- [x] 准备页:4 + 1 张卡可选,4 滑块可拖,选卡片滑块带过渡动画
- [x] 面试页:打字机效果(SSE delta 节流推送 + 光标闪烁),SSE 断线
      显示"与面试官失联,正在重连…"提示
- [x] 10 个拟人状态都能切换(mock 引擎按事件触发不同状态)
- [x] satisfaction 进度条 + emoji 头像随 SSE 实时变化
- [x] 高分丝带彩蛋(satisfaction 跨 80)— 第 1 题最后一轮触发
- [x] <5 题结束弹窗 / >=5 题直接出报告
- [x] 报告页雷达图渲染、逐题回放可展开
- [x] Debug Drawer 4 Tab 都有内容 + JSON 高亮
- [x] Mock 模式跑通完整 5 题面试

## 联调时切到真后端

1. 改 `.env.local`:`VITE_USE_MOCK=false`
2. 重启 `npm run dev`
3. 检查接口路径完全匹配 `接口规范.md §1` 总表

如果接口字段对不上,**不要改前端代码绕过**。先和主操盘人对齐,
更新 `接口规范.md`,前后端再各自调整 — 合同优先。
