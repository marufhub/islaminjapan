export const AI_ERROR_KINDS = [
  'not_configured',
  'model_unavailable',
  'quota_exceeded',
  'unauthorized',
  'forbidden',
  'invalid_request',
  'rate_limited',
  'budget_exceeded',
  'upstream_rate_limited',
  'upstream_unavailable',
  'timeout',
  'refusal',
  'truncated',
  'invalid_output',
  'conflict',
  'unknown',
] as const

export type AIErrorKind = (typeof AI_ERROR_KINDS)[number]

const HTTP_STATUS: Record<AIErrorKind, number> = {
  not_configured: 503,
  model_unavailable: 503,
  quota_exceeded: 503,
  unauthorized: 401,
  forbidden: 403,
  invalid_request: 400,
  rate_limited: 429,
  budget_exceeded: 429,
  upstream_rate_limited: 503,
  upstream_unavailable: 502,
  timeout: 504,
  refusal: 422,
  truncated: 422,
  invalid_output: 502,
  conflict: 409,
  unknown: 500,
}

/** Errors surfaced to the AI Studio UI. Messages are safe to show and never contain secrets. */
export type TokenUsage = { inputTokens: number; outputTokens: number }

export class AIError extends Error {
  readonly kind: AIErrorKind
  readonly retryable: boolean
  /** Tokens consumed before the failure (e.g. a truncated or refused response), for budget accounting. */
  readonly usage?: TokenUsage

  constructor(kind: AIErrorKind, message: string, options: { retryable?: boolean; cause?: unknown; usage?: TokenUsage } = {}) {
    super(message, { cause: options.cause })
    this.name = 'AIError'
    this.kind = kind
    this.retryable = options.retryable ?? false
    this.usage = options.usage
  }

  get status(): number {
    return HTTP_STATUS[this.kind]
  }
}
