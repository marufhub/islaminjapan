import type { Where } from 'payload'

import type { HistoryPeriod } from '@/lib/history/periods'
import type { Locale } from '@/lib/i18n/config'
import type { HistoryEvent } from '@/payload-types'

import { getPayloadClient } from '../payload'
import { getViewer, viewerQueryOptions } from './viewer'

export type HistorySubject = NonNullable<HistoryEvent['subjects']>[number]

export const listHistoryEvents = async ({ locale, period, subject, limit = 200 }: { locale: Locale; period?: HistoryPeriod; subject?: HistorySubject; limit?: number }) => {
  const payload = await getPayloadClient()
  const viewer = await getViewer()
  const conditions: Where[] = []
  if (period) conditions.push({ period: { equals: period } })
  if (subject) conditions.push({ subjects: { in: [subject] } })
  const { docs } = await payload.find({
    collection: 'history-events',
    locale,
    where: conditions.length > 0 ? { and: conditions } : undefined,
    sort: 'sortKey',
    limit,
    depth: 1,
    ...viewerQueryOptions(viewer),
  })
  return docs.filter((event) => Boolean(event.title))
}

export const getHistoryEvent = async (locale: Locale, id: number): Promise<HistoryEvent | null> => {
  const payload = await getPayloadClient()
  const viewer = await getViewer()
  const event = await payload.findByID({
    collection: 'history-events',
    id,
    locale,
    depth: 2,
    disableErrors: true,
    ...viewerQueryOptions(viewer),
  })
  return event && event.title ? event : null
}
