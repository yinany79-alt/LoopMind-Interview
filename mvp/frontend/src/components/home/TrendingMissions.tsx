/**
 * TrendingMissions — Faceup V3 「热门挑战」(精选 JD 网格)。
 *
 * 设计:
 * - 4 张 list-style 卡(横排,公司 logo 在左,信息在右)
 * - 没有卡片大色块,纯白底 + 1px 边
 * - 公司 logo + 岗位 + 城市 + 人数(JetBrains Mono)
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { CuratedJob } from '@/types/api'
import { fetchCuratedJobs } from '@/api/rest'
import BrandIcon from '@/components/icons/BrandIcon'

export default function TrendingMissions() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<CuratedJob[]>([])

  useEffect(() => {
    fetchCuratedJobs()
      .then((r) => setJobs(r.jobs.slice(0, 4)))
      .catch(() => undefined)
  }, [])

  if (jobs.length === 0) return null

  return (
    <section id="trending" className="mt-12 pt-6">
      <div className="hairline mb-6" />
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="section-eyebrow">trending · 热门挑战</div>
          <h2 className="section-title mt-2">真实岗位,真实追问</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/missions?type=trending')}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          See all <ArrowRight size={12} />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {jobs.map((j) => (
          <button
            key={j.id}
            type="button"
            onClick={() => navigate(`/missions?type=trending&job=${j.id}`)}
            className="card card-hover group flex items-start gap-3 p-4 text-left"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[6px] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              <BrandIcon slug={j.company_slug} size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[13px] font-semibold tracking-[-0.015em] text-[var(--text-primary)]">
                {j.title}
              </h3>
              <p className="mt-0.5 truncate text-[11px] text-[var(--text-tertiary)]">
                {j.company} · {j.location}
              </p>
              <p className="mt-2 font-mono text-[10px] tabular-nums text-[var(--text-quaternary)]">
                {j.challenged_count.toLocaleString()} runs
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
