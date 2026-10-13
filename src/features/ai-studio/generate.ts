import type { Payload } from 'payload'

import { AIError } from '@/lib/ai/errors'
import { aiConfig, estimateCostUsd, type ModelTier } from '@/lib/ai/config'
import type { Effort, LLMProvider, StructuredResult } from '@/lib/ai/provider'
import {
  type Brief,
  type Draft,
  draftSchema,
  type GenerateRequest,
  type Outline,
  outlineSchema,
  type Seo,
  seoSchema,
  type Suggestions,
  suggestionsSchema,
  SUMMARY_MAX,
} from '@/lib/ai/schemas'
import type { User } from '@/payload-types'
import {
  buildSystemPrompt,
  draftPrompt,
  outlinePrompt,
  type PromptSource,
  revisePrompt,
  seoPrompt,
  suggestPrompt,
  topicsPrompt,
  translatePrompt,
} from '@/prompts/build'
import { promptVersionFor } from '@/prompts/versions'

import { finishUsage, reserveRequest } from './limits'
import { loadPromptSources, reconcileUsedSources } from './sources'

/**
 * Model tier, output cap and reasoning effort per action. Substantial drafting uses the main model;
 * outlines, SEO metadata and suggestions use the cheaper fast model. Caps are further limited by
 * AI_MAX_OUTPUT_TOKENS.
 */
const ACTION_SETTINGS: Record<GenerateRequest['action'], { tier: ModelTier; maxTokens: number; effort: Effort }> = {
  outline: { tier: 'fast', maxTokens: 6_000, effort: 'medium' },
  draft: { tier: 'main', maxTokens: 16_000, effort: 'high' },
  improve: { tier: 'main', maxTokens: 16_000, effort: 'medium' },
  simplify: { tier: 'main', maxTokens: 16_000, effort: 'medium' },
  translate: { tier: 'main', maxTokens: 16_000, effort: 'medium' },
  seo: { tier: 'fast', maxTokens: 2_000, effort: 'low' },
  suggest: { tier: 'fast', maxTokens: 4_000, effort: 'low' },
  topics: { tier: 'fast', maxTokens: 4_000, effort: 'medium' },
}

const SCHEMA_NAMES: Record<GenerateRequest['action'], string> = {
  outline: 'article_outline',
  draft: 'article_draft',
  improve: 'article_draft',
  simplify: 'article_draft',
  translate: 'article_draft',
  seo: 'seo_metadata',
  suggest: 'editorial_suggestions',
  topics: 'editorial_suggestions',
}

export type GenerateResult =
  | { action: 'outline'; data: Outline }
  | { action: 'draft' | 'improve' | 'simplify' | 'translate'; data: Draft }
  | { action: 'seo'; data: Seo }
  | { action: 'suggest' | 'topics'; data: Suggestions }

export type GenerateResponse = GenerateResult & {
  model: string
  promptVersion: string
  generatedAt: string
  warnings: string[]
}

const modelForTier = (tier: ModelTier): string => aiConfig().models[tier]

const otherLanguage = (language: Brief['language']): Brief['language'] => (language === 'ja' ? 'en' : 'ja')

const withReconciledSources = <T extends { usedSourceIds: number[]; summary?: string }>(data: T, sources: PromptSource[]) => {
  const { usedSourceIds, warnings } = reconcileUsedSources(data.usedSourceIds, sources)
  // The CMS limits summaries to SUMMARY_MAX characters; shorten visibly rather than fail at save time.
  if (typeof data.summary === 'string' && data.summary.length > SUMMARY_MAX) {
    return {
      data: { ...data, usedSourceIds, summary: `${data.summary.slice(0, SUMMARY_MAX - 1)}…` },
      warnings: [...warnings, `The summary was shortened to ${SUMMARY_MAX} characters; please review it.`],
    }
  }
  return { data: { ...data, usedSourceIds }, warnings }
}

type Call = <T>(schema: import('zod').ZodType<T>, prompt: string, system: string) => Promise<StructuredResult<T>>

const runAction = async (
  payload: Payload,
  user: User,
  request: GenerateRequest,
  call: Call,
): Promise<{ result: GenerateResult; warnings: string[]; meta: StructuredResult<unknown> }> => {
  if (request.action === 'topics') {
    const [articles, planned] = await Promise.all([
      payload.find({ collection: 'articles', where: { language: { equals: request.language } }, limit: 300, depth: 0, select: { title: true }, overrideAccess: false }),
      payload.find({ collection: 'editorial-topics', limit: 300, depth: 0, select: { topic: true }, user, overrideAccess: false }),
    ])
    const response = await call(
      suggestionsSchema,
      topicsPrompt(request.language, request.focus, articles.docs.map((doc) => doc.title), planned.docs.map((doc) => doc.topic)),
      buildSystemPrompt('explainer'),
    )
    return { result: { action: 'topics', data: { ...response.data, faqs: [] } }, warnings: [], meta: response }
  }

  const { brief } = request
  const system = buildSystemPrompt(brief.contentType)
  const sources = await loadPromptSources(payload, user, brief.sourceIds)
  const skipped = brief.sourceIds.length - sources.length
  const sourceWarnings = skipped > 0 ? [`${skipped} selected source(s) were not verified or not accessible and were not given to the AI.`] : []

  switch (request.action) {
    case 'outline': {
      const response = await call(outlineSchema, outlinePrompt(brief, sources), system)
      const reconciled = withReconciledSources(response.data, sources)
      return { result: { action: 'outline', data: reconciled.data }, warnings: [...sourceWarnings, ...reconciled.warnings], meta: response }
    }
    case 'draft': {
      const response = await call(draftSchema, draftPrompt(brief, request.outline, sources), system)
      const reconciled = withReconciledSources(response.data, sources)
      return { result: { action: 'draft', data: reconciled.data }, warnings: [...sourceWarnings, ...reconciled.warnings], meta: response }
    }
    case 'improve':
    case 'simplify': {
      const response = await call(draftSchema, revisePrompt(request.action, brief, request.draft, sources), system)
      const reconciled = withReconciledSources(response.data, sources)
      return { result: { action: request.action, data: reconciled.data }, warnings: [...sourceWarnings, ...reconciled.warnings], meta: response }
    }
    case 'translate': {
      const target = otherLanguage(brief.language)
      const response = await call(draftSchema, translatePrompt(brief, request.draft, target, sources), system)
      const reconciled = withReconciledSources(response.data, sources)
      return { result: { action: 'translate', data: reconciled.data }, warnings: [...sourceWarnings, ...reconciled.warnings], meta: response }
    }
    case 'seo': {
      const response = await call(seoSchema, seoPrompt(brief, request.draft), system)
      return { result: { action: 'seo', data: response.data }, warnings: [], meta: response }
    }
    case 'suggest': {
      const response = await call(suggestionsSchema, suggestPrompt(brief, request.draft), system)
      return { result: { action: 'suggest', data: response.data }, warnings: [], meta: response }
    }
  }
}

/**
 * Runs one AI Studio action for an authenticated CMS user: enforces limits, builds a
 * source-grounded prompt, validates the structured response and logs usage (metadata only).
 * Nothing is saved or published here.
 */
export const generate = async (
  payload: Payload,
  user: User,
  request: GenerateRequest,
  provider: LLMProvider,
): Promise<GenerateResponse> => {
  const settings = ACTION_SETTINGS[request.action]
  const promptVersion = promptVersionFor(request.action === 'topics' ? 'topics' : request.brief.contentType)
  // Worst case for this request's output, held against the monthly budget until the real cost is known.
  const reservedCostUsd = estimateCostUsd(modelForTier(settings.tier), {
    inputTokens: 0,
    outputTokens: Math.min(settings.maxTokens, aiConfig().maxOutputTokens),
  })
  const reservationId = await reserveRequest(payload, user.id, request.action, { tier: settings.tier, promptVersion, reservedCostUsd })

  const call: Call = (schema, prompt, system) =>
    provider.generateStructured({
      schema,
      schemaName: SCHEMA_NAMES[request.action],
      prompt,
      system,
      tier: settings.tier,
      maxTokens: settings.maxTokens,
      effort: settings.effort,
    })

  try {
    const { result, warnings, meta } = await runAction(payload, user, request, call)
    const estimatedCostUsd = estimateCostUsd(meta.model, meta.usage)
    await finishUsage(payload, reservationId, { status: 'success', model: meta.model, usage: meta.usage, requestId: meta.requestId, estimatedCostUsd })
    payload.logger.info(
      {
        action: request.action,
        model: meta.model,
        promptVersion,
        requestId: meta.requestId,
        inputTokens: meta.usage.inputTokens,
        outputTokens: meta.usage.outputTokens,
        estimatedCostUsd,
        userId: user.id,
      },
      'AI Studio generation completed',
    )
    return { ...result, model: meta.model, promptVersion, generatedAt: new Date().toISOString(), warnings }
  } catch (error) {
    const aiError = error instanceof AIError ? error : new AIError('unknown', 'Unexpected error while generating content.', { cause: error })
    await finishUsage(payload, reservationId, {
      status: 'error',
      errorKind: aiError.kind,
      usage: aiError.usage,
      // Model is unknown on failure; estimate with the tier's configured model.
      estimatedCostUsd: aiError.usage ? estimateCostUsd(modelForTier(settings.tier), aiError.usage) : null,
    })
    payload.logger.warn({ action: request.action, kind: aiError.kind, promptVersion, userId: user.id, err: aiError.cause }, 'AI Studio generation failed')
    throw aiError
  }
}
