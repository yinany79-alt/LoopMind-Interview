import { motion } from 'framer-motion'
import type { PersonaDimensions } from '@/types/api'

interface Props {
  values: PersonaDimensions
  onChange: (patch: Partial<PersonaDimensions>) => void
}

const SLIDERS: Array<{
  key: keyof PersonaDimensions
  label: string
  left: string
  right: string
}> = [
  { key: 'warmth', label: '温和度', left: '冷峻不寒暄', right: '温和鼓励' },
  { key: 'depth_preference', label: '深度偏好', left: '偏视野/概念', right: '偏 hands-on 实操' },
  { key: 'pace', label: '节奏', left: '慢热', right: '高密度连续追问' },
  { key: 'vision', label: '视野', left: '抠技术细节', right: '拉到行业战略' },
]

export default function PersonaSliders({ values, onChange }: Props) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-serif text-base font-semibold">微调人格</h3>
        <span className="text-xs text-[var(--text-tertiary)]">
          切换卡片时滑块带过渡动画
        </span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {SLIDERS.map((s) => (
          <div key={s.key} className="card p-4">
            <div className="flex items-baseline justify-between">
              <div className="font-medium">{s.label}</div>
              <motion.div
                key={values[s.key]}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                className="font-mono text-sm tabular-nums text-[var(--accent)]"
              >
                {values[s.key]}
              </motion.div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={values[s.key]}
              onChange={(e) =>
                onChange({ [s.key]: Number(e.target.value) } as Partial<PersonaDimensions>)
              }
              className="slider mt-3 w-full"
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-[var(--text-tertiary)]">
              <span>{s.left}</span>
              <span>{s.right}</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        input[type='range'].slider {
          appearance: none;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 999px;
          outline: none;
        }
        input[type='range'].slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: var(--accent);
          border: 2px solid #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        input[type='range'].slider::-webkit-slider-thumb:active {
          transform: scale(1.15);
        }
      `}</style>
    </div>
  )
}
