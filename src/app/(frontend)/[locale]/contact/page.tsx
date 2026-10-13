import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContactForm } from '@/features/contact/ContactForm'
import { issueFormToken } from '@/features/contact/formToken'
import { type LocaleParams, resolveLocale } from '@/lib/i18n/route'
import { buildMetadata } from '@/lib/seo/metadata'
import { bothLocales } from '@/lib/seo/urls'
import { getContactSettings } from '@/lib/site'

type PageProps = { params: LocaleParams }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params)
  return buildMetadata({ locale, title: dict.sections.contact.title, paths: bothLocales('/contact') })
}

export default async function ContactPage({ params }: PageProps) {
  const { locale, dict } = await resolveLocale(params)
  const settings = await getContactSettings(locale)
  return (
    <>
      <PageHeader
        title={dict.sections.contact.title}
        intro={settings.intro || dict.contact.defaultIntro}
        breadcrumbLabel={dict.breadcrumb}
        crumbs={[
          { name: dict.nav.home, path: `/${locale}` },
          { name: dict.sections.contact.title, path: `/${locale}/contact` },
        ]}
      />
      <Container size="reading" className="py-12">
        <p className="mb-8 rounded-md border-l-4 border-gold bg-surface px-4 py-3 text-sm">
          {settings.privacyNotice || dict.contact.defaultPrivacy}{' '}
          <a href={`/${locale}/privacy`}>{dict.nav.privacy}</a>
        </p>
        <ContactForm locale={locale} labels={dict.contact} formToken={issueFormToken(process.env.PAYLOAD_SECRET ?? '')} />
        <p className="mt-10 text-sm text-muted">{dict.sections.faq.notFatwa}</p>
      </Container>
    </>
  )
}
