/**
 * ScoreColumn — Faceup V3.1 第 1 列:综合评分(Linear-tier)。
 *
 * 设计:
 * - eyebrow + 巨大 mono 分数 + 简短 label
 * - 评分等级只在 ≥85 时显绿,其余全墨色
 * - 底部一段叙事性 summary,不堆数字
 */
import type { Report } from '@/types/api'

interface Props {
  report: Report
}

function scoreLabel(score: number): { text: string; tone: string } {
  if (score >= 85) return { text: 'Excellent', tone: 'text-[var(--good)]' }
  if (score >= 70) return { text: 'Solid', tone: 'text-[var(--text-primary)]' }
  if (score >= 55) return { text: 'Decent', tone: 'text-[var(--text-secondary)]' }
  return { text: 'Needs work', tone: 'text-[var(--text-secondary)]' }
}

export default function ScoreColumn({ report }: Props) {
  const score = report.verdict?.overall_score ?? 0
  const label = scoreLabel(score)
  const beat = Math.min(99, Math.max(20, score - 1))

  return (
    <article className="card flex flex-col p-6">
      <div className="section-eyebrow">overall · 综合评分</div>

      <div className="mt-5 flex items-baseline gap-2 font-mono tabular-nums">
        <span
          className="font-display text-[var(--text-primary)]"
          style={{
            fontSize: 64,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            fontWeight: 500,
          }}
        >
          {score}
        </span>
        <span className="font-mono text-[20px] text-[var(--text-tertiary)]">
          /100
        </span>
      </div>

      <div className={`mt-3 text-[13px] font-semibold ${label.tone}`}>
        {label.text}
      </div>

      <div className="mt-5 border-t border-[var(--line)] pt-4 font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
        ranked above
        <span className="ml-1 tabular-nums text-[var(--text-primary)]">
          {beat}%
        </span>
        <span className="ml-1">of users</span>
      </div>

      {report.verdict?.summary && (
        <p className="mt-4 text-[13px] leading-[1.65] text-[var(--text-secondary)]">
          {report.verdict.summary}
        </p>
      )}
    </article>
  )
}
