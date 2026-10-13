import type { Payload } from 'payload'
import { z } from 'zod'

import { AIError } from '@/lib/ai/errors'
import { AUDIENCES, boundedDraftSchema, CONTENT_TYPES, LEVELS, STUDIO_ACTIONS } from '@/lib/ai/schemas'
import { LOCALES } from '@/lib/i18n/config'
import { type RichBlock, toLexical } from '@/lib/richtext/build'
import type { Article, User } from '@/payload-types'

import { loadPromptSources, reconcileUsedSources } from './sources'

const MAX_TOPICS_PER_REQUEST = 10

export const saveRequestSchema = z.object({
  draft: boundedDraftSchema,
  meta: z.object({
    language: z.enum(LOCALES),
    contentType: z.enum(CONTENT_TYPES),
    audience: z.enum(AUDIENCES),
    knowledgeLevel: z.enum(LEVELS),
  }),
  /**
   * Generation metadata reported by the Studio client. It records that the editor used AI assistance;
   * it is not cryptographic proof of a specific generation, and the text may have been edited since.
   */
  generation: z.object({
    model: z.string().max(100),
    action: z.enum(STUDIO_ACTIONS),
    generatedAt: z.iso.datetime(),
    promptVersion: z.string().max(100),
  }),
  target: z.discriminatedUnion('mode', [
    z.object({ mode: z.literal('new') }),
    /** Update an existing draft only if nobody has edited it since `expectedUpdatedAt`. */
    z.object({ mode: z.literal('update'), articleId: z.number().int().positive(), expectedUpdatedAt: z.iso.datetime() }),
  ]),
  /** For translations: the article whose translation group the new draft joins. */
  translationOfId: z.number().int().positive().nullable(),
})

export type SaveRequest = z.infer<typeof saveRequestSchema>

const SECTION_FOR_TYPE: Record<SaveRequest['meta']['contentType'], NonNullable<Article['section']>> = {
  explainer: 'learn',
  history_research: 'islam-in-japan',
  faq: 'learn',
  muslim_life: 'muslim-life',
}

/** AI block model → shared rich-text builder blocks (plain text only, never HTML). */
export const toRichBlocks = (blocks: SaveRequest['draft']['body']): RichBlock[] =>
  blocks.map((block): RichBlock => {
    switch (block.type) {
      case 'h2':
        return { type: 'heading', level: 2, text: block.text }
      case 'h3':
        return { type: 'heading', level: 3, text: block.text }
      case 'bullets':
        return { type: 'list', items: block.items }
      case 'numbered':
        return { type: 'list', ordered: true, items: block.items }
      case 'quote':
        return { type: 'quote', text: block.text }
      default:
        return { type: 'paragraph', text: block.text }
    }
  })

const asciiSlug = (value: string): string =>
  value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s-]+/g, '-').slice(0, 80)

/** Readable slug from an English title, otherwise a unique placeholder for editors to rename. */
const proposeSlug = (draft: SaveRequest['draft']): string =>
  asciiSlug(draft.seoTitle) || asciiSlug(draft.title) || `ai-draft-${Date.now().toString(36)}`

const uniqueSlug = async (payload: Payload, base: string, language: string): Promise<string> => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
    const { totalDocs } = await payload.count({
      collection: 'articles',
      where: { and: [{ slug: { equals: candidate } }, { language: { equals: language } }] },
      overrideAccess: true,
    })
    if (totalDocs === 0) return candidate
  }
  return `${base}-${Date.now().toString(36)}`
}

const categoryId = async (payload: Payload, slug: string): Promise<number | undefined> => {
  if (slug === 'none') return undefined
  const { docs } = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return docs[0]?.id
}

type ExistingClaim = NonNullable<NonNullable<Article['verification']>['claimsRequiringVerification']>[number]

const relationIds = (values: Article['sources']): number[] =>
  (values ?? []).map((value) => (typeof value === 'object' ? value.id : value))

/**
 * Merges new AI claims into existing ones: existing claims (including editors' resolutions and notes)
 * are kept exactly; only claims with new text are added, unresolved.
 */
export const mergeClaims = (existing: ExistingClaim[], incoming: SaveRequest['draft']['claimsRequiringVerification']) => {
  const known = new Set(existing.map((claim) => claim.claim.trim()))
  const added = incoming.filter((claim) => !known.has(claim.claim.trim())).map((claim) => ({ ...claim, resolved: false }))
  return [...existing.map(({ id: _id, ...claim }) => claim), ...added]
}

/** Workflow states the AI save may move back to "draft"; review/approval states are never touched. */
const PRE_DRAFT_STATES = new Set(['idea', 'researching'])

/**
 * Saves AI output as an unpublished CMS draft owned by the requesting user.
 * - New drafts are always created as drafts; publishing still requires editor approval.
 * - Updates only replace the AI-authored content (title, summary, body, SEO, tags). Sources and claims
 *   are merged, never dropped; workflow status, language and section are left alone.
 * - Updates are refused if the article changed since the editor loaded it (no silent overwrite); the
 *   timestamp check is part of the update query itself. Every save is a new version.
 */
export const saveDraft = async (payload: Payload, user: User, input: SaveRequest): Promise<{ id: number; slug: string; updatedAt: string }> => {
  const { draft, meta, generation, target } = input
  const verified = await loadPromptSources(payload, user, draft.usedSourceIds)
  const { usedSourceIds, warnings } = reconcileUsedSources(draft.usedSourceIds, verified)

  const content = {
    title: draft.title,
    summary: draft.summary,
    body: toLexical(toRichBlocks(draft.body)),
    tags: draft.tags.slice(0, 10),
    seo: { title: draft.seoTitle, description: draft.seoDescription },
  }
  const provenance = {
    aiAssisted: true,
    model: generation.model,
    promptTemplate: `${generation.action}:${generation.promptVersion}`,
    generatedAt: generation.generatedAt,
    generatedBy: user.id,
    usedSourceIds,
  }
  // req.context.aiStudio is the only way to write AI provenance (see Articles.aiProvenance access).
  const options = { draft: true, user, overrideAccess: false, context: { aiStudio: true } } as const

  if (target.mode === 'update') {
    const current = await payload.findByID({ collection: 'articles', id: target.articleId, draft: true, depth: 0, user, overrideAccess: false })
    if (current.updatedAt !== target.expectedUpdatedAt) {
      throw new AIError('conflict', 'This article was edited after it was loaded. Save as a new draft instead, or reload it.')
    }
    const result = await payload.update({
      collection: 'articles',
      // Compare-and-set: matches nothing if another save landed after the read above.
      where: { and: [{ id: { equals: target.articleId } }, { updatedAt: { equals: target.expectedUpdatedAt } }] },
      data: {
        ...content,
        sources: [...new Set([...relationIds(current.sources), ...usedSourceIds])],
        verification: {
          claimsRequiringVerification: mergeClaims(current.verification?.claimsRequiringVerification ?? [], draft.claimsRequiringVerification),
          evidenceWarnings: [current.verification?.evidenceWarnings, ...warnings].filter(Boolean).join('\n') || undefined,
          editorialNotes: [current.verification?.editorialNotes, draft.editorialNotes].filter(Boolean).join('\n\n') || undefined,
        },
        aiProvenance: provenance,
        ...(PRE_DRAFT_STATES.has(current.editorialStatus) ? { editorialStatus: 'draft' as const } : {}),
      },
      ...options,
    })
    const updated = result.docs[0]
    if (!updated || result.errors.length > 0) {
      throw new AIError('conflict', 'This article was edited after it was loaded. Save as a new draft instead, or reload it.')
    }
    return { id: updated.id, slug: updated.slug, updatedAt: updated.updatedAt }
  }

  let translationGroup: string | undefined
  if (input.translationOfId) {
    const original = await payload.findByID({ collection: 'articles', id: input.translationOfId, draft: true, depth: 0, user, overrideAccess: false })
    translationGroup = original.translationGroup ?? undefined
  }

  const slug = await uniqueSlug(payload, proposeSlug(draft), meta.language)
  const created = await payload.create({
    collection: 'articles',
    data: {
      ...content,
      slug,
      language: meta.language,
      section: SECTION_FOR_TYPE[meta.contentType],
      articleType: meta.contentType,
      audiences: [meta.audience],
      knowledgeLevel: meta.knowledgeLevel,
      category: await categoryId(payload, draft.suggestedCategory),
      sources: usedSourceIds,
      verification: {
        claimsRequiringVerification: draft.claimsRequiringVerification.map((claim) => ({ ...claim, resolved: false })),
        evidenceWarnings: warnings.join('\n') || undefined,
        editorialNotes: draft.editorialNotes,
      },
      aiProvenance: provenance,
      editorialStatus: 'draft',
      _status: 'draft',
      ...(translationGroup ? { translationGroup } : {}),
    },
    ...options,
  })
  return { id: created.id, slug: created.slug, updatedAt: created.updatedAt }
}

/** Moves a draft to "In review" (authors may do this; approval and publishing stay with editors). */
export const submitForReview = async (payload: Payload, user: User, articleId: number) => {
  const updated = await payload.update({
    collection: 'articles',
    id: articleId,
    data: { editorialStatus: 'in_review' },
    draft: true,
    user,
    overrideAccess: false,
  })
  // updatedAt is returned so the Studio's next save does not conflict with this change.
  return { id: updated.id, editorialStatus: updated.editorialStatus, updatedAt: updated.updatedAt }
}

export const addTopicsRequestSchema = z.object({
  language: z.enum(LOCALES),
  topics: z
    .array(z.object({ topic: z.string().trim().min(2).max(300), audience: z.enum(AUDIENCES), category: z.string().max(50), reason: z.string().max(1000) }))
    .min(1)
    .max(MAX_TOPICS_PER_REQUEST),
})

/**
 * Adds only the topics an editor explicitly selected to the editorial calendar, as ideas.
 * Topics already in the calendar are skipped, so retrying after a partial failure creates no duplicates.
 */
export const addTopics = async (payload: Payload, user: User, input: z.infer<typeof addTopicsRequestSchema>) => {
  const { docs: existing } = await payload.find({
    collection: 'editorial-topics',
    where: { topic: { in: input.topics.map((topic) => topic.topic) } },
    limit: MAX_TOPICS_PER_REQUEST,
    depth: 0,
    select: { topic: true },
    overrideAccess: true,
  })
  const known = new Set(existing.map((doc) => doc.topic))
  const created = []
  for (const topic of input.topics.filter((item) => !known.has(item.topic))) {
    const doc = await payload.create({
      collection: 'editorial-topics',
      data: {
        topic: topic.topic,
        language: input.language,
        audience: topic.audience,
        category: await categoryId(payload, topic.category),
        status: 'idea',
        priority: 'medium',
        notes: `AI提案の理由 / AI rationale: ${topic.reason}`,
      },
      user,
      overrideAccess: false,
    })
    created.push(doc.id)
  }
  return { created }
}
