import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'
import { LOCALES, type Locale } from '@/lib/i18n/config'

import { absoluteUrl } from './urls'

const STATIC_PATHS = ['', '/learn', '/history-of-islam-in-japan', '/muslim-life', '/faq', '/articles', '/about', '/contact', '/editorial-policy', '/sources-policy', '/privacy']

type Entry = MetadataRoute.Sitemap[number]

const withAlternates = (paths: Partial<Record<Locale, string>>, lastModified?: string | null): Entry[] =>
  Object.entries(paths).map(([, path]) => ({
    url: absoluteUrl(path as string),
    lastModified: lastModified ?? undefined,
    alternates: { languages: Object.fromEntries(Object.entries(paths).map(([lang, p]) => [lang, absoluteUrl(p as string)])) },
  }))

/** Only published, public content appears in the sitemap (queries run with public access). */
export const buildSitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const payload = await getPayloadClient()
  // History events are filtered by published language, so each locale is queried separately.
  const [articles, ...eventsByLocale] = await Promise.all([
    payload.find({
      collection: 'articles',
      limit: 5000,
      depth: 0,
      overrideAccess: false,
      select: { slug: true, language: true, translationGroup: true, updatedAt: true },
    }),
    ...LOCALES.map((locale) =>
      payload.find({
        collection: 'history-events',
        locale,
        limit: 5000,
        depth: 0,
        overrideAccess: false,
        select: { publishedLocales: true, updatedAt: true },
      }),
    ),
  ])
  const events = [...new Map(eventsByLocale.flatMap((result) => result.docs).map((event) => [event.id, event])).values()]

  const staticEntries = STATIC_PATHS.flatMap((path) =>
    withAlternates(Object.fromEntries(LOCALES.map((locale) => [locale, `/${locale}${path}`]))),
  )

  const groups = new Map<string, typeof articles.docs>()
  for (const article of articles.docs) {
    const key = article.translationGroup || `article-${article.id}`
    groups.set(key, [...(groups.get(key) ?? []), article])
  }
  const articleEntries = [...groups.values()].flatMap((group) =>
    withAlternates(
      Object.fromEntries(group.map((article) => [article.language, `/${article.language}/articles/${article.slug}`])),
      group.map((article) => article.updatedAt).sort().at(-1),
    ),
  )

  const eventEntries = events.flatMap((event) =>
    withAlternates(
      Object.fromEntries((event.publishedLocales ?? []).map((locale) => [locale, `/${locale}/history-of-islam-in-japan/events/${event.id}`])),
      event.updatedAt,
    ),
  )

  return [...staticEntries, ...articleEntries, ...eventEntries]
}
