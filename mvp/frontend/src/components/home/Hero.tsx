/**
 * Hero — Faceup 首页主标题区(Linear-tier minimal)。
 *
 * 设计哲学:克制 + 大留白 + 主 CTA 用墨黑(不是蓝)
 * 文案改为短促有节奏的英文 + 中文小字副标
 */
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import BreathingDot from './BreathingDot'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="grid grid-cols-1 items-center gap-16 py-20 md:grid-cols-[1.1fr_1fr] md:py-24">
      {/* 左侧:eyebrow + 标题 + 副标 + CTA */}
      <div>
        <div className="section-eyebrow mb-8">interview · honestly</div>

        <h1
          className="font-display text-[var(--text-primary)]"
          style={{
            fontSize: 'clamp(56px, 7vw, 96px)',
            lineHeight: 0.95,
            letterSpacing: '-0.045em',
            fontWeight: 500,
          }}
        >
          Practice the
          <br />
          interview you&apos;re
          <br />
          afraid of.
        </h1>

        <p className="mt-8 max-w-[460px] text-[15px] leading-[1.65] text-[var(--text-secondary)]">
          被一位真实的面试官追问到底。
          <br />
          没有套路,没有 SEO 答案,只有你的真实水位线。
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              document
                .getElementById('challengers')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Choose your interviewer <ArrowRight size={14} />
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              document
                .getElementById('trending')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            或看热门岗位 →
          </button>
        </div>
      </div>

      {/* 右侧:breathing dot */}
      <div className="hidden md:block">
        <BreathingDot />
      </div>
    </section>
  )
}
