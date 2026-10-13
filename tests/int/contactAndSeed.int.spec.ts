import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { hashRequester, RATE_LIMIT_MAX, submitInquiry } from '@/features/contact/service'
import { seed } from '@/seed/seed'

import { getTestPayload } from './helpers'

let payload: Payload

const inquiry = {
  name: 'Test Visitor',
  email: 'visitor@example.test',
  subject: 'Question',
  message: 'I would like to know more about Ramadan.',
  locale: 'en' as const,
}

beforeAll(async () => {
  payload = await getTestPayload()
})

describe('contact inquiries', () => {
  it('stores an inquiry with a hashed requester and no raw IP', async () => {
    const requesterHash = hashRequester('203.0.113.7', 'secret')
    expect(requesterHash).not.toContain('203.0.113.7')
    const result = await submitInquiry(payload, inquiry, requesterHash)
    expect(result).toEqual({ ok: true })
    const { docs } = await payload.find({ collection: 'contact-submissions', where: { requesterHash: { equals: requesterHash } } })
    expect(docs).toHaveLength(1)
    // Without SMTP settings the UI must not claim an email was sent.
    expect(docs[0].deliveryStatus).toBe('not_configured')
  })

  it('rate-limits repeated submissions from the same requester', async () => {
    const requesterHash = hashRequester('198.51.100.9', 'secret')
    for (let index = 0; index < RATE_LIMIT_MAX; index += 1) {
      expect(await submitInquiry(payload, inquiry, requesterHash)).toEqual({ ok: true })
    }
    expect(await submitInquiry(payload, inquiry, requesterHash)).toEqual({ ok: false, reason: 'rate_limited' })
  })

  it('is never readable or creatable through public access', async () => {
    await expect(payload.find({ collection: 'contact-submissions', overrideAccess: false })).rejects.toThrow()
    await expect(
      payload.create({ collection: 'contact-submissions', data: { ...inquiry, status: 'new' }, overrideAccess: false }),
    ).rejects.toThrow()
  })
})

describe('seed', () => {
  it('creates only unpublished drafts and is idempotent', async () => {
    const first = await seed(payload)
    expect(first.created.length).toBeGreaterThan(20)

    for (const collection of ['articles', 'faqs', 'history-events'] as const) {
      const publicView = await payload.find({ collection, overrideAccess: false, locale: 'ja' })
      expect(publicView.totalDocs).toBe(0)
      const all = await payload.find({ collection, draft: true, locale: 'ja', limit: 100 })
      expect(all.docs.every((doc) => doc._status !== 'published')).toBe(true)
    }

    const second = await seed(payload)
    expect(second.created).toHaveLength(0)
  })

  it('keeps AI-drafted policy texts unpublished while publishing the brief-provided homepage copy', async () => {
    const policies = await payload.findGlobal({ slug: 'editorial-policy', locale: 'ja', overrideAccess: false })
    expect(policies.privacyPolicy ?? null).toBeNull()
    const draftPolicies = await payload.findGlobal({ slug: 'editorial-policy', locale: 'ja', draft: true })
    expect(draftPolicies.privacyPolicy).toBeTruthy()
    const homepage = await payload.findGlobal({ slug: 'homepage', locale: 'ja', overrideAccess: false })
    expect(homepage.heroTitle).toBe('日本でイスラームを知る')
  })

  it('never overwrites a global an editor has already filled in', async () => {
    // Navigation items are shared across languages; only labels are localized.
    await payload.updateGlobal({ slug: 'navigation', locale: 'en', data: { items: [{ label: 'Edited', href: '/faq' }] } })
    await seed(payload)
    const nav = await payload.findGlobal({ slug: 'navigation', locale: 'en' })
    expect(nav.items?.map((item) => item.label)).toEqual(['Edited'])
  })

  it('records AI provenance and open claims on seeded articles', async () => {
    const { docs } = await payload.find({ collection: 'articles', where: { slug: { equals: 'prophet-muhammad' } }, draft: true })
    expect(docs[0].aiProvenance?.aiAssisted).toBe(true)
    expect(docs[0].verification?.claimsRequiringVerification?.length).toBeGreaterThan(0)
  })

  it('links Japanese and English versions as translations', async () => {
    const { docs } = await payload.find({ collection: 'articles', where: { slug: { equals: 'what-is-islam' } }, draft: true })
    expect(docs).toHaveLength(2)
    expect(new Set(docs.map((doc) => doc.translationGroup)).size).toBe(1)
  })
})
