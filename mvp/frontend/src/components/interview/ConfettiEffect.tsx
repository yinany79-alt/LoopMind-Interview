import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useInterviewStore } from '@/store/interviewStore'

const COLORS = ['#C96442', '#5C9A6F', '#C9A348', '#E8D5C9', '#1A1A1A']
const PIECE_COUNT = 22

export default function ConfettiEffect() {
  const pulse = useInterviewStore((s) => s.high_score_pulse)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!pulse) return
    setActive(true)
    const t = setTimeout(() => setActive(false), 2200)
    return () => clearTimeout(t)
  }, [pulse])

  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: PIECE_COUNT }).map((_, i) => {
        const left = (i / PIECE_COUNT) * 100 + (Math.random() * 6 - 3)
        const color = COLORS[i % COLORS.length]
        const w = 6 + Math.random() * 6
        const h = 10 + Math.random() * 14
        const delay = Math.random() * 0.25
        const rotateEnd = (Math.random() * 360 - 180).toFixed(0)
        return (
          <motion.span
            key={`${pulse}-${i}`}
            initial={{ y: -40, rotate: 0, opacity: 0 }}
            animate={{
              y: '110vh',
              rotate: Number(rotateEnd),
              opacity: [0, 1, 1, 0.85],
            }}
            transition={{ duration: 1.8 + Math.random() * 0.6, ease: 'easeIn', delay }}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: 0,
              width: w,
              height: h,
              background: color,
              borderRadius: 2,
            }}
          />
        )
      })}
    </div>
  )
}
