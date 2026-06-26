import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useInterviewStore } from '@/store/interviewStore'
import type { GraphNodeId } from '@/types/api'
import GraphCanvas from './GraphCanvas'
import {
  debugFetchState,
  debugResume,
  debugToggleBreakpoint,
} from '@/api/rest'

export default function GraphTab() {
  const sessionId = useInterviewStore((s) => s.session_id)
  const status = useInterviewStore((s) => s.graph_node_status)
  const snapshots = useInterviewStore((s) => s.graph_node_last_snapshot)
  const durations = useInterviewStore((s) => s.graph_node_duration_ms)
  const pausedAt = useInterviewStore((s) => s.graph_paused_at)

  const [breakpoints, setBreakpoints] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<GraphNodeId | null>(null)
  const [busy, setBusy] = useState(false)

  // 同步后端 breakpoint 状态(initial)
  useEffect(() => {
    if (!sessionId) return
    debugFetchState(sessionId)
      .then((r) => setBreakpoints(new Set(r.breakpoints)))
      .catch(() => undefined)
  }, [sessionId])

  // Esc 关闭节点详情
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const toggleBp = async (nodeId: GraphNodeId): Promise<void> => {
    if (!sessionId) return
    const action = breakpoints.has(nodeId) ? 'remove' : 'add'
    setBusy(true)
    try {
      const r = await debugToggleBreakpoint(sessionId, nodeId, action)
      setBreakpoints(new Set(r.breakpoints))
    } finally {
      setBusy(false)
    }
  }

  const resume = async (step: boolean): Promise<void> => {
    if (!sessionId) return
    setBusy(true)
    try {
      await debugResume(sessionId, step)
    } finally {
      setBusy(false)
    }
  }

  const selectedSnapshot = selected ? snapshots[selected] : null
  const selectedStatus = selected ? (status[selected] ?? 'idle') : null
  const selectedDuration = selected ? durations[selected] : null

  if (!sessionId) {
    return (
      <div className="p-4 text-sm text-[var(--text-tertiary)]">
        <p className="mb-3">等待开始面试…</p>
        <p className="text-xs">
          下面是静态拓扑预览,面试开始后会实时显示节点状态。
        </p>
        <div className="mt-4 rounded-lg border border-[var(--divider)] bg-[var(--bg-tertiary)]/40 p-2">
          <GraphCanvas
            status={{}}
            breakpoints={new Set()}
            pausedAt={null}
            selectedNode={null}
            onSelectNode={() => undefined}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 border-b border-[var(--divider)] px-3 py-2 text-xs">
        <button
          type="button"
          onClick={() => void resume(false)}
          disabled={!pausedAt || busy}
          className={clsx(
            'rounded px-2 py-1 font-medium',
            pausedAt
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]',
          )}
        >
          ▶ Resume
        </button>
        <button
          type="button"
          onClick={() => void resume(true)}
          disabled={!pausedAt || busy}
          className={clsx(
            'rounded px-2 py-1 font-medium',
            pausedAt
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              : 'cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]',
          )}
        >
          ⏭ Step
        </button>
        <div className="ml-auto text-[var(--text-tertiary)]">
          {pausedAt ? (
            <span className="font-medium text-amber-600">
              🔴 paused @ {pausedAt}
            </span>
          ) : (
            <span>running…</span>
          )}
        </div>
      </div>

      {/* 画布 */}
      <div className="overflow-auto p-3">
        <GraphCanvas
          status={status}
          breakpoints={breakpoints}
          pausedAt={pausedAt}
          selectedNode={selected}
          onSelectNode={setSelected}
        />
      </div>

      {/* 节点详情 */}
      <div className="border-t border-[var(--divider)] p-3">
        {!selected ? (
          <p className="text-xs text-[var(--text-tertiary)]">
            点击节点查看 input/output/duration · 红圈表示断点
          </p>
        ) : (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{selected}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void toggleBp(selected)}
                  disabled={busy}
                  className={clsx(
                    'rounded border px-2 py-0.5 text-[11px] font-medium',
                    breakpoints.has(selected)
                      ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]',
                  )}
                >
                  {breakpoints.has(selected) ? '✓ 已设断点' : '🔴 设断点'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded px-1.5 py-0.5 text-base leading-none text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  aria-label="关闭节点详情"
                  title="关闭(Esc)"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex gap-3 text-[11px] text-[var(--text-tertiary)]">
              <span>
                状态:
                <span className="ml-1 font-mono">{selectedStatus}</span>
              </span>
              {typeof selectedDuration === 'number' && (
                <span>
                  上次耗时:
                  <span className="ml-1 font-mono">{selectedDuration}ms</span>
                </span>
              )}
            </div>
            <details
              open
              className="rounded border border-[var(--divider)] bg-[var(--bg-tertiary)]/40 p-2 font-mono text-[11px]"
            >
              <summary className="cursor-pointer text-[var(--text-secondary)]">
                state snapshot
              </summary>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words">
                {selectedSnapshot
                  ? JSON.stringify(selectedSnapshot, null, 2)
                  : '(no snapshot yet)'}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
