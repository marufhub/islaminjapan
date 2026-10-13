import type { Metadata } from 'next'

import { PolicyPage } from '@/components/content/PolicyPage'
import { type LocaleParams, resolveLocale } from '@/lib/i18n/route'
import { buildMetadata } from '@/lib/seo/metadata'
import { bothLocales } from '@/lib/seo/urls'
import { getPolicies } from '@/lib/site'

type PageProps = { params: LocaleParams }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params)
  return buildMetadata({ locale, title: dict.sections.privacy.title, paths: bothLocales('/privacy') })
}

export default async function Page({ params }: PageProps) {
  const { locale, dict } = await resolveLocale(params)
  const policies = await getPolicies(locale)
  return (
    <PolicyPage
      locale={locale}
      dict={dict}
      title={dict.sections.privacy.title}
      path="/privacy"
      content={policies.privacyPolicy}
      lastUpdated={policies.lastUpdated}
    />
  )
}
