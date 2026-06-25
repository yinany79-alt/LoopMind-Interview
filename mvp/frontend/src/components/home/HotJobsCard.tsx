interface HotJob {
  title: string
  company: string
  challenged: number
}

// MVP 阶段硬编码 — 前端设计.md §2.2 明确允许
const HOT_JOBS: HotJob[] = [
  { title: 'Agent Harness 产品经理', company: 'DeepSeek', challenged: 412 },
  { title: 'Claude Code DevRel', company: 'Anthropic', challenged: 287 },
  { title: 'Cursor Editor 资深 PM', company: 'Anysphere', challenged: 213 },
  { title: 'Model + Tools 应用研究员', company: 'OpenAI', challenged: 198 },
  { title: 'AI Coding 前端架构', company: '字节跳动', challenged: 165 },
]

export default function HotJobsCard() {
  return (
    <div className="card flex h-full flex-col p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-serif text-base font-semibold">今日最高压战场</h3>
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
          Live · 24h
        </span>
      </div>
      <ul className="flex flex-col divide-y divide-[var(--divider)]">
        {HOT_JOBS.map((job) => (
          <li
            key={`${job.company}-${job.title}`}
            className="flex items-center justify-between py-2.5 text-sm"
          >
            <div className="min-w-0">
              <div className="truncate font-medium text-[var(--text-primary)]">
                {job.title}
              </div>
              <div className="truncate text-xs text-[var(--text-tertiary)]">
                {job.company}
              </div>
            </div>
            <span className="ml-3 shrink-0 rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
              {job.challenged} 人已挑战
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
