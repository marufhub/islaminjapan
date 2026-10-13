import type { Metadata } from 'next'

import { SectionArticles } from '@/components/content/SectionArticles'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { getLearningJourney } from '@/lib/content/articles'
import { firstParam, parsePage } from '@/lib/content/search'
import { type LocaleParams, resolveLocale, type SearchParams } from '@/lib/i18n/route'
import { buildMetadata } from '@/lib/seo/metadata'
import { bothLocales } from '@/lib/seo/urls'

type PageProps = { params: LocaleParams; searchParams: SearchParams }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params)
  return buildMetadata({ locale, title: dict.sections.learn.title, description: dict.sections.learn.intro, paths: bothLocales('/learn') })
}

export default async function LearnPage({ params, searchParams }: PageProps) {
  const { locale, dict } = await resolveLocale(params)
  const page = parsePage(firstParam((await searchParams).page))
  const journey = await getLearningJourney(locale)
  const copy = dict.sections.learn

  return (
    <>
      <PageHeader
        title={copy.title}
        intro={copy.intro}
        breadcrumbLabel={dict.breadcrumb}
        crumbs={[
          { name: dict.nav.home, path: `/${locale}` },
          { name: copy.title, path: `/${locale}/learn` },
        ]}
      />
      <Container className="space-y-16 py-12">
        {journey.length > 0 ? (
          <section aria-labelledby="journey-heading" className="rounded-lg border border-line bg-surface p-6 sm:p-8">
            <h2 id="journey-heading" className="text-2xl font-semibold">
              {copy.journeyTitle}
            </h2>
            <p className="mt-2 text-muted">{copy.journeyIntro}</p>
            <ol className="mt-6 grid gap-4 md:grid-cols-2">
              {journey.map((article, index) => (
                <li key={article.slug} className="flex gap-4">
                  <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <span className="sr-only">{dict.ui.step(index + 1)}: </span>
                    <a href={`/${locale}/articles/${article.slug}`} className="font-semibold">
                      {article.title}
                    </a>
                    {article.summary ? <p className="mt-1 line-clamp-2 text-sm text-muted">{article.summary}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        <SectionArticles locale={locale} dict={dict} section="learn" page={page} basePath={`/${locale}/learn`} heading={copy.topicsTitle} />
      </Container>
    </>
  )
}
