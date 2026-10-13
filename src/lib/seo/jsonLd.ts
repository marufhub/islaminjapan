import type { Locale } from '@/lib/i18n/config'

import { absoluteUrl } from './urls'

export type Crumb = { name: string; path: string }

export const breadcrumbJsonLd = (crumbs: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
})

export const articleJsonLd = (input: {
  locale: Locale
  path: string
  headline: string
  description?: string | null
  datePublished?: string | null
  dateModified?: string | null
  authorName?: string | null
  imageUrl?: string | null
  publisherName: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: input.headline,
  description: input.description ?? undefined,
  inLanguage: input.locale,
  mainEntityOfPage: absoluteUrl(input.path),
  datePublished: input.datePublished ?? undefined,
  dateModified: input.dateModified ?? input.datePublished ?? undefined,
  author: input.authorName ? { '@type': 'Person', name: input.authorName } : undefined,
  image: input.imageUrl ? [input.imageUrl.startsWith('http') ? input.imageUrl : absoluteUrl(input.imageUrl)] : undefined,
  publisher: { '@type': 'Organization', name: input.publisherName },
})

/**
 * FAQPage markup. Search engines restrict FAQ rich results to authoritative sites, but the
 * markup is still valid structured data describing the page.
 */
export const faqJsonLd = (items: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
})

/** Serializes JSON-LD safely for inline <script> (prevents `</script>` breakout). */
export const serializeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c')
