/**
 * ChallengerCard — Faceup V3 单个面试官卡(Linear-tier minimal)。
 *
 * 设计:
 * - 纯白底 + 1px 灰边,圆角 12px
 * - 顶部一行 JetBrains Mono trait_label(取代"严厉型"色块标签)
 * - 中部:80px 圆 Avatar + 名字(15px semibold)+ 角色(12px 灰)
 * - 一行 quote(12px 二级灰,1 行截断)
 * - 底部:★ 评分 + 挑战人数(monospace 数字)+ 右下角 →
 * - hover 时背景变浅灰,边框略深
 */
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Star } from 'lucide-react'
import type { Persona } from '@/types/api'
import Avatar from '@/components/common/Avatar'
import BrandIcon from '@/components/icons/BrandIcon'

interface Props {
  persona: Persona
  challengeCount?: number
  rating?: number
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
}: Props) {
  const navigate = useNavigate()
  const isLegend = persona.tier === 'legend'
  const displayRating = rating ?? persona.score ?? (isLegend ? 9.3 : 4.8)

  return (
    <button
      type="button"
      onClick={() => navigate(`/challengers/${persona.id}`)}
      className="card card-hover group flex flex-col p-5 text-left"
    >
      {/* 顶部 trait label */}
      <div className="mb-5 flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
          {persona.trait_label}
        </span>
        {isLegend && persona.affiliation_slug && (
          <BrandIcon
            slug={persona.affiliation_slug}
            size={14}
            className="text-[var(--text-quaternary)] transition-colors group-hover:text-[var(--text-secondary)]"
          />
        )}
      </div>

      {/* Avatar + 名字 + 角色 */}
      <div className="flex items-start gap-3">
        <Avatar name={persona.name} src={persona.avatar} size={48} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.015em] text-[var(--text-primary)]">
            {persona.name}
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-[var(--text-secondary)]">
            {persona.role_title}
            {isLegend && persona.affiliation && (
              <span className="text-[var(--text-tertiary)]">
                {' · '}
                {persona.affiliation}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Quote */}
      <p className="mt-4 line-clamp-2 min-h-[36px] text-[12.5px] leading-[1.5] text-[var(--text-secondary)]">
        &ldquo;{persona.one_liner}&rdquo;
      </p>

      {/* 底部 rating + count + arrow */}
      <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-3 font-mono text-[11px] tabular-nums text-[var(--text-tertiary)]">
        <span className="inline-flex items-center gap-1">
          <Star size={10} className="fill-[var(--text-primary)] text-[var(--text-primary)]" />
          <span className="font-semibold text-[var(--text-primary)]">
            {displayRating.toFixed(1)}
          </span>
        </span>
        {challengeCount !== undefined && (
          <span>{formatCount(challengeCount)} runs</span>
        )}
        <ArrowUpRight
          size={14}
          className="text-[var(--text-quaternary)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]"
        />
      </div>
    </button>
  )
}
