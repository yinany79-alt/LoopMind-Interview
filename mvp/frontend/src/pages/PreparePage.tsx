import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInterviewStore } from '@/store/interviewStore'
import { fetchPersonas, startSession } from '@/api/rest'
import type { Persona, PersonaDimensions } from '@/types/api'
import JDSummaryCard from '@/components/prepare/JDSummaryCard'
import PersonaCardPicker from '@/components/prepare/PersonaCardPicker'
import PersonaSliders from '@/components/prepare/PersonaSliders'
import ResumePlaceholder from '@/components/prepare/ResumePlaceholder'

function jitter(d: PersonaDimensions): PersonaDimensions {
  const j = (n: number): number => {
    const v = n + Math.floor(Math.random() * 31) - 15 // ±15
    return Math.max(0, Math.min(100, v))
  }
  return {
    warmth: j(d.warmth),
    depth_preference: j(d.depth_preference),
    pace: j(d.pace),
    vision: j(d.vision),
  }
}

export default function PreparePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const sessionId = params.get('sessionId')
  const initialPersonaParam = params.get('persona')

  const sessionInStore = useInterviewStore((s) => s.session_id)
  const jd_summary = useInterviewStore((s) => s.jd_summary)
  const skill_tree = useInterviewStore((s) => s.skill_tree)
  const dimensions = useInterviewStore((s) => s.dimensions)
  const setDimensions = useInterviewStore((s) => s.setDimensions)
  const setPersona = useInterviewStore((s) => s.setPersona)
  const setEffectiveCardId = useInterviewStore((s) => s.setEffectiveCardId)
  const effective_card_id = useInterviewStore((s) => s.effective_card_id)
  const selected_persona = useInterviewStore((s) => s.selected_persona)

  const [personas, setPersonas] = useState<Persona[]>([])
  const [randomResolved, setRandomResolved] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 没有 session 上下文,弹回首页
  useEffect(() => {
    if (!sessionId && !sessionInStore) {
      navigate('/', { replace: true })
    }
  }, [sessionId, sessionInStore, navigate])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { personas } = await fetchPersonas()
        if (cancelled) return
        setPersonas(personas)
        // 优先级:URL ?persona= > 已有 selected_persona > 第一张卡片
        const targetId = initialPersonaParam ?? selected_persona?.id ?? personas[0].id
        const target = personas.find((p) => p.id === targetId) ?? personas[0]
        setPersona(target)
      } catch (e) {
        if (cancelled) return
        setError('加载面试官失败')
        console.error(e)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = (p: Persona, mode: 'card' | 'random'): void => {
    setPersona(p)
    if (mode === 'random') {
      setRandomResolved(p.id)
      setDimensions(jitter(p.default_dimensions))
      setEffectiveCardId(p.id)
    } else {
      setRandomResolved(null)
    }
  }

  const startable = useMemo(
    () => !!effective_card_id && !!sessionInStore,
    [effective_card_id, sessionInStore],
  )

  const handleStart = async (): Promise<void> => {
    if (!sessionInStore || !effective_card_id) return
    setError(null)
    setLoading(true)
    try {
      await startSession(sessionInStore, {
        persona: { card_id: effective_card_id, dimensions },
      })
      navigate(`/interview/${sessionInStore}`)
    } catch (e) {
      const msg =
        typeof e === 'object' && e !== null && 'error' in e
          ? (e as { error: { message?: string } }).error?.message
          : null
      setError(msg ?? '启动面试失败,请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">准备出场</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          挑一位面试官,微调他/她的人格参数。这些参数会注入到 Interviewer
          和 Evaluator 的 prompt 里,真的会影响追问风格。
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-[var(--bad)] bg-[var(--bad)]/10 px-4 py-2 text-sm text-[var(--bad)]">
          {error}
        </div>
      )}

      {jd_summary && skill_tree && (
        <JDSummaryCard jd_summary={jd_summary} skill_tree={skill_tree} />
      )}

      {personas.length > 0 && (
        <>
          <PersonaCardPicker
            personas={personas}
            selectedId={effective_card_id}
            randomResolved={randomResolved}
            onSelect={handleSelect}
          />

          {selected_persona && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]/60 p-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">
                {selected_persona.name}:
              </span>{' '}
              {selected_persona.description}
            </div>
          )}

          <PersonaSliders values={dimensions} onChange={setDimensions} />
        </>
      )}

      <ResumePlaceholder />

      <motion.button
        type="button"
        onClick={handleStart}
        disabled={!startable || loading}
        whileTap={{ scale: 0.97 }}
        className="btn-primary mx-auto px-10 py-3 text-base"
      >
        {loading ? '准备入场…' : '开始面试 →'}
      </motion.button>
    </div>
  )
}
