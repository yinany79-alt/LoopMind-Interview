/**
 * RecommendedChallengers — Faceup V3「推荐面试官」section。
 *
 * 设计:
 * - Section header 用 mono eyebrow + 大标题 + 右侧"See all →" link
 * - 4 张卡(用新 ChallengerCard,纯白底 + 1px 边 + Avatar + quote)
 * - hairline 上分隔
 */
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Persona } from '@/types/api'
import { fetchRecommendedChallengers } from '@/api/rest'
import ChallengerCard from './ChallengerCard'

interface Props {
  fallbackCounts?: Record<string, number>
}

export default function RecommendedChallengers({ fallbackCounts = {} }: Props) {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendedChallengers(4)
      .then((r) => setPersonas(r.personas))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="challengers" className="mt-12 pt-6">
      <div className="hairline mb-6" />
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="section-eyebrow">recommended · 推荐面试官</div>
          <h2 className="section-title mt-2">选一位你愿意被挑战的人</h2>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--text-quaternary)]"
          title="即将上线"
        >
          See all <ArrowRight size={12} />
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-2xl bg-[var(--bg-tertiary)]/60"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {personas.map((p) => (
            <ChallengerCard
              key={p.id}
              persona={p}
              challengeCount={fallbackCounts[p.id]}
            />
          ))}
        </div>
      )}
    </section>
  )
}
