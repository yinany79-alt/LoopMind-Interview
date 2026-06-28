/**
 * BattleStatsCard — Home "我的战绩" 卡。
 *
 * 设计:Lv.7 进阶中 + 小雷达 + 52次/18胜/87分(4 列)。
 * 数据从 GET /api/history/stats(真数据,空 DB 时全 0)。
 */
import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import type { JourneyStats } from '@/types/api'
import { fetchJourneyStats } from '@/api/rest'

export default function BattleStatsCard() {
  const [stats, setStats] = useState<JourneyStats | null>(null)

  useEffect(() => {
    fetchJourneyStats()
      .then(setStats)
      .catch(() => undefined)
  }, [])

  const data = stats ?? { level: 1, total: 0, passed: 0, avg_score: 0, defeated: [] }

  return (
    <article className="card flex items-center gap-5 p-5">
      {/* 左:Lv */}
      <div className="shrink-0 rounded-2xl bg-gradient-to-br from-[#eff4ff] to-[#dbe7ff] px-4 py-3 text-center">
        <div className="font-display text-[28px] font-bold leading-none text-[var(--accent)]">
          Lv.{data.level}
        </div>
        <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-[var(--accent)]">
          <TrendingUp size={10} /> 进阶中
        </div>
      </div>

      {/* 中:统计列 */}
      <div className="flex flex-1 items-end justify-around">
        <Stat label="面试次数" value={data.total} />
        <Stat label="胜利次数" value={data.passed} accent />
        <Stat label="平均分" value={data.avg_score} />
      </div>
    </article>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="text-center">
      <div
        className={`font-display text-[28px] font-bold leading-none ${
          accent ? 'text-[var(--score)]' : 'text-[var(--text-primary)]'
        }`}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-[var(--text-tertiary)]">{label}</div>
    </div>
  )
}
