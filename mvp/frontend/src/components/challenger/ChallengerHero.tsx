/**
 * ChallengerHero — Challenger Detail 顶部大头像 + 名字 + CTA。
 *
 * 设计:左边大头像 280x280;右边名字 + role + ★ rating + 挑战人数 +
 * 引语 + 标签 + 蓝色"选他来面试"。
 */
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ArrowRight } from 'lucide-react'
import type { ChallengerStats, Persona } from '@/types/api'
import BrandIcon from '@/components/icons/BrandIcon'

interface Props {
  persona: Persona
  stats: ChallengerStats | null
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function ChallengerHero({ persona, stats }: Props) {
  const navigate = useNavigate()
  const rating = stats?.rating ?? persona.score ?? 4.8
  const count = stats?.challenged_count ?? 0

  const handleAccept = () => {
    navigate(`/missions?challenger=${persona.id}`)
  }

  const handleCoffee = () => {
    navigate(`/missions?challenger=${persona.id}&type=coffee`)
  }

  return (
    <section className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
      {/* 大头像 */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-[#f2f3f5] to-white">
        <div className="relative aspect-square w-full">
          <img
            src={persona.avatar}
            alt={persona.name}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              const img = e.currentTarget
              img.style.display = 'none'
              if (img.parentElement && !img.parentElement.querySelector('.fb')) {
                const fb = document.createElement('div')
                fb.className =
                  'fb absolute inset-0 grid place-items-center text-7xl font-bold text-[var(--text-tertiary)]'
                fb.textContent = persona.name.charAt(0)
                img.parentElement.appendChild(fb)
              }
            }}
          />
        </div>
      </div>

      {/* 右侧:名字 + role + 评分 + 引语 + 标签 + CTA */}
      <div className="flex flex-col">
        <h1 className="font-display text-[42px] font-semibold leading-tight tracking-tighter text-[var(--text-primary)]">
          {persona.name}
        </h1>

        <p className="mt-2 flex items-center gap-2 text-[16px] text-[var(--text-secondary)]">
          <span>{persona.role_title}</span>
          {persona.affiliation && (
            <>
              <span className="text-[var(--text-quaternary)]">·</span>
              <span>{persona.affiliation}</span>
              {persona.affiliation_slug && (
                <BrandIcon
                  slug={persona.affiliation_slug}
                  size={18}
                  className="text-[var(--text-secondary)]"
                />
              )}
            </>
          )}
        </p>

        <div className="mt-3 inline-flex items-center gap-3 text-[13px] text-[var(--text-tertiary)]">
          <span className="inline-flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="font-semibold text-[var(--text-primary)]">
              {rating.toFixed(1)}
            </span>
          </span>
          <span className="text-[var(--text-quaternary)]">·</span>
          <span>{formatCount(count)} 人挑战</span>
        </div>

        <p className="mt-5 text-[18px] leading-relaxed text-[var(--text-primary)]">
          “{persona.one_liner}”
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {persona.tags.map((t) => (
            <span key={t} className="pill">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap gap-3 pt-8">
          <motion.button
            type="button"
            onClick={handleAccept}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
          >
            选他来面试 <ArrowRight size={16} />
          </motion.button>
          <motion.button
            type="button"
            onClick={handleCoffee}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
          >
            Coffee Chat
          </motion.button>
        </div>
      </div>
    </section>
  )
}
