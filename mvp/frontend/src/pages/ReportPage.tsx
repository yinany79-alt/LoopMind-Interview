import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchReport } from '@/api/rest'
import type { Report } from '@/types/api'
import ScoreHeader from '@/components/report/ScoreHeader'
import DimensionRadar from '@/components/report/DimensionRadar'
import CommentList from '@/components/report/CommentList'
import TopicReplay from '@/components/report/TopicReplay'
import { useInterviewStore } from '@/store/interviewStore'

const POLL_INTERVAL_MS = 2000
const POLL_MAX_MS = 30000

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const resetInterview = useInterviewStore((s) => s.resetInterview)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pollStart] = useState(() => Date.now())

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    const tick = async (): Promise<void> => {
      try {
        const r = await fetchReport(sessionId)
        if (cancelled) return
        setReport(r)
        if (r.status === 'ready') return
        if (r.status === 'failed') {
          setError('报告生成失败,请稍后重试')
          return
        }
        if (Date.now() - pollStart > POLL_MAX_MS) {
          setError('报告生成超时(>30 秒)')
          return
        }
        setTimeout(tick, POLL_INTERVAL_MS)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('获取报告失败')
      }
    }
    void tick()

    return () => {
      cancelled = true
    }
  }, [sessionId, pollStart])

  if (error) {
    return (
      <div className="card mx-auto max-w-2xl p-8 text-center">
        <div className="text-2xl">⚠️</div>
        <h2 className="mt-2 font-serif text-lg">{error}</h2>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-primary mt-4"
        >
          回首页
        </button>
      </div>
    )
  }

  if (!report || report.status === 'generating') {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <SkeletonBlock height={170} />
        <SkeletonBlock height={320} />
        <SkeletonBlock height={140} />
        <SkeletonBlock height={240} />
        <p className="text-center text-xs text-[var(--text-tertiary)]">
          报告生成中,大约 5 秒…
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      {report.verdict && (
        <ScoreHeader
          verdict={report.verdict}
          below_minimum={report.below_minimum ?? false}
        />
      )}
      {report.dimension_scores && (
        <DimensionRadar scores={report.dimension_scores} />
      )}
      {report.comments && <CommentList comments={report.comments} />}
      {report.topic_replays && <TopicReplay replays={report.topic_replays} />}

      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="text-xs text-[var(--text-tertiary)]">
          报告生成时间:{report.generated_at}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => alert('分享功能下一版本开放')}
          >
            分享报告
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              resetInterview()
              navigate('/')
            }}
          >
            重新面试
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            回首页
          </button>
        </div>
      </div>
    </div>
  )
}

function SkeletonBlock({ height }: { height: number }) {
  return (
    <div
      className="card animate-pulse bg-[var(--bg-tertiary)]/70"
      style={{ height }}
    />
  )
}
