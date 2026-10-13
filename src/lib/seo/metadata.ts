import type { Metadata } from 'next'

import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getSiteSettings } from '@/lib/site'

import { absoluteUrl, languageAlternates, type LocalizedPaths } from './urls'

type PageMetadataInput = {
  locale: Locale
  title?: string
  description?: string | null
  /** Paths of this page per language; the current locale's entry is the canonical URL. */
  paths: LocalizedPaths
  noindex?: boolean
  type?: 'website' | 'article'
  imageUrl?: string | null
  publishedTime?: string | null
  modifiedTime?: string | null
}

const OG_LOCALE: Record<Locale, string> = { ja: 'ja_JP', en: 'en_US' }

export const buildMetadata = async (input: PageMetadataInput): Promise<Metadata> => {
  const settings = await getSiteSettings(input.locale)
  const dict = getDictionary(input.locale)
  const siteName = settings.siteName || dict.siteName
  const description = input.description || settings.defaultDescription || dict.home.heroIntro
  const canonicalPath = input.paths[input.locale]
  // Indexing stays off until an admin enables it for launch; drafts/previews are never indexed.
  const indexable = Boolean(settings.allowIndexing) && !input.noindex
  const ogImage =
    input.imageUrl ?? (typeof settings.defaultOgImage === 'object' ? settings.defaultOgImage?.url : null)

  return {
    title: input.title,
    description,
    alternates: {
      canonical: canonicalPath ? absoluteUrl(canonicalPath) : undefined,
      languages: languageAlternates(input.paths),
      types: { 'application/rss+xml': absoluteUrl(`/${input.locale}/rss.xml`) },
    },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: input.type ?? 'website',
      siteName,
      locale: OG_LOCALE[input.locale],
      title: input.title ?? siteName,
      description,
      url: canonicalPath ? absoluteUrl(canonicalPath) : undefined,
      images: ogImage ? [{ url: ogImage.startsWith('http') ? ogImage : absoluteUrl(ogImage) }] : undefined,
      publishedTime: input.publishedTime ?? undefined,
      modifiedTime: input.modifiedTime ?? undefined,
    },
    twitter: { card: ogImage ? 'summary_large_image' : 'summary' },
  }
}
