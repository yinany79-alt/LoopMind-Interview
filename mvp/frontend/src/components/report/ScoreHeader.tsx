import type { Report } from '@/types/api'

interface Props {
  verdict: NonNullable<Report['verdict']>
  below_minimum: boolean
}

export default function ScoreHeader({ verdict, below_minimum }: Props) {
  return (
    <div className="card relative overflow-hidden p-6">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[var(--accent-soft)] opacity-50 blur-2xl" />
      <div className="relative">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          内推级评价
        </div>
        <div className="mt-2 flex items-baseline gap-4">
          <h1 className="font-serif text-4xl font-semibold leading-tight">
            建议定级 {verdict.level}
          </h1>
          <span className="rounded-full bg-[var(--bg-tertiary)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            置信度 {verdict.level_confidence}
          </span>
          {below_minimum && (
            <span className="rounded-full border border-[var(--bad)] bg-[var(--bad)]/10 px-3 py-1 text-xs font-medium text-[var(--bad)]">
              早退场 · 数据有限
            </span>
          )}
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <div className="font-serif text-5xl tabular-nums text-[var(--accent)]">
            {verdict.overall_score}
          </div>
          <div className="text-xs text-[var(--text-tertiary)]">/ 100 综合分</div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          {verdict.summary}
        </p>
      </div>
    </div>
  )
}
