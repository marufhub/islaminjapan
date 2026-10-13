import type { Where } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/lib/i18n/config'
import type { Article } from '@/payload-types'

import { getPayloadClient } from '../payload'
import { getViewer, viewerQueryOptions } from './viewer'

export const ARTICLES_PER_PAGE = 12

export type ArticleSection = NonNullable<Article['section']>

export type ArticleListOptions = {
  locale: Locale
  section?: ArticleSection
  categoryId?: number
  query?: string
  page?: number
  limit?: number
  featuredOnly?: boolean
  articleType?: Article['articleType']
}

const LIST_SELECT = {
  title: true,
  slug: true,
  summary: true,
  language: true,
  section: true,
  category: true,
  coverImage: true,
  knowledgeLevel: true,
  publishedAt: true,
  lastReviewedAt: true,
  learningJourneyOrder: true,
} as const

const buildWhere = ({ locale, section, categoryId, query, featuredOnly, articleType }: ArticleListOptions): Where => {
  const conditions: Where[] = [{ language: { equals: locale } }]
  if (section) conditions.push({ section: { equals: section } })
  if (categoryId) conditions.push({ category: { equals: categoryId } })
  if (featuredOnly) conditions.push({ featured: { equals: true } })
  if (articleType) conditions.push({ articleType: { equals: articleType } })
  if (query) conditions.push({ or: [{ title: { like: query } }, { searchText: { like: query } }] })
  return { and: conditions }
}

export const listArticles = async (options: ArticleListOptions) => {
  const payload = await getPayloadClient()
  const viewer = await getViewer()
  return payload.find({
    collection: 'articles',
    where: buildWhere(options),
    sort: '-publishedAt',
    page: options.page ?? 1,
    limit: options.limit ?? ARTICLES_PER_PAGE,
    depth: 1,
    select: LIST_SELECT,
    ...viewerQueryOptions(viewer),
  })
}

/** Ordered beginner learning journey for a language. */
export const getLearningJourney = async (locale: Locale) => {
  const payload = await getPayloadClient()
  const viewer = await getViewer()
  const { docs } = await payload.find({
    collection: 'articles',
    where: { and: [{ language: { equals: locale } }, { learningJourneyOrder: { exists: true } }] },
    sort: 'learningJourneyOrder',
    limit: 20,
    depth: 0,
    select: LIST_SELECT,
    ...viewerQueryOptions(viewer),
  })
  return docs
}

export const getArticleBySlug = cache(async (locale: Locale, slug: string): Promise<Article | null> => {
  const payload = await getPayloadClient()
  const viewer = await getViewer()
  const { docs } = await payload.find({
    collection: 'articles',
    where: { and: [{ language: { equals: locale } }, { slug: { equals: slug } }] },
    limit: 1,
    depth: 2,
    ...viewerQueryOptions(viewer),
  })
  return docs[0] ?? null
})

export type TranslationLink = { locale: Locale; slug: string }

/** Published versions of the same article in other languages (shared translation group). */
export const getTranslations = cache(async (article: Pick<Article, 'id' | 'translationGroup'>) => {
  if (!article.translationGroup) return []
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: { and: [{ translationGroup: { equals: article.translationGroup } }, { id: { not_equals: article.id } }] },
    limit: 2,
    depth: 0,
    select: { slug: true, language: true },
    overrideAccess: false,
  })
  return docs.map((doc) => ({ locale: doc.language as Locale, slug: doc.slug as string }))
})

/** Finds a published article with this slug in another language, to offer an honest alternative. */
export const findArticleInOtherLocale = async (locale: Locale, slug: string): Promise<TranslationLink | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: { and: [{ slug: { equals: slug } }, { language: { not_equals: locale } }] },
    limit: 1,
    depth: 0,
    select: { slug: true, language: true },
    overrideAccess: false,
  })
  const doc = docs[0]
  return doc ? { locale: doc.language as Locale, slug: doc.slug as string } : null
}
