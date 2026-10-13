import type { Locale } from '@/lib/i18n/config'
import { formatDate } from '@/lib/i18n/format'
import type { Article } from '@/payload-types'

type ArticleCardData = Pick<Article, 'title' | 'slug' | 'summary' | 'publishedAt' | 'knowledgeLevel'> & {
  category?: Article['category']
}

export function ArticleCard({ article, locale, levelLabels }: { article: ArticleCardData; locale: Locale; levelLabels: Record<string, string> }) {
  const category = typeof article.category === 'object' ? article.category?.title : null
  const published = formatDate(article.publishedAt, locale)
  return (
    <article className="flex h-full flex-col rounded-lg border border-line bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap gap-2 text-xs text-muted">
        {category ? <span className="rounded-full bg-primary-soft px-2 py-0.5 text-primary-dark">{category}</span> : null}
        {article.knowledgeLevel ? <span>{levelLabels[article.knowledgeLevel]}</span> : null}
      </div>
      <h3 className="mt-3 text-lg font-semibold">
        <a href={`/${locale}/articles/${article.slug}`} className="text-primary">
          {article.title}
        </a>
      </h3>
      {article.summary ? <p className="mt-2 line-clamp-3 text-sm text-muted">{article.summary}</p> : null}
      {published ? (
        <p className="mt-auto pt-4 text-xs text-muted">
          <time dateTime={article.publishedAt ?? undefined}>{published}</time>
        </p>
      ) : null}
    </article>
  )
}

export function ArticleGrid({ articles, locale, levelLabels }: { articles: ArticleCardData[]; locale: Locale; levelLabels: Record<string, string> }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <li key={article.slug}>
          <ArticleCard article={article} locale={locale} levelLabels={levelLabels} />
        </li>
      ))}
    </ul>
  )
}
