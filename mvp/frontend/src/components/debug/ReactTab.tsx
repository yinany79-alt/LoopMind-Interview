import { useInterviewStore } from '@/store/interviewStore'

export default function ReactTab() {
  const messages = useInterviewStore((s) => s.messages)
  const turns = useInterviewStore((s) => s.turns)
  const interviewerWithSteps = messages.filter(
    (m) => m.role === 'interviewer' && m.thinking_steps.length > 0,
  )
  return (
    <div className="space-y-4">
      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Interviewer ReAct
        </h4>
        {interviewerWithSteps.length === 0 && (
          <p className="text-xs text-[var(--text-tertiary)]">尚无思考链</p>
        )}
        {interviewerWithSteps.map((m) => (
          <div
            key={m.message_id}
            className="mb-3 rounded-md border border-[var(--divider)] bg-[var(--bg-secondary)] p-2"
          >
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              {m.message_id} · {m.role === 'interviewer' ? m.mode : 'USER'}
            </div>
            <ol className="mt-1 space-y-1 font-mono text-[11px]">
              {m.role === 'interviewer' &&
                m.thinking_steps.map((s) => (
                  <li key={s.step_index} className="leading-snug">
                    <span className="mr-1 text-[var(--accent)]">
                      [{s.step_type}]
                    </span>
                    {s.tool_name ? (
                      <span className="text-[var(--mid)]">
                        {s.tool_name}({JSON.stringify(s.tool_args)})
                      </span>
                    ) : (
                      <span className="text-[var(--text-secondary)]">{s.content}</span>
                    )}
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Evaluator turns ({turns.length})
        </h4>
        {turns.map((t) => (
          <div
            key={t.turn_id}
            className="mb-2 rounded-md border border-[var(--divider)] bg-[var(--bg-secondary)] p-2 font-mono text-[11px]"
          >
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              {t.turn_id} · {t.evaluation.answer_quality}
            </div>
            <div className="mt-1 text-[var(--text-secondary)]">
              satisfaction → {t.evaluation.current_satisfaction}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
