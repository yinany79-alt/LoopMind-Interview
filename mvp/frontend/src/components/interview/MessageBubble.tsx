/**
 * MessageBubble — Faceup V3.1(Linear-tier 对话气泡)。
 *
 * 设计:
 * - user 气泡:墨黑底白字(不是蓝软色)
 * - interviewer 消息:无气泡边框,纯文字 + 顶部 mono 元信息
 * - pending 态:左侧极细墨色竖线,不是 emerald 边
 * - mode 标签:统一 .pill mono,不用色块
 */
import clsx from 'clsx'
import type { ChatMessage } from '@/store/interviewStore'
import TypewriterText from './TypewriterText'
import ThinkingFoldout from './ThinkingFoldout'

interface Props {
  msg: ChatMessage
  debug: boolean
}

const MODE_LABEL: Record<string, string> = {
  OPENING: 'opening',
  DRILL_DOWN: 'drill-down',
  SWITCH_TOPIC: 'switch',
  INTERRUPT: 'cut',
}

export default function MessageBubble({ msg, debug }: Props) {
  if (msg.role === 'user') {
    return (
      <div className="mb-6 flex justify-end">
        <div
          className="max-w-[80%] rounded-xl px-4 py-2.5 text-[14.5px] leading-[1.55]"
          style={{ background: 'var(--ink)', color: '#fff' }}
        >
          <div className="whitespace-pre-wrap">{msg.text}</div>
        </div>
      </div>
    )
  }

  const isPending = !msg.done && msg.text.length === 0
  const isAwaitingThinking = isPending && msg.thinking_steps.length === 0

  return (
    <div className="mb-6">
      {/* meta:面试官 · mode · topic — 全 mono 灰 */}
      <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
        <span>interviewer</span>
        <span className="text-[var(--text-quaternary)]">·</span>
        <span
          className={clsx(
            msg.mode === 'INTERRUPT'
              ? 'text-[var(--bad)]'
              : msg.mode === 'DRILL_DOWN'
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)]',
          )}
        >
          {MODE_LABEL[msg.mode] ?? msg.mode.toLowerCase()}
        </span>
        {msg.topic_name && (
          <>
            <span className="text-[var(--text-quaternary)]">·</span>
            <span className="normal-case tracking-normal text-[var(--text-secondary)]">
              {msg.topic_name}
              {msg.depth > 0 ? ` · d${msg.depth}` : ''}
            </span>
          </>
        )}
      </div>

      {/* body */}
      <div
        className={clsx(
          'max-w-[88%] text-[15px] leading-[1.65] text-[var(--text-primary)]',
          isPending && 'border-l-2 pl-3',
        )}
        style={isPending ? { borderColor: 'var(--ink)' } : undefined}
      >
        {!isAwaitingThinking && msg.text.length > 0 && (
          <TypewriterText text={msg.text} done={msg.done} />
        )}
        <ThinkingFoldout
          steps={msg.thinking_steps}
          defaultOpen={debug}
          pending={isPending}
        />
      </div>
    </div>
  )
}
