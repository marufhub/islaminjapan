import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/seo/urls'

export const dynamic = 'force-dynamic'

/** Crawling is blocked until an admin enables indexing in Site settings (pre-launch safety). */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: false })
  if (!settings.allowIndexing) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/preview', '/ja/search', '/en/search'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
