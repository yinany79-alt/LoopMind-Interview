/**
 * Hero — 首页主标题区。
 *
 * 设计:左侧大标题 + 副标 + 双 CTA;右侧 OrbVisual。
 * 严格 Apple 风:大字距、轻字重、克制留白。
 */
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import OrbVisual from './OrbVisual'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="grid grid-cols-1 items-center gap-10 py-12 md:grid-cols-2 md:py-16">
      {/* 左侧:标题 + 副标 + CTA */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-display text-[56px] font-semibold leading-[1.05] tracking-tightest text-[var(--text-primary)] md:text-[64px]"
        >
          Who will
          <br />
          <span className="text-[var(--accent)]">challenge you</span>
          <br />
          today?
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="mt-7 max-w-md"
        >
          <p className="text-[19px] font-medium text-[var(--text-primary)]">
            今天谁来面你?
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-tertiary)]">
            不同的面试官,不同的风格,收获不同的成长。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              document
                .getElementById('challengers')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            选择面试官
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              document
                .getElementById('trending')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            查看热门岗位
          </button>
        </motion.div>
      </div>

      {/* 右侧:OrbVisual */}
      <div className="hidden md:block">
        <OrbVisual />
      </div>
    </section>
  )
}
