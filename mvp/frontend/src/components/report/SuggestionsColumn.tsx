/**
 * SuggestionsColumn — Report 第 4 列:改进建议。
 * 来源:comments.filter(type === 'weakness')。
 */
import { Lightbulb } from 'lucide-react'
import type { Report } from '@/types/api'

interface Props {
  report: Report
}

export default function SuggestionsColumn({ report }: Props) {
  const items =
    report.comments?.filter((c) => c.type === 'weakness').slice(0, 5) ?? []

  return (
    <article className="card flex flex-col p-6">
      <header className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
        <Lightbulb size={14} className="text-[var(--warn)]" />
        改进建议
      </header>

      {items.length === 0 ? (
        <p className="text-[13px] text-[var(--text-tertiary)]">未识别到明显短板。</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warn)]" />
              <span className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {c.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
