/**
 * LegendGrid — Home 大佬挑战 section。
 *
 * 设计图:5 张大佬卡 + 第一张(Kai Chen)是 featured 主推。
 * 本期:5 张并列(legend tier 全部展示),都用 ChallengerCard 通用样式。
 */
import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { Persona } from '@/types/api'
import { fetchPersonas } from '@/api/rest'
import ChallengerCard from './ChallengerCard'

export default function LegendGrid() {
  const [legends, setLegends] = useState<Persona[]>([])

  useEffect(() => {
    fetchPersonas()
      .then((r) => setLegends(r.personas.filter((p) => p.tier === 'legend')))
      .catch(() => undefined)
  }, [])

  if (legends.length === 0) return null

  return (
    <section className="mt-10">
      <header className="mb-5 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-[24px] font-semibold tracking-tighter text-[var(--text-primary)]">
            大佬挑战
          </h2>
          <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
            Leader Challenge · 直面行业顶尖
          </p>
        </div>
        <span className="text-[13px] text-[var(--text-quaternary)]">
          {legends.length} 位大佬可挑战
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {legends.map((p) => (
          <ChallengerCard key={p.id} persona={p} />
        ))}
      </div>
    </section>
  )
}
