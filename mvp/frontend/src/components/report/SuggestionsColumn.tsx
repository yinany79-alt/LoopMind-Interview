/**
 * SuggestionsColumn — Faceup V3.1 第 4 列(Linear-tier)。
 */
import type { Report } from '@/types/api'

interface Props {
  report: Report
}

export default function SuggestionsColumn({ report }: Props) {
  const items =
    report.comments?.filter((c) => c.type === 'weakness').slice(0, 5) ?? []

  return (
    <article className="card flex flex-col p-6">
      <div className="section-eyebrow">to improve · 改进建议</div>

      {items.length === 0 ? (
        <p className="mt-5 text-[13px] text-[var(--text-tertiary)]">
          未识别到明显短板。
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {items.map((c, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 font-mono text-[10px] tabular-nums uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[13px] leading-[1.65] text-[var(--text-primary)]">
                {c.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
