import { notFound } from 'next/navigation'

import { ArticleGrid } from '@/components/content/ArticleCard'
import { Pagination } from '@/components/ui/Pagination'
import { type ArticleSection, listArticles } from '@/lib/content/articles'
import { withQuery } from '@/lib/content/query'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type SectionArticlesProps = {
  locale: Locale
  dict: Dictionary
  section: ArticleSection
  page: number
  basePath: string
  heading: string
}

/** Paginated list of published articles in one site section. */
export async function SectionArticles({ locale, dict, section, page, basePath, heading }: SectionArticlesProps) {
  const result = await listArticles({ locale, section, page })
  if (page > 1 && page > result.totalPages) notFound()
  return (
    <section aria-labelledby={`${section}-articles`}>
      <h2 id={`${section}-articles`} className="text-2xl font-semibold">
        {heading}
      </h2>
      <div className="mt-6">
        {result.docs.length > 0 ? (
          <ArticleGrid articles={result.docs} locale={locale} levelLabels={dict.ui.knowledgeLevel} />
        ) : (
          <p className="text-muted">{dict.ui.emptySection}</p>
        )}
      </div>
      <Pagination
        page={result.page ?? 1}
        totalPages={result.totalPages}
        hrefForPage={(target) => withQuery(basePath, { page: target > 1 ? target : undefined })}
        labels={{ nav: dict.ui.pagination, previous: dict.ui.previous, next: dict.ui.next, pageOf: dict.ui.pageOf }}
      />
    </section>
  )
}
