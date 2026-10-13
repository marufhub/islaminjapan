import type { Metadata } from 'next'

import { ArticleGrid } from '@/components/content/ArticleCard'
import { FaqList } from '@/components/content/FaqList'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchForm } from '@/components/ui/SearchForm'
import { listArticles } from '@/lib/content/articles'
import { listFaqs } from '@/lib/content/faqs'
import { withQuery } from '@/lib/content/query'
import { firstParam, normalizeQuery } from '@/lib/content/search'
import { type LocaleParams, resolveLocale, type SearchParams } from '@/lib/i18n/route'
import { buildMetadata } from '@/lib/seo/metadata'
import { bothLocales } from '@/lib/seo/urls'

type PageProps = { params: LocaleParams; searchParams: SearchParams }

const RESULTS_PER_TYPE = 12

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params)
  // Search result pages are never indexed.
  return buildMetadata({ locale, title: dict.sections.search.title, paths: bothLocales('/search'), noindex: true })
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale, dict } = await resolveLocale(params)
  const q = normalizeQuery(firstParam((await searchParams).q))
  const [articles, faqs] = q
    ? await Promise.all([listArticles({ locale, query: q, limit: RESULTS_PER_TYPE }), listFaqs({ locale, query: q, limit: RESULTS_PER_TYPE })])
    : [null, []]
  const basePath = `/${locale}/search`

  return (
    <>
      <PageHeader
        title={dict.sections.search.title}
        intro={dict.sections.search.intro}
        breadcrumbLabel={dict.breadcrumb}
        crumbs={[
          { name: dict.nav.home, path: `/${locale}` },
          { name: dict.sections.search.title, path: basePath },
        ]}
      >
        <div className="mt-8">
          <SearchForm action={basePath} defaultValue={q} label={dict.ui.searchLabel} placeholder={dict.ui.searchPlaceholder} buttonLabel={dict.ui.searchButton} />
        </div>
      </PageHeader>
      <Container className="py-12">
        <div className="space-y-12" aria-live="polite">
        {q ? (
          <>
            <p className="text-sm text-muted">{dict.ui.resultsFor(q)}</p>
            {articles && articles.docs.length > 0 ? (
              <section aria-labelledby="article-results">
                <h2 id="article-results" className="mb-6 text-xl font-semibold">
                  {dict.nav.articles} <span className="text-base font-normal text-muted">({dict.ui.resultCount(articles.totalDocs)})</span>
                </h2>
                <ArticleGrid articles={articles.docs} locale={locale} levelLabels={dict.ui.knowledgeLevel} />
                {articles.totalDocs > RESULTS_PER_TYPE ? (
                  <p className="mt-4 text-sm">
                    <a href={withQuery(`/${locale}/articles`, { q })}>{dict.ui.viewAll} →</a>
                  </p>
                ) : null}
              </section>
            ) : null}
            {faqs.length > 0 ? (
              <section aria-labelledby="faq-results">
                <h2 id="faq-results" className="mb-6 text-xl font-semibold">
                  {dict.nav.faq}
                </h2>
                <FaqList faqs={faqs} locale={locale} />
              </section>
            ) : null}
            {(articles?.docs.length ?? 0) + faqs.length === 0 ? <p className="text-muted">{dict.ui.noResults}</p> : null}
          </>
        ) : null}
        </div>
      </Container>
    </>
  )
}
