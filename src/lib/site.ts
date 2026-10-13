import { cache } from 'react'

import type { Locale } from './i18n/config'
import { getDictionary } from './i18n/dictionaries'
import { getPayloadClient } from './payload'

export type NavItem = { label: string; href: string }

const defaultNavigation = (locale: Locale): NavItem[] => {
  const { nav } = getDictionary(locale)
  return [
    { label: nav.learn, href: '/learn' },
    { label: nav.islamInJapan, href: '/islam-in-japan' },
    { label: nav.muslimLife, href: '/muslim-life' },
    { label: nav.faq, href: '/faq' },
    { label: nav.articles, href: '/articles' },
    { label: nav.about, href: '/about' },
  ]
}

/** CMS-managed main navigation, falling back to the default sections until editors configure it. */
export const getNavigation = cache(async (locale: Locale): Promise<NavItem[]> => {
  const payload = await getPayloadClient()
  const navigation = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
  const items = (navigation.items ?? [])
    .filter((item) => item.label && item.href)
    .map((item) => ({ label: item.label as string, href: item.href }))
  return items.length > 0 ? items : defaultNavigation(locale)
})

export const getSiteSettings = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', locale, depth: 1 })
})

export const getHomepage = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'homepage', locale, depth: 1 })
})
