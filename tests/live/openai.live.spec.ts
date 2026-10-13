import { describe, expect, it } from 'vitest'

import { isAIConfigured } from '@/lib/ai/config'
import { OpenAIProvider } from '@/lib/ai/openai'
import { outlineSchema, seoSchema } from '@/lib/ai/schemas'
import { buildSystemPrompt, outlinePrompt } from '@/prompts/build'

/**
 * Real, PAID calls to the OpenAI API. Never part of `pnpm test` or CI.
 * Run explicitly with: AI_LIVE_TEST=1 pnpm test:ai-live (requires OPENAI_API_KEY).
 */
const enabled = process.env.AI_LIVE_TEST === '1' && isAIConfigured()

describe.skipIf(!enabled)('OpenAI live smoke test', () => {
  const provider = enabled ? new OpenAIProvider() : null

  it('returns valid structured SEO metadata from the fast model', async () => {
    const result = await provider!.generateStructured({
      system: buildSystemPrompt('explainer'),
      prompt: 'Task: write an SEO title and meta description in Japanese for an introductory article titled 「ラマダンとは？」.',
      schema: seoSchema,
      schemaName: 'seo_metadata',
      tier: 'fast',
      maxTokens: 1_000,
      effort: 'low',
    })
    expect(result.data.seoTitle.length).toBeGreaterThan(0)
    expect(result.requestId).toBeTruthy()
  }, 120_000)

  it('returns a valid outline that only cites supplied sources', async () => {
    const result = await provider!.generateStructured({
      system: buildSystemPrompt('history_research'),
      prompt: outlinePrompt(
        {
          topic: '神戸ムスリムモスクの歴史',
          contentType: 'history_research',
          language: 'ja',
          audience: 'general_public',
          knowledgeLevel: 'beginner',
          purpose: 'historical_research',
          style: 'educational',
          length: 'short',
          sourceIds: [],
          researchNotes: '',
          instructions: '',
        },
        [],
      ),
      schema: outlineSchema,
      schemaName: 'article_outline',
      tier: 'fast',
      maxTokens: 4_000,
      effort: 'low',
    })
    // No sources were supplied, so none may be cited and specific claims must be flagged.
    expect(result.data.usedSourceIds).toEqual([])
    expect(result.data.claimsRequiringVerification.length).toBeGreaterThan(0)
  }, 180_000)
})
