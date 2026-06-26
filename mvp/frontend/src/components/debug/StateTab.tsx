import { useInterviewStore } from '@/store/interviewStore'
import JsonView from './JsonView'

export default function StateTab() {
  // 拿一个精简但完整的 InterviewState 快照
  const snapshot = useInterviewStore((s) => ({
    session_id: s.session_id,
    sse_status: s.sse_status,
    jd_summary: s.jd_summary,
    skill_tree_node_count: s.skill_tree?.nodes.length ?? 0,
    selected_persona: s.selected_persona?.id ?? null,
    dimensions: s.dimensions,
    effective_card_id: s.effective_card_id,
    interviewer_state: s.interviewer_state,
    current_topic_id: s.current_topic_id,
    current_topic_name: s.current_topic_name,
    current_depth: s.current_depth,
    topics_covered_count: s.topics_covered_count,
    min_topics_reached: s.min_topics_reached,
    satisfaction: s.satisfaction,
    satisfaction_previous: s.satisfaction_previous,
    red_flags: s.red_flags,
    bright_spots: s.bright_spots,
    messages_count: s.messages.length,
    turns_count: s.turns.length,
    last_error: s.last_error,
    session_ended: s.session_ended,
  }))
  return (
    <div className="space-y-2">
      <div className="text-xs text-[var(--text-tertiary)]">
        全局 InterviewState 实时快照
      </div>
      <JsonView value={snapshot} />
    </div>
  )
}
