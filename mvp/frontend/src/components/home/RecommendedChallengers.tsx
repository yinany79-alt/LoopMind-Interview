/**
 * RecommendedChallengers — Faceup V5「导师模式」section(只拉 mentor tier)。
 *
 * 设计:
 * - 4 张 MentorCard(圆头像 + 名字 + role + 标签),视觉比下方 LegendGrid 轻
 * - 标题改"导师模式"(对应英文 mentor mode),mono eyebrow + 中文大标题
 * - hairline 上分隔
 */
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Persona } from '@/types/api'
import { fetchPersonas } from '@/api/rest'
import MentorCard from './MentorCard'

export default function RecommendedChallengers() {
  const [mentors, setMentors] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPersonas()
      .then((r) => setMentors(r.personas.filter((p) => p.tier === 'mentor')))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="challengers" className="mt-12 pt-6">
      <div className="hairline mb-6" />
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="section-eyebrow">mentor mode · 导师模式</div>
          <h2 className="section-title mt-2">先和 4 位 mentor 练手</h2>
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[300px] animate-pulse rounded-2xl bg-[var(--bg-tertiary)]/60"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mentors.map((p) => (
            <MentorCard key={p.id} persona={p} />
          ))}
        </div>
      )}
    </section>
  )
}
