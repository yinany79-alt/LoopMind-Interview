import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInterviewStore } from '@/store/interviewStore'
import { useInterviewSSE } from '@/hooks/useSSE'
import { useDebugMode } from '@/hooks/useDebugMode'
import { endSession, submitAnswer } from '@/api/rest'
import InterviewerHeader from '@/components/interview/InterviewerHeader'
import ChatStream from '@/components/interview/ChatStream'
import InputBox from '@/components/interview/InputBox'
import EndDialog from '@/components/interview/EndDialog'
import ConfettiEffect from '@/components/interview/ConfettiEffect'
import MinReachedToast from '@/components/interview/MinReachedToast'

export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { enabled: debug } = useDebugMode()

  const storeSessionId = useInterviewStore((s) => s.session_id)
  const sseStatus = useInterviewStore((s) => s.sse_status)
  const awaitingAssistant = useInterviewStore((s) => s.awaiting_assistant)
  const messagesLen = useInterviewStore((s) => s.messages.length)
  const topicsCovered = useInterviewStore((s) => s.topics_covered_count)
  const minReached = useInterviewStore((s) => s.min_topics_reached)
  const sessionEnded = useInterviewStore((s) => s.session_ended)
  const appendUserMessage = useInterviewStore((s) => s.appendUserMessage)

  const activeSessionId = sessionId ?? storeSessionId
  const [endDialogOpen, setEndDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)

  // 没有 session 上下文,弹回首页
  useEffect(() => {
    if (!activeSessionId) navigate('/', { replace: true })
  }, [activeSessionId, navigate])

  const { handleRef } = useInterviewSSE(activeSessionId ?? null)

  // 后端 session_ended 后,跳报告页
  useEffect(() => {
    if (sessionEnded && activeSessionId) {
      navigate(`/report/${activeSessionId}`)
    }
  }, [sessionEnded, activeSessionId, navigate])

  const handleSend = async (text: string): Promise<void> => {
    if (!activeSessionId || submitting) return
    setSubmitting(true)
    setNetworkError(null)
    appendUserMessage(text)
    try {
      await submitAnswer(activeSessionId, { content: text })
      // mock 模式下还要把答案推给 mock SSE 引擎
      handleRef.current?.sendUserAnswer(activeSessionId, text)
    } catch (e) {
      console.error(e)
      setNetworkError('提交失败,请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEndClick = (): void => {
    if (topicsCovered < 5) {
      setEndDialogOpen(true)
    } else {
      void confirmEnd()
    }
  }

  const confirmEnd = async (): Promise<void> => {
    if (!activeSessionId) return
    try {
      await endSession(activeSessionId, { reason: 'user_initiated' })
      // session_ended SSE 事件会触发跳转,这里也兜底跳一次
      navigate(`/report/${activeSessionId}`)
    } catch (e) {
      console.error(e)
      setNetworkError('结束面试失败')
    } finally {
      setEndDialogOpen(false)
    }
  }

  const sseLabel = useMemo(() => {
    switch (sseStatus) {
      case 'connecting':
        return '连接中…'
      case 'disconnected':
        return '与面试官失联,正在重连…'
      case 'connected':
        return null
      default:
        return null
    }
  }, [sseStatus])

  return (
    <div className="flex h-[calc(100vh-3.5rem-5rem)] flex-col gap-4">
      <InterviewerHeader onEndClick={handleEndClick} />

      {sseLabel && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1.5 text-xs text-[var(--text-tertiary)]">
          {sseLabel}
        </div>
      )}
      {networkError && (
        <div className="rounded-md border border-[var(--bad)] bg-[var(--bad)]/10 px-3 py-1.5 text-xs text-[var(--bad)]">
          {networkError}
        </div>
      )}
      {messagesLen === 0 && sseStatus === 'connected' && (
        <div className="rounded-md border border-[var(--divider)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-tertiary)]">
          面试官正在准备开场题…
        </div>
      )}

      <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatStream debug={debug} />
        <InputBox
          disabled={submitting || awaitingAssistant || !!sessionEnded}
          onSubmit={handleSend}
        />
      </div>

      <ConfettiEffect />
      <MinReachedToast />
      <EndDialog
        open={endDialogOpen}
        topicsCovered={topicsCovered}
        onContinue={() => setEndDialogOpen(false)}
        onConfirmEnd={() => void confirmEnd()}
      />

      {minReached && topicsCovered >= 5 && !sessionEnded && (
        <div className="sr-only">达到结束门槛</div>
      )}
    </div>
  )
}
