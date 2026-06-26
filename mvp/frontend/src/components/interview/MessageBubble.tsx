import clsx from 'clsx'
import type { ChatMessage } from '@/store/interviewStore'
import TypewriterText from './TypewriterText'
import ThinkingFoldout from './ThinkingFoldout'

interface Props {
  msg: ChatMessage
  debug: boolean
}

const MODE_LABEL: Record<string, string> = {
  OPENING: '开场',
  DRILL_DOWN: '追问',
  SWITCH_TOPIC: '换题',
  INTERRUPT: '打断',
}

export default function MessageBubble({ msg, debug }: Props) {
  if (msg.role === 'user') {
    return (
      <div className="mb-5 flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-[var(--accent-soft)] px-4 py-2.5 text-[15px] leading-relaxed text-[var(--text-primary)] shadow-sm">
          <div className="whitespace-pre-wrap">{msg.text}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-5">
      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-xs font-medium text-[var(--text-secondary)]">面试官</span>
        <span
          className={clsx(
            'rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wide',
            msg.mode === 'INTERRUPT'
              ? 'bg-[var(--bad)]/15 text-[var(--bad)]'
              : msg.mode === 'DRILL_DOWN'
                ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]',
          )}
        >
          {MODE_LABEL[msg.mode] ?? msg.mode}
        </span>
        {msg.topic_name && (
          <span className="text-[11px] text-[var(--text-tertiary)]">
            · {msg.topic_name}
            {msg.depth > 0 ? ` (深度 ${msg.depth})` : ''}
          </span>
        )}
      </div>
      <div className="max-w-[88%] rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-[15px] leading-relaxed shadow-sm">
        <TypewriterText text={msg.text} done={msg.done} />
        <ThinkingFoldout steps={msg.thinking_steps} defaultOpen={debug} />
      </div>
    </div>
  )
}
