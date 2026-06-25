import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession } from '@/api/rest'
import { useInterviewStore } from '@/store/interviewStore'
import JDInputCard from '@/components/home/JDInputCard'
import HotJobsCard from '@/components/home/HotJobsCard'
import PersonaGalleryCard from '@/components/home/PersonaGalleryCard'
import HowItWorks from '@/components/home/HowItWorks'

export default function HomePage() {
  const navigate = useNavigate()
  const setSession = useInterviewStore((s) => s.setSession)
  const resetInterview = useInterviewStore((s) => s.resetInterview)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (jdText: string): Promise<void> => {
    setError(null)
    setLoading(true)
    try {
      resetInterview()
      const resp = await createSession({ jd_text: jdText })
      setSession(resp)
      navigate(`/prepare?sessionId=${encodeURIComponent(resp.session_id)}`)
    } catch (e) {
      const msg =
        typeof e === 'object' && e !== null && 'error' in e
          ? (e as { error: { message?: string } }).error?.message
          : null
      setError(msg ?? '解析 JD 失败,请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="pt-2">
        <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight">
          赛博面试官
          <span className="ml-2 text-base font-normal text-[var(--text-tertiary)]">
            对着 JD 来一场会追问到底的面试
          </span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          不是问问题,是把你的简历背诵打回原形。AI 会按这份 JD 的技能点逐项验真,
          直到逼出你真实的水位线。
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-[var(--bad)] bg-[var(--bad)]/10 px-4 py-2 text-sm text-[var(--bad)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="md:col-span-2">
          <JDInputCard loading={loading} onSubmit={handleSubmit} />
        </div>
        <div className="flex flex-col gap-5">
          <HotJobsCard />
          <PersonaGalleryCard />
        </div>
      </div>

      <HowItWorks />
    </div>
  )
}
