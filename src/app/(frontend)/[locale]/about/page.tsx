import type { Metadata } from 'next'

import { PolicyPage } from '@/components/content/PolicyPage'
import { type LocaleParams, resolveLocale } from '@/lib/i18n/route'
import { buildMetadata } from '@/lib/seo/metadata'
import { bothLocales } from '@/lib/seo/urls'
import { getPolicies, getSiteSettings } from '@/lib/site'

type PageProps = { params: LocaleParams }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params)
  return buildMetadata({ locale, title: dict.sections.about.title, paths: bothLocales('/about') })
}

export default async function AboutPage({ params }: PageProps) {
  const { locale, dict } = await resolveLocale(params)
  const [policies, settings] = await Promise.all([getPolicies(locale), getSiteSettings(locale)])
  // Only organization details actually entered by an admin are shown — nothing is invented.
  const details = [
    { label: locale === 'ja' ? '運営者' : 'Organization', value: settings.organizationName },
    { label: locale === 'ja' ? '代表者' : 'Representative', value: settings.representative },
    { label: locale === 'ja' ? '所在地' : 'Address', value: settings.address },
    { label: locale === 'ja' ? 'メール' : 'Email', value: settings.publicEmail },
  ].filter((item) => item.value)

  return (
    <PolicyPage locale={locale} dict={dict} title={dict.sections.about.title} path="/about" content={policies.about}>
      {details.length > 0 ? (
        <dl className="mt-10 grid gap-3 rounded-lg border border-line bg-surface p-6 text-sm sm:grid-cols-[10rem_1fr]">
          {details.map((item) => (
            <div key={item.label} className="contents">
              <dt className="text-muted">{item.label}</dt>
              <dd className="whitespace-pre-line">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className="mt-8 text-sm">
        <a href={`/${locale}/editorial-policy`}>{dict.nav.editorialPolicy}</a>
        {' · '}
        <a href={`/${locale}/sources-policy`}>{dict.nav.sourcesPolicy}</a>
        {' · '}
        <a href={`/${locale}/contact`}>{dict.nav.contact}</a>
      </p>
    </PolicyPage>
  )
}
