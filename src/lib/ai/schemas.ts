import { z } from 'zod'

import { LOCALES } from '@/lib/i18n/config'

/**
 * Model output schemas. Kept flat (no unions/optionals) so they translate cleanly to the
 * structured-output JSON Schema subset; length limits are re-checked client-side by the SDK.
 */
export const CATEGORY_SLUGS = ['beliefs', 'quran-hadith', 'history-japan', 'muslim-life', 'ethics-culture', 'community', 'none'] as const

export const blockSchema = z.object({
  type: z.enum(['h2', 'h3', 'paragraph', 'bullets', 'numbered', 'quote']),
  /** Text for headings, paragraphs and quotes; empty for lists. */
  text: z.string(),
  /** Items for lists; empty for other block types. */
  items: z.array(z.string()),
})

export const claimSchema = z.object({
  claim: z.string(),
  reason: z.string(),
  suggestedEvidence: z.string(),
})

export const outlineSchema = z.object({
  title: z.string(),
  sections: z.array(z.object({ heading: z.string(), points: z.array(z.string()) })),
  usedSourceIds: z.array(z.number().int()),
  claimsRequiringVerification: z.array(claimSchema),
  editorialNotes: z.string(),
})

export const draftSchema = z.object({
  title: z.string(),
  summary: z.string(),
  outline: z.array(z.string()),
  body: z.array(blockSchema),
  seoTitle: z.string(),
  seoDescription: z.string(),
  suggestedCategory: z.enum(CATEGORY_SLUGS),
  tags: z.array(z.string()),
  usedSourceIds: z.array(z.number().int()),
  claimsRequiringVerification: z.array(claimSchema),
  editorialNotes: z.string(),
})

export const seoSchema = z.object({ seoTitle: z.string(), seoDescription: z.string() })

export const suggestionsSchema = z.object({
  faqs: z.array(z.object({ question: z.string(), reason: z.string() })),
  topics: z.array(
    z.object({
      topic: z.string(),
      audience: z.enum(['general_public', 'non_muslims', 'new_muslims', 'muslim_residents']),
      category: z.enum(CATEGORY_SLUGS),
      reason: z.string(),
    }),
  ),
})

export type Outline = z.infer<typeof outlineSchema>
export type Draft = z.infer<typeof draftSchema>
export type DraftBlock = z.infer<typeof blockSchema>
export type Claim = z.infer<typeof claimSchema>
export type Seo = z.infer<typeof seoSchema>
export type Suggestions = z.infer<typeof suggestionsSchema>

// ---------------------------------------------------------------------------
// Request schemas (validated at the API boundary)
// ---------------------------------------------------------------------------

export const CONTENT_TYPES = ['explainer', 'history_research', 'faq', 'muslim_life'] as const
export const AUDIENCES = ['general_public', 'non_muslims', 'new_muslims', 'muslim_residents'] as const
export const LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export const PURPOSES = ['introduction', 'explanation', 'historical_research', 'practical_guidance', 'question_answer'] as const
export const STYLES = ['beginner_friendly', 'educational', 'research_oriented', 'conversational'] as const
export const LENGTHS = ['short', 'medium', 'long'] as const

const text = (max: number) => z.string().trim().max(max)

export const briefSchema = z.object({
  topic: text(300).min(2),
  contentType: z.enum(CONTENT_TYPES),
  language: z.enum(LOCALES),
  audience: z.enum(AUDIENCES),
  knowledgeLevel: z.enum(LEVELS),
  purpose: z.enum(PURPOSES),
  style: z.enum(STYLES),
  length: z.enum(LENGTHS),
  sourceIds: z.array(z.number().int().positive()).max(20),
  researchNotes: text(20_000),
  instructions: text(2_000),
})

export type Brief = z.infer<typeof briefSchema>

export const STUDIO_ACTIONS = ['outline', 'draft', 'improve', 'simplify', 'seo', 'translate', 'suggest', 'topics'] as const
export type StudioAction = (typeof STUDIO_ACTIONS)[number]

/** Article summaries are limited to 400 characters in the CMS. */
export const SUMMARY_MAX = 400

const boundedText = (max: number) => z.string().max(max)
const boundedClaim = z.object({ claim: boundedText(1_000), reason: boundedText(1_000), suggestedEvidence: boundedText(1_000) })

/** Drafts sent back from the browser: every string and list is bounded to cap request size and cost. */
export const boundedDraftSchema = z.object({
  title: boundedText(300),
  summary: boundedText(SUMMARY_MAX),
  outline: z.array(boundedText(300)).max(50),
  body: z
    .array(z.object({ type: blockSchema.shape.type, text: boundedText(10_000), items: z.array(boundedText(2_000)).max(100) }))
    .max(200),
  seoTitle: boundedText(120),
  seoDescription: boundedText(300),
  suggestedCategory: z.enum(CATEGORY_SLUGS),
  tags: z.array(boundedText(60)).max(20),
  usedSourceIds: z.array(z.number().int()).max(50),
  claimsRequiringVerification: z.array(boundedClaim).max(50),
  editorialNotes: boundedText(5_000),
})

const draftInputSchema = boundedDraftSchema
const boundedOutlineSchema = z.object({
  title: boundedText(300),
  sections: z.array(z.object({ heading: boundedText(300), points: z.array(boundedText(1_000)).max(30) })).max(40),
  usedSourceIds: z.array(z.number().int()).max(50),
  claimsRequiringVerification: z.array(boundedClaim).max(50),
  editorialNotes: boundedText(5_000),
})

export const generateRequestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('outline'), brief: briefSchema }),
  z.object({ action: z.literal('draft'), brief: briefSchema, outline: boundedOutlineSchema }),
  z.object({ action: z.literal('improve'), brief: briefSchema, draft: draftInputSchema }),
  z.object({ action: z.literal('simplify'), brief: briefSchema, draft: draftInputSchema }),
  z.object({ action: z.literal('seo'), brief: briefSchema, draft: draftInputSchema }),
  z.object({ action: z.literal('translate'), brief: briefSchema, draft: draftInputSchema }),
  z.object({ action: z.literal('suggest'), brief: briefSchema, draft: draftInputSchema }),
  z.object({ action: z.literal('topics'), language: z.enum(LOCALES), focus: text(500) }),
])

export type GenerateRequest = z.infer<typeof generateRequestSchema>
