/**
 * HighlightsColumn — Faceup V3.1 第 3 列(Linear-tier)。
 *
 * 设计:去掉 Sparkles icon + good 色块,改 mono 编号 + 墨色文字
 */
import type { Report } from '@/types/api'

interface Props {
  report: Report
}

export default function HighlightsColumn({ report }: Props) {
  const items =
    report.comments?.filter((c) => c.type === 'strength').slice(0, 5) ?? []

  return (
    <article className="card flex flex-col p-6">
      <div className="section-eyebrow">strengths · 表现亮点</div>

      {items.length === 0 ? (
        <p className="mt-5 text-[13px] text-[var(--text-tertiary)]">
          未识别到突出亮点。
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
