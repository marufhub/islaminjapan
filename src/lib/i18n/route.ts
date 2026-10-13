import { notFound } from 'next/navigation'

import { isLocale, type Locale } from './config'
import { getDictionary, type Dictionary } from './dictionaries'

export type LocaleParams = Promise<{ locale: string }>
export type SearchParams = Promise<Record<string, string | string[] | undefined>>

/** Resolves the route locale or renders 404 for anything other than ja/en. */
export const resolveLocale = async (params: LocaleParams): Promise<{ locale: Locale; dict: Dictionary }> => {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return { locale, dict: getDictionary(locale) }
}
