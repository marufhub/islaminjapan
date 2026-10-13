import type { z } from 'zod'

import type { ModelTier } from './config'

export type Effort = 'low' | 'medium' | 'high'

export type StructuredRequest<T> = {
  /** Stable instructions (cacheable). */
  system: string
  /** The task, including delimited untrusted material (editor notes, source excerpts). */
  prompt: string
  schema: z.ZodType<T>
  /** Name for the JSON schema sent to the API (letters, digits, underscores). */
  schemaName: string
  /** 'main' for substantial drafting, 'fast' for outlines, SEO and suggestions. */
  tier: ModelTier
  maxTokens: number
  effort: Effort
}

export type StructuredResult<T> = {
  data: T
  model: string
  usage: { inputTokens: number; outputTokens: number }
  /** Provider request/response id for support and auditing. */
  requestId: string | null
}

/**
 * Provider seam for AI generation. Only OpenAI is implemented; the interface exists so the
 * studio logic can be tested with a fake provider and so another vendor could be added later.
 */
export interface LLMProvider {
  readonly name: string
  generateStructured<T>(request: StructuredRequest<T>): Promise<StructuredResult<T>>
}
