import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import type { ThinkingStep } from '@/store/interviewStore'

interface Props {
  steps: ThinkingStep[]
  defaultOpen?: boolean
  /** 是否处于"思考进行中"状态:有思考但还没出正文 */
  pending?: boolean
}

const LABEL: Record<ThinkingStep['step_type'], string> = {
  thought: 'Thought',
  tool_call: 'Tool',
  observation: 'Observation',
  final: 'Final',
}

const TONE: Record<ThinkingStep['step_type'], string> = {
  thought: 'text-[var(--text-secondary)]',
  tool_call: 'text-[var(--accent)]',
  observation: 'text-[var(--mid)]',
  final: 'text-[var(--good)]',
}

export default function ThinkingFoldout({
  steps,
  defaultOpen = false,
  pending = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen || pending)
  const [userOverride, setUserOverride] = useState(false)

  // pending → 文本开始(pending=false)时,如果用户没手动操作过,自动收起
  useEffect(() => {
    if (!userOverride) setOpen(defaultOpen || pending)
  }, [pending, defaultOpen, userOverride])

  if (steps.length === 0 && !pending) return null

  return (
    <div className={clsx(pending ? 'mt-0' : 'mt-2')}>
      <button
        type="button"
        onClick={() => {
          setUserOverride(true)
          setOpen((v) => !v)
        }}
        className={clsx(
          'flex items-center gap-1 text-xs transition-colors',
          pending
            ? 'text-[var(--text-primary)]'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]',
        )}
      >
        <span className={clsx('transition-transform', open && 'rotate-90')}>
          ▸
        </span>
        <span>
          {pending && steps.length === 0
            ? '面试官正在思考…'
            : pending
              ? `思考中 · ${steps.length} 步`
              : `思考过程(${steps.length} 步)`}
        </span>
        {pending && (
          <span className="inline-flex gap-0.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-1 rounded-full"
                style={{ background: 'var(--ink)' }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </span>
        )}
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
            <ol className="mt-2 space-y-1 rounded-lg border border-[var(--divider)] bg-[var(--bg-tertiary)]/50 p-3 font-mono text-[12px] leading-relaxed">
              {steps.length === 0 ? (
                <li className="text-[var(--text-tertiary)]">
                  (等待第一条思考…)
                </li>
              ) : (
                steps.map((s) => (
                  <li key={s.step_index} className="flex gap-2">
                    <span
                      className={clsx(
                        'w-[78px] shrink-0 font-semibold uppercase tracking-wide',
                        TONE[s.step_type],
                      )}
                    >
                      {LABEL[s.step_type]}
                      {s.step_type === 'tool_call' && s.tool_name
                        ? ` · ${s.tool_name}`
                        : ''}
                    </span>
                    <span className="whitespace-pre-wrap break-words text-[var(--text-secondary)]">
                      {s.content}
                    </span>
                  </li>
                ))
              )}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
