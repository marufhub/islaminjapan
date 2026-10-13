import type { Where } from 'payload'

import type { Locale } from '@/lib/i18n/config'

import { getPayloadClient } from '../payload'
import { getViewer, viewerQueryOptions } from './viewer'

export const listFaqs = async ({ locale, query, featuredOnly, limit = 100 }: { locale: Locale; query?: string; featuredOnly?: boolean; limit?: number }) => {
  const payload = await getPayloadClient()
  const viewer = await getViewer()
  const conditions: Where[] = []
  if (query) conditions.push({ or: [{ question: { like: query } }, { searchText: { like: query } }] })
  if (featuredOnly) conditions.push({ featured: { equals: true } })
  const { docs } = await payload.find({
    collection: 'faqs',
    locale,
    where: conditions.length > 0 ? { and: conditions } : undefined,
    sort: 'order',
    limit,
    depth: 1,
    ...viewerQueryOptions(viewer),
  })
  // Hide documents that have no text in this language (never substitute another language).
  return docs.filter((faq) => Boolean(faq.question))
}
