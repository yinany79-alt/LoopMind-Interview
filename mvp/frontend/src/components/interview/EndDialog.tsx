import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  open: boolean
  topicsCovered: number
  onContinue: () => void
  onConfirmEnd: () => void
}

export default function EndDialog({
  open,
  topicsCovered,
  onContinue,
  onConfirmEnd,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 grid place-items-center bg-black/30 backdrop-blur-sm"
          onClick={onContinue}
        >
          <motion.div
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="card mx-4 w-full max-w-md p-6"
          >
            <h3 className="font-serif text-lg font-semibold">
              您还没回答完 5 道题
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              当前已答 <b>{topicsCovered}</b> 题。评分需要至少 5 题以覆盖
              5 个维度,现在结束的话评估数据会比较单薄。
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onConfirmEnd}
                className="btn-secondary"
              >
                仍然结束
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="btn-primary"
              >
                继续面试
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
