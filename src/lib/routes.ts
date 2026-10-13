import type { Locale } from './i18n/config'

/**
 * Public route of the "History of Islam in Japan" section (日本におけるイスラームの歴史).
 * The section covers Islam and Muslim communities in Japan — not general Japanese history.
 */
export const HISTORY_PATH = '/history-of-islam-in-japan'
/** Former path, kept as a permanent redirect. */
export const LEGACY_HISTORY_PATH = '/islam-in-japan'

export const historyEventPath = (locale: Locale, id: number | string): string => `/${locale}${HISTORY_PATH}/events/${id}`
