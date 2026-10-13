import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'

import { aiConfig, isAIConfigured } from './config'
import { AIError, type TokenUsage } from './errors'
import type { LLMProvider, StructuredRequest, StructuredResult } from './provider'

const isInsufficientQuota = (error: InstanceType<typeof OpenAI.APIError>): boolean => error.code === 'insufficient_quota'

/** Maps OpenAI SDK errors to user-facing AI Studio errors (most specific first). Never echoes keys. */
export const mapOpenAIError = (error: unknown): AIError => {
  if (error instanceof AIError) return error
  if (error instanceof OpenAI.AuthenticationError) {
    return new AIError('not_configured', 'The AI service rejected the server credentials. Check OPENAI_API_KEY.', { cause: error })
  }
  if (error instanceof OpenAI.PermissionDeniedError || error instanceof OpenAI.NotFoundError) {
    return new AIError('model_unavailable', 'The configured model is not available to this API account. Check OPENAI_MODEL / OPENAI_FAST_MODEL.', { cause: error })
  }
  if (error instanceof OpenAI.RateLimitError) {
    return isInsufficientQuota(error)
      ? new AIError('quota_exceeded', 'The OpenAI account has no remaining quota. Check billing on the OpenAI platform.', { cause: error })
      : new AIError('upstream_rate_limited', 'The AI service is busy. Please try again in a minute.', { retryable: true, cause: error })
  }
  if (error instanceof OpenAI.BadRequestError) {
    return new AIError('invalid_request', 'The AI service could not process this request. Try shortening the notes or sources.', { cause: error })
  }
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return new AIError('timeout', 'The AI request timed out. Please try again.', { retryable: true, cause: error })
  }
  if (error instanceof OpenAI.APIConnectionError) {
    return new AIError('upstream_unavailable', 'Could not reach the AI service. Please try again.', { retryable: true, cause: error })
  }
  if (error instanceof OpenAI.APIError) {
    const retryable = (error.status ?? 500) >= 500
    return new AIError('upstream_unavailable', 'The AI service returned an error. Please try again.', { retryable, cause: error })
  }
  return new AIError('unknown', 'Unexpected error while generating content.', { cause: error })
}

type ResponseItem = OpenAI.Responses.ResponseOutputItem

const findRefusal = (output: ResponseItem[]): string | null => {
  for (const item of output) {
    if (item.type !== 'message') continue
    for (const content of item.content) {
      if (content.type === 'refusal') return content.refusal
    }
  }
  return null
}

/**
 * OpenAI Responses API provider with structured outputs (`zodTextFormat`).
 * `responses.create` is used rather than `responses.parse` so that the response status, refusals and
 * token usage are always inspected first; the JSON is then validated against the Zod schema here.
 * Requests are server-side only, with `store: false` unless OPENAI_STORE=true.
 */
export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai'
  private readonly client: OpenAI

  constructor(options: { client?: OpenAI } = {}) {
    if (!options.client && !isAIConfigured()) {
      throw new AIError('not_configured', 'AI generation is not configured. Set OPENAI_API_KEY on the server.')
    }
    this.client = options.client ?? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: aiConfig().timeoutMs, maxRetries: 2 })
  }

  async generateStructured<T>(request: StructuredRequest<T>): Promise<StructuredResult<T>> {
    const config = aiConfig()
    const model = config.models[request.tier]
    let response: OpenAI.Responses.Response
    try {
      response = await this.client.responses.create({
        model,
        // Server-controlled editorial policy; editor input and source excerpts go in the lower-trust `input`.
        instructions: request.system,
        input: request.prompt,
        text: { format: zodTextFormat(request.schema, request.schemaName) },
        max_output_tokens: Math.min(request.maxTokens, config.maxOutputTokens),
        reasoning: { effort: request.effort },
        store: config.store,
      })
    } catch (error) {
      throw mapOpenAIError(error)
    }

    const usage: TokenUsage = { inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 }
    const refusal = findRefusal(response.output)
    if (refusal || response.incomplete_details?.reason === 'content_filter') {
      throw new AIError('refusal', 'The AI declined this request. Rephrase the topic or instructions, or write this piece manually.', { usage })
    }
    if (response.status === 'incomplete') {
      throw new AIError('truncated', 'The response was cut off before it was complete. Choose a shorter length, a narrower topic, or raise AI_MAX_OUTPUT_TOKENS.', { usage })
    }
    if (response.status !== 'completed') {
      throw new AIError('upstream_unavailable', 'The AI service did not complete the request. Please try again.', { retryable: true, usage })
    }

    const parsed = (() => {
      try {
        return request.schema.safeParse(JSON.parse(response.output_text))
      } catch {
        return null
      }
    })()
    if (!parsed?.success) {
      throw new AIError('invalid_output', 'The AI response did not match the expected format. Please try again.', { retryable: true, usage })
    }
    return { data: parsed.data, model: response.model, usage, requestId: response.id ?? null }
  }
}
