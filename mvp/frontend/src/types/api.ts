// 严格按照 mvp/docs/接口规范.md §4 实现,字段名一律 snake_case。

export type SessionId = string
export type MessageId = string
export type TurnId = string

export interface PersonaDimensions {
  warmth: number // 0-100
  depth_preference: number
  pace: number
  vision: number
}

export interface Persona {
  id: string
  name: string
  tags: string[]
  description: string
  default_dimensions: PersonaDimensions
}

export interface PersonasResponse {
  personas: Persona[]
}

export interface CreateSessionRequest {
  jd_text: string
}

export interface JDSummary {
  title: string
  company: string
  location: string
}

export interface SkillTreeNode {
  id: string
  topic: string
  weight: number
  depth_level: 'shallow' | 'medium' | 'deep'
  dimensions: string[]
}

export interface SkillTree {
  root: string
  dimensions: string[]
  nodes: SkillTreeNode[]
}

export interface CreateSessionResponse {
  session_id: SessionId
  created_at: string
  jd_summary: JDSummary
  skill_tree: SkillTree
}

export interface SessionStartRequest {
  persona: {
    card_id: string
    dimensions: PersonaDimensions
  }
}

export interface SessionStartResponse {
  session_id: SessionId
  status: 'ready'
  stream_url: string
}

export interface AnswerRequest {
  content: string
}

export interface AnswerResponse {
  accepted: boolean
  turn_id: TurnId
}

export interface EndRequest {
  reason: 'user_initiated' | 'min_topics_reached' | 'natural_end'
}

export interface EndResponse {
  session_id: SessionId
  status: 'ended'
  report_url: string
  topics_covered_count: number
  below_minimum: boolean
}

export interface RedFlag {
  topic: string
  evidence: string
  severity: 'low' | 'medium' | 'high'
}

export interface BrightSpot {
  topic: string
  evidence: string
}

export interface EvaluatorResult {
  answer_quality: 'surface' | 'concept' | 'hands_on' | 'insight'
  dimension_deltas: Record<string, number>
  current_satisfaction: number
  found_gaps: string[]
  found_strengths: string[]
  drill_down_target: string | null
  drill_down_hint: string | null
  red_flags_to_add: RedFlag[]
  bright_spots_to_add: BrightSpot[]
  topic_finish_signal: 'exhausted' | 'user_excellent' | 'user_hopeless' | null
}

export type InterviewerMode = 'OPENING' | 'DRILL_DOWN' | 'SWITCH_TOPIC' | 'INTERRUPT'

export type ThinkingStepType = 'thought' | 'tool_call' | 'observation' | 'final'

export type InterviewerStateId =
  | 'idle'
  | 'thinking'
  | 'tapping'
  | 'frowning'
  | 'nodding'
  | 'note_taking'
  | 'reading_material'
  | 'sharpening_gaze'
  | 'pen_down'
  | 'leaning_forward'
  | 'silent_pause'

export interface Report {
  session_id: SessionId
  status: 'generating' | 'ready' | 'failed'
  generated_at?: string
  verdict?: {
    level: string
    level_confidence: 'low' | 'medium' | 'high'
    overall_score: number
    summary: string
  }
  dimension_scores?: Record<string, number>
  comments?: Array<{ type: 'strength' | 'weakness'; text: string }>
  topic_replays?: Array<{
    topic_id: string
    topic_name: string
    turns: Array<{
      role: 'interviewer' | 'user'
      content: string
      thinking?: string
    }>
    final_satisfaction: number
    evaluator_comment: string
  }>
  below_minimum?: boolean
}

// ───────── SSE 事件 payload(每个事件的 data JSON 体)─────────

export interface SSESessionStarted {
  session_id: SessionId
  persona: {
    card_id: string
    name: string
    dimensions: PersonaDimensions
  }
}

export interface SSEInterviewerState {
  state_id: InterviewerStateId
  state_text: string
  ttl_ms: number
}

export interface SSEAssistantMessageStart {
  message_id: MessageId
  mode: InterviewerMode
  topic_id: string
  topic_name: string
  depth: number
}

export interface SSEAssistantMessageDelta {
  message_id: MessageId
  delta: string
}

export interface SSEAssistantMessageEnd {
  message_id: MessageId
  full_text: string
  thinking_steps_count: number
}

export interface SSEThinkingStep {
  message_id: MessageId
  step_index: number
  step_type: ThinkingStepType
  content: string
  tool_name: string | null
  tool_args: Record<string, unknown> | null
}

export interface SSEEvaluatorStarted {
  turn_id: TurnId
}

export interface SSEEvaluatorResult {
  turn_id: TurnId
  evaluation: EvaluatorResult
}

export interface SSESatisfactionUpdate {
  topic_id: string
  previous_value: number
  new_value: number
  delta: number
}

export interface SSERedFlagAdded {
  flag: RedFlag
}

export interface SSEBrightSpotAdded {
  spot: BrightSpot
}

export interface SSETopicFinished {
  topic_id: string
  reason:
    | 'satisfaction_reached'
    | 'depth_limit'
    | 'user_hopeless'
    | 'user_excellent'
    | 'exhausted'
  final_satisfaction: number
}

export interface SSETopicStarted {
  topic_id: string
  topic_name: string
  weight: number
  depth_level: 'shallow' | 'medium' | 'deep'
  is_red_flag_hunt: boolean
}

export interface SSEMinTopicsReached {
  covered_count: number
}

export interface SSEError {
  error_code: string
  message: string
  recoverable: boolean
}

export interface SSESessionEnded {
  reason: 'user_initiated' | 'natural_end' | 'error'
  report_ready_eta_ms: number
  below_minimum: boolean
}

// 事件名 -> payload 类型映射,便于 store / SSE 路由强类型化。
export type SSEEventMap = {
  session_started: SSESessionStarted
  interviewer_state: SSEInterviewerState
  assistant_message_start: SSEAssistantMessageStart
  assistant_message_delta: SSEAssistantMessageDelta
  assistant_message_end: SSEAssistantMessageEnd
  thinking_step: SSEThinkingStep
  evaluator_started: SSEEvaluatorStarted
  evaluator_result: SSEEvaluatorResult
  satisfaction_update: SSESatisfactionUpdate
  red_flag_added: SSERedFlagAdded
  bright_spot_added: SSEBrightSpotAdded
  topic_finished: SSETopicFinished
  topic_started: SSETopicStarted
  min_topics_reached: SSEMinTopicsReached
  error: SSEError
  session_ended: SSESessionEnded
}

export type SSEEventName = keyof SSEEventMap

export interface APIError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
