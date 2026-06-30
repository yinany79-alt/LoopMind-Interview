/**
 * Hero — Faceup V4.2 首页主标题区(左右分栏 + 轮换关键词)。
 *
 * 设计:
 * - 左:eyebrow + 大标题(其中"[afraid of]"轮换 5 词)+ 中文副标 + 双 CTA
 * - 右:PortraitWall(5 张诺奖风窄竖条,默认灰度 hover 变彩)
 *
 * 轮换词每 2.5s 切换:
 *   afraid of  → ghosted from → rejected from → underqualified for → overthinking
 * 切换动画:旧词 translateY(-100%) fade out + 新词 translateY(0) fade in
 * 600ms cubic-bezier 缓动,鼠标 hover 标题区时暂停轮换。
 */
import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import PortraitWall from './PortraitWall'

const ROTATING_WORDS = [
  'afraid of',
  'ghosted from',
  'rejected from',
  'underqualified for',
  'overthinking',
] as const

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0)
  const pausedRef = useRef(false)

  useEffect(() => {
    const tick = window.setInterval(() => {
      if (pausedRef.current) return
      setWordIdx((i) => (i + 1) % ROTATING_WORDS.length)
    }, 2800)
    return () => window.clearInterval(tick)
  }, [])

  // 测最长词宽度,reserve 占位避免标题抖
  // 通过隐藏的 sizer span 测每个词,取最长
  return (
    <section className="grid grid-cols-1 items-center gap-16 py-20 md:grid-cols-[1.1fr_1fr] md:py-24">
      {/* 左:eyebrow + 标题 + 副标 + CTA */}
      <div
        onMouseEnter={() => {
          pausedRef.current = true
        }}
        onMouseLeave={() => {
          pausedRef.current = false
        }}
      >
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
          <span className="relative inline-flex">
            {/* sizer:不可见,只用来撑出最长词的宽度,避免布局抖动 */}
            <span
              aria-hidden
              className="invisible whitespace-nowrap"
              style={{ display: 'inline-block' }}
            >
              {ROTATING_WORDS.reduce((a, b) => (a.length >= b.length ? a : b))}
            </span>
            {/* 真实词,绝对定位叠在 sizer 上,实现切换动画 */}
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ display: 'inline-block' }}
            >
              {ROTATING_WORDS.map((w, i) => {
                const isActive = i === wordIdx
                const isPrev =
                  i === (wordIdx - 1 + ROTATING_WORDS.length) % ROTATING_WORDS.length
                return (
                  <span
                    key={w}
                    className="absolute inset-0 whitespace-nowrap"
                    style={{
                      fontStyle: 'italic',
                      background:
                        'linear-gradient(135deg, #c96442 0%, #d97757 50%, #b94a8d 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      color: 'transparent',
                      opacity: isActive ? 1 : 0,
                      transform: isActive
                        ? 'translateY(0)'
                        : isPrev
                          ? 'translateY(-100%)'
                          : 'translateY(100%)',
                      transition:
                        'opacity 500ms ease, transform 600ms cubic-bezier(0.2,0.7,0.2,1)',
                    }}
                  >
                    {w}
                  </span>
                )
              })}
            </span>
          </span>
          .
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

      {/* 右:5 张诺奖风窄竖条 */}
      <div className="hidden md:block">
        <PortraitWall />
      </div>
    </section>
  )
}
