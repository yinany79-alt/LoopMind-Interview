import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { useDebugMode } from '@/hooks/useDebugMode'
import ConversationTab from './ConversationTab'
import ReactTab from './ReactTab'
import EvaluatorTab from './EvaluatorTab'
import StateTab from './StateTab'

type Tab = 'conversation' | 'react' | 'evaluator' | 'state'

const TABS: { key: Tab; label: string }[] = [
  { key: 'conversation', label: '对话流' },
  { key: 'react', label: 'ReAct' },
  { key: 'evaluator', label: 'Evaluator' },
  { key: 'state', label: 'State' },
]

export default function DebugDrawer() {
  const { enabled, toggle } = useDebugMode()
  const [tab, setTab] = useState<Tab>('state')

  return (
    <AnimatePresence>
      {enabled && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          className="fixed right-0 top-0 z-40 flex h-full w-[420px] flex-col border-l border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-[var(--divider)] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[var(--bad)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Debug
              </span>
              <h3 className="font-serif text-sm font-semibold">面试官内部视图</h3>
            </div>
            <button
              type="button"
              onClick={toggle}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              aria-label="close"
            >
              ✕
            </button>
          </header>

          <nav className="flex border-b border-[var(--divider)]">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={clsx(
                  'flex-1 px-3 py-2 text-xs font-medium transition-colors',
                  tab === t.key
                    ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-3">
            {tab === 'conversation' && <ConversationTab />}
            {tab === 'react' && <ReactTab />}
            {tab === 'evaluator' && <EvaluatorTab />}
            {tab === 'state' && <StateTab />}
          </div>

          <footer className="border-t border-[var(--divider)] px-3 py-2 text-[10px] text-[var(--text-tertiary)]">
            快捷键 Cmd/Ctrl + Shift + D · URL 加 ?debug=1 也能开启
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
