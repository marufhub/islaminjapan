import { randomUUID } from 'node:crypto'

import type { Payload } from 'payload'

import { LOCALES } from '@/lib/i18n/config'
import { paragraphs, toLexical } from '@/lib/richtext/build'

import { SEED_ARTICLES } from './content/articles'
import { SEED_FAQS } from './content/faqs'
import { SEED_HISTORY_EVENTS } from './content/history'
import { SEED_CATEGORIES, SEED_HOMEPAGE, SEED_NAVIGATION, SEED_POLICIES, SEED_SITE } from './content/site'

/** Recorded on every seeded draft so reviewers know the text came from an AI-assisted session. */
const SEED_PROVENANCE = {
  aiAssisted: true,
  model: 'Claude (authored during initial project setup)',
  promptTemplate: 'seed-script',
}
const SEED_NOTE =
  'シード用の初期下書き（AI支援で作成）。公開前に、内容の監修・検証済み出典の登録・要確認事項の解決が必要です。 / Seed draft (AI-assisted). Requires expert review, verified sources and resolved claims before publishing.'

export type SeedReport = { created: string[]; skipped: string[] }

const seedCategories = async (payload: Payload, report: SeedReport) => {
  const ids = new Map<string, number>()
  for (const category of SEED_CATEGORIES) {
    const existing = await payload.find({ collection: 'categories', where: { slug: { equals: category.slug } }, limit: 1 })
    if (existing.docs[0]) {
      ids.set(category.slug, existing.docs[0].id)
      report.skipped.push(`category:${category.slug}`)
      continue
    }
    const created = await payload.create({
      collection: 'categories',
      locale: 'ja',
      data: { title: category.ja, slug: category.slug, group: category.group },
    })
    await payload.update({ collection: 'categories', id: created.id, locale: 'en', data: { title: category.en } })
    ids.set(category.slug, created.id)
    report.created.push(`category:${category.slug}`)
  }
  return ids
}

type LocalizedGlobal = 'site-settings' | 'navigation' | 'homepage' | 'editorial-policy'

/** True when the global already has content in any locale, so editors' work is never overwritten. */
const globalHasContent = async (payload: Payload, slug: LocalizedGlobal, field: string): Promise<boolean> => {
  for (const locale of LOCALES) {
    const doc = (await payload.findGlobal({ slug, locale, depth: 0, draft: true })) as unknown as Record<string, unknown>
    const value = doc[field]
    if (Array.isArray(value) ? value.length > 0 : Boolean(value)) return true
  }
  return false
}

/**
 * Each global is initialised only if it is still empty in every locale.
 * Site name, navigation and the homepage copy come from the project brief and are published;
 * policy texts are AI-drafted and are saved as an unpublished DRAFT for editorial/legal review.
 */
const seedGlobals = async (payload: Payload, report: SeedReport) => {
  const seedIfEmpty = async (slug: LocalizedGlobal, field: string, write: (locale: (typeof LOCALES)[number]) => Promise<unknown>) => {
    if (await globalHasContent(payload, slug, field)) {
      report.skipped.push(`global:${slug}`)
      return
    }
    for (const locale of LOCALES) await write(locale)
    report.created.push(`global:${slug}`)
  }

  await seedIfEmpty('site-settings', 'siteName', (locale) =>
    payload.updateGlobal({
      slug: 'site-settings',
      locale,
      data: { siteName: SEED_SITE[locale].siteName, tagline: SEED_SITE[locale].tagline, defaultDescription: SEED_SITE[locale].description },
    }),
  )
  await seedIfEmpty('navigation', 'items', (locale) =>
    payload.updateGlobal({ slug: 'navigation', locale, data: { items: SEED_NAVIGATION[locale] } }),
  )
  await seedIfEmpty('homepage', 'heroTitle', (locale) =>
    payload.updateGlobal({ slug: 'homepage', locale, data: { ...SEED_HOMEPAGE[locale], _status: 'published' } }),
  )
  await seedIfEmpty('editorial-policy', 'about', (locale) => {
    const policies = SEED_POLICIES[locale]
    return payload.updateGlobal({
      slug: 'editorial-policy',
      locale,
      draft: true,
      data: {
        about: toLexical(policies.about),
        editorialPolicy: toLexical(policies.editorialPolicy),
        sourcesPolicy: toLexical(policies.sourcesPolicy),
        privacyPolicy: toLexical(policies.privacyPolicy),
        _status: 'draft',
      },
    })
  })
}

const seedArticles = async (payload: Payload, categories: Map<string, number>, report: SeedReport) => {
  const groups = new Map<string, string>()
  const ids = new Map<string, number>()
  for (const article of SEED_ARTICLES) {
    const key = `${article.language}:${article.slug}`
    const existing = await payload.find({
      collection: 'articles',
      where: { and: [{ slug: { equals: article.slug } }, { language: { equals: article.language } }] },
      limit: 1,
      draft: true,
    })
    if (existing.docs[0]) {
      ids.set(key, existing.docs[0].id)
      report.skipped.push(`article:${key}`)
      continue
    }
    const translationGroup = groups.get(article.translationKey) ?? randomUUID()
    groups.set(article.translationKey, translationGroup)
    const created = await payload.create({
      collection: 'articles',
      draft: true,
      context: { aiStudio: true },
      data: {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        language: article.language,
        translationGroup,
        section: article.section,
        articleType: article.articleType,
        category: categories.get(article.categorySlug),
        audiences: article.audiences,
        knowledgeLevel: article.knowledgeLevel,
        japanRelevance: article.japanRelevance,
        learningJourneyOrder: article.learningJourneyOrder,
        editorialStatus: article.editorialStatus,
        body: toLexical(article.body),
        verification: {
          claimsRequiringVerification: article.claims.map((claim) => ({ ...claim, resolved: false })),
          editorialNotes: SEED_NOTE,
        },
        aiProvenance: { ...SEED_PROVENANCE, generatedAt: new Date().toISOString() },
        _status: 'draft',
      },
    })
    ids.set(key, created.id)
    report.created.push(`article:${key}`)
  }
  return ids
}

const seedFaqs = async (payload: Payload, categories: Map<string, number>, articles: Map<string, number>, report: SeedReport) => {
  for (const faq of SEED_FAQS) {
    const existing = await payload.find({ collection: 'faqs', locale: 'ja', where: { question: { equals: faq.question } }, limit: 1, draft: true })
    if (existing.docs[0]) {
      report.skipped.push(`faq:${faq.order}`)
      continue
    }
    const related = faq.relatedSlug ? articles.get(`ja:${faq.relatedSlug}`) : undefined
    await payload.create({
      collection: 'faqs',
      locale: 'ja',
      draft: true,
      data: {
        question: faq.question,
        shortAnswer: faq.shortAnswer,
        answer: toLexical(paragraphs(...faq.answer)),
        category: categories.get(faq.categorySlug),
        order: faq.order,
        relatedArticles: related ? [related] : [],
        editorialStatus: 'draft',
        _status: 'draft',
      },
    })
    report.created.push(`faq:${faq.order}`)
  }
}

const seedHistory = async (payload: Payload, articles: Map<string, number>, report: SeedReport) => {
  for (const event of SEED_HISTORY_EVENTS) {
    const existing = await payload.find({ collection: 'history-events', locale: 'ja', where: { title: { equals: event.title } }, limit: 1, draft: true })
    if (existing.docs[0]) {
      report.skipped.push(`event:${event.title}`)
      continue
    }
    const related = event.relatedSlug ? articles.get(`ja:${event.relatedSlug}`) : undefined
    await payload.create({
      collection: 'history-events',
      locale: 'ja',
      draft: true,
      data: {
        title: event.title,
        summary: event.summary,
        date: event.date,
        location: event.location,
        subjects: event.subjects,
        uncertaintyNotes: event.uncertaintyNotes,
        relatedArticles: related ? [related] : [],
        verificationStatus: 'in_research',
        verificationNotes: SEED_NOTE,
        editorialStatus: 'researching',
        _status: 'draft',
      },
    })
    report.created.push(`event:${event.title}`)
  }
}

/** Idempotent: existing records (matched by slug/question/title) are left untouched. */
export const seed = async (payload: Payload): Promise<SeedReport> => {
  const report: SeedReport = { created: [], skipped: [] }
  const categories = await seedCategories(payload, report)
  await seedGlobals(payload, report)
  const articles = await seedArticles(payload, categories, report)
  await seedFaqs(payload, categories, articles, report)
  await seedHistory(payload, articles, report)
  return report
}
