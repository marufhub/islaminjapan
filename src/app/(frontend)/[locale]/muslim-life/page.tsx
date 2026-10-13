import type { Metadata } from 'next'

import { SectionArticles } from '@/components/content/SectionArticles'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { firstParam, parsePage } from '@/lib/content/search'
import { type LocaleParams, resolveLocale, type SearchParams } from '@/lib/i18n/route'
import { buildMetadata } from '@/lib/seo/metadata'
import { bothLocales } from '@/lib/seo/urls'

type PageProps = { params: LocaleParams; searchParams: SearchParams }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params)
  const copy = dict.sections.muslimLife
  return buildMetadata({ locale, title: copy.title, description: copy.intro, paths: bothLocales('/muslim-life') })
}

export default async function MuslimLifePage({ params, searchParams }: PageProps) {
  const { locale, dict } = await resolveLocale(params)
  const page = parsePage(firstParam((await searchParams).page))
  const copy = dict.sections.muslimLife

  return (
    <>
      <PageHeader
        title={copy.title}
        intro={copy.intro}
        breadcrumbLabel={dict.breadcrumb}
        crumbs={[
          { name: dict.nav.home, path: `/${locale}` },
          { name: copy.title, path: `/${locale}/muslim-life` },
        ]}
      >
        <p className="mt-4 max-w-3xl rounded-md border-l-4 border-gold bg-surface px-4 py-3 text-sm">{copy.updateNote}</p>
      </PageHeader>
      <Container className="py-12">
        <SectionArticles locale={locale} dict={dict} section="muslim-life" page={page} basePath={`/${locale}/muslim-life`} heading={copy.title} />
      </Container>
    </>
  )
}
