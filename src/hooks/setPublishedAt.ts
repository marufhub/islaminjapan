import type { CollectionBeforeChangeHook } from 'payload'

/** Stamps the first publication date; editors may override it manually. */
export const setPublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (data._status !== 'published' || data.publishedAt || originalDoc?.publishedAt) return data
  return { ...data, publishedAt: new Date().toISOString() }
}
