import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface MiniPersona {
  id: string
  name: string
  emoji: string
  tag: string
}

const PERSONAS: MiniPersona[] = [
  { id: 'cold_techlead', name: '冷酷 Tech Lead', emoji: '🥶', tag: '抠细节 · 不留情面' },
  { id: 'vision_master', name: 'OpenAI 视野流', emoji: '🌌', tag: '看认知 · 谈格局' },
  { id: 'product_mentor', name: '资深产品 Mentor', emoji: '🌿', tag: '友好引导 · 看潜力' },
  { id: 'researcher', name: '直接的研究员', emoji: '🔬', tag: '关心原理 · 技术直球' },
]

export default function PersonaGalleryCard() {
  const navigate = useNavigate()
  const handleClick = (id: string): void => {
    navigate(`/prepare?persona=${encodeURIComponent(id)}`)
  }
  return (
    <div className="card flex h-full flex-col p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-serif text-base font-semibold">面试官镜像馆</h3>
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
          4 张人格皮肤
        </span>
      </div>
      <p className="mb-4 text-xs text-[var(--text-tertiary)]">
        点一张卡片快速进入准备页,直接预选这位面试官
      </p>
      <div className="grid flex-1 grid-cols-2 gap-2">
        {PERSONAS.map((p) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => handleClick(p.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-start rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-left transition-colors hover:border-[var(--accent)] hover:bg-white"
          >
            <span className="text-2xl">{p.emoji}</span>
            <span className="mt-1.5 text-sm font-medium">{p.name}</span>
            <span className="mt-0.5 text-[11px] leading-tight text-[var(--text-tertiary)]">
              {p.tag}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
