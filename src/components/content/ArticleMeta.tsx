import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { formatDate } from '@/lib/i18n/format'

type ArticleMetaProps = {
  locale: Locale
  dict: Dictionary
  authorName: string | null
  reviewerName: string | null
  publishedAt?: string | null
  lastReviewedAt?: string | null
}

/** Credibility line: who wrote and reviewed the article, and when. */
export function ArticleMeta({ locale, dict, authorName, reviewerName, publishedAt, lastReviewedAt }: ArticleMetaProps) {
  const items = [
    { label: dict.ui.writtenBy, value: authorName },
    { label: dict.ui.reviewedBy, value: reviewerName },
    { label: dict.ui.publishedOn, value: formatDate(publishedAt, locale), dateTime: publishedAt },
    { label: dict.ui.lastReviewed, value: formatDate(lastReviewedAt, locale), dateTime: lastReviewedAt },
  ].filter((item) => item.value)
  if (items.length === 0) return null
  return (
    <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex gap-2">
          <dt className="text-muted">{item.label}</dt>
          <dd>{item.dateTime ? <time dateTime={item.dateTime}>{item.value}</time> : item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
