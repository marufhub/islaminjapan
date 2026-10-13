import type { PayloadRequest } from 'payload'

import type { PublishCheck } from './editorialWorkflow'

type Doc = Record<string, unknown>

const relationIds = (value: unknown): Array<number | string> => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (item && typeof item === 'object' ? (item as { id?: number | string }).id : item))
    .filter((id): id is number | string => typeof id === 'number' || typeof id === 'string')
}

export const requireReviewer: PublishCheck = (doc) =>
  doc.reviewer ? null : 'レビュー担当者を設定してください (A reviewer is required before publishing).'

export const requireResolvedClaims: PublishCheck = (doc) => {
  const claims = (doc.verification as Doc | undefined)?.claimsRequiringVerification
  const unresolved = Array.isArray(claims)
    ? claims.filter((claim) => !(claim as Doc)?.resolved).length
    : 0
  return unresolved === 0
    ? null
    : `未確認の主張が${unresolved}件あります (${unresolved} claim(s) still need verification).`
}

export const requireFactChecked: PublishCheck = (doc) =>
  doc.verificationStatus === 'verified'
    ? null
    : '事実確認が完了していません (Fact-check status must be "Verified" before publishing).'

type SourceSelector = string | ((doc: Doc) => unknown[])

const collectSourceIds = (doc: Doc, selector: SourceSelector): Array<number | string> => {
  const groups = typeof selector === 'string' ? [doc[selector]] : selector(doc)
  return [...new Set(groups.flatMap(relationIds))]
}

/** Every cited source (including nested citations) must itself be verified — a URL alone is not evidence. */
export const requireVerifiedSources =
  (selector: SourceSelector = 'sources'): PublishCheck =>
  async (doc: Doc, req: PayloadRequest) => {
    const ids = collectSourceIds(doc, selector)
    if (ids.length === 0) return null
    const { docs } = await req.payload.find({
      collection: 'sources',
      where: { id: { in: ids } },
      depth: 0,
      limit: ids.length,
      pagination: false,
      req,
    })
    const unverified = docs.filter((source) => source.verificationStatus !== 'verified')
    if (unverified.length === 0 && docs.length === ids.length) return null
    const titles = unverified.map((source) => `「${source.title}」`).join(', ')
    return `未検証の出典が含まれています ${titles} (Attached sources must be verified before publishing).`
  }
