import type { AIErrorKind } from '@/lib/ai/errors'
import type { GenerateRequest } from '@/lib/ai/schemas'

import type { GenerateResponse } from './generate'
import type { SaveRequest } from './save'

export type ApiError = { kind: AIErrorKind | 'network'; message: string; retryable: boolean }
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError }

/** Calls an AI Studio endpoint with the CMS session cookie (same origin only). */
const post = async <T>(path: string, body: unknown): Promise<ApiResult<T>> => {
  try {
    const response = await fetch(`/api/ai-studio/${path}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = (await response.json().catch(() => null)) as ApiResult<T> | null
    if (payload && typeof payload === 'object' && 'ok' in payload) return payload
    return { ok: false, error: { kind: 'unknown', message: `Unexpected response (${response.status}).`, retryable: response.status >= 500 } }
  } catch {
    return { ok: false, error: { kind: 'network', message: 'Network error. Check your connection and try again.', retryable: true } }
  }
}

export const studioApi = {
  generate: (request: GenerateRequest) => post<GenerateResponse>('generate', request),
  save: (request: SaveRequest) => post<{ id: number; slug: string; updatedAt: string }>('save', request),
  submitReview: (articleId: number) => post<{ id: number; editorialStatus: string; updatedAt: string }>('submit-review', { articleId }),
  addTopics: (body: { language: 'ja' | 'en'; topics: Array<{ topic: string; audience: string; category: string; reason: string }> }) =>
    post<{ created: number[] }>('topics', body),
}
