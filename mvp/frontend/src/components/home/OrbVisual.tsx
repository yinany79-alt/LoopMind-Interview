/**
 * OrbVisual — Hero 右侧的"漂浮玻璃方块 + 浮空标签"。
 *
 * 严格 Apple Vision Pro 风:
 * - 浅蓝渐变玻璃方块,旋转 18°
 * - 内嵌深蓝核心
 * - 三个 pill 标签悬浮其外:MCP / Agent Loop / Tool Use
 * - 极轻阴影,无 glow
 */
import { motion } from 'framer-motion'

const TAGS = [
  { label: 'MCP', x: '54%', y: '12%' },
  { label: 'Agent Loop', x: '72%', y: '58%' },
  { label: 'Tool Use', x: '12%', y: '76%' },
]

export default function OrbVisual() {
  return (
    <div className="relative mx-auto h-[320px] w-full max-w-[460px]">
      {/* 渐变背景晕染 */}
      <div className="absolute inset-0 -z-10 opacity-60 blur-3xl">
        <div className="absolute left-1/3 top-1/3 h-48 w-48 rounded-full bg-[#dbe7ff]" />
        <div className="absolute right-1/4 top-1/4 h-32 w-32 rounded-full bg-[#eef4ff]" />
      </div>

      {/* 玻璃方块(底层) */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rotate-[12deg] rounded-[38px] border border-white/80 bg-gradient-to-br from-white/90 to-[#ebf1ff]/40 shadow-[0_30px_80px_rgba(42,97,255,0.12)] backdrop-blur-sm"
        aria-hidden
      />

      {/* 核心方块(中层) */}
      <motion.div
        animate={{ y: [0, 6, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-gradient-to-br from-[#8fb3ff] to-[#2f6fff] shadow-[0_20px_50px_rgba(38,110,255,0.32)]"
        aria-hidden
      />

      {/* 浮空标签 */}
      {TAGS.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.4 + i * 0.15 },
            scale: { duration: 0.6, delay: 0.4 + i * 0.15 },
            y: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 },
          }}
          style={{ left: t.x, top: t.y }}
          className="absolute z-10 rounded-full border border-[var(--border)] bg-white/85 px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] shadow-[0_8px_26px_rgba(0,0,0,0.05)] backdrop-blur"
        >
          {t.label}
        </motion.div>
      ))}
    </div>
  )
}
