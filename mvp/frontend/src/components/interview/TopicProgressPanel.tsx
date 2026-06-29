/**
 * TopicProgressPanel — Interview 左栏:面试进度。
 *
 * 列出 skill_tree.nodes 各 topic 的状态:✓ 已完成 / ● 进行中 / ○ 未开始。
 * 当前 topic 用 current_topic_id 匹配。
 */
import { Check } from 'lucide-react'
import clsx from 'clsx'
import { useInterviewStore } from '@/store/interviewStore'

export default function TopicProgressPanel() {
  const skillTree = useInterviewStore((s) => s.skill_tree)
  const currentTopicId = useInterviewStore((s) => s.current_topic_id)
  const messages = useInterviewStore((s) => s.messages)

  const nodes = skillTree?.nodes ?? []

  // 推断哪些 topic 已"走过":取所有 interviewer message 的 topic_id 集合
  const visitedIds = new Set<string>()
  for (const m of messages) {
    if (m.role === 'interviewer' && m.topic_id) {
      visitedIds.add(m.topic_id)
    }
  }

  if (nodes.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-[12px] text-[var(--text-tertiary)]">
        加载技能树…
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-[var(--divider)] px-5 py-4">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
          面试进度
        </h3>
        <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
          {visitedIds.size} / {nodes.length} 已覆盖
        </p>
      </header>
      <ul className="flex-1 space-y-1 overflow-y-auto p-3">
        {nodes.map((n) => {
          const isCurrent = n.id === currentTopicId
          const isDone = visitedIds.has(n.id) && !isCurrent
          return (
            <li
              key={n.id}
              className={clsx(
                'flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-colors',
                isCurrent && 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]',
                !isCurrent && isDone && 'text-[var(--text-secondary)]',
                !isCurrent && !isDone && 'text-[var(--text-tertiary)]',
              )}
            >
              <span
                className={clsx(
                  'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full',
                  isCurrent && 'bg-[var(--accent)] text-white',
                  !isCurrent && isDone && 'border border-[var(--good)] bg-[var(--good)] text-white',
                  !isCurrent && !isDone && 'border border-[var(--border)]',
                )}
              >
                {isCurrent ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                ) : isDone ? (
                  <Check size={10} strokeWidth={3} />
                ) : null}
              </span>
              <span className="leading-snug">{n.topic}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
