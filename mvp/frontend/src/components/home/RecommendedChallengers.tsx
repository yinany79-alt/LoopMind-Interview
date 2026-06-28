/**
 * RecommendedChallengers — Home 推荐面试官 section。
 *
 * 设计图同时出 Mentor 4 张 + Leader 4 张,两个 section。
 * 本组件:推荐面试官(4 张 = mentor 优先 + 1 legend)。
 */
import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { Persona } from '@/types/api'
import { fetchRecommendedChallengers } from '@/api/rest'
import ChallengerCard from './ChallengerCard'

interface Props {
  /** 同时拉真实人数(可选,本期由 Home 顶层挑战计数注入) */
  fallbackCounts?: Record<string, number>
}

export default function RecommendedChallengers({ fallbackCounts = {} }: Props) {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendedChallengers(4)
      .then((r) => setPersonas(r.personas))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="challengers" className="mt-10">
      <header className="mb-5 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-[24px] font-semibold tracking-tighter text-[var(--text-primary)]">
            推荐面试官
          </h2>
          <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
            Character First · 选择风格,先于选择岗位
          </p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-quaternary)]"
          title="即将上线"
        >
          查看全部 <ChevronRight size={14} />
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-6 text-center text-sm text-[var(--bad)]">
          推荐拉取失败:{error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="card h-[280px] animate-pulse bg-[var(--bg-tertiary)]/60"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
