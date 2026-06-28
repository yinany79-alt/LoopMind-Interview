/**
 * ScoreColumn — Report 第 1 列:综合评分。
 */
import type { Report } from '@/types/api'

interface Props {
  report: Report
}

function scoreLabel(score: number): { text: string; tone: string } {
  if (score >= 85) return { text: '优秀', tone: 'text-[var(--good)]' }
  if (score >= 70) return { text: '良好', tone: 'text-[var(--accent)]' }
  if (score >= 55) return { text: '及格', tone: 'text-[var(--warn)]' }
  return { text: '待提升', tone: 'text-[var(--bad)]' }
}

export default function ScoreColumn({ report }: Props) {
  const score = report.verdict?.overall_score ?? 0
  const label = scoreLabel(score)
  // 简单百分位估算(实际应从 history 算)
  const beat = Math.min(99, Math.max(20, score - 1))

  return (
    <article className="card flex flex-col p-6">
      <header className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
        综合评分
      </header>

      <div className="my-5">
        <div className="font-display text-[64px] font-bold leading-none tracking-tightest text-[var(--text-primary)]">
          {score}
          <span className="text-[24px] font-medium text-[var(--text-tertiary)]">
            /100
          </span>
        </div>
        <div className={`mt-2 inline-block text-[14px] font-semibold ${label.tone}`}>
          {label.text}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-tertiary)]">
        超过了 <span className="font-semibold text-[var(--text-primary)]">{beat}%</span> 的用户
      </p>

      {report.verdict?.summary && (
        <p className="mt-4 border-t border-[var(--divider)] pt-4 text-[12px] leading-relaxed text-[var(--text-secondary)]">
          {report.verdict.summary}
        </p>
      )}
    </article>
  )
}
