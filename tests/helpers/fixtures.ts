import { getPayload } from 'payload'

import { toLexical } from '../../src/lib/richtext/build.js'
import config from '../../src/payload.config.js'

export const FIXTURE = {
  prefix: 'e2e-',
  articleSlug: 'e2e-ramadan-basics',
  jaOnlySlug: 'e2e-ja-only',
  draftSlug: 'e2e-draft-only',
  articleTitleJa: 'E2Eテスト記事：ラマダンの基礎',
  articleTitleEn: 'E2E test article: Ramadan basics',
  faqQuestion: 'E2Eテスト：断食とは何ですか？',
  eventTitle: 'E2Eテスト年表項目',
  sourceTitle: 'E2E fixture source (test data)',
  contactEmail: 'e2e-visitor@example.test',
}

const getClient = async () => getPayload({ config })

/** Removes everything the fixtures (and the contact-form test) created. */
export async function cleanupFixtures(): Promise<void> {
  const payload = await getClient()
  await payload.delete({ collection: 'articles', where: { slug: { like: FIXTURE.prefix } } })
  await payload.delete({ collection: 'faqs', where: { question: { equals: FIXTURE.faqQuestion } }, locale: 'ja' })
  await payload.delete({ collection: 'history-events', where: { title: { equals: FIXTURE.eventTitle } }, locale: 'ja' })
  await payload.delete({ collection: 'sources', where: { title: { equals: FIXTURE.sourceTitle } } })
  await payload.delete({ collection: 'contact-submissions', where: { email: { equals: FIXTURE.contactEmail } } })
}

/** Published test content created via the system (no user) so the UI can be exercised. */
export async function seedFixtures(): Promise<void> {
  await cleanupFixtures()
  const payload = await getClient()
  const source = await payload.create({
    collection: 'sources',
    data: { title: FIXTURE.sourceTitle, sourceType: 'other', contentAccessed: true, verificationStatus: 'verified' },
  })
  const published = { _status: 'published' as const, editorialStatus: 'approved' as const }
  const group = 'e2e-translation-group'
  const base = { section: 'muslim-life' as const, articleType: 'explainer' as const, sources: [source.id], translationGroup: group }

  await payload.create({
    collection: 'articles',
    data: {
      ...base,
      ...published,
      title: FIXTURE.articleTitleJa,
      slug: FIXTURE.articleSlug,
      language: 'ja',
      summary: 'ラマダン月の断食について説明するテスト記事です。',
      body: toLexical([{ type: 'paragraph', text: 'ラマダンはイスラーム暦の9番目の月です。' }]),
    },
  })
  await payload.create({
    collection: 'articles',
    data: {
      ...base,
      ...published,
      title: FIXTURE.articleTitleEn,
      slug: FIXTURE.articleSlug,
      language: 'en',
      summary: 'A test article about fasting in Ramadan.',
      body: toLexical([{ type: 'paragraph', text: 'Ramadan is the ninth month of the Islamic calendar.' }]),
    },
  })
  await payload.create({
    collection: 'articles',
    data: { ...published, section: 'learn', articleType: 'explainer', title: 'E2E日本語のみの記事', slug: FIXTURE.jaOnlySlug, language: 'ja' },
  })
  await payload.create({
    collection: 'articles',
    draft: true,
    data: { section: 'learn', articleType: 'explainer', title: 'E2E未公開の下書き', slug: FIXTURE.draftSlug, language: 'ja', _status: 'draft' },
  })
  await payload.create({
    collection: 'faqs',
    locale: 'ja',
    data: {
      ...published,
      question: FIXTURE.faqQuestion,
      shortAnswer: 'テスト用の回答です。',
      answer: toLexical([{ type: 'paragraph', text: '夜明けから日没まで飲食を控えることです。' }]),
      publishedLocales: ['ja'],
    },
  })
  await payload.create({
    collection: 'history-events',
    locale: 'ja',
    data: {
      ...published,
      title: FIXTURE.eventTitle,
      summary: 'テスト用の年表項目です。',
      date: { precision: 'circa', startYear: 1890 },
      verificationStatus: 'verified',
      sources: [source.id],
      publishedLocales: ['ja'],
    },
  })
}
