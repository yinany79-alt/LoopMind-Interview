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

export type PersonaTier = 'mentor' | 'legend'

export interface Persona {
  id: string
  tier: PersonaTier
  name: string
  role_title: string                  // "Tech Lead" / "Founder & CEO"
  avatar: string                       // URL,e.g. /static/personas/zhang-qing.jpg
  trait_label: string                  // "严厉型" / "原创主义"
  one_liner: string                    // 一句话风格描述
  tags: string[]
  default_dimensions: PersonaDimensions
  description?: string                 // 详情页用(部分场景才有)
  affiliation?: string                 // legend 才有
  affiliation_slug?: string            // simple-icons slug
  score?: number                       // 4.x / 9.x 评分,marketing 用
  first_principle?: string             // 人物信奉的第一性原理,hover 浮层用
}

export interface PersonasResponse {
  personas: Persona[]
}

// ===== 三模式 =====
export type SessionMode = 'jd_paste' | 'curated' | 'coffee_chat'

export interface CreateSessionRequest {
  mode: SessionMode
  jd_text?: string
  curated_job_id?: string
}

export interface CreateSessionResponseV2 {
  session_id: string
  mode: SessionMode
  created_at: string
  jd_summary: JDSummary
  skill_tree: SkillTree
}

// ===== 精选 JD / Trending Mission =====
export interface CuratedJob {
  id: string
  title: string
  company: string
  company_slug: string
  location: string
  salary_range: string
  difficulty: number  // 1-5
  tags: string[]
  challenged_count: number
}

export interface CuratedJobDetail extends CuratedJob {
  jd_text: string
}

// ===== Stats =====
export interface ChallengerStats {
  persona_id: string
  challenged_count: number
  avg_duration_min: number
  pass_rate: number
  rating: number
}

export interface JourneyStats {
  level: number
  total: number
  passed: number
  avg_score: number
  defeated: string[]   // persona_id 列表
}

export interface JourneyHistoryItem {
  session_id: string
  created_at: number
  ended_at: number | null
  mode: SessionMode
  persona_id: string | null
  persona_name: string | null
  persona_avatar: string | null
  jd_title: string | null
  topics_count: number
  satisfaction_final: number | null
  duration_minutes: number
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

// ===== Debug: 图节点流转 / 断点 =====

export type GraphNodeId =
  | 'dispatch'
  | 'interviewer'
  | 'evaluator'
  | 'router'
  | 'next_topic'

export interface GraphNodeStateSnapshot {
  turn_count?: number
  current_topic_id?: string | null
  current_topic_name?: string | null
  current_depth?: number
  current_satisfaction?: number
  next_action?: string
  _interviewer_mode?: string
  _all_done?: boolean
  topics_covered_count?: number
  [k: string]: unknown
}

export interface SSEGraphNodeEnter {
  node_id: GraphNodeId
  ts: number
  inputs_snapshot: GraphNodeStateSnapshot
}

export interface SSEGraphNodeExit {
  node_id: GraphNodeId
  ts: number
  duration_ms: number
  outputs_snapshot?: GraphNodeStateSnapshot
  error?: string
}

export interface SSEGraphPaused {
  at_node: GraphNodeId
  reason: 'breakpoint' | 'step'
  state_snapshot: GraphNodeStateSnapshot
}

export interface SSEGraphResumed {
  from_node: GraphNodeId
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
  graph_node_enter: SSEGraphNodeEnter
  graph_node_exit: SSEGraphNodeExit
  graph_paused: SSEGraphPaused
  graph_resumed: SSEGraphResumed
}

export type SSEEventName = keyof SSEEventMap

export interface APIError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
