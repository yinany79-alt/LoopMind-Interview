/**
 * InterviewPage — Cyber Interview V2 三栏面试页(改皮 + 重构)。
 *
 * 设计图 image.png Page 4:
 * - 顶部 bar:< 退出面试 · 面试中 23:45 · 面试官信息 / 设置
 * - 左栏:面试进度(skill_tree 5 个 topic)
 * - 中栏:对话流 + 输入框
 * - 右栏:面试助手(进度环 + 实时反馈 + satisfaction 条)
 *
 * Coffee Chat 模式(mode === 'coffee_chat'):隐藏左右两栏,只显中间对话区。
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Info, Settings } from 'lucide-react'
import { useInterviewStore } from '@/store/interviewStore'
import { useInterviewSSE } from '@/hooks/useSSE'
import { useDebugMode } from '@/hooks/useDebugMode'
import { endSession, submitAnswer } from '@/api/rest'
import ChatStream from '@/components/interview/ChatStream'
import InputBox from '@/components/interview/InputBox'
import EndDialog from '@/components/interview/EndDialog'
import ConfettiEffect from '@/components/interview/ConfettiEffect'
import MinReachedToast from '@/components/interview/MinReachedToast'
import TopicProgressPanel from '@/components/interview/TopicProgressPanel'
import AssistantPanel from '@/components/interview/AssistantPanel'

export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { enabled: debug } = useDebugMode()

  const storeSessionId = useInterviewStore((s) => s.session_id)
  const mode = useInterviewStore((s) => s.mode)
  const selectedPersona = useInterviewStore((s) => s.selected_persona)
  const sseStatus = useInterviewStore((s) => s.sse_status)
  const awaitingAssistant = useInterviewStore((s) => s.awaiting_assistant)
  const messagesLen = useInterviewStore((s) => s.messages.length)
  const topicsCovered = useInterviewStore((s) => s.topics_covered_count)
  const minReached = useInterviewStore((s) => s.min_topics_reached)
  const sessionEnded = useInterviewStore((s) => s.session_ended)
  const appendUserMessage = useInterviewStore((s) => s.appendUserMessage)

  const activeSessionId = sessionId ?? storeSessionId
  const isCoffee = mode === 'coffee_chat'
  const [endDialogOpen, setEndDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)

  // 计时器
  useEffect(() => {
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  // 没有 session 上下文,弹回首页
  useEffect(() => {
    if (!activeSessionId) navigate('/', { replace: true })
  }, [activeSessionId, navigate])

  const { handleRef } = useInterviewSSE(activeSessionId ?? null)

  // 后端 session_ended 后,跳报告页(coffee_chat 也跳,但报告稀薄)
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
      handleRef.current?.sendUserAnswer(activeSessionId, text)
    } catch (e) {
      console.error(e)
      setNetworkError('提交失败,请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEndClick = (): void => {
    if (isCoffee || topicsCovered >= 5) {
      void confirmEnd()
    } else {
      setEndDialogOpen(true)
    }
  }

  const confirmEnd = async (): Promise<void> => {
    if (!activeSessionId) return
    try {
      await endSession(activeSessionId, { reason: 'user_initiated' })
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
      default:
        return null
    }
  }, [sseStatus])

  const elapsedStr = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  return (
    <div className="flex h-[calc(100vh-4rem-5rem)] flex-col gap-4">
      {/* 顶部 bar */}
      <header className="card flex items-center gap-3 px-5 py-3">
        <button
          type="button"
          onClick={handleEndClick}
          className="btn-ghost"
        >
          <ArrowLeft size={14} /> {isCoffee ? '结束聊天' : '退出面试'}
        </button>
        <div className="mx-auto flex items-center gap-3">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--good)]" />
          <span className="text-[14px] font-medium text-[var(--text-primary)]">
            {isCoffee ? 'Coffee Chat 进行中' : '面试中'}
          </span>
          <span className="font-mono text-[13px] tabular-nums text-[var(--text-tertiary)]">
            · {elapsedStr}
          </span>
          {selectedPersona && (
            <>
              <span className="text-[var(--text-quaternary)]">·</span>
              <span className="text-[13px] font-medium text-[var(--text-secondary)]">
                {selectedPersona.name}
              </span>
            </>
          )}
        </div>
        <button type="button" className="btn-ghost" disabled>
          <Info size={14} /> 面试官信息
        </button>
        <button type="button" className="btn-ghost" disabled>
          <Settings size={14} />
        </button>
      </header>

      {sseLabel && (
        <div className="card px-4 py-2 text-[12px] text-[var(--text-tertiary)]">
          {sseLabel}
        </div>
      )}
      {networkError && (
        <div className="rounded-xl border border-[var(--bad)]/30 bg-[var(--bad)]/5 px-4 py-2 text-[12px] text-[var(--bad)]">
          {networkError}
        </div>
      )}

      {/* 三栏(Coffee Chat 隐藏左右) */}
      <div
        className={`grid min-h-0 flex-1 gap-4 ${
          isCoffee
            ? 'grid-cols-1'
            : 'grid-cols-1 lg:grid-cols-[240px_1fr_280px]'
        }`}
      >
        {!isCoffee && (
          <aside className="card hidden lg:flex">
            <TopicProgressPanel />
          </aside>
        )}

        <main className="card flex min-h-0 flex-col overflow-hidden">
          {messagesLen === 0 && sseStatus === 'connected' && (
            <div className="border-b border-[var(--divider)] px-5 py-3 text-[12px] text-[var(--text-tertiary)]">
              {isCoffee ? '面试官正在准备开场…' : '面试官正在准备开场题…'}
            </div>
          )}
          <ChatStream debug={debug} />
          <InputBox
            disabled={submitting || awaitingAssistant || !!sessionEnded}
            onSubmit={handleSend}
          />
        </main>

        {!isCoffee && (
          <aside className="card hidden lg:flex">
            <AssistantPanel />
          </aside>
        )}
      </div>

      {!isCoffee && <ConfettiEffect />}
      {!isCoffee && <MinReachedToast />}
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
