/**
 * ChallengerCard — 单个面试官卡片(通用,用于 Home 推荐 + Gallery + Detail)。
 *
 * 设计:
 * - 顶部 120-170px 高的头像区,渐变背景 + 真人照片底部对齐
 * - 名字 + 角色 + 一句话 quote + 评分 + 挑战人数
 * - hover 上浮 + 阴影加深
 * - 大佬卡(tier=legend)右上角带 affiliation logo
 */
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { Persona } from '@/types/api'
import BrandIcon from '@/components/icons/BrandIcon'

interface Props {
  persona: Persona
  /** 显示挑战人数(k 为单位),数字 = challenged_count;不传则隐藏 */
  challengeCount?: number
  /** 评分(4.x / 9.x);默认从 persona.score 取 */
  rating?: number
  variant?: 'default' | 'compact'
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function ChallengerCard({
  persona,
  challengeCount,
  rating,
  variant = 'default',
}: Props) {
  const navigate = useNavigate()
  const isLegend = persona.tier === 'legend'
  const displayRating = rating ?? persona.score ?? (isLegend ? 9.5 : 4.8)
  const ratingFmt = isLegend ? displayRating.toFixed(1) : displayRating.toFixed(1)

  return (
    <motion.button
      type="button"
      onClick={() => navigate(`/challengers/${persona.id}`)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="card card-hover group flex flex-col overflow-hidden text-left"
    >
      {/* 头像区 */}
      <div className="relative h-[152px] overflow-hidden bg-gradient-to-b from-[#f2f3f5] to-white">
        <img
          src={persona.avatar}
          alt={persona.name}
          className="absolute inset-x-0 bottom-0 mx-auto h-[156px] object-contain"
          onError={(e) => {
            // 头像加载失败时显示首字母
            const target = e.currentTarget
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent && !parent.querySelector('.avatar-fallback')) {
              const fb = document.createElement('div')
              fb.className =
                'avatar-fallback absolute inset-0 grid place-items-center text-5xl font-bold text-[var(--text-tertiary)]'
              fb.textContent = persona.name.charAt(0)
              parent.appendChild(fb)
            }
          }}
        />
        {/* 大佬:右上角 affiliation logo */}
        {isLegend && persona.affiliation_slug && (
          <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] bg-white/90 text-[var(--text-secondary)] shadow-sm backdrop-blur">
            <BrandIcon slug={persona.affiliation_slug} size={16} />
          </div>
        )}
        {/* trait label tag(左上) */}
        <div className="absolute left-3 top-3">
          <span className="pill bg-white/90 backdrop-blur">
            {persona.trait_label}
          </span>
        </div>
      </div>

      {/* 文字区 */}
      <div className={variant === 'compact' ? 'p-3' : 'p-4'}>
        <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
          {persona.name}
        </h3>
        <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
          {persona.role_title}
          {isLegend && persona.affiliation && (
            <span className="ml-1 text-[var(--text-secondary)]">
              · {persona.affiliation}
            </span>
          )}
        </p>
        <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-[var(--text-secondary)]">
          {persona.one_liner}
        </p>

        {/* 评分 + 挑战人数 */}
        <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--text-tertiary)]">
          <span className="inline-flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="font-semibold text-[var(--text-primary)]">
              {ratingFmt}
            </span>
          </span>
          {challengeCount !== undefined && (
            <span>{formatCount(challengeCount)} 人挑战</span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
