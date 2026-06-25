import { useEffect, useRef } from 'react'
import { useInterviewStore } from '@/store/interviewStore'
import MessageBubble from './MessageBubble'

interface Props {
  debug: boolean
}

export default function ChatStream({ debug }: Props) {
  const messages = useInterviewStore((s) => s.messages)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // 让最新消息总是滚动到视区
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, messages[messages.length - 1]?.text])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
    >
      <div className="mx-auto max-w-chat pt-6">
        {messages.length === 0 && (
          <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
            面试官正在准备开场,请稍候…
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.message_id} msg={m} debug={debug} />
        ))}
      </div>
    </div>
  )
}
