/**
 * MentorCard — 导师模式卡(中等尺寸,圆头像)。
 *
 * 跟 ChallengerCard(4:5 大 portrait) 视觉差异化:
 * - 用圆形头像(128px)替代竖照背景,看起来更亲近
 * - 文字区在头像下方,标准 list-style 排版
 * - 没有 dark portrait 蒙层
 * - hover 时:卡 lift 4px + 阴影,头像微缩放,first_principle 浮层从下滑出
 */
import { useNavigate } from 'react-router-dom'
import type { Persona } from '@/types/api'

interface Props {
  persona: Persona
}

export default function MentorCard({ persona }: Props) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/challengers/${persona.id}`)}
      className="group relative flex w-full flex-col items-center overflow-hidden rounded-2xl bg-white p-6 text-center transition-all duration-300"
      style={{
        border: '1px solid var(--line)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow =
          '0 18px 36px -16px rgba(0,0,0,0.12), 0 6px 12px -6px rgba(0,0,0,0.06)'
        el.style.borderColor = 'rgba(10,10,10,0.12)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
        el.style.borderColor = 'var(--line)'
      }}
    >
      {/* 圆头像 */}
      <div
        className="relative overflow-hidden rounded-full transition-transform duration-500 group-hover:scale-105"
        style={{
          width: 128,
          height: 128,
          background: 'var(--bg-tertiary)',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
        }}
      >
        <img
          src={persona.avatar}
          alt={persona.name}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center 22%' }}
          onError={(e) => {
            const img = e.currentTarget
            img.style.display = 'none'
            if (img.parentElement && !img.parentElement.querySelector('.fb')) {
              const fb = document.createElement('div')
              fb.className =
                'fb absolute inset-0 grid place-items-center font-semibold text-[var(--text-tertiary)]'
              fb.style.fontSize = '40px'
              fb.style.letterSpacing = '-0.02em'
              fb.textContent = persona.name.charAt(0)
              img.parentElement.appendChild(fb)
            }
          }}
        />
      </div>

      {/* trait label */}
      <div
        className="mt-4 inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.04em]"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
        }}
      >
        {persona.trait_label}
      </div>

      {/* 名字 */}
      <h3
        className="mt-3 font-serif text-[var(--text-primary)]"
        style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '-0.018em',
          lineHeight: 1.2,
        }}
      >
        {persona.name}
      </h3>

      {/* role */}
      <p
        className="mt-1 text-[12.5px]"
        style={{ color: 'var(--text-secondary)', letterSpacing: '-0.005em' }}
      >
        {persona.role_title}
      </p>

      {/* one_liner */}
      <p
        className="mt-2 text-[12px]"
        style={{ color: 'var(--text-tertiary)', lineHeight: 1.5 }}
      >
        {persona.one_liner}
      </p>

      {/* 底部 tags */}
      <p
        className="mt-3 text-[11px]"
        style={{ color: 'var(--text-quaternary)', letterSpacing: '0.01em' }}
      >
        {persona.tags.slice(0, 3).join(' · ')}
      </p>
    </button>
  )
}
