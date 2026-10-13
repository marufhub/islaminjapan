import type { Metadata } from 'next'
import { Amiri, Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { PreviewBanner } from '@/components/layout/PreviewBanner'
import { getViewer } from '@/lib/content/viewer'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

import './globals.css'

// Japanese fonts are large; next/font subsets them on demand rather than preloading.
const sansJp = Noto_Sans_JP({ weight: ['400', '500', '700'], preload: false, display: 'swap', variable: '--font-sans-jp' })
const serifJp = Noto_Serif_JP({ weight: ['500', '700'], preload: false, display: 'swap', variable: '--font-serif-jp' })
const arabic = Amiri({ weight: ['400', '700'], subsets: ['arabic'], display: 'swap', variable: '--font-arabic-face' })

type LayoutProps = { children: ReactNode; params: Promise<{ locale: string }> }

// Pages read the CMS on each request, so the build never needs a database connection.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = getDictionary(locale)
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
    title: { default: `${dict.siteSubtitle} | ${dict.siteName}`, template: `%s | ${dict.siteName}` },
    description: dict.home.heroIntro,
    icons: { icon: '/favicon.svg' },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const viewer = await getViewer()

  return (
    <html lang={locale} className={`${sansJp.variable} ${serifJp.variable} ${arabic.variable}`}>
      <body className="min-h-screen bg-ivory text-charcoal antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-4 focus:py-2"
        >
          {dict.skipToContent}
        </a>
        {viewer.isPreview ? (
          <PreviewBanner message={dict.ui.previewBanner} exitLabel={dict.ui.exitPreview} returnPath={`/${locale}`} />
        ) : null}
        <SiteHeader locale={locale} />
        <main id="main">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  )
}
