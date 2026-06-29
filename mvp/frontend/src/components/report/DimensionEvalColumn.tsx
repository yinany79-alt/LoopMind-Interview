/**
 * DimensionEvalColumn — Faceup V3.1 第 2 列(Linear-tier)。
 */
import type { Report } from '@/types/api'

const DIMENSION_LABELS: Record<string, string> = {
  tech_understanding: '技术能力',
  first_hand_experience: '项目经验',
  product_methodology: '问题解决',
  user_empathy: '沟通表达',
  agent_product_taste: '逻辑思维',
  logic: '逻辑思维',
  communication: '沟通表达',
  technical: '技术能力',
  problem_solving: '问题解决',
  project_experience: '项目经验',
}

interface Props {
  report: Report
}

export default function DimensionEvalColumn({ report }: Props) {
  const scores = report.dimension_scores ?? {}
  const items = Object.entries(scores)
    .map(([k, v]) => ({
      label: DIMENSION_LABELS[k] ?? k,
      value: Math.round(v),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return (
    <article className="card flex flex-col p-6">
      <div className="section-eyebrow">dimensions · 各项能力</div>

      {items.length === 0 ? (
        <p className="mt-5 text-[13px] text-[var(--text-tertiary)]">
          暂无维度数据
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {items.map((it) => (
            <li key={it.label}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[13px] text-[var(--text-primary)]">
                  {it.label}
                </span>
                <span
                  className="font-mono text-[13px] font-semibold tabular-nums"
                  style={{
                    color:
                      it.value >= 85
                        ? 'var(--good)'
                        : 'var(--text-primary)',
                  }}
                >
                  {it.value}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${it.value}%`,
                    background:
                      it.value >= 85
                        ? 'var(--good)'
                        : 'var(--ink)',
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
