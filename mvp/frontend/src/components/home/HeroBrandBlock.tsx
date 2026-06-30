/**
 * HeroBrandBlock — Hero 左侧"品牌封面"一体卡(白底,上品牌下入口)。
 *
 * 设计:
 * - 整块纯白,无边框无阴影,与页面背景融为一体
 * - 上半区(spotlight 区):
 *   · 大字 "Hello, I'm Faceup."(默认全字淡灰)
 *   · 鼠标进入触发聚光圈跟随,套中某词时切中文 + 墨黑
 *   · 聚光灯仅在上半区生效
 * - 下半区(普通区):
 *   · eyebrow "interview · honestly"
 *   · 中文副标 + 描述
 *   · 双 CTA(主黑按钮 + ghost link)
 *   · 不受聚光灯影响,正常显示
 *
 * 聚光圈半径从 140 → 100,更精准。
 */
import { useRef, useState, type MouseEvent } from 'react'
import { ArrowRight } from 'lucide-react'

const WORDS: { en: string; zh: string; punct?: string }[] = [
  { en: 'Hello', zh: '你好', punct: ',' },
  { en: 'I’m', zh: '我是' },
  { en: 'Faceup', zh: '照面', punct: '.' },
]

const SPOTLIGHT_R = 100 // 聚光圈半径

export default function HeroBrandBlock() {
  const spotlightAreaRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [hitIdx, setHitIdx] = useState<number | null>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const wrap = spotlightAreaRef.current?.getBoundingClientRect()
    if (!wrap) return
    const x = e.clientX - wrap.left
    const y = e.clientY - wrap.top
    setPos({ x, y })

    let bestIdx: number | null = null
    let bestDist = SPOTLIGHT_R
    wordRefs.current.forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left - wrap.left + r.width / 2
      const cy = r.top - wrap.top + r.height / 2
      const d = Math.hypot(cx - x, cy - y)
      if (d < bestDist) {
        bestDist = d
        bestIdx = i
      }
    })
    setHitIdx(bestIdx)
  }

  const handleLeave = () => {
    setPos(null)
    setHitIdx(null)
  }

  const hovered = pos !== null

  return (
    <div className="flex h-full flex-col">
      {/* ===== 上半:大字 + 聚光灯 ===== */}
      <div
        ref={spotlightAreaRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          minHeight: 220,
          background: '#fff',
          cursor: hovered ? 'none' : 'default',
          userSelect: 'none',
          padding: '40px 24px',
        }}
      >
        <h1
          className="font-display text-center"
          style={{
            fontSize: 'clamp(32px, 4.5vw, 64px)',
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            fontWeight: 600,
            paddingBottom: '0.1em',
          }}
        >
          {WORDS.map((w, i) => {
            const isHit = hitIdx === i
            return (
              <span key={i}>
                <span
                  ref={(el) => {
                    wordRefs.current[i] = el
                  }}
                  className="inline-block transition-colors duration-200"
                  style={{
                    color: isHit ? '#0a0a0a' : 'rgba(10, 10, 10, 0.18)',
                    fontWeight: isHit ? 700 : 600,
                  }}
                >
                  {isHit ? w.zh : w.en}
                </span>
                {w.punct && (
                  <span
                    className="inline-block"
                    style={{ color: 'rgba(10, 10, 10, 0.18)' }}
                  >
                    {w.punct}
                  </span>
                )}
                {i < WORDS.length - 1 && (
                  <span style={{ color: 'transparent' }}>&nbsp;</span>
                )}
              </span>
            )
          })}
        </h1>

        {/* 聚光圈 */}
        {hovered && pos && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: pos.x,
              top: pos.y,
              width: SPOTLIGHT_R * 2,
              height: SPOTLIGHT_R * 2,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: '1.5px solid rgba(10, 10, 10, 0.16)',
              boxShadow:
                'inset 0 0 0 1px rgba(255,255,255,0.7), 0 0 24px rgba(0,0,0,0.04)',
            }}
          />
        )}
      </div>

      {/* ===== 下半:eyebrow + 副标 + CTA ===== */}
      <div className="mt-2 px-1">
        <div className="section-eyebrow mb-3">interview · honestly</div>
        <p className="text-[18px] leading-[1.5] text-[var(--text-primary)]">
          被一位真实的面试官追问到底。
        </p>
        <p className="mt-1.5 text-[14px] leading-[1.65] text-[var(--text-secondary)]">
          没有套路,没有 SEO 答案,只有你的真实水位线。
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
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
    </div>
  )
}
