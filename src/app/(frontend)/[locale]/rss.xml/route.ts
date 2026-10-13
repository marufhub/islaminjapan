import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getPayloadClient } from '@/lib/payload'
import { buildRss } from '@/lib/seo/rss'
import { absoluteUrl } from '@/lib/seo/urls'

const FEED_SIZE = 30

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return new Response('Not found', { status: 404 })
  const dict = getDictionary(locale)
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: { language: { equals: locale } },
    sort: '-publishedAt',
    limit: FEED_SIZE,
    depth: 0,
    overrideAccess: false,
    select: { title: true, slug: true, summary: true, publishedAt: true },
  })
  const xml = buildRss({
    title: `${dict.siteName} — ${dict.siteSubtitle}`,
    url: absoluteUrl(`/${locale}`),
    description: dict.home.heroIntro,
    language: locale,
    items: docs.map((doc) => ({
      title: doc.title,
      url: absoluteUrl(`/${locale}/articles/${doc.slug}`),
      description: doc.summary,
      publishedAt: doc.publishedAt,
    })),
  })
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' } })
}
