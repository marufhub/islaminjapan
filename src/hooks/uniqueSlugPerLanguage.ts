import type { CollectionBeforeChangeHook, CollectionSlug, Where } from 'payload'

import { WorkflowError } from './editorialWorkflow'

/** Slugs must be unique within a language (ja and en versions may share a slug). */
export const uniqueSlugPerLanguage =
  (collection: CollectionSlug): CollectionBeforeChangeHook =>
  async ({ data, originalDoc, req }) => {
    const slug = data.slug ?? originalDoc?.slug
    const language = data.language ?? originalDoc?.language
    if (!slug || !language) return data

    const conditions: Where[] = [{ slug: { equals: slug } }, { language: { equals: language } }]
    if (originalDoc?.id) conditions.push({ id: { not_equals: originalDoc.id } })

    const { totalDocs } = await req.payload.count({
      collection,
      where: { and: conditions },
      req,
    })
    if (totalDocs > 0) {
      throw new WorkflowError(`スラッグ「${slug}」は既に使われています (Slug "${slug}" is already in use).`)
    }
    return data
  }
