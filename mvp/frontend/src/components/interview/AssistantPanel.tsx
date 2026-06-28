/**
 * AssistantPanel — Interview 右栏:面试助手。
 *
 * 顶部:进度环 (2/5 → 当前 topic 数 / 总 topic 数)
 * 中部:实时反馈(最新 evaluator 的 found_strengths/found_gaps 文字)
 * 底部:逻辑性 横条 (current_satisfaction → ████ 85)
 */
import { useInterviewStore } from '@/store/interviewStore'

export default function AssistantPanel() {
  const skillTree = useInterviewStore((s) => s.skill_tree)
  const topicsCovered = useInterviewStore((s) => s.topics_covered_count)
  const turns = useInterviewStore((s) => s.turns)
  const satisfaction = useInterviewStore((s) => s.satisfaction)

  const total = skillTree?.nodes.length ?? 0
  const lastEval = turns[turns.length - 1]?.evaluation ?? null

  const feedback =
    lastEval?.found_strengths?.length
      ? `亮点:${lastEval.found_strengths.slice(0, 2).join('、')}`
      : lastEval?.found_gaps?.length
        ? `建议:${lastEval.found_gaps.slice(0, 2).join('、')}`
        : '等待第一个回答…'

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-[var(--divider)] px-5 py-4">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
          面试助手
        </h3>
        <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
          实时观察与反馈
        </p>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {/* 进度环 */}
        <section>
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            覆盖进度
          </h4>
          <div className="flex items-center gap-4">
            <ProgressRing value={topicsCovered} max={Math.max(total, 1)} />
            <div className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
              已覆盖 {topicsCovered} / {total} 个话题
            </div>
          </div>
        </section>

        {/* 实时反馈 */}
        <section>
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            实时反馈
          </h4>
          <p className="rounded-xl bg-[var(--bg-tertiary)]/50 px-4 py-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {feedback}
          </p>
        </section>

        {/* 当前 satisfaction */}
        <section>
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            当前满意度
          </h4>
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${Math.max(0, Math.min(100, satisfaction))}%` }}
              />
            </div>
            <span className="font-mono text-[12px] font-semibold text-[var(--text-primary)]">
              {satisfaction}
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}

function ProgressRing({ value, max }: { value: number; max: number }) {
  const pct = Math.min(1, value / max)
  const R = 28
  const C = 2 * Math.PI * R
  const offset = C * (1 - pct)
  return (
    <svg width={72} height={72} viewBox="0 0 72 72">
      <circle
        cx={36}
        cy={36}
        r={R}
        fill="none"
        stroke="var(--bg-tertiary)"
        strokeWidth={6}
      />
      <circle
        cx={36}
        cy={36}
        r={R}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={6}
        strokeDasharray={C}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x="36"
        y="40"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill="var(--text-primary)"
      >
        {value}/{max}
      </text>
    </svg>
  )
}
