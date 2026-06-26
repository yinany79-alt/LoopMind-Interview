import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  loading: boolean
  onSubmit: (jdText: string) => void
}

const SAMPLE_JD = `Agent Harness 产品经理 · DeepSeek (杭州/北京)

团队使命:Model + Harness = Agent。我们相信下一代的 AI 产品形态不是 chatbot,
而是能在循环中持续完成任务的 agent。Harness 团队负责设计这一层把模型变成真正
能干活的"载体"——从 Tool Use、MCP、上下文工程,到端到端的产品体验。

你将负责:
- 主导 DeepSeek Agent 产品形态的产品决策
- 与研究/工程团队一起设计 Agent Loop 关键交互
- 定义指标体系,推动产品迭代
- 跟踪 Cursor / Claude Code / Devin 等竞品,形成判断

要求:
- 5 年以上 to-C / to-Developer 产品经验
- 对 Agent / LLM 有第一手使用经验,能从原理层理解产品权衡
- 强工程 sense,能和 research engineer 深度对话`

export default function JDInputCard({ loading, onSubmit }: Props) {
  const [value, setValue] = useState('')
  const [loadingStage, setLoadingStage] = useState(0)

  // Loading 文案分阶段轮播:解析 JD → 构建技能树 → 校准面试官
  const STAGES = [
    '解析 JD 中…',
    '提取技能维度…',
    '构建技能树…',
    '校准面试官 persona…',
    '等待面试官就位…',
  ]
  useEffect(() => {
    if (!loading) {
      setLoadingStage(0)
      return
    }
    const timers: number[] = []
    STAGES.forEach((_, i) => {
      if (i === 0) return
      timers.push(
        window.setTimeout(() => setLoadingStage(i), i * 4500),
      )
    })
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [loading])

  const handleSubmit = (): void => {
    const text = value.trim()
    if (!text || loading) return
    onSubmit(text)
  }

  const overLimit = value.length > 5000

  return (
    <div className="card relative flex h-full flex-col p-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-serif text-xl font-semibold">投递 JD,开始解构</h2>
        <span className="text-xs text-[var(--text-tertiary)]">
          粘贴 JD 文本 · 上限 5000 字
        </span>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
        AI 会把这份 JD 拆成 4-6 个核心技能点,围绕它们设计一场逼真的面试。
        准备好,面试官会在你说空话时立刻打断。
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="把目标岗位的 JD 全文粘贴到这里…"
        rows={12}
        className="min-h-[220px] flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 font-sans text-[15px] leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:bg-white"
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
          <button
            type="button"
            onClick={() => setValue(SAMPLE_JD)}
            className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)]"
          >
            填入示例 JD
          </button>
          <span className={overLimit ? 'text-[var(--bad)]' : undefined}>
            {value.length} / 5000
          </span>
          <span className="hidden text-[var(--text-tertiary)] sm:inline">
            · 上传截图功能下一版本开放
          </span>
        </div>
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={loading || overLimit || !value.trim()}
          whileTap={{ scale: 0.97 }}
          className="btn-primary"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <motion.span
                className="inline-block h-3 w-3 rounded-full border-2 border-white/30 border-t-white"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>{STAGES[loadingStage] ?? STAGES[0]}</span>
            </span>
          ) : (
            '开始解构 →'
          )}
        </motion.button>
      </div>
    </div>
  )
}
