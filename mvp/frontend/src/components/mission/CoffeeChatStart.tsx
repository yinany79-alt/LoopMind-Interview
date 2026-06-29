/**
 * CoffeeChatStart — Faceup V3.1(Linear-tier)。
 *
 * 设计:去掉 amber icon 大圆、改 3 列 mono spec、文案克制
 */
import { ArrowRight } from 'lucide-react'
import type { Persona } from '@/types/api'

interface Props {
  challenger: Persona
  submitting: boolean
  onLaunch: () => void
}

const SPECS = [
  { label: 'scoring', value: 'none', desc: '不计入战绩' },
  { label: 'pressure', value: 'low', desc: '你主导话题' },
  { label: 'end', value: 'open', desc: '随时离开' },
]

export default function CoffeeChatStart({
  challenger,
  submitting,
  onLaunch,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <article className="card p-10">
        <div className="section-eyebrow text-center">coffee chat</div>

        <h2
          className="mt-3 text-center font-display text-[var(--text-primary)]"
          style={{
            fontSize: 'clamp(28px, 3vw, 36px)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            fontWeight: 500,
          }}
        >
          和 {challenger.name} 喝一杯。
        </h2>

        <p className="mx-auto mt-4 max-w-[480px] text-center text-[14px] leading-[1.65] text-[var(--text-secondary)]">
          没有评分,没有 KPI,没有强制结束。
          <br />
          想聊技术、聊行业、聊职业规划——你定话题。
        </p>

        {/* 3 列 mono spec */}
        <div className="mt-8 grid grid-cols-3 gap-4 border-y border-[var(--line)] py-5">
          {SPECS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                {s.label}
              </div>
              <div className="mt-2 font-mono text-[15px] font-medium tabular-nums text-[var(--text-primary)]">
                {s.value}
              </div>
              <div className="mt-1 text-[11px] text-[var(--text-tertiary)]">
                {s.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onLaunch}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Starting…' : 'Start coffee chat'}{' '}
            {!submitting && <ArrowRight size={14} />}
          </button>
        </div>
      </article>
    </div>
  )
}
