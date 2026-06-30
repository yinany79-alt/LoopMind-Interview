/**
 * Hero — Faceup V4 首页主标题区(Apple Newsroom-tier)。
 *
 * 设计参照 preview 2/index.html:
 * - 居中布局(不是左右分栏)
 * - 80px Source Serif 4 + italic 渐变高亮强调词
 * - 28px 中文副标 + 19px 描述
 * - 单个 primary CTA(胶囊形)
 * - 底部 mono meta "今日 N / N 次免费挑战"
 */
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <header className="mx-auto flex max-w-[900px] flex-col items-center px-6 py-24 text-center md:py-32">
      {/* 主标题 · Serif italic + 渐变高亮 */}
      <h1
        className="font-serif text-[var(--text-primary)]"
        style={{
          fontSize: 'clamp(48px, 7vw, 80px)',
          lineHeight: 1.05,
          fontWeight: 500,
          letterSpacing: '-0.025em',
        }}
      >
        Who will{' '}
        <span
          style={{
            fontStyle: 'italic',
            background:
              'linear-gradient(135deg, #c96442 0%, #d97757 50%, #b94a8d 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          challenge you
        </span>{' '}
        today?
      </h1>

      {/* 中文副标 */}
      <div
        className="mt-8 text-[var(--text-primary)]"
        style={{
          fontSize: 'clamp(20px, 2.2vw, 28px)',
          fontWeight: 400,
          letterSpacing: '-0.015em',
        }}
      >
        今天,让谁来面你。
      </div>

      {/* 描述 */}
      <p className="mt-5 max-w-[620px] text-[17px] leading-[1.55] text-[var(--text-secondary)]">
        不同的面试官,不同的风格,不同的成长。
        <br />
        把简历或 JD 交给 AI,让它替你模拟一场真正的高压面试。
      </p>

      {/* CTA · 胶囊形 */}
      <button
        type="button"
        onClick={() => {
          document
            .getElementById('challengers')
            ?.scrollIntoView({ behavior: 'smooth' })
        }}
        className="group mt-12 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14.5px] font-medium text-white transition-all"
        style={{
          background: 'var(--ink)',
          letterSpacing: '-0.005em',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background =
            'var(--ink-hover)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--ink)'
        }}
      >
        投递 JD,开始挑战
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>

      {/* meta · 今日剩余 */}
      <div className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: 'var(--good)' }}
        />
        今日剩 3 / 3 次免费挑战
      </div>
    </header>
  )
}
