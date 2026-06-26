import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import {
  interviewerEmojiOf,
  satisfactionBarColor,
  useInterviewStore,
} from '@/store/interviewStore'

interface Props {
  onEndClick: () => void
}

export default function InterviewerHeader({ onEndClick }: Props) {
  const selectedPersona = useInterviewStore((s) => s.selected_persona)
  const satisfaction = useInterviewStore((s) => s.satisfaction)
  const interviewerState = useInterviewStore((s) => s.interviewer_state)
  const topicsCovered = useInterviewStore((s) => s.topics_covered_count)
  const redFlagPulse = useInterviewStore((s) => s.red_flag_pulse)
  const brightSpotPulse = useInterviewStore((s) => s.bright_spot_pulse)
  const lowPulse = useInterviewStore((s) => s.low_score_pulse)

  const emoji = interviewerEmojiOf(satisfaction)
  const barTone = satisfactionBarColor(satisfaction)
  const personaName = selectedPersona?.name ?? '面试官'

  const [redBadge, setRedBadge] = useState(false)
  const [brightBadge, setBrightBadge] = useState(false)
  useEffect(() => {
    if (!redFlagPulse) return
    setRedBadge(true)
    const t = setTimeout(() => setRedBadge(false), 1500)
    return () => clearTimeout(t)
  }, [redFlagPulse])
  useEffect(() => {
    if (!brightSpotPulse) return
    setBrightBadge(true)
    const t = setTimeout(() => setBrightBadge(false), 1500)
    return () => clearTimeout(t)
  }, [brightSpotPulse])

  return (
    <div className="card flex items-center gap-5 p-4">
      <motion.div
        animate={
          lowPulse
            ? { x: [-3, 3, -3, 3, 0] }
            : redBadge
              ? { rotate: [0, -4, 4, -2, 0] }
              : { x: 0, rotate: 0 }
        }
        key={lowPulse || redFlagPulse}
        transition={{ duration: 0.45 }}
        className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--bg-tertiary)] text-[40px] leading-none"
      >
        <span aria-label="interviewer-mood">{emoji}</span>
        {interviewerState.state_id !== 'idle' && (
          <motion.span
            aria-hidden
            className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_0_2px_var(--bg-secondary)]"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <AnimatePresence>
          {redBadge && (
            <motion.span
              key="red"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-[var(--bad)] text-xs text-white shadow-sm"
            >
              ❗
            </motion.span>
          )}
          {brightBadge && (
            <motion.span
              key="bright"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-[var(--good)] text-xs text-white shadow-sm"
            >
              ✨
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-base font-semibold leading-tight">
            {personaName}
          </h2>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={interviewerState.state_id + interviewerState.state_text}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
              className={clsx(
                'flex items-center gap-1',
                interviewerState.state_id === 'idle'
                  ? 'text-sm text-[var(--text-tertiary)]'
                  : 'text-sm font-medium text-emerald-600',
              )}
            >
              <span>{interviewerState.state_text}</span>
              {interviewerState.state_id !== 'idle' && (
                <span className="inline-flex gap-0.5" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1 w-1 rounded-full bg-emerald-500"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{
                        duration: 1.1,
                        repeat: Infinity,
                        delay: i * 0.18,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </span>
              )}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
            <motion.div
              animate={{ width: `${Math.max(0, Math.min(100, satisfaction))}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={clsx(
                'h-full rounded-full',
                barTone === 'good' && 'bg-[var(--good)]',
                barTone === 'mid' && 'bg-[var(--mid)]',
                barTone === 'bad' && 'bg-[var(--bad)]',
              )}
            />
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">
            当前轮 {topicsCovered} / 至少 5
          </span>
        </div>
      </div>

      <button type="button" onClick={onEndClick} className="btn-secondary">
        结束面试
      </button>
    </div>
  )
}
