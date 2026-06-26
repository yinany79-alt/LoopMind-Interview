import { useInterviewStore } from '@/store/interviewStore'

export default function MemoryTab() {
  const sessionId = useInterviewStore((s) => s.session_id)
  const skillTree = useInterviewStore((s) => s.skill_tree)
  const turns = useInterviewStore((s) => s.turns)
  const messages = useInterviewStore((s) => s.messages)
  const satisfaction = useInterviewStore((s) => s.satisfaction)
  const topicsCovered = useInterviewStore((s) => s.topics_covered_count)
  const currentTopicName = useInterviewStore((s) => s.current_topic_name)
  const redFlags = useInterviewStore((s) => s.red_flags)
  const brightSpots = useInterviewStore((s) => s.bright_spots)

  if (!sessionId) {
    return (
      <div className="p-4 text-sm text-[var(--text-tertiary)]">
        等待开始面试…
      </div>
    )
  }

  const skillNodes = skillTree?.nodes ?? []
  // 从消息里抓覆盖到的 topic_id 集合(message.topic_id 来自 assistant_message_start)
  const coveredIds = new Set(
    messages
      .filter((m): m is typeof m & { topic_id: string } =>
        m.role === 'interviewer' && Boolean((m as { topic_id?: string }).topic_id),
      )
      .map((m) => m.topic_id),
  )

  return (
    <div className="h-full space-y-4 overflow-y-auto p-4 text-xs">
      {/* 当前满意度 */}
      <section>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
          实时状态
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="满意度" value={satisfaction} />
          <Stat label="已覆盖话题" value={topicsCovered} />
          <Stat label="Red flags" value={redFlags.length} tone="bad" />
          <Stat label="Bright spots" value={brightSpots.length} tone="good" />
        </div>
        {currentTopicName && (
          <div className="mt-2 rounded border border-[var(--divider)] bg-[var(--bg-tertiary)]/40 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
              当前话题
            </div>
            <div className="mt-1 font-medium">{currentTopicName}</div>
          </div>
        )}
      </section>

      {/* 技能树覆盖 */}
      <section>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
          技能树覆盖 ({coveredIds.size} / {skillNodes.length})
        </h4>
        <ul className="space-y-1">
          {skillNodes.length === 0 ? (
            <li className="text-[var(--text-tertiary)]">(无)</li>
          ) : (
            skillNodes.map((n) => {
              const covered = coveredIds.has(n.id)
              return (
                <li
                  key={n.id}
                  className="flex items-center gap-2 rounded border border-[var(--divider)] bg-[var(--bg-tertiary)]/40 px-2 py-1"
                >
                  <span
                    className={
                      covered
                        ? 'text-emerald-600'
                        : 'text-[var(--text-tertiary)]'
                    }
                  >
                    {covered ? '●' : '○'}
                  </span>
                  <span className="flex-1 font-medium">{n.topic}</span>
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
                    w={n.weight}
                  </span>
                  <span className="rounded bg-[var(--bg-primary)] px-1 text-[10px] text-[var(--text-secondary)]">
                    {n.depth_level}
                  </span>
                </li>
              )
            })
          )}
        </ul>
      </section>

      {/* Turn 评估摘要 */}
      <section>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
          评估记录 ({turns.length})
        </h4>
        {turns.length === 0 ? (
          <p className="text-[var(--text-tertiary)]">(尚无 evaluator 输出)</p>
        ) : (
          <ul className="space-y-2">
            {turns.slice(-6).reverse().map((t) => (
              <li
                key={t.turn_id}
                className="rounded border border-[var(--divider)] bg-[var(--bg-tertiary)]/40 p-2"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
                    {t.turn_id}
                  </span>
                  {typeof t.evaluation?.current_satisfaction === 'number' && (
                    <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                      sat={t.evaluation.current_satisfaction}
                    </span>
                  )}
                </div>
                {t.evaluation?.answer_quality && (
                  <div className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                    quality:
                    <span className="ml-1 font-medium text-[var(--text-secondary)]">
                      {t.evaluation.answer_quality}
                    </span>
                  </div>
                )}
                {Array.isArray(t.evaluation?.found_gaps) &&
                  t.evaluation.found_gaps.length > 0 && (
                    <div className="mt-1 text-[10px] text-[var(--text-secondary)]">
                      gaps: {t.evaluation.found_gaps.slice(0, 2).join(' · ')}
                    </div>
                  )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'good' | 'bad'
}): JSX.Element {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-600'
      : tone === 'bad'
        ? 'text-red-600'
        : 'text-[var(--text-primary)]'
  return (
    <div className="rounded border border-[var(--divider)] bg-[var(--bg-tertiary)]/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
        {label}
      </div>
      <div className={`mt-1 text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  )
}
