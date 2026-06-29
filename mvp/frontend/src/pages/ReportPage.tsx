/**
 * ReportPage — Cyber Interview V2 Growth Report 4 列版。
 *
 * 设计图 image.png Page 6:
 * - 顶部 < 返回 + 分享 + 下载
 * - 4 列:综合评分 | 各项能力评估 | 本次表现亮点 | 改进建议
 * - 底部:Topic 重放(沿用旧组件)
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import { fetchReport } from '@/api/rest'
import type { Report } from '@/types/api'
import { useInterviewStore } from '@/store/interviewStore'
import ScoreColumn from '@/components/report/ScoreColumn'
import DimensionEvalColumn from '@/components/report/DimensionEvalColumn'
import HighlightsColumn from '@/components/report/HighlightsColumn'
import SuggestionsColumn from '@/components/report/SuggestionsColumn'
import TopicReplay from '@/components/report/TopicReplay'

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
        <h2 className="text-lg font-semibold">{error}</h2>
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
      <div className="space-y-4">
        <SkeletonBlock height={70} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <SkeletonBlock height={260} />
          <SkeletonBlock height={260} />
          <SkeletonBlock height={260} />
          <SkeletonBlock height={260} />
        </div>
        <p className="pt-2 text-center text-xs text-[var(--text-tertiary)]">
          报告生成中,约 5 秒…
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 顶部 bar */}
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            resetInterview()
            navigate('/')
          }}
          className="btn-ghost"
        >
          <ArrowLeft size={14} /> 返回
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => alert('分享功能即将上线')}
            className="btn-ghost"
          >
            <Share2 size={14} /> 分享报告
          </button>
          <button
            type="button"
            onClick={() => alert('下载功能即将上线')}
            className="btn-ghost"
          >
            <Download size={14} /> 下载报告
          </button>
        </div>
      </header>

      {/* 主标题 */}
      <div>
        <div className="section-eyebrow">growth report · 成长报告</div>
        <h1
          className="mt-3 font-display text-[var(--text-primary)]"
          style={{
            fontSize: 'clamp(36px, 4vw, 48px)',
            lineHeight: 1.1,
            letterSpacing: '-0.035em',
            fontWeight: 500,
          }}
        >
          这一场，你做得如何。
        </h1>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
          generated · {report.generated_at}
        </p>
      </div>

      {/* 4 列 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ScoreColumn report={report} />
        <DimensionEvalColumn report={report} />
        <HighlightsColumn report={report} />
        <SuggestionsColumn report={report} />
      </div>

      {/* Topic 重放(可选) */}
      {report.topic_replays && report.topic_replays.length > 0 && (
        <TopicReplay replays={report.topic_replays} />
      )}

      {/* 底部按钮区 */}
      <div className="card mt-2 flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-[12px] text-[var(--text-tertiary)]">
          想要更多挑战?选位新面试官再来一次。
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              resetInterview()
              navigate('/')
            }}
          >
            重新挑战
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
      className="card animate-pulse bg-[var(--bg-tertiary)]/60"
      style={{ height }}
    />
  )
}
