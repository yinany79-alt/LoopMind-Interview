import { useState } from 'react'
import type { SkillTree, JDSummary } from '@/types/api'
import clsx from 'clsx'

interface Props {
  jd_summary: JDSummary
  skill_tree: SkillTree
}

export default function JDSummaryCard({ jd_summary, skill_tree }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="font-serif text-lg font-semibold">{jd_summary.title}</h2>
          <div className="mt-1 text-xs text-[var(--text-tertiary)]">
            {jd_summary.company} · {jd_summary.location}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-[var(--text-secondary)] underline-offset-2 hover:underline"
        >
          {expanded ? '收起技能点' : `展开 ${skill_tree.nodes.length} 个技能点`}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {skill_tree.dimensions.map((d) => (
          <span
            key={d}
            className="rounded-full bg-[var(--bg-tertiary)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]"
          >
            {d}
          </span>
        ))}
      </div>

      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          expanded ? 'mt-4 grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <ul className="space-y-2 border-t border-[var(--divider)] pt-3">
            {skill_tree.nodes.map((n) => (
              <li
                key={n.id}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{n.topic}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {n.dimensions.join(' · ')}
                  </div>
                </div>
                <div className="shrink-0 text-xs">
                  <span className="rounded bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-[var(--text-secondary)]">
                    weight {n.weight}
                  </span>
                  <span className="ml-1 rounded bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-[var(--text-secondary)]">
                    {n.depth_level}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
