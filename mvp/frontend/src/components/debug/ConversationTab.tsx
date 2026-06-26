import { useInterviewStore } from '@/store/interviewStore'
import JsonView from './JsonView'

export default function ConversationTab() {
  const messages = useInterviewStore((s) => s.messages)
  return (
    <div className="space-y-3">
      <div className="text-xs text-[var(--text-tertiary)]">
        消息原始 JSON({messages.length} 条)
      </div>
      {messages.map((m) => (
        <div
          key={m.message_id}
          className="rounded-md border border-[var(--divider)] bg-[var(--bg-secondary)] p-2"
        >
          <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
            {m.role === 'user' ? 'USER' : `INTERVIEWER · ${m.message_id}`}
          </div>
          <JsonView value={m} />
        </div>
      ))}
    </div>
  )
}
