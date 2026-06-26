import { useState } from 'react'
import clsx from 'clsx'
import { useInterviewStore } from '@/store/interviewStore'

const EVENT_COLOR: Record<string, string> = {
  session_started: 'text-sky-600',
  session_ended: 'text-sky-600',
  graph_node_enter: 'text-blue-500',
  graph_node_exit: 'text-blue-400',
  graph_paused: 'text-amber-600',
  graph_resumed: 'text-amber-500',
  thinking_step: 'text-purple-500',
  evaluator_started: 'text-fuchsia-500',
  evaluator_result: 'text-fuchsia-600',
  assistant_message_start: 'text-emerald-500',
  assistant_message_end: 'text-emerald-600',
  satisfaction_update: 'text-yellow-600',
  red_flag_added: 'text-red-500',
  bright_spot_added: 'text-green-500',
  topic_finished: 'text-indigo-500',
  topic_started: 'text-indigo-500',
  interviewer_state: 'text-slate-500',
  error: 'text-red-600',
}

export default function LogTab() {
  const log = useInterviewStore((s) => s.event_log)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState('')

  const filtered = filter
    ? log.filter((e) =>
        e.event.toLowerCase().includes(filter.toLowerCase()),
      )
    : log

  const toggle = (idx: number): void => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--divider)] px-3 py-2">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="过滤事件名…"
          className="w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1 text-xs outline-none focus:border-[var(--accent)]"
        />
        <div className="mt-1 text-[10px] text-[var(--text-tertiary)]">
          {filtered.length} / {log.length} 条 · 新事件追加在底部
        </div>
      </div>
      <div className="flex-1 overflow-auto font-mono text-[11px]">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-tertiary)]">
            {log.length === 0 ? '(等待事件…)' : '(无匹配)'}
          </div>
        ) : (
          <ul>
            {filtered.map((e, i) => {
              const idx = log.indexOf(e)
              const isOpen = expanded.has(idx)
              const tsStr = new Date(e.ts).toLocaleTimeString('zh-CN', {
                hour12: false,
              })
              return (
                <li
                  key={idx}
                  className="border-b border-[var(--divider)]/60 px-3 py-1.5 hover:bg-[var(--bg-tertiary)]/40"
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="flex w-full items-center gap-2 text-left"
                  >
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {tsStr}
                    </span>
                    <span
                      className={clsx(
                        'font-semibold',
                        EVENT_COLOR[e.event] ?? 'text-[var(--text-primary)]',
                      )}
                    >
                      {e.event}
                    </span>
                    <span className="ml-auto truncate text-[10px] text-[var(--text-tertiary)]">
                      {summarize(e.event, e.data)}
                    </span>
                  </button>
                  {isOpen && (
                    <pre className="mt-1 max-h-60 overflow-auto rounded bg-[var(--bg-tertiary)]/50 p-2 text-[10px]">
                      {JSON.stringify(e.data, null, 2)}
                    </pre>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function summarize(event: string, data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const d = data as Record<string, unknown>
  if (event === 'graph_node_enter' || event === 'graph_node_exit') {
    return String(d.node_id ?? '')
  }
  if (event === 'graph_paused') return `@ ${String(d.at_node ?? '')}`
  if (event === 'thinking_step') {
    return String(d.step_type ?? '') + ' ' + String(d.content ?? '').slice(0, 40)
  }
  if (event === 'satisfaction_update') {
    return `${String(d.previous_value ?? '')} → ${String(d.current_value ?? '')}`
  }
  if (event === 'interviewer_state') return String(d.state_text ?? '')
  return ''
}
