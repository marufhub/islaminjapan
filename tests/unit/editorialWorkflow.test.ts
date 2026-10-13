import { describe, expect, it } from 'vitest'

import { checkTransition, withApprovalReset } from '@/hooks/editorialWorkflow'
import { requireResolvedClaims, requireReviewer, requireFactChecked } from '@/hooks/publishChecks'

const author = { id: 1, role: 'author' as const }
const editor = { id: 2, role: 'editor' as const }
const admin = { id: 3, role: 'admin' as const }

describe('checkTransition', () => {
  it('lets an author save a draft', () => {
    expect(checkTransition(author, { _status: 'draft', editorialStatus: 'draft' }, undefined)).toBeNull()
  })

  it('lets an author submit for review', () => {
    expect(
      checkTransition(author, { _status: 'draft', editorialStatus: 'in_review' }, { editorialStatus: 'draft' }),
    ).toBeNull()
  })

  it('forbids an author from publishing', () => {
    const result = checkTransition(author, { _status: 'published', editorialStatus: 'approved' }, undefined)
    expect(result?.status).toBe(403)
  })

  it('forbids an author from approving', () => {
    const result = checkTransition(
      author,
      { _status: 'draft', editorialStatus: 'approved' },
      { editorialStatus: 'in_review' },
    )
    expect(result?.status).toBe(403)
  })

  it('allows an author to keep editing an already-approved draft without re-approving', () => {
    expect(
      checkTransition(author, { _status: 'draft', editorialStatus: 'approved' }, { editorialStatus: 'approved' }),
    ).toBeNull()
  })

  it('requires approval before an editor publishes', () => {
    const result = checkTransition(editor, { _status: 'published', editorialStatus: 'in_review' }, undefined)
    expect(result?.status).toBe(400)
  })

  it('lets an editor approve and publish', () => {
    expect(checkTransition(editor, { _status: 'published', editorialStatus: 'approved' }, undefined)).toBeNull()
    expect(checkTransition(admin, { _status: 'published', editorialStatus: 'approved' }, undefined)).toBeNull()
  })

  it('forbids an author from unpublishing', () => {
    const result = checkTransition(
      author,
      { _status: 'draft', editorialStatus: 'approved' },
      { _status: 'draft' },
      { isLivePublished: true },
    )
    expect(result?.status).toBe(403)
  })

  it('lets an author save a new draft version of a published document', () => {
    expect(
      checkTransition(author, { _status: 'draft', editorialStatus: 'approved' }, { _status: 'published', editorialStatus: 'approved' }, { isSavingDraft: true, isLivePublished: true }),
    ).toBeNull()
  })

  it('allows system operations without a user', () => {
    expect(checkTransition(undefined, { _status: 'published', editorialStatus: 'draft' }, undefined)).toBeNull()
  })
})

describe('withApprovalReset', () => {
  it('sends an approved document back to review when an author edits it', () => {
    expect(withApprovalReset(author, { title: 'x' }, { editorialStatus: 'approved' })).toEqual({
      title: 'x',
      editorialStatus: 'in_review',
    })
  })

  it('keeps approval for editor edits and for non-approved documents', () => {
    expect(withApprovalReset(editor, { title: 'x' }, { editorialStatus: 'approved' })).toEqual({ title: 'x' })
    expect(withApprovalReset(author, { title: 'x' }, { editorialStatus: 'draft' })).toEqual({ title: 'x' })
  })
})

describe('publish checks', () => {
  const req = {} as never

  it('requires a reviewer', () => {
    expect(requireReviewer({}, req)).toMatch(/reviewer/)
    expect(requireReviewer({ reviewer: 2 }, req)).toBeNull()
  })

  it('blocks publishing with unresolved claims', () => {
    const doc = {
      verification: { claimsRequiringVerification: [{ claim: 'x', resolved: false }, { claim: 'y', resolved: true }] },
    }
    expect(requireResolvedClaims(doc, req)).toMatch(/1 claim/)
    expect(requireResolvedClaims({ verification: { claimsRequiringVerification: [] } }, req)).toBeNull()
  })

  it('requires fact-check verification for history events', () => {
    expect(requireFactChecked({ verificationStatus: 'unverified' }, req)).toMatch(/Verified/)
    expect(requireFactChecked({ verificationStatus: 'verified' }, req)).toBeNull()
  })
})
