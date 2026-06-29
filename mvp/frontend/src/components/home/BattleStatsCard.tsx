/**
 * BattleStatsCard — Faceup V3「我的战绩」(含雷达图,参考 image.png 设计图)。
 *
 * 设计:
 * - 左侧:Lv + 3 个 stat 数字
 * - 右侧:小型 RadarChart(5 维)
 * - 数字用 tabular-nums + JetBrains Mono
 */
import { useEffect, useState } from 'react'
import type { JourneyStats } from '@/types/api'
import { fetchJourneyStats } from '@/api/rest'
import RadarChart from '@/components/common/RadarChart'

// 静态雷达维度(等真数据接入后从历史 evaluator 聚合)
const STATIC_RADAR = [
  { label: '逻辑', value: 78 },
  { label: '深度', value: 65 },
  { label: '表达', value: 72 },
  { label: '原理', value: 55 },
  { label: '落地', value: 80 },
]

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
      {/* 左:Lv + stats */}
      <div className="flex-1">
        <header className="font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
          battle record · 我的战绩
        </header>

        <div className="mt-3 grid grid-cols-4 gap-3">
          <Stat label="LEVEL" value={`Lv.${data.level}`} highlight />
          <Stat label="RUNS" value={String(data.total)} />
          <Stat label="WINS" value={String(data.passed)} />
          <Stat label="AVG" value={String(data.avg_score)} />
        </div>

        <p className="mt-3 font-mono text-[10px] tabular-nums uppercase tracking-[0.04em] text-[var(--text-quaternary)]">
          last updated · just now
        </p>
      </div>

      {/* 右:小雷达 */}
      <div className="hidden shrink-0 sm:block">
        <RadarChart data={STATIC_RADAR} size={120} showLabels={false} />
      </div>
    </article>
  )
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <div
        className="font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--text-tertiary)]"
        style={{ fontSize: 10 }}
      >
        {label}
      </div>
      <div
        className={`mt-1 font-semibold tabular-nums ${
          highlight ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
        }`}
        style={{
          fontSize: 22,
          letterSpacing: '-0.025em',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </div>
    </div>
  )
}
