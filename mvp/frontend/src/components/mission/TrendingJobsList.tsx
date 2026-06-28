/**
 * TrendingJobsList — Mission 页 trending tab 内容。
 *
 * 显示 curated jobs 列表;点击后展开 JD 全文 + 确认按钮。
 */
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, Users } from 'lucide-react'
import type { CuratedJob, CuratedJobDetail } from '@/types/api'
import {
  fetchCuratedJobDetail,
  fetchCuratedJobs,
} from '@/api/rest'
import BrandIcon from '@/components/icons/BrandIcon'

interface Props {
  initialJobId?: string
  submitting: boolean
  onLaunch: (jobId: string) => void
}

export default function TrendingJobsList({
  initialJobId,
  submitting,
  onLaunch,
}: Props) {
  const [jobs, setJobs] = useState<CuratedJob[]>([])
  const [selected, setSelected] = useState<string | null>(initialJobId ?? null)
  const [detail, setDetail] = useState<CuratedJobDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    fetchCuratedJobs().then((r) => setJobs(r.jobs)).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!selected) {
      setDetail(null)
      return
    }
    setLoadingDetail(true)
    fetchCuratedJobDetail(selected)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false))
  }, [selected])

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1.2fr]">
      {/* 列表 */}
      <ul className="space-y-3">
        {jobs.map((j) => {
          const active = selected === j.id
          return (
            <li key={j.id}>
              <button
                type="button"
                onClick={() => setSelected(j.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]/30'
                    : 'border-[var(--border)] bg-white hover:border-[var(--text-tertiary)]'
                }`}
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--bg-tertiary)]">
                  <BrandIcon slug={j.company_slug} size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-semibold text-[var(--text-primary)]">
                    {j.title}
                  </h3>
                  <p className="mt-0.5 truncate text-[12px] text-[var(--text-tertiary)]">
                    {j.company}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--text-tertiary)]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} /> {j.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={11} /> {j.challenged_count.toLocaleString()}
                    </span>
                    <span className="text-amber-500">
                      {'★'.repeat(j.difficulty)}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {/* 详情 + 确认 */}
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid place-items-center rounded-2xl border border-dashed border-[var(--border)] p-10 text-center text-[14px] text-[var(--text-tertiary)]"
          >
            选一个岗位 →
          </motion.div>
        ) : (
          <motion.section
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card flex flex-col p-5"
          >
            {loadingDetail || !detail ? (
              <div className="grid h-40 place-items-center text-[var(--text-tertiary)]">
                加载中…
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <BrandIcon
                    slug={detail.company_slug}
                    size={18}
                    className="text-[var(--text-secondary)]"
                  />
                  <span className="text-[13px] font-medium text-[var(--text-secondary)]">
                    {detail.company}
                  </span>
                  <span className="text-[var(--text-quaternary)]">·</span>
                  <span className="text-[13px] text-[var(--text-tertiary)]">
                    {detail.location}
                  </span>
                  <span className="ml-auto text-[12px] text-[var(--text-tertiary)]">
                    {detail.salary_range}
                  </span>
                </div>
                <h3 className="text-[20px] font-semibold text-[var(--text-primary)]">
                  {detail.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {detail.tags.map((t) => (
                    <span key={t} className="pill">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 max-h-[260px] overflow-y-auto rounded-xl border border-[var(--divider)] bg-[var(--bg-tertiary)]/30 p-3 font-mono text-[12px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
                  {detail.jd_text}
                </div>
                <button
                  type="button"
                  onClick={() => onLaunch(detail.id)}
                  disabled={submitting}
                  className="btn-primary mt-4 w-full"
                >
                  {submitting ? '正在创建会话…' : '用这份 JD 开始'} <ArrowRight size={14} />
                </button>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
