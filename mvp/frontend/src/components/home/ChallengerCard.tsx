/**
 * ChallengerCard — Faceup V4(Apple Newsroom-tier)。
 *
 * 设计参照 preview 2 的卡片 + 新增 hover slide-up first_principle:
 * - 4:5 竖卡 portrait 真人照片底片(object-position center 18% 裁顶贴脸)
 * - 卡片底部一个 meta 区显示名字/角色/标签
 * - hover:
 *   · 整卡 scale(1.04) + 阴影抬升
 *   · 内部图 scale(1.05) 微缩放(parallax 错觉)
 *   · 底部从下方 slide up 一条"信奉的第一性原理"暗色 overlay
 *
 * Legend 卡用 dark 主题(深色 portrait 底),Mentor 卡用 light 主题。
 */
import { useNavigate } from 'react-router-dom'
import type { Persona } from '@/types/api'
import BrandIcon from '@/components/icons/BrandIcon'

interface Props {
  persona: Persona
  challengeCount?: number
}

export default function ChallengerCard({ persona }: Props) {
  const navigate = useNavigate()
  const isLegend = persona.tier === 'legend'

  return (
    <button
      type="button"
      onClick={() => navigate(`/challengers/${persona.id}`)}
      className="group block w-full overflow-hidden text-left"
      style={{
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      {/* Portrait 区 · 4:5 真人照片 */}
      <div
        className="relative overflow-hidden transition-all duration-500 ease-out group-hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25),0_12px_24px_-12px_rgba(0,0,0,0.15)]"
        style={{
          aspectRatio: '4 / 5',
          borderRadius: 18,
          background: isLegend ? 'var(--surface-dark, #1d1d1f)' : 'var(--bg-tertiary)',
        }}
      >
        <img
          src={persona.avatar}
          alt={persona.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          style={{ objectPosition: 'center 18%' }}
          onError={(e) => {
            const img = e.currentTarget
            img.style.display = 'none'
            if (img.parentElement && !img.parentElement.querySelector('.fb')) {
              const fb = document.createElement('div')
              fb.className =
                'fb absolute inset-0 grid place-items-center text-6xl font-bold'
              fb.style.color = isLegend
                ? 'rgba(255,255,255,0.25)'
                : 'rgba(0,0,0,0.2)'
              fb.textContent = persona.name.charAt(0)
              img.parentElement.appendChild(fb)
            }
          }}
        />

        {/* 左上 trait label(深色玻璃) */}
        <div
          className="absolute left-3 top-3 z-[2] inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.04em]"
          style={{
            background: 'rgba(255,255,255,0.16)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#fff',
          }}
        >
          {persona.trait_label}
        </div>

        {/* 右上 公司 logo(legend 才有) */}
        {isLegend && persona.affiliation_slug && (
          <div
            className="absolute right-3 top-3 z-[2] grid h-7 w-7 place-items-center rounded-full"
            style={{
              background: 'rgba(255,255,255,0.16)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#fff',
            }}
          >
            <BrandIcon slug={persona.affiliation_slug} size={12} />
          </div>
        )}

        {/* hover slide-up overlay · 第一性原理 */}
        {persona.first_principle && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] translate-y-full px-5 py-5 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-y-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0) 100%)',
              minHeight: '45%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/60">
              first principle · 信奉
            </div>
            <p
              className="font-serif italic text-white"
              style={{
                fontSize: 14,
                lineHeight: 1.45,
                letterSpacing: '-0.005em',
              }}
            >
              "{persona.first_principle}"
            </p>
          </div>
        )}
      </div>

      {/* Meta · 卡下方 */}
      <div className="mt-3.5 px-1">
        <h3
          className="font-serif text-[var(--text-primary)]"
          style={{
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: '-0.012em',
          }}
        >
          {persona.name}
        </h3>
        <p
          className="mt-0.5 text-[12.5px] text-[var(--text-secondary)]"
          style={{ letterSpacing: '-0.005em' }}
        >
          {persona.role_title}
          {isLegend && persona.affiliation && (
            <span className="text-[var(--text-tertiary)]">
              {' · '}
              {persona.affiliation}
            </span>
          )}
        </p>
        <p className="mt-1.5 text-[11.5px] text-[var(--text-tertiary)]">
          {persona.tags.slice(0, 3).join(' · ')}
        </p>
      </div>
    </button>
  )
}
