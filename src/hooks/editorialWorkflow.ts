import { APIError, type CollectionBeforeChangeHook, type CollectionSlug, type PayloadRequest } from 'payload'

import { canPublish, type Role } from '@/access/roles'

export const EDITORIAL_STATUSES = ['idea', 'researching', 'draft', 'in_review', 'approved'] as const
export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number]

type Doc = Record<string, unknown>

/** Returns a user-facing error message when a document is not ready to publish, else null. */
export type PublishCheck = (doc: Doc, req: PayloadRequest) => Promise<string | null> | string | null

export class WorkflowError extends APIError {
  constructor(message: string, status = 400) {
    super(message, status, null, true)
  }
}

type Actor = { id?: number | string; role?: Role | null } | null | undefined

/**
 * Pure workflow decision, separated from Payload for unit testing.
 * Returns an error message or null when the transition is allowed.
 */
export const checkTransition = (
  user: Actor,
  next: Doc,
  previous: Doc | undefined,
  { isSavingDraft = false, isLivePublished = false }: { isSavingDraft?: boolean; isLivePublished?: boolean } = {},
): { message: string; status: number } | null => {
  // System operations (seed scripts, migrations) run without a user via the Local API.
  if (!user) return null

  const isPublishing = next._status === 'published'
  const becomesApproved =
    next.editorialStatus === 'approved' && previous?.editorialStatus !== 'approved'

  if (!canPublish(user)) {
    // A draft save on a published document leaves the live version untouched; anything else unpublishes it.
    if (isLivePublished && !isPublishing && !isSavingDraft) {
      return { message: '公開を取り下げられるのは編集者のみです (Only editors can unpublish).', status: 403 }
    }
    if (isPublishing) {
      return { message: '公開できるのは編集者・管理者のみです (Only editors can publish).', status: 403 }
    }
    if (becomesApproved) {
      return { message: '承認できるのは編集者・管理者のみです (Only editors can approve).', status: 403 }
    }
    return null
  }

  if (isPublishing && next.editorialStatus !== 'approved') {
    return {
      message:
        '公開前に編集ステータスを「承認済み」にしてください (Set the editorial status to "Approved" before publishing).',
      status: 400,
    }
  }
  return null
}

/**
 * Approval covers the content an editor reviewed. When a non-editor changes an approved document,
 * it goes back to review so unreviewed edits cannot be published under an old approval.
 */
export const withApprovalReset = (user: Actor, data: Doc, previous: Doc | undefined): Doc => {
  if (!user || canPublish(user) || previous?.editorialStatus !== 'approved') return data
  return { ...data, editorialStatus: 'in_review' }
}

/**
 * `originalDoc` is the latest version, which may be a draft saved after publishing.
 * Whether the document is live must be read from the published document itself.
 */
const isLiveDocumentPublished = async (req: PayloadRequest, collection: CollectionSlug, id: unknown) => {
  if (typeof id !== 'number' && typeof id !== 'string') return false
  const live = await req.payload.findByID({
    collection,
    id,
    depth: 0,
    draft: false,
    overrideAccess: true,
    disableErrors: true,
    req,
  })
  return (live as Doc | null)?._status === 'published'
}

/**
 * Enforces Draft → In Review → Approved → Published on the server.
 * Additional per-collection publish checks (sources verified, claims resolved, …) run on publish.
 */
export const enforceEditorialWorkflow =
  (publishChecks: PublishCheck[] = []): CollectionBeforeChangeHook =>
  async ({ collection, data, originalDoc, req }) => {
    const user = req.user as Actor
    const previous = originalDoc as Doc | undefined
    const next: Doc = { ...(previous ?? {}), ...data }
    const isSavingDraft = req.context?.isSavingDraft === true
    const needsLiveStatus = Boolean(user && previous?.id && !canPublish(user) && !isSavingDraft)
    const isLivePublished = needsLiveStatus
      ? await isLiveDocumentPublished(req, collection.slug as CollectionSlug, previous?.id)
      : false
    const failure = checkTransition(user, next, previous, { isSavingDraft, isLivePublished })
    if (failure) throw new WorkflowError(failure.message, failure.status)

    if (req.user && next._status === 'published') {
      for (const check of publishChecks) {
        const message = await check(next, req)
        if (message) throw new WorkflowError(message)
      }
    }
    return withApprovalReset(user, data, previous)
  }
