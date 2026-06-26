import { create } from 'zustand'
import type {
  CreateSessionResponse,
  EvaluatorResult,
  GraphNodeId,
  GraphNodeStateSnapshot,
  Persona,
  PersonaDimensions,
  RedFlag,
  BrightSpot,
  SkillTree,
  SSEAssistantMessageEnd,
  SSEAssistantMessageStart,
  SSEEvaluatorResult,
  SSEGraphNodeEnter,
  SSEGraphNodeExit,
  SSEGraphPaused,
  SSEGraphResumed,
  SSEInterviewerState,
  SSEMinTopicsReached,
  SSERedFlagAdded,
  SSEBrightSpotAdded,
  SSESatisfactionUpdate,
  SSESessionEnded,
  SSESessionStarted,
  SSEThinkingStep,
  SSETopicFinished,
  SSETopicStarted,
  SSEError,
  SessionId,
  InterviewerStateId,
  InterviewerMode,
  ThinkingStepType,
} from '@/types/api'

export type SSEStatus = 'idle' | 'connecting' | 'connected' | 'disconnected'

export interface ThinkingStep {
  step_index: number
  step_type: ThinkingStepType
  content: string
  tool_name: string | null
  tool_args: Record<string, unknown> | null
}

export interface InterviewerMessage {
  message_id: string
  role: 'interviewer'
  mode: InterviewerMode
  topic_id: string
  topic_name: string
  depth: number
  // 累积的可见文本(打字机用 delta 拼接)
  text: string
  thinking_steps: ThinkingStep[]
  // 完成态:true 时不再追加 delta,光标隐藏
  done: boolean
  created_at: number
}

export interface UserMessage {
  message_id: string
  role: 'user'
  text: string
  created_at: number
}

export type ChatMessage = InterviewerMessage | UserMessage

export interface TurnRecord {
  turn_id: string
  evaluation: EvaluatorResult
}

export interface InterviewState {
  /* —— session 元数据 —— */
  session_id: SessionId | null
  jd_summary: CreateSessionResponse['jd_summary'] | null
  skill_tree: SkillTree | null

  /* —— 准备页选择 —— */
  selected_persona: Persona | null
  dimensions: PersonaDimensions
  // 用户已经从随机卡片抽出的真实 card_id(用于上送 start)
  effective_card_id: string | null

  /* —— 会话进行态 —— */
  sse_status: SSEStatus
  interviewer_state: SSEInterviewerState
  current_topic_id: string | null
  current_topic_name: string | null
  current_depth: number
  topics_covered_count: number
  min_topics_reached: boolean
  satisfaction: number // 当前 topic 的最新 satisfaction
  satisfaction_previous: number
  red_flags: RedFlag[]
  bright_spots: BrightSpot[]
  red_flag_pulse: number // 时间戳,触发头像角标动画
  bright_spot_pulse: number
  high_score_pulse: number // satisfaction <80 → >=80 时触发丝带
  low_score_pulse: number // satisfaction >20 → <=20 时触发震动

  /* —— 对话 —— */
  messages: ChatMessage[]
  // 等待用户回答 / 等待面试官出题 的 UI 锁
  awaiting_assistant: boolean

  /* —— Debug & 评估 —— */
  turns: TurnRecord[]
  last_error: SSEError | null
  session_ended: SSESessionEnded | null

  /* —— Debug: 图节点流转 —— */
  graph_node_status: Partial<Record<GraphNodeId, 'idle' | 'running' | 'done' | 'paused' | 'error'>>
  graph_node_last_snapshot: Partial<Record<GraphNodeId, GraphNodeStateSnapshot>>
  graph_node_duration_ms: Partial<Record<GraphNodeId, number>>
  graph_active_node: GraphNodeId | null
  graph_paused_at: GraphNodeId | null
  /** 时间线:所有 SSE 事件按顺序记录,Log Tab 用 */
  event_log: { ts: number; event: string; data: unknown }[]

  /* —— actions —— */
  setSession: (s: CreateSessionResponse) => void
  setPersona: (p: Persona) => void
  setDimensions: (d: Partial<PersonaDimensions>) => void
  setEffectiveCardId: (id: string) => void
  resetInterview: () => void

  setSseStatus: (s: SSEStatus) => void
  onSessionStarted: (e: SSESessionStarted) => void
  setInterviewerState: (e: SSEInterviewerState) => void

  startMessage: (e: SSEAssistantMessageStart) => void
  appendDelta: (msgId: string, delta: string) => void
  endMessage: (e: SSEAssistantMessageEnd) => void
  addThinkingStep: (e: SSEThinkingStep) => void

  appendUserMessage: (text: string) => void
  setAwaitingAssistant: (v: boolean) => void

  setEvaluation: (e: SSEEvaluatorResult) => void
  updateSatisfaction: (e: SSESatisfactionUpdate) => void
  addRedFlag: (e: SSERedFlagAdded) => void
  addBrightSpot: (e: SSEBrightSpotAdded) => void
  startTopic: (e: SSETopicStarted) => void
  finishTopic: (e: SSETopicFinished) => void
  markMinReached: (e: SSEMinTopicsReached) => void
  endSession: (e: SSESessionEnded) => void
  setError: (e: SSEError) => void

  /* —— Debug actions —— */
  onGraphNodeEnter: (e: SSEGraphNodeEnter) => void
  onGraphNodeExit: (e: SSEGraphNodeExit) => void
  onGraphPaused: (e: SSEGraphPaused) => void
  onGraphResumed: (e: SSEGraphResumed) => void
  pushEventLog: (event: string, data: unknown) => void
}

const DEFAULT_DIMENSIONS: PersonaDimensions = {
  warmth: 50,
  depth_preference: 50,
  pace: 50,
  vision: 50,
}

const IDLE_STATE: SSEInterviewerState = {
  state_id: 'idle' as InterviewerStateId,
  state_text: '等待开始...',
  ttl_ms: 0,
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  session_id: null,
  jd_summary: null,
  skill_tree: null,

  selected_persona: null,
  dimensions: { ...DEFAULT_DIMENSIONS },
  effective_card_id: null,

  sse_status: 'idle',
  interviewer_state: { ...IDLE_STATE },
  current_topic_id: null,
  current_topic_name: null,
  current_depth: 0,
  topics_covered_count: 0,
  min_topics_reached: false,
  satisfaction: 50,
  satisfaction_previous: 50,
  red_flags: [],
  bright_spots: [],
  red_flag_pulse: 0,
  bright_spot_pulse: 0,
  high_score_pulse: 0,
  low_score_pulse: 0,

  messages: [],
  awaiting_assistant: false,

  turns: [],
  last_error: null,
  session_ended: null,

  graph_node_status: {},
  graph_node_last_snapshot: {},
  graph_node_duration_ms: {},
  graph_active_node: null,
  graph_paused_at: null,
  event_log: [],

  setSession: (s) =>
    set({
      session_id: s.session_id,
      jd_summary: s.jd_summary,
      skill_tree: s.skill_tree,
    }),

  setPersona: (p) =>
    set({
      selected_persona: p,
      dimensions: { ...p.default_dimensions },
      effective_card_id: p.id,
    }),

  setDimensions: (d) =>
    set((st) => ({ dimensions: { ...st.dimensions, ...d } })),

  setEffectiveCardId: (id) => set({ effective_card_id: id }),

  resetInterview: () =>
    set({
      sse_status: 'idle',
      interviewer_state: { ...IDLE_STATE },
      current_topic_id: null,
      current_topic_name: null,
      current_depth: 0,
      topics_covered_count: 0,
      min_topics_reached: false,
      satisfaction: 50,
      satisfaction_previous: 50,
      red_flags: [],
      bright_spots: [],
      red_flag_pulse: 0,
      bright_spot_pulse: 0,
      high_score_pulse: 0,
      low_score_pulse: 0,
      messages: [],
      awaiting_assistant: false,
      turns: [],
      last_error: null,
      session_ended: null,
      graph_node_status: {},
      graph_node_last_snapshot: {},
      graph_node_duration_ms: {},
      graph_active_node: null,
      graph_paused_at: null,
      event_log: [],
    }),

  setSseStatus: (s) => set({ sse_status: s }),

  onSessionStarted: (_e) => {
    // session_started 仅用于确认连接,主要状态来自后续事件
    set({ sse_status: 'connected' })
  },

  setInterviewerState: (e) => set({ interviewer_state: e }),

  startMessage: (e) =>
    set((st) => {
      const existingIdx = st.messages.findIndex(
        (m) => m.role === 'interviewer' && m.message_id === e.message_id,
      )
      if (existingIdx >= 0) {
        // placeholder 已被 addThinkingStep 创建,补齐元数据,保留已收集的 thinking_steps
        const next = st.messages.slice()
        const existing = next[existingIdx] as InterviewerMessage
        next[existingIdx] = {
          ...existing,
          mode: e.mode,
          topic_id: e.topic_id,
          topic_name: e.topic_name,
          depth: e.depth,
        }
        return {
          messages: next,
          current_topic_id: e.topic_id,
          current_topic_name: e.topic_name,
          current_depth: e.depth,
          awaiting_assistant: true,
        }
      }
      const fresh: InterviewerMessage = {
        message_id: e.message_id,
        role: 'interviewer',
        mode: e.mode,
        topic_id: e.topic_id,
        topic_name: e.topic_name,
        depth: e.depth,
        text: '',
        thinking_steps: [],
        done: false,
        created_at: Date.now(),
      }
      return {
        messages: [...st.messages, fresh],
        current_topic_id: e.topic_id,
        current_topic_name: e.topic_name,
        current_depth: e.depth,
        awaiting_assistant: true,
      }
    }),

  appendDelta: (msgId, delta) =>
    set((st) => ({
      messages: st.messages.map((m) =>
        m.role === 'interviewer' && m.message_id === msgId
          ? { ...m, text: m.text + delta }
          : m,
      ),
    })),

  endMessage: (e) =>
    set((st) => ({
      messages: st.messages.map((m) =>
        m.role === 'interviewer' && m.message_id === e.message_id
          ? { ...m, text: e.full_text, done: true }
          : m,
      ),
      awaiting_assistant: false,
    })),

  addThinkingStep: (e) =>
    set((st) => {
      const step = {
        step_index: e.step_index,
        step_type: e.step_type,
        content: e.content,
        tool_name: e.tool_name,
        tool_args: e.tool_args,
      }
      const idx = st.messages.findIndex(
        (m) => m.role === 'interviewer' && m.message_id === e.message_id,
      )
      if (idx >= 0) {
        const next = st.messages.slice()
        const existing = next[idx] as InterviewerMessage
        next[idx] = {
          ...existing,
          thinking_steps: [...existing.thinking_steps, step],
        }
        return { messages: next }
      }
      // placeholder: startMessage 还没到,先建一个空消息把 thinking_step 收住
      const placeholder: InterviewerMessage = {
        message_id: e.message_id,
        role: 'interviewer',
        mode: 'OPENING',
        topic_id: st.current_topic_id ?? '',
        topic_name: st.current_topic_name ?? '',
        depth: st.current_depth ?? 0,
        text: '',
        thinking_steps: [step],
        done: false,
        created_at: Date.now(),
      }
      return {
        messages: [...st.messages, placeholder],
        awaiting_assistant: true,
      }
    }),

  appendUserMessage: (text) =>
    set((st) => ({
      messages: [
        ...st.messages,
        {
          message_id: `u_${Date.now()}`,
          role: 'user',
          text,
          created_at: Date.now(),
        },
      ],
      awaiting_assistant: true,
    })),

  setAwaitingAssistant: (v) => set({ awaiting_assistant: v }),

  setEvaluation: (e) =>
    set((st) => ({
      turns: [...st.turns, { turn_id: e.turn_id, evaluation: e.evaluation }],
    })),

  updateSatisfaction: (e) => {
    const prev = e.previous_value
    const next = e.new_value
    const now = Date.now()
    const patch: Partial<InterviewState> = {
      satisfaction: next,
      satisfaction_previous: prev,
    }
    if (prev < 80 && next >= 80) patch.high_score_pulse = now
    if (prev > 20 && next <= 20) patch.low_score_pulse = now
    set(patch)
  },

  addRedFlag: (e) =>
    set((st) => ({
      red_flags: [...st.red_flags, e.flag],
      red_flag_pulse: Date.now(),
    })),

  addBrightSpot: (e) =>
    set((st) => ({
      bright_spots: [...st.bright_spots, e.spot],
      bright_spot_pulse: Date.now(),
    })),

  startTopic: (e) =>
    set({
      current_topic_id: e.topic_id,
      current_topic_name: e.topic_name,
      current_depth: 0,
      // 进新题 reset 当前题 satisfaction 为 50,符合后端语义
      satisfaction: 50,
      satisfaction_previous: 50,
    }),

  finishTopic: (e) =>
    set((st) => ({
      topics_covered_count: st.topics_covered_count + 1,
      // 记录最终满意度便于报告
      satisfaction: e.final_satisfaction,
    })),

  markMinReached: (e) =>
    set({ min_topics_reached: true, topics_covered_count: e.covered_count }),

  endSession: (e) =>
    set({
      session_ended: e,
      sse_status: 'disconnected',
    }),

  setError: (e) => set({ last_error: e }),

  onGraphNodeEnter: (e) =>
    set((st) => ({
      graph_node_status: { ...st.graph_node_status, [e.node_id]: 'running' },
      graph_node_last_snapshot: {
        ...st.graph_node_last_snapshot,
        [e.node_id]: e.inputs_snapshot,
      },
      graph_active_node: e.node_id,
    })),

  onGraphNodeExit: (e) =>
    set((st) => ({
      graph_node_status: {
        ...st.graph_node_status,
        [e.node_id]: e.error ? 'error' : 'done',
      },
      graph_node_duration_ms: {
        ...st.graph_node_duration_ms,
        [e.node_id]: e.duration_ms,
      },
      graph_node_last_snapshot: e.outputs_snapshot
        ? {
            ...st.graph_node_last_snapshot,
            [e.node_id]: e.outputs_snapshot,
          }
        : st.graph_node_last_snapshot,
      graph_active_node:
        st.graph_active_node === e.node_id ? null : st.graph_active_node,
    })),

  onGraphPaused: (e) =>
    set((st) => ({
      graph_node_status: { ...st.graph_node_status, [e.at_node]: 'paused' },
      graph_paused_at: e.at_node,
      graph_node_last_snapshot: {
        ...st.graph_node_last_snapshot,
        [e.at_node]: e.state_snapshot,
      },
    })),

  onGraphResumed: () =>
    set({ graph_paused_at: null }),

  pushEventLog: (event, data) =>
    set((st) => {
      const next = [
        ...st.event_log,
        { ts: Date.now(), event, data },
      ]
      // 滚动保留最近 500 条,避免内存爆
      return { event_log: next.length > 500 ? next.slice(-500) : next }
    }),
}))

// 便捷选择器
export const interviewerEmojiOf = (satisfaction: number): string => {
  if (satisfaction <= 20) return '😑'
  if (satisfaction <= 40) return '🤨'
  if (satisfaction <= 60) return '🤔'
  if (satisfaction <= 80) return '😊'
  return '😤'
}

export const satisfactionBarColor = (
  satisfaction: number,
): 'good' | 'mid' | 'bad' => {
  if (satisfaction >= 60) return 'good'
  if (satisfaction >= 30) return 'mid'
  return 'bad'
}

// 留给非 React 调用方(SSE 处理器)直接拿 store
export const interviewStore = useInterviewStore
