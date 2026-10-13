export const LOCALES = ['ja', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'ja'

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value)

/** Bilingual label helper for Payload admin labels. */
export const label = (ja: string, en: string): Record<Locale, string> => ({ ja, en })

export const LOCALE_OPTIONS = [
  { label: '日本語', value: 'ja' },
  { label: 'English', value: 'en' },
] as const satisfies ReadonlyArray<{ label: string; value: Locale }>
