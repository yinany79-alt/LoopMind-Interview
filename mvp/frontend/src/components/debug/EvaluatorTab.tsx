import { useInterviewStore } from '@/store/interviewStore'
import JsonView from './JsonView'

export default function EvaluatorTab() {
  const turns = useInterviewStore((s) => s.turns)
  return (
    <div className="space-y-3">
      <div className="text-xs text-[var(--text-tertiary)]">
        每次 Evaluator 返回的 JSON · 高亮新出现的字段
      </div>
      {turns.length === 0 && (
        <div className="text-xs text-[var(--text-tertiary)]">尚未触发评估</div>
      )}
      {turns.map((t, idx) => {
        const prev = idx > 0 ? turns[idx - 1].evaluation : undefined
        const diff = diffKeys(prev as Record<string, unknown> | undefined, t.evaluation as unknown as Record<string, unknown>)
        return (
          <div
            key={t.turn_id}
            className="rounded-md border border-[var(--divider)] bg-[var(--bg-secondary)] p-2"
          >
            <div className="mb-1 flex items-baseline justify-between text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              <span>{t.turn_id}</span>
              {diff.length > 0 && (
                <span className="text-[var(--accent)]">变化: {diff.join(', ')}</span>
              )}
            </div>
            <JsonView value={t.evaluation} />
          </div>
        )
      })}
    </div>
  )
}

function diffKeys(
  a: Record<string, unknown> | undefined,
  b: Record<string, unknown>,
): string[] {
  if (!a) return []
  const out: string[] = []
  for (const k of Object.keys(b)) {
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) out.push(k)
  }
  return out
}
