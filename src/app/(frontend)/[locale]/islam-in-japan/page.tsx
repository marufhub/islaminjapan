import type { Metadata } from 'next'

import { SectionArticles } from '@/components/content/SectionArticles'
import { Timeline } from '@/components/content/Timeline'
import { Container } from '@/components/ui/Container'
import { FilterNav } from '@/components/ui/FilterNav'
import { PageHeader } from '@/components/ui/PageHeader'
import { type HistorySubject, listHistoryEvents } from '@/lib/content/history'
import { withQuery } from '@/lib/content/query'
import { firstParam, parsePage } from '@/lib/content/search'
import { HISTORY_PERIODS, type HistoryPeriod } from '@/lib/history/periods'
import { type LocaleParams, resolveLocale, type SearchParams } from '@/lib/i18n/route'
import { buildMetadata } from '@/lib/seo/metadata'
import { bothLocales } from '@/lib/seo/urls'

type PageProps = { params: LocaleParams; searchParams: SearchParams }

const SUBJECTS: HistorySubject[] = ['people', 'organizations', 'mosques', 'communities', 'diplomacy', 'education']

const asPeriod = (value: string | undefined): HistoryPeriod | undefined =>
  HISTORY_PERIODS.find((period) => period.value === value)?.value

const asSubject = (value: string | undefined): HistorySubject | undefined =>
  SUBJECTS.find((subject) => subject === value)

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params)
  const query = await searchParams
  const copy = dict.sections.islamInJapan
  // Filtered views are useful to visitors but duplicate the main page for search engines.
  const filtered = Boolean(firstParam(query.period) || firstParam(query.subject) || firstParam(query.page))
  return buildMetadata({ locale, title: copy.title, description: copy.intro, paths: bothLocales('/islam-in-japan'), noindex: filtered })
}

export default async function IslamInJapanPage({ params, searchParams }: PageProps) {
  const { locale, dict } = await resolveLocale(params)
  const query = await searchParams
  const period = asPeriod(firstParam(query.period))
  const subject = asSubject(firstParam(query.subject))
  const page = parsePage(firstParam(query.page))
  const events = await listHistoryEvents({ locale, period, subject })
  const copy = dict.sections.islamInJapan
  const basePath = `/${locale}/islam-in-japan`
  const filterHref = (next: { period?: string; subject?: string }) => `${withQuery(basePath, { period, subject, ...next })}#timeline`

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
      />
      <Container className="space-y-16 py-12">
        <section aria-labelledby="timeline" className="scroll-mt-8">
          <h2 id="timeline" className="text-2xl font-semibold">
            {copy.timelineTitle}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">{copy.researchNote}</p>
          <div className="mt-6 space-y-4">
            <FilterNav
              label={dict.ui.period}
              options={[
                { label: dict.ui.filterAll, href: filterHref({ period: undefined }), active: !period },
                ...HISTORY_PERIODS.map((item) => ({
                  label: item[locale],
                  href: filterHref({ period: item.value }),
                  active: period === item.value,
                })),
              ]}
            />
            <FilterNav
              label={dict.ui.subject}
              options={[
                { label: dict.ui.filterAll, href: filterHref({ subject: undefined }), active: !subject },
                ...SUBJECTS.map((item) => ({ label: dict.subjects[item], href: filterHref({ subject: item }), active: subject === item })),
              ]}
            />
          </div>
          <div className="mt-10" aria-live="polite">
            {events.length > 0 ? (
              <Timeline
                events={events}
                locale={locale}
                labels={{ details: dict.ui.eventDetails, location: dict.ui.location, uncertain: dict.ui.uncertaintyNotes }}
              />
            ) : (
              <p className="text-muted">{period || subject ? dict.ui.noResults : dict.ui.emptySection}</p>
            )}
          </div>
        </section>
        <SectionArticles locale={locale} dict={dict} section="islam-in-japan" page={page} basePath={basePath} heading={copy.articlesTitle} />
      </Container>
    </>
  )
}
