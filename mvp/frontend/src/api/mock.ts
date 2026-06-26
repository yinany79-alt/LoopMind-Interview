import type {
  AnswerRequest,
  AnswerResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  EndRequest,
  EndResponse,
  PersonasResponse,
  Report,
  SessionStartRequest,
  SessionStartResponse,
} from '@/types/api'
import { runMockScript, type MockSSEController } from './mockScript'
import type { SSEHandlers, SSEHandle } from './sse'

import personasJson from './mock/personas.json'
import createSessionJson from './mock/createSession.json'
import startSessionJson from './mock/startSession.json'
import reportJson from './mock/report.json'

const MOCK_DELAY = 200 // 模拟网络延时,过短反而看着假

function delay<T>(value: T, ms = MOCK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// 用一个简单的伪随机生成 session_id,跨调用稳定
let _mockSessionCounter = 0
function nextSessionId(): string {
  _mockSessionCounter += 1
  return `mock-${_mockSessionCounter.toString(16).padStart(4, '0')}-` +
    'aaaa-bbbb-cccccccccccc'
}

/* —— REST mocks —— */

export async function createSession(
  _body: CreateSessionRequest,
): Promise<CreateSessionResponse> {
  const resp = {
    ...createSessionJson,
    session_id: nextSessionId(),
    created_at: '2026-06-25T14:30:00Z',
  } as CreateSessionResponse
  return delay(resp)
}

export async function fetchPersonas(): Promise<PersonasResponse> {
  return delay(personasJson as PersonasResponse)
}

export async function startSession(
  sessionId: string,
  _body: SessionStartRequest,
): Promise<SessionStartResponse> {
  return delay({
    ...startSessionJson,
    session_id: sessionId,
    stream_url: `/api/sessions/${sessionId}/stream`,
  } as SessionStartResponse)
}

const lastAnswerBySession = new Map<string, string>()
let answerTurnCounter = 0

export async function submitAnswer(
  sessionId: string,
  body: AnswerRequest,
): Promise<AnswerResponse> {
  answerTurnCounter += 1
  const turnId = `t_${answerTurnCounter.toString().padStart(3, '0')}`
  lastAnswerBySession.set(sessionId, body.content)
  // 触发 mock SSE 流推进
  mockControllers.get(sessionId)?.onUserAnswer(body.content)
  return delay({ accepted: true, turn_id: turnId })
}

const reportReadyAt = new Map<string, number>()

export async function endSession(
  sessionId: string,
  _body: EndRequest,
): Promise<EndResponse> {
  reportReadyAt.set(sessionId, Date.now() + 2000)
  mockControllers.get(sessionId)?.onEnd()
  // covered_count 取自当前 mock 引擎记录
  const covered = mockControllers.get(sessionId)?.topicsCovered ?? 5
  return delay({
    session_id: sessionId,
    status: 'ended',
    report_url: `/api/sessions/${sessionId}/report`,
    topics_covered_count: covered,
    below_minimum: covered < 5,
  })
}

export async function fetchReport(sessionId: string): Promise<Report> {
  const readyAt = reportReadyAt.get(sessionId)
  if (!readyAt || Date.now() < readyAt) {
    return delay({ session_id: sessionId, status: 'generating' } as Report, 300)
  }
  return delay({
    ...(reportJson as Report),
    session_id: sessionId,
  })
}

/* —— SSE mock —— */

const mockControllers = new Map<string, MockSSEController>()

export function createMockSSE(
  sessionId: string,
  handlers: SSEHandlers,
): SSEHandle {
  const controller = runMockScript(sessionId, handlers)
  mockControllers.set(sessionId, controller)
  return {
    close: () => {
      controller.close()
      mockControllers.delete(sessionId)
      handlers.onClose?.()
    },
    sendUserAnswer: (sid, content) => {
      const c = mockControllers.get(sid)
      c?.onUserAnswer(content)
    },
  }
}
