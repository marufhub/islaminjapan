import type { Locale } from './config'

const FORMATTERS: Record<Locale, Intl.DateTimeFormat> = {
  ja: new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long', timeZone: 'Asia/Tokyo' }),
  en: new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'Asia/Tokyo' }),
}

/** Formats a stored ISO date for display in Japan time; returns null for missing/invalid values. */
export const formatDate = (value: string | null | undefined, locale: Locale): string | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : FORMATTERS[locale].format(date)
}
