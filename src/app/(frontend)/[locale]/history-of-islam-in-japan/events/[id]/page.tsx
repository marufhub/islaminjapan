import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MediaImage } from '@/components/content/MediaImage'
import { RichText } from '@/components/content/RichText'
import { SourceList } from '@/components/content/SourceList'
import { eventDateLabel } from '@/components/content/Timeline'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { getEventReview, getHistoryEvent } from '@/lib/content/history'
import { displayName, getDisplayNames } from '@/lib/content/people'
import { formatDate } from '@/lib/i18n/format'
import { HISTORY_PERIODS } from '@/lib/history/periods'
import type { Locale } from '@/lib/i18n/config'
import { isLocale } from '@/lib/i18n/config'
import { resolveLocale } from '@/lib/i18n/route'
import { buildMetadata } from '@/lib/seo/metadata'
import type { HistoryEvent } from '@/payload-types'

type PageProps = { params: Promise<{ locale: string; id: string }> }

const parseId = (value: string): number | null => (/^\d{1,10}$/.test(value) ? Number(value) : null)

const publishedPaths = (event: HistoryEvent) =>
  Object.fromEntries(
    (event.publishedLocales ?? [])
      .filter((locale): locale is Locale => isLocale(locale))
      .map((locale) => [locale, `/${locale}/history-of-islam-in-japan/events/${event.id}`]),
  )

const loadEvent = async (params: PageProps['params']) => {
  const { locale, dict } = await resolveLocale(params)
  const id = parseId((await params).id)
  const event = id === null ? null : await getHistoryEvent(locale, id)
  return { locale, dict, event }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, event } = await loadEvent(params)
  if (!event) return {}
  return buildMetadata({
    locale,
    title: event.title,
    description: event.summary,
    paths: publishedPaths(event),
    noindex: event._status !== 'published',
  })
}

export default async function HistoryEventPage({ params }: PageProps) {
  const { locale, dict, event } = await loadEvent(params)
  if (!event) notFound()

  const review = await getEventReview(event.id)
  const reviewerName = displayName(await getDisplayNames([review.reviewer]), review.reviewer)
  const reviewedOn = formatDate(review.lastReviewedAt, locale)
  const sectionPath = `/${locale}/history-of-islam-in-japan`
  const period = HISTORY_PERIODS.find((item) => item.value === event.period)
  const related = (event.relatedArticles ?? []).filter(
    (item): item is Exclude<typeof item, number> => typeof item === 'object' && item.language === locale,
  )

  return (
    <article>
      <PageHeader
        title={event.title}
        breadcrumbLabel={dict.breadcrumb}
        crumbs={[
          { name: dict.nav.home, path: `/${locale}` },
          { name: dict.sections.history.title, path: sectionPath },
          { name: event.title, path: `${sectionPath}/events/${event.id}` },
        ]}
      >
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-muted">{dict.ui.period}</dt>
            <dd className="font-semibold text-primary-dark">
              {eventDateLabel(event, locale)}
              {period ? ` · ${period[locale]}` : ''}
            </dd>
          </div>
          {event.location ? (
            <div>
              <dt className="text-muted">{dict.ui.location}</dt>
              <dd>{event.location}</dd>
            </div>
          ) : null}
        </dl>
      </PageHeader>
      <Container size="reading" className="py-12">
        {event.summary ? <p className="text-lg">{event.summary}</p> : null}
        <RichText data={event.body} locale={locale} className="mt-8" />

        {event.uncertaintyNotes ? (
          <aside className="mt-10 rounded-md border-l-4 border-gold bg-gold-soft/60 p-4">
            <h2 className="text-base font-semibold">{dict.ui.uncertaintyNotes}</h2>
            <p className="mt-2 text-sm">{event.uncertaintyNotes}</p>
          </aside>
        ) : null}

        {(event.conflictingAccounts ?? []).length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">{dict.ui.conflictingAccounts}</h2>
            <ul className="mt-4 space-y-3">
              {(event.conflictingAccounts ?? []).map((account) =>
                account.account ? (
                  <li key={account.id} className="rounded-md border border-line bg-surface p-4 text-sm">
                    {account.account}
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        ) : null}

        {(event.images ?? []).map((item) => (
          <MediaImage key={item.id} media={item.image} aiLabel={dict.ui.aiGeneratedImage} className="mt-10" sizes="(min-width: 768px) 768px, 100vw" />
        ))}

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">{dict.ui.relatedArticles}</h2>
            <ul className="mt-4 space-y-2">
              {related.map((article) => (
                <li key={article.id}>
                  <a href={`/${locale}/articles/${article.slug}`}>{article.title}</a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <SourceList sources={event.sources} heading={dict.ui.references} locale={locale} />
        {reviewerName || reviewedOn ? (
          <p className="mt-8 text-sm text-muted">
            {dict.ui.reviewedBy}: {reviewerName ?? '—'}
            {reviewedOn ? ` (${dict.ui.lastReviewed}: ${reviewedOn})` : ''}
          </p>
        ) : null}
        <p className="mt-12">
          <a href={`${sectionPath}#timeline`}>← {dict.ui.backToTimeline}</a>
        </p>
      </Container>
    </article>
  )
}
