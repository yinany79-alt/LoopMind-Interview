/**
 * MissionHeader — Mission 页顶部"已选面试官"条 + 主标题。
 */
import type { Persona } from '@/types/api'
import BrandIcon from '@/components/icons/BrandIcon'

interface Props {
  challenger: Persona
}

export default function MissionHeader({ challenger }: Props) {
  return (
    <header className="mb-8 text-center">
      <h1 className="font-display text-[36px] font-semibold tracking-tightest text-[var(--text-primary)]">
        选择挑战任务
      </h1>
      <p className="mt-2 text-[14px] text-[var(--text-tertiary)]">
        选择一个任务,开始你的面试挑战
      </p>

      {/* 已选面试官 */}
      <div className="mx-auto mt-5 inline-flex items-center gap-3 rounded-full border border-[var(--divider)] bg-white px-4 py-2">
        <div className="h-7 w-7 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
          <img
            src={challenger.avatar}
            alt={challenger.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
        <span className="text-[13px] text-[var(--text-secondary)]">
          已选 ·
          <span className="ml-1 font-semibold text-[var(--text-primary)]">
            {challenger.name}
          </span>
          <span className="ml-1 text-[var(--text-tertiary)]">
            {challenger.role_title}
          </span>
        </span>
        {challenger.affiliation_slug && (
          <BrandIcon
            slug={challenger.affiliation_slug}
            size={14}
            className="text-[var(--text-tertiary)]"
          />
        )}
      </div>
    </header>
  )
}
