/**
 * AchievementCard — Home 右下"最高成就"卡。
 *
 * 设计:大图标 + "击败 Kai Chen" + "超过 85% 的用户"。
 * 真数据从 JourneyStats.defeated[0]; 空时显示"开启你的第一次挑战"。
 */
import { useEffect, useState } from 'react'
import { Trophy, ChevronRight } from 'lucide-react'
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
      <header className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display text-[18px] font-semibold tracking-tighter text-[var(--text-primary)]">
          最高成就
        </h3>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--text-quaternary)]"
        >
          查看全部 <ChevronRight size={12} />
        </button>
      </header>

      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-500">
          <Trophy size={26} />
        </div>
        <div>
          {defeated ? (
            <>
              <div className="text-[20px] font-semibold text-[var(--text-primary)]">
                击败 {defeated}
              </div>
              <div className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                超过 85% 的用户。
              </div>
            </>
          ) : (
            <>
              <div className="text-[16px] font-semibold text-[var(--text-primary)]">
                开启你的第一次挑战
              </div>
              <div className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                选一位面试官,接受挑战。
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
