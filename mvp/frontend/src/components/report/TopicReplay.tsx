import { useState } from 'react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  interviewerEmojiOf,
  satisfactionBarColor,
} from '@/store/interviewStore'
import type { Report } from '@/types/api'

interface Props {
  replays: NonNullable<Report['topic_replays']>
}

export default function TopicReplay({ replays }: Props) {
  return (
    <div className="card p-5">
      <h3 className="font-serif text-base font-semibold">逐题回放</h3>
      <ul className="mt-3 space-y-2">
        {replays.map((r, idx) => (
          <ReplayItem key={r.topic_id} idx={idx + 1} replay={r} />
        ))}
      </ul>
    </div>
  )
}

function ReplayItem({
  idx,
  replay,
}: {
  idx: number
  replay: NonNullable<Report['topic_replays']>[number]
}) {
  const [open, setOpen] = useState(idx === 1)
  const tone = satisfactionBarColor(replay.final_satisfaction)
  return (
    <li className="rounded-xl border border-[var(--border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-tertiary)]/40"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="font-mono text-xs text-[var(--text-tertiary)]">
            {String(idx).padStart(2, '0')}
          </span>
          <span className="truncate font-medium">{replay.topic_name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span aria-hidden>{interviewerEmojiOf(replay.final_satisfaction)}</span>
          <span
            className={clsx(
              'rounded-full px-2 py-0.5 font-medium',
              tone === 'good' && 'bg-[var(--good)]/15 text-[var(--good)]',
              tone === 'mid' && 'bg-[var(--mid)]/15 text-[var(--mid)]',
              tone === 'bad' && 'bg-[var(--bad)]/15 text-[var(--bad)]',
            )}
          >
            满意度 {replay.final_satisfaction}
          </span>
          <span
            className={clsx(
              'text-[var(--text-tertiary)] transition-transform',
              open && 'rotate-90',
            )}
          >
            ▸
          </span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--divider)] px-4 py-4 text-sm">
              <ol className="space-y-3">
                {replay.turns.map((t, i) => (
                  <li key={i} className="flex flex-col">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                      {t.role === 'interviewer' ? '面试官' : '你'}
                    </span>
                    <div
                      className={clsx(
                        'mt-1 whitespace-pre-wrap leading-relaxed',
                        t.role === 'interviewer'
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)]',
                      )}
                    >
                      {t.content}
                    </div>
                    {t.role === 'interviewer' && t.thinking && (
                      <details className="mt-1 rounded border border-[var(--divider)] bg-[var(--bg-tertiary)]/40 p-2 font-mono text-[11px] text-[var(--text-tertiary)]">
                        <summary className="cursor-pointer select-none">
                          思考过程
                        </summary>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {t.thinking}
                        </pre>
                      </details>
                    )}
                  </li>
                ))}
              </ol>
              <div className="mt-4 rounded-md border border-[var(--divider)] bg-[var(--bg-tertiary)]/50 p-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                <span className="font-medium text-[var(--text-primary)]">
                  面试官评价:
                </span>{' '}
                {replay.evaluator_comment}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
