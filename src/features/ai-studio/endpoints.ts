import { addDataAndFileToRequest, type Endpoint, type PayloadRequest } from 'payload'
import { z } from 'zod'

import { OpenAIProvider } from '@/lib/ai/openai'
import { aiConfig, isAIConfigured } from '@/lib/ai/config'
import { AIError } from '@/lib/ai/errors'
import type { LLMProvider } from '@/lib/ai/provider'
import { generateRequestSchema } from '@/lib/ai/schemas'
import type { User } from '@/payload-types'

import { generate } from './generate'
import { estimatedSpendThisMonth } from './limits'
import { addTopics, addTopicsRequestSchema, saveDraft, saveRequestSchema, submitForReview } from './save'

const submitReviewSchema = z.object({ articleId: z.number().int().positive() })

type ProviderFactory = () => LLMProvider

/** Overridable in tests; production always uses the server-side OpenAI provider. */
let providerFactory: ProviderFactory = () => new OpenAIProvider()
export const setProviderFactoryForTests = (factory: ProviderFactory | null) => {
  providerFactory = factory ?? (() => new OpenAIProvider())
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

const errorResponse = (error: AIError) =>
  json({ ok: false, error: { kind: error.kind, message: error.message, retryable: error.retryable } }, error.status)

const requireUser = (req: PayloadRequest): User => {
  if (!req.user) throw new AIError('unauthorized', 'Sign in to the CMS to use the AI Studio.')
  return req.user as User
}

const readBody = async <T>(req: PayloadRequest, schema: z.ZodType<T>): Promise<T> => {
  await addDataAndFileToRequest(req)
  const parsed = schema.safeParse(req.data)
  if (!parsed.success) {
    const fields = parsed.error.issues.slice(0, 5).map((issue) => issue.path.join('.') || 'body')
    throw new AIError('invalid_request', `Invalid request: ${fields.join(', ')}`)
  }
  return parsed.data
}

const handle =
  (run: (req: PayloadRequest) => Promise<unknown>): Endpoint['handler'] =>
  async (req) => {
    try {
      return json({ ok: true, data: await run(req) })
    } catch (error) {
      if (error instanceof AIError) return errorResponse(error)
      // Access-control and validation errors from Payload keep their status; details stay server-side.
      const status = typeof (error as { status?: unknown })?.status === 'number' ? (error as { status: number }).status : 500
      if (status >= 500) req.payload.logger.error({ err: error }, 'AI Studio endpoint failed')
      const message = status < 500 && error instanceof Error ? error.message : 'Unexpected server error.'
      return json({ ok: false, error: { kind: status === 403 ? 'forbidden' : 'unknown', message, retryable: false } }, status)
    }
  }

/** All AI Studio endpoints require an authenticated CMS user; Payload resolves the session cookie. */
export const aiStudioEndpoints: Endpoint[] = [
  {
    path: '/ai-studio/status',
    method: 'get',
    handler: handle(async (req) => {
      requireUser(req)
      const config = aiConfig()
      return {
        provider: config.provider,
        configured: isAIConfigured(),
        models: config.models,
        hourlyRequestLimit: config.hourlyRequestLimit,
        dailyTokenBudget: config.dailyTokenBudget,
        monthlyBudgetUsd: config.monthlyBudgetUsd,
        estimatedSpendThisMonthUsd: Number((await estimatedSpendThisMonth(req.payload)).toFixed(4)),
        store: config.store,
      }
    }),
  },
  {
    path: '/ai-studio/generate',
    method: 'post',
    handler: handle(async (req) => {
      const user = requireUser(req)
      const request = await readBody(req, generateRequestSchema)
      return generate(req.payload, user, request, providerFactory())
    }),
  },
  {
    path: '/ai-studio/save',
    method: 'post',
    handler: handle(async (req) => {
      const user = requireUser(req)
      return saveDraft(req.payload, user, await readBody(req, saveRequestSchema))
    }),
  },
  {
    path: '/ai-studio/submit-review',
    method: 'post',
    handler: handle(async (req) => {
      const user = requireUser(req)
      const { articleId } = await readBody(req, submitReviewSchema)
      return submitForReview(req.payload, user, articleId)
    }),
  },
  {
    path: '/ai-studio/topics',
    method: 'post',
    handler: handle(async (req) => {
      const user = requireUser(req)
      return addTopics(req.payload, user, await readBody(req, addTopicsRequestSchema))
    }),
  },
]
