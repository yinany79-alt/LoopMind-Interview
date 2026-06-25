import { motion } from 'framer-motion'
import type { Persona } from '@/types/api'
import clsx from 'clsx'

interface Props {
  personas: Persona[]
  selectedId: string | null
  /** 选中"随机"卡片时,展示出来的实际人格 id */
  randomResolved: string | null
  onSelect: (p: Persona, mode: 'card' | 'random') => void
}

const EMOJI_BY_ID: Record<string, string> = {
  cold_techlead: '🥶',
  vision_master: '🌌',
  product_mentor: '🌿',
  researcher: '🔬',
}

export default function PersonaCardPicker({
  personas,
  selectedId,
  randomResolved,
  onSelect,
}: Props) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-serif text-base font-semibold">选择面试官</h3>
        <span className="text-xs text-[var(--text-tertiary)]">
          点卡片切换,滑块会跟着滑到这位面试官的默认值
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {personas.map((p) => {
          const active = selectedId === p.id && !randomResolved
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => onSelect(p, 'card')}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                'flex h-full flex-col rounded-xl border bg-[var(--bg-secondary)] p-3 text-left transition-all',
                active
                  ? 'border-[var(--accent)] shadow-[0_0_0_3px_var(--accent-soft)]'
                  : 'border-[var(--border)] hover:border-[var(--text-tertiary)]',
              )}
            >
              <span className="text-3xl">{EMOJI_BY_ID[p.id] ?? '🧑'}</span>
              <span className="mt-2 text-sm font-medium leading-tight">
                {p.name}
              </span>
              <span className="mt-1 text-[11px] leading-snug text-[var(--text-tertiary)]">
                {p.tags.join(' · ')}
              </span>
            </motion.button>
          )
        })}
        <motion.button
          type="button"
          onClick={() => {
            const idx = Math.floor(Math.random() * personas.length)
            onSelect(personas[idx], 'random')
          }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          className={clsx(
            'flex h-full flex-col rounded-xl border bg-[var(--bg-secondary)] p-3 text-left transition-all',
            randomResolved
              ? 'border-[var(--accent)] shadow-[0_0_0_3px_var(--accent-soft)]'
              : 'border-dashed border-[var(--text-tertiary)] hover:border-[var(--accent)]',
          )}
        >
          <span className="text-3xl">🎲</span>
          <span className="mt-2 text-sm font-medium leading-tight">随机</span>
          <span className="mt-1 text-[11px] leading-snug text-[var(--text-tertiary)]">
            {randomResolved
              ? `命运抽到了:${personas.find((p) => p.id === randomResolved)?.name ?? '???'}`
              : '4 张里抽 1,滑块 ±15 抖动'}
          </span>
        </motion.button>
      </div>
    </div>
  )
}
