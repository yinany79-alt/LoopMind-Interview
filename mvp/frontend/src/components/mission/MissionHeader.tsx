/**
 * MissionHeader — Faceup V3.1 Mission 页顶部(Linear-tier)。
 *
 * 设计:eyebrow + 短标题 + 左对齐 + Avatar chip
 */
import type { Persona } from '@/types/api'
import Avatar from '@/components/common/Avatar'
import BrandIcon from '@/components/icons/BrandIcon'

interface Props {
  challenger: Persona
}

export default function MissionHeader({ challenger }: Props) {
  return (
    <header className="mb-10">
      <div className="section-eyebrow">step 2 · choose your mission</div>

      <h1
        className="mt-3 font-display text-[var(--text-primary)]"
        style={{
          fontSize: 'clamp(32px, 4vw, 44px)',
          lineHeight: 1.1,
          letterSpacing: '-0.035em',
          fontWeight: 500,
        }}
      >
        今天用什么挑战他?
      </h1>

      {/* 已选面试官 chip */}
      <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-[var(--divider)] bg-white px-3 py-1.5">
        <Avatar name={challenger.name} src={challenger.avatar} size={22} />
        <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
          interviewer
        </span>
        <span className="text-[var(--text-quaternary)]">·</span>
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">
          {challenger.name}
        </span>
        <span className="text-[12px] text-[var(--text-tertiary)]">
          {challenger.role_title}
        </span>
        {challenger.affiliation_slug && (
          <BrandIcon
            slug={challenger.affiliation_slug}
            size={12}
            className="text-[var(--text-quaternary)]"
          />
        )}
      </div>
    </header>
  )
}
