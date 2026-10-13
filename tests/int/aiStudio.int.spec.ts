import type { Payload } from 'payload'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { generate } from '@/features/ai-studio/generate'
import { estimatedSpendThisMonth } from '@/features/ai-studio/limits'
import { saveDraft, type SaveRequest, submitForReview } from '@/features/ai-studio/save'
import { AIError } from '@/lib/ai/errors'
import type { LLMProvider, StructuredRequest } from '@/lib/ai/provider'
import type { Brief, Draft } from '@/lib/ai/schemas'
import type { User } from '@/payload-types'

import { createUser, getTestPayload } from './helpers'

let payload: Payload
let author: User
let editor: User
let verifiedId: number
let unverifiedId: number

/** Fake model: records prompts and returns canned structured output. */
const fakeProvider = (output: unknown, calls: StructuredRequest<unknown>[] = []): LLMProvider => ({
  name: 'fake',
  async generateStructured<T>(request: StructuredRequest<T>) {
    calls.push(request as StructuredRequest<unknown>)
    return { data: request.schema.parse(output), model: 'fake-model', usage: { inputTokens: 100, outputTokens: 50 }, requestId: 'resp_test' }
  },
})

const failingProvider = (error: AIError): LLMProvider => ({
  name: 'failing',
  async generateStructured() {
    throw error
  },
})

const brief = (overrides: Partial<Brief> = {}): Brief => ({
  topic: 'ラマダンとは',
  contentType: 'explainer',
  language: 'ja',
  audience: 'non_muslims',
  knowledgeLevel: 'beginner',
  purpose: 'explanation',
  style: 'beginner_friendly',
  length: 'short',
  sourceIds: [],
  researchNotes: '',
  instructions: '',
  ...overrides,
})

const draft = (overrides: Partial<Draft> = {}): Draft => ({
  title: 'ラマダンとは？',
  summary: 'ラマダンについての説明です。',
  outline: ['意味', '過ごし方'],
  body: [
    { type: 'h2', text: 'ラマダンの意味', items: [] },
    { type: 'paragraph', text: 'ラマダンはイスラーム暦の9番目の月です。', items: [] },
  ],
  seoTitle: 'What is Ramadan',
  seoDescription: 'ラマダンの基本。',
  suggestedCategory: 'muslim-life',
  tags: ['ラマダン'],
  usedSourceIds: [],
  claimsRequiringVerification: [{ claim: '毎年約11日早まる', reason: '日数の根拠が必要', suggestedEvidence: '暦の資料' }],
  editorialNotes: '出典を追加してください。',
  ...overrides,
})

const saveRequest = (overrides: Partial<SaveRequest> = {}): SaveRequest => ({
  draft: draft(),
  meta: { language: 'ja', contentType: 'explainer', audience: 'non_muslims', knowledgeLevel: 'beginner' },
  generation: { model: 'fake-model', action: 'draft', generatedAt: new Date().toISOString(), promptVersion: 'explainer@2+policy@2' },
  target: { mode: 'new' },
  translationOfId: null,
  ...overrides,
})

beforeAll(async () => {
  payload = await getTestPayload()
  await createUser(payload, 'admin', 'AiAdmin')
  editor = await createUser(payload, 'editor', 'AiEditor')
  author = await createUser(payload, 'author', 'AiAuthor')
  const verified = await payload.create({
    collection: 'sources',
    data: {
      title: 'Verified calendar reference',
      sourceType: 'book',
      contentAccessed: true,
      verificationStatus: 'verified',
      excerpts: [{ text: 'Ramadan is the ninth month.', locator: 'p. 12', origin: 'editor_transcribed' }],
      researchNotes: 'internal note',
    },
  })
  const unverified = await payload.create({ collection: 'sources', data: { title: 'Unchecked blog', sourceType: 'website', verificationStatus: 'unverified' } })
  verifiedId = verified.id
  unverifiedId = unverified.id
})

afterEach(() => vi.unstubAllEnvs())

describe('generate', () => {
  it('passes only verified sources and their excerpts to the model', async () => {
    const calls: StructuredRequest<unknown>[] = []
    const output = { title: 't', sections: [{ heading: 'h', points: ['p'] }], usedSourceIds: [verifiedId, unverifiedId, 12345], claimsRequiringVerification: [], editorialNotes: '' }
    const result = await generate(payload, author, { action: 'outline', brief: brief({ sourceIds: [verifiedId, unverifiedId] }) }, fakeProvider(output, calls))

    expect(calls[0].prompt).toContain('Ramadan is the ninth month.')
    expect(calls[0].prompt).not.toContain('Unchecked blog')
    // Internal research notes on the source are never sent.
    expect(calls[0].prompt).not.toContain('internal note')
    expect(result.action).toBe('outline')
    if (result.action === 'outline') expect(result.data.usedSourceIds).toEqual([verifiedId])
    expect(result.warnings.join(' ')).toMatch(/not verified or not accessible/)
    expect(result.warnings.join(' ')).toMatch(/not supplied/)
  })

  it('logs usage metadata without content', async () => {
    const { docs } = await payload.find({ collection: 'ai-usage', where: { user: { equals: author.id } }, sort: '-createdAt', limit: 1 })
    expect(docs[0]).toMatchObject({
      action: 'outline',
      status: 'success',
      model: 'fake-model',
      modelTier: 'fast',
      promptVersion: 'explainer@2+policy@2',
      requestId: 'resp_test',
      inputTokens: 100,
      outputTokens: 50,
    })
    expect(JSON.stringify(docs[0])).not.toContain('ラマダン')
  })

  it('records failures and rethrows a typed error', async () => {
    const error = new AIError('refusal', 'declined')
    await expect(generate(payload, author, { action: 'seo', brief: brief(), draft: draft() }, failingProvider(error))).rejects.toMatchObject({ kind: 'refusal' })
    const { docs } = await payload.find({ collection: 'ai-usage', where: { user: { equals: author.id } }, sort: '-createdAt', limit: 1 })
    expect(docs[0]).toMatchObject({ status: 'error', errorKind: 'refusal' })
  })

  it('records tokens from failed calls against the budget', async () => {
    const error = new AIError('truncated', 'cut off', { usage: { inputTokens: 300, outputTokens: 16000 } })
    await expect(generate(payload, author, { action: 'seo', brief: brief(), draft: draft() }, failingProvider(error))).rejects.toMatchObject({ kind: 'truncated' })
    const { docs } = await payload.find({ collection: 'ai-usage', where: { user: { equals: author.id } }, sort: '-createdAt', limit: 1 })
    expect(docs[0]).toMatchObject({ status: 'error', errorKind: 'truncated', outputTokens: 16000 })
  })

  it('counts in-flight requests so parallel bursts cannot exceed the hourly limit', async () => {
    const burstUser = await createUser(payload, 'author', 'BurstAuthor')
    vi.stubEnv('AI_HOURLY_REQUEST_LIMIT', '3')
    const slow: LLMProvider = {
      name: 'slow',
      async generateStructured<T>(request: StructuredRequest<T>) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return { data: request.schema.parse({ seoTitle: 'a', seoDescription: 'b' }), model: 'fake-model', usage: { inputTokens: 1, outputTokens: 1 }, requestId: 'resp_test' }
      },
    }
    const results = await Promise.allSettled(
      Array.from({ length: 6 }, () => generate(payload, burstUser, { action: 'seo', brief: brief(), draft: draft() }, slow)),
    )
    expect(results.filter((result) => result.status === 'fulfilled').length).toBeLessThanOrEqual(3)
    // Rejected attempts are not stored.
    const { totalDocs } = await payload.count({ collection: 'ai-usage', where: { user: { equals: burstUser.id } } })
    expect(totalDocs).toBeLessThanOrEqual(3)
  })

  it('enforces the hourly request limit per user', async () => {
    vi.stubEnv('AI_HOURLY_REQUEST_LIMIT', '2')
    const provider = fakeProvider({ seoTitle: 'a', seoDescription: 'b' })
    await expect(generate(payload, author, { action: 'seo', brief: brief(), draft: draft() }, provider)).rejects.toMatchObject({ kind: 'rate_limited' })
    // Other users are unaffected.
    await expect(generate(payload, editor, { action: 'seo', brief: brief(), draft: draft() }, provider)).resolves.toBeTruthy()
  })

  it('enforces the daily token budget', async () => {
    vi.stubEnv('AI_DAILY_TOKEN_BUDGET', '100')
    await expect(
      generate(payload, editor, { action: 'seo', brief: brief(), draft: draft() }, fakeProvider({ seoTitle: 'a', seoDescription: 'b' })),
    ).rejects.toMatchObject({ kind: 'budget_exceeded' })
  })
})

describe('saveDraft', () => {
  it('saves an unpublished draft with claims, sources and AI provenance', async () => {
    const saved = await saveDraft(payload, author, saveRequest({ draft: draft({ usedSourceIds: [verifiedId, unverifiedId] }) }))
    const article = await payload.findByID({ collection: 'articles', id: saved.id, draft: true, depth: 0 })
    expect(article._status).toBe('draft')
    expect(article.editorialStatus).toBe('draft')
    expect(article.author).toBe(author.id)
    expect(article.slug).toBe('what-is-ramadan')
    expect(article.sources).toEqual([verifiedId])
    expect(article.verification?.claimsRequiringVerification?.[0]).toMatchObject({ claim: '毎年約11日早まる', resolved: false })
    expect(article.aiProvenance).toMatchObject({ aiAssisted: true, model: 'fake-model', promptTemplate: 'draft:explainer@2+policy@2', generatedBy: author.id })
    const publicView = await payload.find({ collection: 'articles', where: { id: { equals: saved.id } }, overrideAccess: false })
    expect(publicView.totalDocs).toBe(0)
  })

  it('refuses to overwrite a draft that was edited after loading, and keeps version history', async () => {
    const saved = await saveDraft(payload, author, saveRequest({ draft: draft({ seoTitle: 'Conflict test' }) }))
    // Someone edits the article in the CMS.
    await payload.update({ collection: 'articles', id: saved.id, data: { summary: 'Human edit' }, draft: true, user: author, overrideAccess: false })

    await expect(
      saveDraft(payload, author, saveRequest({ target: { mode: 'update', articleId: saved.id, expectedUpdatedAt: saved.updatedAt } })),
    ).rejects.toMatchObject({ kind: 'conflict' })
    const current = await payload.findByID({ collection: 'articles', id: saved.id, draft: true })
    expect(current.summary).toBe('Human edit')

    const updated = await saveDraft(payload, author, saveRequest({ target: { mode: 'update', articleId: saved.id, expectedUpdatedAt: current.updatedAt } }))
    const versions = await payload.findVersions({ collection: 'articles', where: { parent: { equals: updated.id } } })
    expect(versions.totalDocs).toBeGreaterThanOrEqual(3)
  })

  it('keeps sources, claim resolutions and workflow status when updating an existing article', async () => {
    const saved = await saveDraft(payload, author, saveRequest({ draft: draft({ seoTitle: 'Merge test', usedSourceIds: [verifiedId] }) }))
    // An editor resolves the claim and moves the article into review.
    const current = await payload.findByID({ collection: 'articles', id: saved.id, draft: true, depth: 0 })
    const claim = current.verification?.claimsRequiringVerification?.[0]
    const reviewed = await payload.update({
      collection: 'articles',
      id: saved.id,
      draft: true,
      user: editor,
      overrideAccess: false,
      data: {
        editorialStatus: 'in_review',
        verification: { claimsRequiringVerification: [{ ...claim!, resolved: true, resolutionNote: 'Checked' }] },
      },
    })

    const updated = await saveDraft(
      payload,
      editor,
      saveRequest({
        draft: draft({ title: 'Improved title', usedSourceIds: [], claimsRequiringVerification: [{ claim: 'New claim', reason: 'r', suggestedEvidence: 'e' }] }),
        target: { mode: 'update', articleId: saved.id, expectedUpdatedAt: reviewed.updatedAt },
      }),
    )
    const article = await payload.findByID({ collection: 'articles', id: updated.id, draft: true, depth: 0 })
    expect(article.title).toBe('Improved title')
    expect(article.sources).toEqual([verifiedId])
    expect(article.editorialStatus).toBe('in_review')
    expect(article.verification?.claimsRequiringVerification?.map((item) => [item.claim, item.resolved])).toEqual([
      ['毎年約11日早まる', true],
      ['New claim', false],
    ])
  })

  it('links a translation into the original translation group', async () => {
    const original = await saveDraft(payload, author, saveRequest({ draft: draft({ seoTitle: 'Original for translation' }) }))
    const translation = await saveDraft(
      payload,
      author,
      saveRequest({
        draft: draft({ title: 'What is Ramadan?', seoTitle: 'What is Ramadan translation' }),
        meta: { language: 'en', contentType: 'explainer', audience: 'non_muslims', knowledgeLevel: 'beginner' },
        translationOfId: original.id,
      }),
    )
    const [a, b] = await Promise.all(
      [original.id, translation.id].map((id) => payload.findByID({ collection: 'articles', id, draft: true, depth: 0 })),
    )
    expect(b.language).toBe('en')
    expect(b.translationGroup).toBe(a.translationGroup)
  })

  it('lets an author submit for review but still not publish', async () => {
    const saved = await saveDraft(payload, author, saveRequest({ draft: draft({ seoTitle: 'Review flow' }) }))
    const submitted = await submitForReview(payload, author, saved.id)
    expect(submitted).toMatchObject({ editorialStatus: 'in_review' })
    // The returned timestamp lets the Studio keep saving without a false conflict.
    await expect(
      saveDraft(payload, author, saveRequest({ target: { mode: 'update', articleId: saved.id, expectedUpdatedAt: submitted.updatedAt } })),
    ).resolves.toBeTruthy()
    await expect(
      payload.update({ collection: 'articles', id: saved.id, data: { _status: 'published', editorialStatus: 'approved' }, user: author, overrideAccess: false }),
    ).rejects.toThrow(/Only editors/)
  })
})

describe('site-wide monthly budget', () => {
  it('blocks new requests once the estimated monthly spend reaches AI_MONTHLY_BUDGET_USD', async () => {
    const user = await createUser(payload, 'editor', 'BudgetEditor')
    const priced: LLMProvider = {
      name: 'priced',
      async generateStructured<T>(request: StructuredRequest<T>) {
        // 1M input tokens on gpt-6-luna ≈ US$0.10 estimated.
        return { data: request.schema.parse({ seoTitle: 'a', seoDescription: 'b' }), model: 'gpt-6-luna', usage: { inputTokens: 1_000_000, outputTokens: 0 }, requestId: 'r' }
      },
    }
    const spentBefore = await estimatedSpendThisMonth(payload)
    vi.stubEnv('AI_MONTHLY_BUDGET_USD', String(spentBefore + 0.1))
    await expect(generate(payload, user, { action: 'seo', brief: brief(), draft: draft() }, priced)).resolves.toBeTruthy()
    const { docs } = await payload.find({ collection: 'ai-usage', where: { user: { equals: user.id } }, limit: 1 })
    expect(docs[0].estimatedCostUsd).toBeCloseTo(0.1)
    await expect(generate(payload, user, { action: 'seo', brief: brief(), draft: draft() }, priced)).rejects.toMatchObject({ kind: 'budget_exceeded' })
  })
})
