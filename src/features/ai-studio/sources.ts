import type { Payload } from 'payload'

import type { PromptSource } from '@/prompts/build'
import type { User } from '@/payload-types'

/**
 * Loads the sources an editor selected, as that editor (access control applies).
 * Only VERIFIED sources are given to the model; excerpts are the only content it receives.
 */
export const loadPromptSources = async (payload: Payload, user: User, ids: number[]): Promise<PromptSource[]> => {
  if (ids.length === 0) return []
  const { docs } = await payload.find({
    collection: 'sources',
    where: { and: [{ id: { in: ids } }, { verificationStatus: { equals: 'verified' } }] },
    limit: ids.length,
    depth: 0,
    user,
    overrideAccess: false,
  })
  return docs.map((source) => ({
    id: source.id,
    title: source.title,
    authors: source.authors,
    institution: source.institution,
    year: source.publicationYear,
    sourceType: source.sourceType,
    url: source.url,
    attribution: source.attributionRequirements,
    excerpts: (source.excerpts ?? []).map((excerpt) => ({ text: excerpt.text, locator: excerpt.locator })),
  }))
}

/**
 * Keeps only source ids that were actually supplied to the model, and reports any it
 * claimed without excerpts (bibliographic-only), so editors can check them.
 */
export const reconcileUsedSources = (
  claimedIds: number[],
  supplied: PromptSource[],
): { usedSourceIds: number[]; warnings: string[] } => {
  const byId = new Map(supplied.map((source) => [source.id, source]))
  const unique = [...new Set(claimedIds)]
  const usedSourceIds = unique.filter((id) => byId.has(id))
  const warnings: string[] = []
  const unknown = unique.filter((id) => !byId.has(id))
  if (unknown.length > 0) warnings.push(`AI referenced source IDs that were not supplied and were removed: ${unknown.join(', ')}`)
  const withoutExcerpts = usedSourceIds.filter((id) => (byId.get(id)?.excerpts.length ?? 0) === 0)
  if (withoutExcerpts.length > 0) {
    warnings.push(`Sources cited without supplied excerpts (contents not provided to the AI): ${withoutExcerpts.join(', ')}`)
  }
  return { usedSourceIds, warnings }
}
