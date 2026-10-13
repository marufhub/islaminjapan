import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config'

export const siteUrl = (): string => (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const absoluteUrl = (path: string): string => `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`

export type LocalizedPaths = Partial<Record<Locale, string>>

/**
 * hreflang alternates. Only languages where the page really exists are listed;
 * x-default points to the Japanese version when available.
 */
export const languageAlternates = (paths: LocalizedPaths): Record<string, string> => {
  const entries = Object.entries(paths).filter((entry): entry is [Locale, string] => Boolean(entry[1]))
  const alternates = Object.fromEntries(entries.map(([locale, path]) => [locale, absoluteUrl(path)]))
  const fallback = paths[DEFAULT_LOCALE] ?? entries[0]?.[1]
  return fallback ? { ...alternates, 'x-default': absoluteUrl(fallback) } : alternates
}

/** Same path in both languages (for pages that exist in ja and en, e.g. section landings). */
export const bothLocales = (path: string): LocalizedPaths => ({
  ja: `/ja${path === '/' ? '' : path}`,
  en: `/en${path === '/' ? '' : path}`,
})
