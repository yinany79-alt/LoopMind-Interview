/**
 * LegendGrid — Faceup V3「大佬挑战」section。
 */
import { useEffect, useState } from 'react'
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
    <section className="mt-12 pt-6">
      <div className="hairline mb-6" />
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="section-eyebrow">leader challenge · 大佬挑战</div>
          <h2 className="section-title mt-2">直面行业最锋利的头脑</h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--text-quaternary)]">
          {legends.length} legends
        </span>
      </header>

      <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {legends.map((p) => (
          <ChallengerCard key={p.id} persona={p} />
        ))}
      </div>
    </section>
  )
}
