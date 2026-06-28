import type {
  AnswerRequest,
  AnswerResponse,
  ChallengerStats,
  CreateSessionRequest,
  CreateSessionResponse,
  CuratedJob,
  CuratedJobDetail,
  EndRequest,
  EndResponse,
  JourneyHistoryItem,
  JourneyStats,
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

// ===== Session 三模式 =====

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

// ===== Curated Jobs / Trending Missions =====

export async function fetchCuratedJobs(): Promise<{ jobs: CuratedJob[] }> {
  if (USE_MOCK) return { jobs: [] }
  return http('/api/curated-jobs')
}

export async function fetchCuratedJobDetail(
  jobId: string,
): Promise<CuratedJobDetail> {
  if (USE_MOCK) throw new Error('not implemented in mock')
  return http(`/api/curated-jobs/${jobId}`)
}

// ===== Challenger 推荐 + 详情统计 =====

export async function fetchRecommendedChallengers(
  count = 4,
): Promise<PersonasResponse> {
  if (USE_MOCK) return mock.fetchPersonas()
  return http(`/api/challengers/recommended?count=${count}`)
}

export async function fetchChallengerStats(
  personaId: string,
): Promise<ChallengerStats> {
  if (USE_MOCK) {
    return {
      persona_id: personaId,
      challenged_count: 0,
      avg_duration_min: 14,
      pass_rate: 50,
      rating: 4.8,
    }
  }
  return http(`/api/challengers/${personaId}/stats`)
}

// ===== Journey / Battle Record =====

export async function fetchJourneyStats(): Promise<JourneyStats> {
  if (USE_MOCK) {
    return { level: 1, total: 0, passed: 0, avg_score: 0, defeated: [] }
  }
  return http('/api/history/stats')
}

export async function fetchJourneyHistory(
  limit = 20,
): Promise<{ items: JourneyHistoryItem[] }> {
  if (USE_MOCK) return { items: [] }
  return http(`/api/history/list?limit=${limit}`)
}

// ===== Debug =====

export interface DebugStateResp {
  breakpoints: string[]
  paused_at: string | null
  step_mode: boolean
  available_nodes: string[]
}

export async function debugFetchState(sessionId: string): Promise<DebugStateResp> {
  if (USE_MOCK)
    return { breakpoints: [], paused_at: null, step_mode: false, available_nodes: [] }
  return http(`/api/sessions/${sessionId}/debug/state`)
}

export async function debugToggleBreakpoint(
  sessionId: string,
  nodeId: string,
  action: 'add' | 'remove',
): Promise<{ ok: boolean; breakpoints: string[] }> {
  if (USE_MOCK) return { ok: true, breakpoints: [] }
  return http(`/api/sessions/${sessionId}/debug/breakpoints`, {
    method: 'POST',
    json: { node_id: nodeId, action },
  })
}

export async function debugResume(
  sessionId: string,
  step: boolean,
): Promise<{ ok: boolean; step?: boolean; reason?: string }> {
  if (USE_MOCK) return { ok: true }
  return http(`/api/sessions/${sessionId}/debug/resume`, {
    method: 'POST',
    json: { step },
  })
}
