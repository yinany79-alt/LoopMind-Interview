/**
 * MyJDInput — Mission 页 jd tab 内容。粘贴 JD textarea。
 */
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

const SAMPLE = `Agent Harness 产品经理 · DeepSeek

要求:
- 5 年以上 to-C / to-Developer 产品经验
- 对 Agent / LLM 有第一手使用经验
- 强工程 sense,能和 research engineer 深度对话`

const STAGES = [
  '解析 JD…',
  '提取技能维度…',
  '构建技能树…',
  '校准面试官…',
  '等待面试官就位…',
]

interface Props {
  submitting: boolean
  onLaunch: (jdText: string) => void
}

export default function MyJDInput({ submitting, onLaunch }: Props) {
  const [value, setValue] = useState('')
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!submitting) {
      setStage(0)
      return
    }
    const timers: number[] = []
    STAGES.forEach((_, i) => {
      if (i === 0) return
      timers.push(window.setTimeout(() => setStage(i), i * 3500))
    })
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [submitting])

  const overLimit = value.length > 8000
  const canSubmit = value.trim().length >= 10 && !overLimit && !submitting

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      <div className="card p-5">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="把你心仪岗位的 JD 全文粘贴到这里…"
          rows={14}
          className="w-full resize-none rounded-xl border border-[var(--divider)] bg-white p-4 text-[14px] leading-relaxed text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
        <div className="mt-3 flex items-center justify-between text-[12px]">
          <button
            type="button"
            onClick={() => setValue(SAMPLE)}
            className="text-[var(--text-secondary)] hover:text-[var(--accent)]"
          >
            填入示例 JD
          </button>
          <span className={overLimit ? 'text-[var(--bad)]' : 'text-[var(--text-tertiary)]'}>
            {value.length} / 8000
          </span>
        </div>
      </div>

      <div className="card flex flex-col p-5">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
          AI 解析过程
        </h3>
        <ol className="mt-3 space-y-2 text-[12px]">
          {STAGES.map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-2 ${
                submitting && i <= stage
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-tertiary)]'
              }`}
            >
              <span
                className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${
                  submitting && i < stage
                    ? 'bg-[var(--good)] text-white'
                    : submitting && i === stage
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                }`}
              >
                {submitting && i < stage ? '✓' : i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={() => onLaunch(value)}
          disabled={!canSubmit}
          className="btn-primary mt-auto w-full"
        >
          {submitting ? STAGES[stage] : '开始解构 JD'}{' '}
          {!submitting && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  )
}
