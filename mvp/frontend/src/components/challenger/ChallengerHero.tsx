/**
 * ChallengerHero — Faceup V3.1 人物详情页头部(Linear-tier minimal)。
 *
 * 设计:
 * - 左:正方形大头像(用 Avatar 组件),无浅灰渐变底
 * - 右:eyebrow + 名字(48px Inter)+ role + 公司 logo + 单行 metric + 引语 + tags
 * - 主 CTA: "Choose this interviewer"(墨黑)+ ghost "Coffee Chat"
 * - 数字 mono tabular-nums
 */
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { ChallengerStats, Persona } from '@/types/api'
import Avatar from '@/components/common/Avatar'
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
  const passRate = stats?.pass_rate ?? 0

  const handleAccept = () => navigate(`/missions?challenger=${persona.id}`)
  const handleCoffee = () => navigate(`/missions?challenger=${persona.id}&type=coffee`)

  return (
    <section className="grid grid-cols-1 gap-10 md:grid-cols-[260px_1fr]">
      {/* 左:大头像方块 */}
      <div className="relative">
        <Avatar name={persona.name} src={persona.avatar} size={260} className="!rounded-2xl" />
      </div>

      {/* 右 */}
      <div className="flex flex-col">
        <div className="section-eyebrow">
          {persona.tier === 'legend' ? 'leader · 大佬' : 'mentor · 导师'}
        </div>

        <h1
          className="mt-3 font-display text-[var(--text-primary)]"
          style={{
            fontSize: 'clamp(40px, 5vw, 56px)',
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            fontWeight: 500,
          }}
        >
          {persona.name}
        </h1>

        <p className="mt-3 flex flex-wrap items-center gap-2 text-[15px] text-[var(--text-secondary)]">
          <span>{persona.role_title}</span>
          {persona.affiliation && (
            <>
              <span className="text-[var(--text-quaternary)]">·</span>
              <span className="font-medium text-[var(--text-primary)]">
                {persona.affiliation}
              </span>
              {persona.affiliation_slug && (
                <BrandIcon
                  slug={persona.affiliation_slug}
                  size={14}
                  className="text-[var(--text-tertiary)]"
                />
              )}
            </>
          )}
        </p>

        {/* metric line · mono */}
        <div className="mt-5 flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
          <span>
            <span className="tabular-nums text-[13px] font-semibold text-[var(--text-primary)]">
              {rating.toFixed(1)}
            </span>
            <span className="ml-1">rating</span>
          </span>
          <span className="text-[var(--text-quaternary)]">/</span>
          <span>
            <span className="tabular-nums text-[13px] font-semibold text-[var(--text-primary)]">
              {formatCount(count)}
            </span>
            <span className="ml-1">runs</span>
          </span>
          <span className="text-[var(--text-quaternary)]">/</span>
          <span>
            <span className="tabular-nums text-[13px] font-semibold text-[var(--text-primary)]">
              {passRate}%
            </span>
            <span className="ml-1">pass rate</span>
          </span>
        </div>

        {/* quote */}
        <p className="mt-7 max-w-[560px] text-[19px] leading-[1.55] text-[var(--text-primary)]">
          “{persona.one_liner}”
        </p>

        {/* tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {persona.tags.map((t) => (
            <span key={t} className="pill">
              {t}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={handleAccept} className="btn-primary">
            Choose this interviewer <ArrowRight size={14} />
          </button>
          <button type="button" onClick={handleCoffee} className="btn-ghost">
            或 Coffee Chat →
          </button>
        </div>
      </div>
    </section>
  )
}
