/**
 * AchievementCard — Faceup V3「最高成就」(无 emoji)。
 */
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { fetchJourneyStats } from '@/api/rest'

export default function AchievementCard() {
  const [defeated, setDefeated] = useState<string | null>(null)

  useEffect(() => {
    fetchJourneyStats()
      .then((s) => {
        if (s.defeated.length > 0) setDefeated(s.defeated[0])
      })
      .catch(() => undefined)
  }, [])

  return (
    <article className="card p-6">
      <header className="mb-5">
        <div className="section-eyebrow">your peak · 最高成就</div>
        <h3 className="section-title mt-2">
          {defeated ? `Beat ${defeated}` : '尚未开始'}
        </h3>
      </header>

      {defeated ? (
        <>
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
            一个把你按在椅子上追问 40 分钟的人，被你说服了。
            <br />
            你超过 85% 的用户。
          </p>
          <button
            type="button"
            disabled
            className="mt-5 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--text-quaternary)]"
          >
            查看全部成就 <ArrowRight size={12} />
          </button>
        </>
      ) : (
        <>
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
            完成第一场挑战,这里会记下你击败的第一位面试官。
          </p>
          <button
            type="button"
            onClick={() => {
              document
                .getElementById('challengers')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="mt-5 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--ink)]"
          >
            选一位面试官 <ArrowRight size={12} />
          </button>
        </>
      )}
    </article>
  )
}
