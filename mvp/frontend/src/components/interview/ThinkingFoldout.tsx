import { useState } from 'react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import type { ThinkingStep } from '@/store/interviewStore'

interface Props {
  steps: ThinkingStep[]
  defaultOpen?: boolean
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

export default function ThinkingFoldout({ steps, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  if (steps.length === 0) return null
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
      >
        <span className={clsx('transition-transform', open && 'rotate-90')}>
          ▸
        </span>
        <span>思考过程({steps.length} 步)</span>
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
              {steps.map((s) => (
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
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
