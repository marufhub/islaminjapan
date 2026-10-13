import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'

import { createUser, getTestPayload } from './helpers'

let payload: Payload
let admin: User
let editor: User
let author: User
let otherAuthor: User

const asUser = (user: User) => ({ user, overrideAccess: false })

const createDraftArticle = (user: User, overrides: Record<string, unknown> = {}) =>
  payload.create({
    collection: 'articles',
    data: { title: 'What is Islam?', slug: `article-${Math.random().toString(36).slice(2, 8)}`, language: 'ja', ...overrides },
    draft: true,
    ...asUser(user),
  })

beforeAll(async () => {
  payload = await getTestPayload()
  admin = await createUser(payload, 'admin', 'Admin')
  editor = await createUser(payload, 'editor', 'Editor')
  author = await createUser(payload, 'author', 'Author')
  otherAuthor = await createUser(payload, 'author', 'OtherAuthor')
})

describe('roles', () => {
  it('makes the first account an admin', () => {
    expect(admin.role).toBe('admin')
  })

  it('does not let an author promote themselves', async () => {
    const updated = await payload.update({ collection: 'users', id: author.id, data: { role: 'admin' }, ...asUser(author) })
    expect(updated.role).toBe('author')
  })

  it('hides user accounts from the public', async () => {
    await expect(payload.find({ collection: 'users', overrideAccess: false })).rejects.toThrow()
  })
})

describe('article publishing workflow', () => {
  it('lets an author create a draft owned by them', async () => {
    const article = await createDraftArticle(author)
    expect(article._status).toBe('draft')
    expect(typeof article.author === 'object' ? article.author?.id : article.author).toBe(author.id)
  })

  it('forbids an author from publishing', async () => {
    const article = await createDraftArticle(author)
    await expect(
      payload.update({
        collection: 'articles',
        id: article.id,
        data: { _status: 'published', editorialStatus: 'approved' },
        ...asUser(author),
      }),
    ).rejects.toThrow(/Only editors/)
  })

  it('forbids an author from approving', async () => {
    const article = await createDraftArticle(author)
    await expect(
      payload.update({ collection: 'articles', id: article.id, data: { editorialStatus: 'approved' }, draft: true, ...asUser(author) }),
    ).rejects.toThrow(/Only editors can approve/)
  })

  it("forbids an author from editing another author's article", async () => {
    const article = await createDraftArticle(otherAuthor)
    await expect(
      payload.update({ collection: 'articles', id: article.id, data: { title: 'Changed' }, draft: true, ...asUser(author) }),
    ).rejects.toThrow()
  })

  it('requires approval and a reviewer before an editor publishes', async () => {
    const article = await createDraftArticle(author)
    await expect(
      payload.update({ collection: 'articles', id: article.id, data: { _status: 'published' }, ...asUser(editor) }),
    ).rejects.toThrow(/Approved/)
    await expect(
      payload.update({
        collection: 'articles',
        id: article.id,
        data: { _status: 'published', editorialStatus: 'approved' },
        ...asUser(editor),
      }),
    ).rejects.toThrow(/reviewer/)
  })

  it('blocks publishing with unresolved claims', async () => {
    const article = await createDraftArticle(author, {
      verification: { claimsRequiringVerification: [{ claim: 'A historical date', resolved: false }] },
    })
    await expect(
      payload.update({
        collection: 'articles',
        id: article.id,
        data: { _status: 'published', editorialStatus: 'approved', reviewer: editor.id },
        ...asUser(editor),
      }),
    ).rejects.toThrow(/claim/)
  })

  it('blocks publishing with unverified sources, then allows it once verified', async () => {
    const source = await payload.create({
      collection: 'sources',
      data: { title: 'Test source', sourceType: 'book', verificationStatus: 'unverified' },
      draft: false,
      ...asUser(author),
    })
    const article = await createDraftArticle(author, { sources: [source.id] })
    const publish = () =>
      payload.update({
        collection: 'articles',
        id: article.id,
        data: { _status: 'published', editorialStatus: 'approved', reviewer: editor.id },
        ...asUser(editor),
      })

    await expect(publish()).rejects.toThrow(/sources must be verified/)
    await payload.update({
      collection: 'sources',
      id: source.id,
      data: { contentAccessed: true, verificationStatus: 'verified' },
      ...asUser(editor),
    })
    const published = await publish()
    expect(published._status).toBe('published')
    expect(published.publishedAt).toBeTruthy()
  })

  it('shows only published articles to the public', async () => {
    const { docs } = await payload.find({ collection: 'articles', overrideAccess: false, limit: 100 })
    expect(docs.length).toBeGreaterThan(0)
    expect(docs.every((doc) => doc._status === 'published')).toBe(true)
  })

  it('ignores AI provenance written through the normal API', async () => {
    const article = await createDraftArticle(author, { aiProvenance: { aiAssisted: true, model: 'forged' } })
    const stored = await payload.findByID({ collection: 'articles', id: article.id, draft: true })
    expect(stored.aiProvenance?.model ?? null).toBeNull()
  })

  it('rejects a duplicate slug in the same language', async () => {
    await createDraftArticle(author, { slug: 'duplicate-slug' })
    await expect(createDraftArticle(author, { slug: 'duplicate-slug' })).rejects.toThrow(/already in use/)
    await expect(createDraftArticle(author, { slug: 'duplicate-slug', language: 'en' })).resolves.toBeTruthy()
  })
})

describe('sources', () => {
  it('cannot be verified without confirming the contents were consulted', async () => {
    const source = await payload.create({ collection: 'sources', data: { title: 'URL only', sourceType: 'website', url: 'https://example.org', verificationStatus: 'unverified' }, draft: false, ...asUser(editor) })
    await expect(
      payload.update({ collection: 'sources', id: source.id, data: { verificationStatus: 'verified' }, ...asUser(editor) }),
    ).rejects.toThrow(/actually consulted/)
  })

  it('cannot be verified by an author, on create or update', async () => {
    const created = await payload.create({
      collection: 'sources',
      data: { title: 'Mine', sourceType: 'book', contentAccessed: true, verificationStatus: 'verified' },
      draft: false,
      ...asUser(author),
    })
    expect(created.verificationStatus).toBe('unverified')
    expect(created.contentAccessed).toBe(false)
    const updated = await payload.update({
      collection: 'sources',
      id: created.id,
      data: { contentAccessed: true, verificationStatus: 'verified' },
      ...asUser(author),
    })
    expect(updated.verificationStatus).toBe('unverified')
  })

  it('cannot be altered or downgraded by its author once verified', async () => {
    const source = await payload.create({
      collection: 'sources',
      data: { title: 'Owned', sourceType: 'book', verificationStatus: 'unverified' },
      draft: false,
      ...asUser(author),
    })
    await payload.update({
      collection: 'sources',
      id: source.id,
      data: { contentAccessed: true, verificationStatus: 'verified' },
      ...asUser(editor),
    })
    await expect(
      payload.update({ collection: 'sources', id: source.id, data: { url: 'https://changed.example' }, ...asUser(author) }),
    ).rejects.toThrow()
  })

  it('hides unverified sources and research notes from the public', async () => {
    const { docs } = await payload.find({ collection: 'sources', overrideAccess: false, limit: 100 })
    expect(docs.every((doc) => doc.verificationStatus === 'verified')).toBe(true)
    expect(docs.every((doc) => doc.researchNotes === undefined)).toBe(true)
  })
})

describe('history events', () => {
  const createEvent = (data: Record<string, unknown>) =>
    payload.create({
      collection: 'history-events',
      data: { title: 'テスト項目', date: { precision: 'year', startYear: 1938 }, ...data },
      locale: 'ja',
      draft: true,
      ...asUser(editor),
    })

  it('derives the sort key and period from the date', async () => {
    const event = await createEvent({})
    expect(event.sortKey).toBe(19380000)
    expect(event.period).toBe('prewar_showa')
  })

  it('rejects an inconsistent date', async () => {
    await expect(createEvent({ date: { precision: 'day', startYear: 1938, startMonth: 2, startDay: 30 } })).rejects.toThrow(/invalid day/)
  })

  it('requires an explicit sort key for unknown dates', async () => {
    await expect(createEvent({ date: { precision: 'unknown' } })).rejects.toThrow(/sort key/)
    await expect(createEvent({ date: { precision: 'unknown' }, sortKey: 18000000 })).resolves.toBeTruthy()
  })

  it('cannot be published until fact-checked with a verified source', async () => {
    const event = await createEvent({})
    await expect(
      payload.update({
        collection: 'history-events',
        id: event.id,
        data: { _status: 'published', editorialStatus: 'approved', publishedLocales: ['ja'] },
        ...asUser(editor),
      }),
    ).rejects.toThrow(/Fact-check/)
  })

  it('is visible to the public only in published locales', async () => {
    const source = await payload.create({
      collection: 'sources',
      data: { title: 'Verified archive', sourceType: 'archival', contentAccessed: true, verificationStatus: 'verified' },
      ...asUser(editor),
    })
    const event = await createEvent({ sources: [source.id], verificationStatus: 'verified' })
    await payload.update({
      collection: 'history-events',
      id: event.id,
      data: { _status: 'published', editorialStatus: 'approved', publishedLocales: ['ja'], reviewer: editor.id },
      locale: 'ja',
      ...asUser(editor),
    })

    const ja = await payload.find({ collection: 'history-events', locale: 'ja', overrideAccess: false })
    const en = await payload.find({ collection: 'history-events', locale: 'en', overrideAccess: false })
    expect(ja.docs.map((doc) => doc.id)).toContain(event.id)
    expect(en.docs.map((doc) => doc.id)).not.toContain(event.id)
    // Reviewer identity and review date are internal; the public API never returns them.
    const publicEvent = ja.docs.find((doc) => doc.id === event.id)
    expect(publicEvent?.reviewer).toBeUndefined()
    expect(publicEvent?.lastReviewedAt).toBeUndefined()
  })
})

describe('review hardening', () => {
  const publishApproved = async (articleAuthor: User) => {
    const article = await createDraftArticle(articleAuthor)
    return payload.update({
      collection: 'articles',
      id: article.id,
      data: { _status: 'published', editorialStatus: 'approved', reviewer: editor.id },
      ...asUser(editor),
    })
  }

  it('forbids an author from unpublishing their published article', async () => {
    const article = await publishApproved(author)
    await expect(
      payload.update({ collection: 'articles', id: article.id, data: { _status: 'draft' }, ...asUser(author) }),
    ).rejects.toThrow(/Only editors can unpublish/)
  })

  it('lets an author save a new draft of their published article without unpublishing it', async () => {
    const article = await publishApproved(author)
    await payload.update({
      collection: 'articles',
      id: article.id,
      data: { title: 'Revised title' },
      draft: true,
      ...asUser(author),
    })
    const live = await payload.findByID({ collection: 'articles', id: article.id, overrideAccess: false })
    expect(live._status).toBe('published')
    expect(live.title).toBe('What is Islam?')
  })

  it('ignores editor-only fields set by an author at creation', async () => {
    const article = await createDraftArticle(author, {
      reviewer: editor.id,
      author: otherAuthor.id,
      verification: { claimsRequiringVerification: [{ claim: 'x', resolved: true }] },
    })
    const stored = await payload.findByID({ collection: 'articles', id: article.id, draft: true, depth: 0 })
    expect(stored.reviewer ?? null).toBeNull()
    expect(stored.author).toBe(author.id)
    expect(stored.verification?.claimsRequiringVerification?.[0]?.resolved).toBe(false)

    const event = await payload.create({
      collection: 'history-events',
      data: { title: '著者作成', date: { precision: 'year', startYear: 1950 }, verificationStatus: 'verified' },
      locale: 'ja',
      draft: true,
      ...asUser(author),
    })
    expect(event.verificationStatus).toBe('unverified')
  })

  it('hides internal verification notes from the public', async () => {
    const article = await publishApproved(author)
    const publicDoc = await payload.findByID({ collection: 'articles', id: article.id, overrideAccess: false })
    expect(publicDoc.verification).toBeUndefined()
  })

  it('does not leak another language through fallback-locale for anonymous readers', async () => {
    const source = await payload.create({
      collection: 'sources',
      data: { title: 'Fallback test source', sourceType: 'archival', contentAccessed: true, verificationStatus: 'verified' },
      draft: false,
      ...asUser(editor),
    })
    const event = await payload.create({
      collection: 'history-events',
      data: { title: '日本語のみ', date: { precision: 'year', startYear: 1960 }, sources: [source.id], verificationStatus: 'verified' },
      locale: 'ja',
      draft: true,
      ...asUser(editor),
    })
    await payload.update({
      collection: 'history-events',
      id: event.id,
      data: { _status: 'published', editorialStatus: 'approved', publishedLocales: ['ja', 'en'], reviewer: editor.id },
      locale: 'ja',
      ...asUser(editor),
    })
    const english = await payload.findByID({
      collection: 'history-events',
      id: event.id,
      locale: 'en',
      fallbackLocale: 'ja',
      overrideAccess: false,
    })
    expect(english.title ?? null).toBeNull()
  })

  it('limits authors to their own user record', async () => {
    const { docs } = await payload.find({ collection: 'users', ...asUser(author) })
    expect(docs.map((doc) => doc.id)).toEqual([author.id])
  })

  it("forbids an author from editing another author's media metadata", async () => {
    // 1×1 transparent PNG
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64',
    )
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'テスト画像', license: 'owned' },
      file: { data: png, mimetype: 'image/png', name: 'pixel.png', size: png.length },
      locale: 'ja',
      ...asUser(otherAuthor),
    })
    await expect(
      payload.update({ collection: 'media', id: media.id, data: { license: 'unknown' }, ...asUser(author) }),
    ).rejects.toThrow()
    const own = await payload.update({ collection: 'media', id: media.id, data: { credit: 'Owner' }, ...asUser(otherAuthor) })
    expect(own.credit).toBe('Owner')
  })

  it('forbids unpublishing even after a newer draft version exists', async () => {
    const article = await publishApproved(author)
    await payload.update({ collection: 'articles', id: article.id, data: { title: 'Draft edit' }, draft: true, ...asUser(author) })
    await expect(
      payload.update({ collection: 'articles', id: article.id, data: { _status: 'draft' }, ...asUser(author) }),
    ).rejects.toThrow(/Only editors can unpublish/)
    const live = await payload.findByID({ collection: 'articles', id: article.id, overrideAccess: false })
    expect(live._status).toBe('published')
  })

  it('returns an approved article to review when its author edits it', async () => {
    const article = await createDraftArticle(author)
    await payload.update({ collection: 'articles', id: article.id, data: { editorialStatus: 'approved' }, draft: true, ...asUser(editor) })
    const edited = await payload.update({
      collection: 'articles',
      id: article.id,
      data: { summary: 'Unreviewed change' },
      draft: true,
      ...asUser(author),
    })
    expect(edited.editorialStatus).toBe('in_review')
  })

  it('requires sources cited in conflicting accounts to be verified', async () => {
    const verified = await payload.create({
      collection: 'sources',
      data: { title: 'Verified', sourceType: 'book', contentAccessed: true, verificationStatus: 'verified' },
      draft: false,
      ...asUser(editor),
    })
    const unverified = await payload.create({
      collection: 'sources',
      data: { title: 'Unverified account', sourceType: 'book', verificationStatus: 'unverified' },
      draft: false,
      ...asUser(editor),
    })
    const event = await payload.create({
      collection: 'history-events',
      data: {
        title: '諸説',
        date: { precision: 'year', startYear: 1970 },
        sources: [verified.id],
        conflictingAccounts: [{ account: '別の説', sources: [unverified.id] }],
        verificationStatus: 'verified',
      },
      locale: 'ja',
      draft: true,
      ...asUser(editor),
    })
    await expect(
      payload.update({
        collection: 'history-events',
        id: event.id,
        data: { _status: 'published', editorialStatus: 'approved', publishedLocales: ['ja'], reviewer: editor.id },
        locale: 'ja',
        ...asUser(editor),
      }),
    ).rejects.toThrow(/Unverified account/)
  })

  it('re-derives the period when the start year is corrected', async () => {
    const event = await payload.create({
      collection: 'history-events',
      data: { title: '年の訂正', date: { precision: 'year', startYear: 1890 } },
      locale: 'ja',
      draft: true,
      ...asUser(editor),
    })
    expect(event.period).toBe('meiji')
    const corrected = await payload.update({
      collection: 'history-events',
      id: event.id,
      data: { date: { precision: 'year', startYear: 1932 }, period: 'meiji' },
      locale: 'ja',
      draft: true,
      ...asUser(editor),
    })
    expect(corrected.period).toBe('prewar_showa')
    expect(corrected.sortKey).toBe(19320000)
  })

  it('requires reviewer approval before a history event is published', async () => {
    const source = await payload.create({
      collection: 'sources',
      data: { title: 'Reviewer test source', sourceType: 'archival', contentAccessed: true, verificationStatus: 'verified' },
      draft: false,
      ...asUser(editor),
    })
    const event = await payload.create({
      collection: 'history-events',
      data: { title: '承認テスト', date: { precision: 'year', startYear: 1935 }, sources: [source.id], verificationStatus: 'verified' },
      locale: 'ja',
      draft: true,
      ...asUser(editor),
    })
    await expect(
      payload.update({
        collection: 'history-events',
        id: event.id,
        data: { _status: 'published', editorialStatus: 'approved', publishedLocales: ['ja'] },
        locale: 'ja',
        ...asUser(editor),
      }),
    ).rejects.toThrow(/reviewer/)
  })
})
