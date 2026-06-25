import type {
  SSEAssistantMessageStart,
  SSEEventMap,
  SSEEventName,
  SSEThinkingStep,
  SSETopicStarted,
} from '@/types/api'
import type { SSEHandlers } from './sse'

export interface MockSSEController {
  /** 用户提交回答后驱动后续事件 */
  onUserAnswer: (content: string) => void
  /** 用户点结束 */
  onEnd: () => void
  /** 拆 SSE,停所有 timer */
  close: () => void
  /** 当前已完成题数(用于 endSession response) */
  readonly topicsCovered: number
}

type Timer = ReturnType<typeof setTimeout>

interface TopicSpec {
  id: string
  name: string
  weight: number
  depth_level: 'shallow' | 'medium' | 'deep'
  /** 该题的固定面试官话术列表,index 0=opening,1+=drill_down */
  questions: string[]
  /** 评估器的情绪曲线(对应每一次回答) */
  evaluations: {
    answer_quality: 'surface' | 'concept' | 'hands_on' | 'insight'
    satisfaction: number
    deltas: Record<string, number>
    gaps: string[]
    strengths: string[]
    drill_down_target: string | null
    drill_down_hint: string | null
    red_flag?: { topic: string; evidence: string; severity: 'low' | 'medium' | 'high' }
    bright_spot?: { topic: string; evidence: string }
    /** 最后一轮回答时设置 topic_finish_signal */
    finish_signal?: 'exhausted' | 'user_excellent' | 'user_hopeless' | null
  }[]
  finish_reason:
    | 'satisfaction_reached'
    | 'depth_limit'
    | 'user_hopeless'
    | 'user_excellent'
    | 'exhausted'
  thinking_per_answer: SSEThinkingStep['content'][][]
}

/* 5 + 1 topics,内置一场完整面试。第 6 题用于演示"超过门槛后还能继续"。 */
const TOPICS: TopicSpec[] = [
  {
    id: 'agent_loop',
    name: 'Agent Loop 与产品形态',
    weight: 2.5,
    depth_level: 'deep',
    questions: [
      '你怎么理解 Agent Loop?它和传统 chatbot 在产品形态上最大差别在哪?',
      'stop condition 这块你会怎么设计?完全交给模型自决吗?',
    ],
    evaluations: [
      {
        answer_quality: 'concept',
        satisfaction: 65,
        deltas: { agent_product_taste: 5, tech_understanding: 10 },
        gaps: ['未提及 stop condition'],
        strengths: ['理解 Agent Loop 与 chatbot 的形态差异'],
        drill_down_target: 'tech_understanding',
        drill_down_hint: '追问 stop condition 设计',
      },
      {
        answer_quality: 'hands_on',
        satisfaction: 82,
        deltas: { agent_product_taste: 8, tech_understanding: 9 },
        gaps: [],
        strengths: ['联想到 Claude Code Auto-Accept,有一手观察'],
        drill_down_target: null,
        drill_down_hint: null,
        bright_spot: { topic: 'Agent Loop', evidence: '主动联想到 Claude Code Auto-Accept 的 stop 设计' },
        finish_signal: 'user_excellent',
      },
    ],
    finish_reason: 'satisfaction_reached',
    thinking_per_answer: [
      [
        '用户回答了 Agent Loop 的核心,但漏了 stop condition。',
        '[Tool] query_standard_answer(topic="Agent Loop")',
        '标准答案:连续多步、stop condition 自决、Tool Use 闭环。',
        '决定追问 stop condition。',
      ],
      [
        '用户的 stop 三层设计具体且联想到 Claude Code Auto-Accept,是一手观察。',
        '[Tool] check_first_hand_evidence(topic="Claude Code")',
        '检测到具体场景描述,信号正向。',
        '本题可结束,记 bright_spot。',
      ],
    ],
  },
  {
    id: 'tool_use',
    name: 'Tool Use 与 MCP',
    weight: 2.0,
    depth_level: 'medium',
    questions: [
      'MCP 解决了什么问题?和直接在 prompt 里塞工具描述的差别是什么?',
    ],
    evaluations: [
      {
        answer_quality: 'hands_on',
        satisfaction: 78,
        deltas: { tech_understanding: 8 },
        gaps: ['未提工具描述质量影响调用准确率'],
        strengths: ['具体到 stdio transport,说明深入读过协议'],
        drill_down_target: null,
        drill_down_hint: null,
        bright_spot: { topic: 'MCP', evidence: '提到 stdio transport 的可插拔特性' },
        finish_signal: 'user_excellent',
      },
    ],
    finish_reason: 'satisfaction_reached',
    thinking_per_answer: [
      [
        '用户提到 stdio transport,说明不只是看过摘要,是真读了协议。',
        '[Tool] query_standard_answer(topic="MCP")',
        '标准答案:协议下沉、可发现、可插拔。已覆盖 2/3。',
        '本题深度够,可结束并记 bright_spot。',
      ],
    ],
  },
  {
    id: 'claude_code_taste',
    name: 'Claude Code 的产品品味',
    weight: 2.5,
    depth_level: 'deep',
    questions: [
      "你用 Claude Code 时,什么时刻会让你觉得'这个模型行为有品味'?",
      '具体到一次?哪个项目、什么场景、它的"先 grep"让你避免了什么坑?',
    ],
    evaluations: [
      {
        answer_quality: 'concept',
        satisfaction: 55,
        deltas: { agent_product_taste: 4, first_hand_experience: -2 },
        gaps: ['描述偏抽象,缺具体场景'],
        strengths: [],
        drill_down_target: 'first_hand_experience',
        drill_down_hint: '追问一个具体场景验证是否真用过',
      },
      {
        answer_quality: 'surface',
        satisfaction: 18,
        deltas: { first_hand_experience: -15, agent_product_taste: -3 },
        gaps: ['承认没有真实重度使用经历'],
        strengths: [],
        drill_down_target: null,
        drill_down_hint: null,
        red_flag: {
          topic: 'Claude Code',
          evidence: '无第一手实践,仅基于演示与文档形成认知',
          severity: 'high',
        },
        finish_signal: 'user_hopeless',
      },
    ],
    finish_reason: 'user_hopeless',
    thinking_per_answer: [
      [
        '用户给的"先 grep 再动手"是真实观察还是看博客?需要追问具体场景。',
        '[Tool] check_first_hand_evidence(topic="Claude Code")',
        '上下文里没有具体项目/场景的细节。',
        '决定 drill_down first_hand。',
      ],
      [
        '用户承认没有重度使用,只是看演示。',
        '[Tool] get_red_flags_history()',
        '当前 red_flags=[]。',
        '记录 red_flag: 一手经验缺失。本题转下一题。',
      ],
    ],
  },
  {
    id: 'competitor_landscape',
    name: 'Cursor / Devin 竞品认知',
    weight: 1.5,
    depth_level: 'medium',
    questions: [
      'Cursor 和 Claude Code 在产品形态上最核心的差别是什么?',
    ],
    evaluations: [
      {
        answer_quality: 'concept',
        satisfaction: 60,
        deltas: { product_methodology: 5 },
        gaps: ['未对比 context 管理 / 工具调用范围 / 用户介入时机的具体差异'],
        strengths: ['区分了 inline 补全心智和 agent 心智'],
        drill_down_target: null,
        drill_down_hint: null,
        finish_signal: 'exhausted',
      },
    ],
    finish_reason: 'exhausted',
    thinking_per_answer: [
      [
        '用户给出心智差异层的区分,概念上对。但没下沉到产品决策差异。',
        '[Tool] query_standard_answer(topic="Cursor vs Claude Code")',
        '标准答案应包含 context 管理、工具调用范围、用户介入时机。',
        '题目时间预算用完,标记 exhausted 进下一题。',
      ],
    ],
  },
  {
    id: 'metric_design',
    name: '如何度量 Agent 产品的好坏',
    weight: 1.5,
    depth_level: 'medium',
    questions: [
      '你是 Claude Code PM,只能选三个北极星指标,你选什么?为什么?',
    ],
    evaluations: [
      {
        answer_quality: 'hands_on',
        satisfaction: 72,
        deltas: { product_methodology: 7, agent_product_taste: 3 },
        gaps: ['缺少"先优化哪个、为什么"的优先级判断'],
        strengths: ['三个指标都给出了选择理由'],
        drill_down_target: null,
        drill_down_hint: null,
        finish_signal: 'user_excellent',
      },
    ],
    finish_reason: 'satisfaction_reached',
    thinking_per_answer: [
      [
        '用户的三个指标 task completion / unattended steps / WAS 都合理且能讲理由。',
        '[Tool] query_standard_answer(topic="agent metrics")',
        '标准答案常见有:任务完成率、自主步骤占比、留存。覆盖 3/3。',
        '本题达成 5 题门槛,可结束此题进入第 6 题或等待用户结束。',
      ],
    ],
  },
  {
    id: '5_year_vision',
    name: '5 年后 Agent 产品的形态',
    weight: 1.8,
    depth_level: 'shallow',
    questions: [
      '5 年后,你觉得 Agent 产品的主要形态会从 CLI / IDE 走向哪里?',
    ],
    evaluations: [
      {
        answer_quality: 'concept',
        satisfaction: 65,
        deltas: { agent_product_taste: 5 },
        gaps: ['偏行业判断,缺少自己独到的产品假设'],
        strengths: ['提出"操作系统层 agent 入口"的判断'],
        drill_down_target: null,
        drill_down_hint: null,
        finish_signal: 'user_excellent',
      },
    ],
    finish_reason: 'satisfaction_reached',
    thinking_per_answer: [
      [
        '开放题,用户给出 OS-level agent 入口的判断,方向合理。',
        '[Tool] query_standard_answer(topic="agent 5y vision")',
        '可对比 OpenAI Operator、Anthropic computer use 的方向。',
        '本题可收尾。',
      ],
    ],
  },
]

/* 拟人状态库,严格按接口规范的 state_id 枚举 */
const STATE_THINKING = { state_id: 'thinking' as const, state_text: '面试官正在沉思...', ttl_ms: 3000 }
const STATE_TAPPING = { state_id: 'tapping' as const, state_text: '面试官在敲击桌面...', ttl_ms: 2000 }
const STATE_FROWNING = { state_id: 'frowning' as const, state_text: '面试官在皱眉...', ttl_ms: 2500 }
const STATE_NODDING = { state_id: 'nodding' as const, state_text: '面试官在点头...', ttl_ms: 2500 }
const STATE_NOTE_TAKING = { state_id: 'note_taking' as const, state_text: '面试官正在记录笔记...', ttl_ms: 3000 }
const STATE_READING = { state_id: 'reading_material' as const, state_text: '面试官在翻看资料...', ttl_ms: 2500 }
const STATE_SHARPEN = { state_id: 'sharpening_gaze' as const, state_text: '面试官的眼神锐利起来...', ttl_ms: 2500 }
const STATE_PEN_DOWN = { state_id: 'pen_down' as const, state_text: '面试官放下了笔...', ttl_ms: 2000 }
const STATE_LEANING = { state_id: 'leaning_forward' as const, state_text: '面试官身体前倾...', ttl_ms: 2500 }
const STATE_SILENT = { state_id: 'silent_pause' as const, state_text: '面试官沉默了几秒...', ttl_ms: 2500 }
const STATE_IDLE = { state_id: 'idle' as const, state_text: '等待你的回答', ttl_ms: 0 }

let _gMsgCounter = 0
const nextMessageId = () => `m_${(++_gMsgCounter).toString().padStart(3, '0')}`
let _gTurnCounter = 0
const nextTurnId = () => `t_${(++_gTurnCounter).toString().padStart(3, '0')}`

function emit<K extends SSEEventName>(
  handlers: SSEHandlers,
  name: K,
  payload: SSEEventMap[K],
): void {
  const h = handlers[name] as ((p: SSEEventMap[K]) => void) | undefined
  h?.(payload)
}

export function runMockScript(
  sessionId: string,
  handlers: SSEHandlers,
): MockSSEController {
  const timers = new Set<Timer>()
  let topicIdx = 0
  let inTopicAnswerIdx = 0 // 当前 topic 里收到的第 N 个回答(0-based)
  let topicsCovered = 0
  let closed = false
  let minReachedEmitted = false

  const schedule = (ms: number, fn: () => void): void => {
    if (closed) return
    const t = setTimeout(() => {
      timers.delete(t)
      if (!closed) fn()
    }, ms)
    timers.add(t)
  }

  const setState = (state: { state_id: string; state_text: string; ttl_ms: number }): void => {
    emit(handlers, 'interviewer_state', state as SSEEventMap['interviewer_state'])
  }

  const streamAssistantMessage = (params: {
    topic: TopicSpec
    mode: SSEAssistantMessageStart['mode']
    depth: number
    text: string
    thinking_steps: string[]
    onDone: () => void
  }): void => {
    const messageId = nextMessageId()
    setState(STATE_THINKING)

    schedule(500, () => {
      emit(handlers, 'assistant_message_start', {
        message_id: messageId,
        mode: params.mode,
        topic_id: params.topic.id,
        topic_name: params.topic.name,
        depth: params.depth,
      })

      // 推送 thinking_steps,每条间隔 250ms
      params.thinking_steps.forEach((content, idx) => {
        schedule(250 + idx * 350, () => {
          const isTool = content.startsWith('[Tool]')
          const step: SSEThinkingStep = {
            message_id: messageId,
            step_index: idx,
            step_type: isTool
              ? 'tool_call'
              : idx === params.thinking_steps.length - 1
                ? 'final'
                : idx === params.thinking_steps.length - 2 && !isTool
                  ? 'observation'
                  : 'thought',
            content: isTool ? content.replace(/^\[Tool\]\s*/, '') : content,
            tool_name: isTool ? content.match(/\[Tool\]\s*([\w_]+)/)?.[1] ?? null : null,
            tool_args: isTool ? {} : null,
          }
          emit(handlers, 'thinking_step', step)
        })
      })

      const deltaStart = 250 + params.thinking_steps.length * 350 + 200
      // 按字符切分推送 delta
      const tokens: string[] = []
      let buf = ''
      for (const ch of params.text) {
        buf += ch
        if (buf.length >= 3 || /[,。!?,.!?\s]/.test(ch)) {
          tokens.push(buf)
          buf = ''
        }
      }
      if (buf) tokens.push(buf)

      tokens.forEach((tok, idx) => {
        schedule(deltaStart + idx * 45, () => {
          emit(handlers, 'assistant_message_delta', {
            message_id: messageId,
            delta: tok,
          })
        })
      })

      const endAt = deltaStart + tokens.length * 45 + 200
      schedule(endAt, () => {
        emit(handlers, 'assistant_message_end', {
          message_id: messageId,
          full_text: params.text,
          thinking_steps_count: params.thinking_steps.length,
        })
        setState(STATE_IDLE)
        params.onDone()
      })
    })
  }

  // 第一次开场:连接 → session_started → topic_started → 第一道题
  schedule(150, () => {
    emit(handlers, 'session_started', {
      session_id: sessionId,
      persona: {
        card_id: 'cold_techlead',
        name: '冷酷大厂 Tech Lead',
        dimensions: { warmth: 20, depth_preference: 80, pace: 70, vision: 40 },
      },
    })
    handlers.onOpen?.()

    schedule(400, () => {
      const t = TOPICS[0]
      const ts: SSETopicStarted = {
        topic_id: t.id,
        topic_name: t.name,
        weight: t.weight,
        depth_level: t.depth_level,
        is_red_flag_hunt: false,
      }
      emit(handlers, 'topic_started', ts)
      streamAssistantMessage({
        topic: t,
        mode: 'OPENING',
        depth: 0,
        text: t.questions[0],
        thinking_steps: t.thinking_per_answer[0].slice(0, 2),
        onDone: () => {},
      })
    })
  })

  const onUserAnswer = (content: string): void => {
    if (closed) return
    const topic = TOPICS[topicIdx]
    if (!topic) return

    const evalSpec = topic.evaluations[inTopicAnswerIdx]
    const turnId = nextTurnId()
    const isInterrupt = content.length > 500

    // silent_pause → evaluator_started → 4 thinking steps → evaluator_result
    setState(STATE_SILENT)

    schedule(600, () => {
      emit(handlers, 'evaluator_started', { turn_id: turnId })
      setState(STATE_NOTE_TAKING)
    })

    const reactSteps = topic.thinking_per_answer[inTopicAnswerIdx]
    reactSteps.forEach((content, idx) => {
      schedule(900 + idx * 300, () => {
        const isTool = content.startsWith('[Tool]')
        emit(handlers, 'thinking_step', {
          message_id: `eval_${turnId}`,
          step_index: idx,
          step_type: isTool ? 'tool_call' : idx === reactSteps.length - 1 ? 'final' : 'thought',
          content: isTool ? content.replace(/^\[Tool\]\s*/, '') : content,
          tool_name: isTool ? content.match(/\[Tool\]\s*([\w_]+)/)?.[1] ?? null : null,
          tool_args: isTool ? {} : null,
        })
        if (isTool) setState(STATE_READING)
      })
    })

    const afterReactAt = 900 + reactSteps.length * 300 + 200

    schedule(afterReactAt, () => {
      emit(handlers, 'evaluator_result', {
        turn_id: turnId,
        evaluation: {
          answer_quality: evalSpec.answer_quality,
          dimension_deltas: evalSpec.deltas,
          current_satisfaction: evalSpec.satisfaction,
          found_gaps: evalSpec.gaps,
          found_strengths: evalSpec.strengths,
          drill_down_target: evalSpec.drill_down_target,
          drill_down_hint: evalSpec.drill_down_hint,
          red_flags_to_add: evalSpec.red_flag ? [evalSpec.red_flag] : [],
          bright_spots_to_add: evalSpec.bright_spot ? [evalSpec.bright_spot] : [],
          topic_finish_signal: evalSpec.finish_signal ?? null,
        },
      })

      const prevSat = inTopicAnswerIdx === 0 ? 50 : topic.evaluations[inTopicAnswerIdx - 1].satisfaction
      emit(handlers, 'satisfaction_update', {
        topic_id: topic.id,
        previous_value: prevSat,
        new_value: evalSpec.satisfaction,
        delta: evalSpec.satisfaction - prevSat,
      })

      if (evalSpec.satisfaction > prevSat) setState(STATE_NODDING)
      else if (evalSpec.satisfaction < prevSat) setState(STATE_FROWNING)

      if (evalSpec.red_flag) {
        schedule(200, () => emit(handlers, 'red_flag_added', { flag: evalSpec.red_flag! }))
      }
      if (evalSpec.bright_spot) {
        schedule(200, () => emit(handlers, 'bright_spot_added', { spot: evalSpec.bright_spot! }))
      }

      // 判断:再来一轮 drill_down,还是 topic_finished 进下一题
      const hasMoreInTopic =
        evalSpec.drill_down_target != null && inTopicAnswerIdx + 1 < topic.questions.length

      const proceedAt = 600

      if (hasMoreInTopic) {
        const nextQ = topic.questions[inTopicAnswerIdx + 1]
        const nextThinking = topic.thinking_per_answer[inTopicAnswerIdx + 1]?.slice(0, 3) ?? []
        inTopicAnswerIdx += 1
        schedule(proceedAt, () => {
          const mode: SSEAssistantMessageStart['mode'] = isInterrupt ? 'INTERRUPT' : 'DRILL_DOWN'
          setState(STATE_SHARPEN)
          streamAssistantMessage({
            topic,
            mode,
            depth: inTopicAnswerIdx,
            text: nextQ,
            thinking_steps: nextThinking,
            onDone: () => {},
          })
        })
      } else {
        schedule(proceedAt, () => {
          emit(handlers, 'topic_finished', {
            topic_id: topic.id,
            reason: topic.finish_reason,
            final_satisfaction: evalSpec.satisfaction,
          })
          setState(STATE_PEN_DOWN)
          topicsCovered += 1

          // 5 题门槛
          if (topicsCovered === 5 && !minReachedEmitted) {
            minReachedEmitted = true
            schedule(300, () =>
              emit(handlers, 'min_topics_reached', { covered_count: topicsCovered }),
            )
          }

          // 进下一 topic
          topicIdx += 1
          inTopicAnswerIdx = 0
          const nextTopic = TOPICS[topicIdx]
          if (!nextTopic) {
            // 题库用完 → natural_end
            schedule(600, () =>
              emit(handlers, 'session_ended', {
                reason: 'natural_end',
                report_ready_eta_ms: 2000,
                below_minimum: topicsCovered < 5,
              }),
            )
            return
          }
          schedule(800, () => {
            emit(handlers, 'topic_started', {
              topic_id: nextTopic.id,
              topic_name: nextTopic.name,
              weight: nextTopic.weight,
              depth_level: nextTopic.depth_level,
              is_red_flag_hunt: false,
            })
            setState(STATE_LEANING)
            streamAssistantMessage({
              topic: nextTopic,
              mode: 'OPENING',
              depth: 0,
              text: nextTopic.questions[0],
              thinking_steps: nextTopic.thinking_per_answer[0].slice(0, 2),
              onDone: () => {},
            })
          })
        })
      }
    })
  }

  const onEnd = (): void => {
    if (closed) return
    schedule(200, () => {
      emit(handlers, 'session_ended', {
        reason: 'user_initiated',
        report_ready_eta_ms: 2000,
        below_minimum: topicsCovered < 5,
      })
    })
  }

  return {
    onUserAnswer,
    onEnd,
    close: () => {
      closed = true
      for (const t of timers) clearTimeout(t)
      timers.clear()
    },
    get topicsCovered() {
      return topicsCovered
    },
  }
}
