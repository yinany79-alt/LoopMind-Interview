import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useInterviewStore } from '@/store/interviewStore'

/** 当 min_topics_reached=true 后,弹一次 toast,4 秒后消失 */
export default function MinReachedToast() {
  const min = useInterviewStore((s) => s.min_topics_reached)
  const covered = useInterviewStore((s) => s.topics_covered_count)
  const [show, setShow] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (min && !shown) {
      setShow(true)
      setShown(true)
      const t = setTimeout(() => setShow(false), 4500)
      return () => clearTimeout(t)
    }
  }, [min, shown])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed left-1/2 top-20 z-30 -translate-x-1/2"
        >
          <div className="rounded-full border border-[var(--good)] bg-white px-4 py-2 text-sm shadow-md">
            ✅ 已答 {covered} 题,达到结束门槛 — 可以随时结束面试
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
