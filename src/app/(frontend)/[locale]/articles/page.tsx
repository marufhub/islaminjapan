import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticleGrid } from '@/components/content/ArticleCard'
import { Container } from '@/components/ui/Container'
import { FilterNav } from '@/components/ui/FilterNav'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchForm } from '@/components/ui/SearchForm'
import { listArticles } from '@/lib/content/articles'
import { withQuery } from '@/lib/content/query'
import { firstParam, normalizeQuery, parsePage } from '@/lib/content/search'
import { type LocaleParams, resolveLocale, type SearchParams } from '@/lib/i18n/route'
import { buildMetadata } from '@/lib/seo/metadata'
import { bothLocales } from '@/lib/seo/urls'
import { getCategories } from '@/lib/site'

type PageProps = { params: LocaleParams; searchParams: SearchParams }

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params)
  const query = await searchParams
  const copy = dict.sections.articles
  const filtered = Boolean(firstParam(query.q) || firstParam(query.category) || firstParam(query.page))
  return buildMetadata({ locale, title: copy.title, description: copy.intro, paths: bothLocales('/articles'), noindex: filtered })
}

export default async function ArticlesPage({ params, searchParams }: PageProps) {
  const { locale, dict } = await resolveLocale(params)
  const query = await searchParams
  const q = normalizeQuery(firstParam(query.q))
  const page = parsePage(firstParam(query.page))
  const categories = await getCategories(locale)
  const categorySlug = firstParam(query.category)
  const category = categories.find((item) => item.slug === categorySlug)
  const result = await listArticles({ locale, query: q || undefined, categoryId: category?.id, page })
  if (page > 1 && page > result.totalPages) notFound()
  const basePath = `/${locale}/articles`
  const copy = dict.sections.articles

  return (
    <>
      <PageHeader
        title={copy.title}
        intro={copy.intro}
        breadcrumbLabel={dict.breadcrumb}
        crumbs={[
          { name: dict.nav.home, path: `/${locale}` },
          { name: copy.title, path: basePath },
        ]}
      >
        <div className="mt-8">
          <SearchForm
            action={basePath}
            defaultValue={q}
            label={dict.ui.searchLabel}
            placeholder={dict.ui.searchPlaceholder}
            buttonLabel={dict.ui.searchButton}
            hidden={{ category: category?.slug }}
          />
        </div>
      </PageHeader>
      <Container className="space-y-8 py-12">
        {categories.length > 0 ? (
          <FilterNav
            label={dict.ui.category}
            options={[
              { label: dict.ui.filterAll, href: withQuery(basePath, { q }), active: !category },
              ...categories.map((item) => ({
                label: item.title,
                href: withQuery(basePath, { q, category: item.slug }),
                active: category?.id === item.id,
              })),
            ]}
          />
        ) : null}
        <div aria-live="polite">
          {q ? (
            <p className="mb-6 text-sm text-muted">
              {dict.ui.resultsFor(q)} — {dict.ui.resultCount(result.totalDocs)}
            </p>
          ) : null}
          {result.docs.length > 0 ? (
            <ArticleGrid articles={result.docs} locale={locale} levelLabels={dict.ui.knowledgeLevel} />
          ) : (
            <p className="text-muted">{q || category ? dict.ui.noResults : dict.ui.emptySection}</p>
          )}
        </div>
        <Pagination
          page={result.page ?? 1}
          totalPages={result.totalPages}
          hrefForPage={(target) => withQuery(basePath, { q, category: category?.slug, page: target > 1 ? target : undefined })}
          labels={{ nav: dict.ui.pagination, previous: dict.ui.previous, next: dict.ui.next, pageOf: dict.ui.pageOf }}
        />
      </Container>
    </>
  )
}
