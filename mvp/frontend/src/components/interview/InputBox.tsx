import { useState, type KeyboardEvent } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

interface Props {
  disabled?: boolean
  onSubmit: (text: string) => void
}

const INTERRUPT_THRESHOLD = 500

export default function InputBox({ disabled, onSubmit }: Props) {
  const [value, setValue] = useState('')

  const handleSend = (): void => {
    const t = value.trim()
    if (!t || disabled) return
    onSubmit(t)
    setValue('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const over = value.length > INTERRUPT_THRESHOLD
  const empty = value.trim().length === 0

  return (
    <div className="border-t border-[var(--divider)] bg-[var(--bg-primary)]/95 px-4 pb-5 pt-3 backdrop-blur">
      <div className="mx-auto max-w-chat">
        <div
          className={clsx(
            'flex items-end gap-2 rounded-2xl border bg-white p-2 shadow-sm transition-colors',
            over ? 'border-[var(--bad)]' : 'border-[var(--border)] focus-within:border-[var(--accent)]',
          )}
        >
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="输入你的回答…(Enter 提交,Shift+Enter 换行)"
            rows={2}
            className="flex-1 resize-none border-0 bg-transparent px-3 py-1.5 text-[15px] leading-relaxed outline-none placeholder:text-[var(--text-tertiary)]"
          />
          <motion.button
            type="button"
            onClick={handleSend}
            whileTap={{ scale: 0.95 }}
            disabled={disabled || empty}
            className="btn-primary mr-1 mt-1 px-4 py-2"
          >
            发送 ↵
          </motion.button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
          <span>
            Enter 提交,Shift+Enter 换行
          </span>
          <span className={over ? 'font-medium text-[var(--bad)]' : undefined}>
            {value.length} 字{over ? ` · 超过 ${INTERRUPT_THRESHOLD},面试官可能打断` : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
