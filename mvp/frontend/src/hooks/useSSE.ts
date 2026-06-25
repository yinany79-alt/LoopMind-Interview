import { useEffect, useRef } from 'react'
import { openInterviewSSE, type SSEHandle } from '@/api/sse'
import { useInterviewStore } from '@/store/interviewStore'

/**
 * 订阅一次 SSE,把所有事件 dispatch 到 store。返回一个稳定的 ref,
 * 调用方可以拿到 close / sendUserAnswer(mock 模式下用)。
 */
export function useInterviewSSE(sessionId: string | null): {
  handleRef: React.MutableRefObject<SSEHandle | null>
} {
  const handleRef = useRef<SSEHandle | null>(null)
  const store = useInterviewStore

  useEffect(() => {
    if (!sessionId) return
    store.setState({ sse_status: 'connecting' })

    const h = openInterviewSSE(sessionId, {
      onOpen: () => store.setState({ sse_status: 'connected' }),
      onError: () => store.setState({ sse_status: 'disconnected' }),
      onClose: () => store.setState({ sse_status: 'disconnected' }),

      session_started: (e) => store.getState().onSessionStarted(e),
      interviewer_state: (e) => store.getState().setInterviewerState(e),
      assistant_message_start: (e) => store.getState().startMessage(e),
      assistant_message_delta: (e) =>
        store.getState().appendDelta(e.message_id, e.delta),
      assistant_message_end: (e) => store.getState().endMessage(e),
      thinking_step: (e) => store.getState().addThinkingStep(e),
      evaluator_started: () =>
        store.getState().setInterviewerState({
          state_id: 'note_taking',
          state_text: '面试官正在记录笔记...',
          ttl_ms: 3000,
        }),
      evaluator_result: (e) => store.getState().setEvaluation(e),
      satisfaction_update: (e) => store.getState().updateSatisfaction(e),
      red_flag_added: (e) => store.getState().addRedFlag(e),
      bright_spot_added: (e) => store.getState().addBrightSpot(e),
      topic_finished: (e) => store.getState().finishTopic(e),
      topic_started: (e) => store.getState().startTopic(e),
      min_topics_reached: (e) => store.getState().markMinReached(e),
      error: (e) => store.getState().setError(e),
      session_ended: (e) => store.getState().endSession(e),
    })

    handleRef.current = h
    return () => {
      h.close()
      handleRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  return { handleRef }
}
