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
import * as mock from './mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const isMock = (): boolean => USE_MOCK

async function http<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    body: init?.json ? JSON.stringify(init.json) : init?.body,
  })
  if (!res.ok) {
    let err: unknown
    try {
      err = await res.json()
    } catch {
      err = { error: { code: 'NETWORK', message: res.statusText } }
    }
    throw err
  }
  return (await res.json()) as T
}

export async function createSession(
  body: CreateSessionRequest,
): Promise<CreateSessionResponse> {
  if (USE_MOCK) return mock.createSession(body)
  return http('/api/sessions', { method: 'POST', json: body })
}

export async function fetchPersonas(): Promise<PersonasResponse> {
  if (USE_MOCK) return mock.fetchPersonas()
  return http('/api/personas')
}

export async function startSession(
  sessionId: string,
  body: SessionStartRequest,
): Promise<SessionStartResponse> {
  if (USE_MOCK) return mock.startSession(sessionId, body)
  return http(`/api/sessions/${sessionId}/start`, { method: 'POST', json: body })
}

export async function submitAnswer(
  sessionId: string,
  body: AnswerRequest,
): Promise<AnswerResponse> {
  if (USE_MOCK) return mock.submitAnswer(sessionId, body)
  return http(`/api/sessions/${sessionId}/answer`, {
    method: 'POST',
    json: body,
  })
}

export async function endSession(
  sessionId: string,
  body: EndRequest,
): Promise<EndResponse> {
  if (USE_MOCK) return mock.endSession(sessionId, body)
  return http(`/api/sessions/${sessionId}/end`, { method: 'POST', json: body })
}

export async function fetchReport(sessionId: string): Promise<Report> {
  if (USE_MOCK) return mock.fetchReport(sessionId)
  return http(`/api/sessions/${sessionId}/report`)
}

export function getStreamUrl(sessionId: string): string {
  return `${BASE}/api/sessions/${sessionId}/stream`
}
