/**
 * MissionPage — /missions 任务选择页。
 *
 * URL 参数:
 * - challenger=:id   已选好的面试官(从 ChallengerDetail 跳过来)
 * - type=trending|jd|coffee  默认 tab(从 Home Mission 卡跳过来)
 * - job=:id          直接选了某个 curated job(从 Home Trending 跳过来)
 *
 * 三种 mode 流程:
 * - trending → 列出 curated jobs,点选 → 显示 JD 全文 → 接受 → createSession(curated)
 * - jd       → 显示 textarea → 提交 → createSession(jd_paste)
 * - coffee   → 一段说明 + 直接开始 → createSession(coffee_chat)
 *
 * 全部需要先有 challenger,如果 url 没带就提示先去 / 选人。
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { Persona, SessionMode } from '@/types/api'
import {
  createSession,
  fetchPersonas,
  startSession,
} from '@/api/rest'
import { useInterviewStore } from '@/store/interviewStore'
import MissionHeader from '@/components/mission/MissionHeader'
import MissionTypeTabs from '@/components/mission/MissionTypeTabs'
import TrendingJobsList from '@/components/mission/TrendingJobsList'
import MyJDInput from '@/components/mission/MyJDInput'
import CoffeeChatStart from '@/components/mission/CoffeeChatStart'

type TabType = 'trending' | 'jd' | 'coffee'

export default function MissionPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const challengerId = params.get('challenger')
  const initialType = (params.get('type') as TabType) || 'trending'
  const initialJobId = params.get('job') || undefined

  const setSession = useInterviewStore((s) => s.setSession)
  const setPersona = useInterviewStore((s) => s.setPersona)
  const resetInterview = useInterviewStore((s) => s.resetInterview)

  const [personas, setPersonas] = useState<Persona[]>([])
  const [type, setType] = useState<TabType>(initialType)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPersonas().then((r) => setPersonas(r.personas))
  }, [])

  const challenger = useMemo(
    () => personas.find((p) => p.id === challengerId) ?? null,
    [personas, challengerId],
  )

  // 没选 challenger,引导回首页
  if (!challengerId) {
    return (
      <div className="grid h-[50vh] place-items-center text-center">
        <div>
          <p className="text-[var(--text-secondary)]">
            请先选一位面试官,再选择挑战任务。
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-primary mt-4"
          >
            去选面试官
          </button>
        </div>
      </div>
    )
  }

  if (!challenger) {
    return (
      <div className="grid h-[50vh] place-items-center text-[var(--text-tertiary)]">
        加载面试官中…
      </div>
    )
  }

  // 统一的 session 创建 + start + 跳转
  const launch = async (
    mode: SessionMode,
    payload: { jd_text?: string; curated_job_id?: string },
  ): Promise<void> => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      resetInterview()
      const resp = await createSession({ mode, ...payload })
      setSession(resp)
      setPersona(challenger)
      // start 接口确认 persona
      await startSession(resp.session_id, {
        persona: {
          card_id: challenger.id,
          dimensions: challenger.default_dimensions,
        },
      })
      navigate(`/interview/${resp.session_id}`)
    } catch (e) {
      const msg =
        typeof e === 'object' && e !== null && 'error' in e
          ? (e as { error: { message?: string } }).error?.message
          : String(e)
      setError(msg ?? '创建会话失败,请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn-ghost mb-6"
      >
        <ArrowLeft size={16} /> 返回
      </button>

      <MissionHeader challenger={challenger} />

      <MissionTypeTabs current={type} onChange={setType} />

      {error && (
        <div className="mt-4 rounded-xl border border-[var(--bad)]/30 bg-[var(--bad)]/5 px-4 py-3 text-sm text-[var(--bad)]">
          {error}
        </div>
      )}

      <div className="mt-6">
        {type === 'trending' && (
          <TrendingJobsList
            initialJobId={initialJobId}
            submitting={submitting}
            onLaunch={(jobId) => launch('curated', { curated_job_id: jobId })}
          />
        )}
        {type === 'jd' && (
          <MyJDInput
            submitting={submitting}
            onLaunch={(jdText) => launch('jd_paste', { jd_text: jdText })}
          />
        )}
        {type === 'coffee' && (
          <CoffeeChatStart
            challenger={challenger}
            submitting={submitting}
            onLaunch={() => launch('coffee_chat', {})}
          />
        )}
      </div>
    </div>
  )
}
