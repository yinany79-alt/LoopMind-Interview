/**
 * TrendingMissions — Home 热门挑战 section(curated jobs 4 张)。
 *
 * 设计:小卡 = 公司 logo + 岗位名 + 公司 + N 人挑战。
 * 点 → 跳 /missions?type=trending&job={id} (Mission 页打开对应 JD)
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Users } from 'lucide-react'
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
    <section id="trending" className="mt-10">
      <header className="mb-5 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-[24px] font-semibold tracking-tighter text-[var(--text-primary)]">
            热门挑战
          </h2>
          <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
            Trending Missions · 行业真实岗位
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/missions?type=trending')}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
        >
          查看全部 <ChevronRight size={14} />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {jobs.map((j) => (
          <motion.button
            key={j.id}
            type="button"
            onClick={() => navigate(`/missions?type=trending&job=${j.id}`)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="card card-hover flex items-center gap-3 p-4 text-left"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              <BrandIcon slug={j.company_slug} size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[14px] font-semibold text-[var(--text-primary)]">
                {j.title}
              </h3>
              <p className="mt-0.5 truncate text-[12px] text-[var(--text-tertiary)]">
                {j.company}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
                <Users size={10} /> {j.challenged_count.toLocaleString()} 人挑战
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
