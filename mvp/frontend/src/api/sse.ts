import type { SSEEventMap, SSEEventName } from '@/types/api'
import { getStreamUrl, isMock } from './rest'
import { createMockSSE } from './mock'

export type SSEHandlers = {
  [K in SSEEventName]?: (payload: SSEEventMap[K]) => void
} & {
  onOpen?: () => void
  onError?: (err: unknown) => void
  onClose?: () => void
}

export interface SSEHandle {
  close: () => void
  /**
   * Mock 模式专用:推送用户回答到 mock 引擎,触发后续事件流。
   * 真后端时这是 no-op(用户回答通过 REST /answer 推送)。
   */
  sendUserAnswer: (sessionId: string, content: string) => void
}

/** 真后端模式:浏览器原生 EventSource */
function openRealSSE(sessionId: string, handlers: SSEHandlers): SSEHandle {
  const es = new EventSource(getStreamUrl(sessionId))
  es.onopen = () => handlers.onOpen?.()
  es.onerror = (err) => handlers.onError?.(err)

  const allNames: SSEEventName[] = [
    'session_started',
    'interviewer_state',
    'assistant_message_start',
    'assistant_message_delta',
    'assistant_message_end',
    'thinking_step',
    'evaluator_started',
    'evaluator_result',
    'satisfaction_update',
    'red_flag_added',
    'bright_spot_added',
    'topic_finished',
    'topic_started',
    'min_topics_reached',
    'error',
    'session_ended',
  ]

  for (const name of allNames) {
    es.addEventListener(name, (raw) => {
      try {
        const payload = JSON.parse((raw as MessageEvent).data)
        const h = handlers[name] as ((p: unknown) => void) | undefined
        h?.(payload)
      } catch (err) {
        handlers.onError?.(err)
      }
    })
  }

  return {
    close: () => {
      es.close()
      handlers.onClose?.()
    },
    sendUserAnswer: () => {
      // 真后端模式由 REST /answer 触发,SSE 无 client-push 通道
    },
  }
}

export function openInterviewSSE(
  sessionId: string,
  handlers: SSEHandlers,
): SSEHandle {
  return isMock()
    ? createMockSSE(sessionId, handlers)
    : openRealSSE(sessionId, handlers)
}
