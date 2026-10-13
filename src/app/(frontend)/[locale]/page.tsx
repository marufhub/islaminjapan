import type { Metadata } from 'next'

import { ArticleGrid } from '@/components/content/ArticleCard'
import { FaqList } from '@/components/content/FaqList'
import { Timeline } from '@/components/content/Timeline'
import { Container } from '@/components/ui/Container'
import { listArticles } from '@/lib/content/articles'
import { listFaqs } from '@/lib/content/faqs'
import { listHistoryEvents } from '@/lib/content/history'
import type { Locale } from '@/lib/i18n/config'
import { localizedHref } from '@/lib/i18n/paths'
import { type LocaleParams, resolveLocale } from '@/lib/i18n/route'
import { buildMetadata } from '@/lib/seo/metadata'
import { bothLocales } from '@/lib/seo/urls'
import { getHomepage } from '@/lib/site'
import type { Article, Faq } from '@/payload-types'

type PageProps = { params: LocaleParams }

const TIMELINE_PREVIEW_COUNT = 4
const LATEST_COUNT = 3
const FAQ_PREVIEW_COUNT = 5

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await resolveLocale(params)
  return buildMetadata({ locale, paths: bothLocales('/') })
}

/** Homepage relationships come back as IDs when not publicly readable; keep only readable docs in this language. */
const articlesInLocale = (
  items: Array<number | Article> | null | undefined,
  locale: Locale,
): Article[] =>
  (items ?? []).filter(
    (item): item is Article =>
      typeof item === 'object' && item !== null && item.language === locale,
  )

const faqsInLocale = (items: Array<number | Faq> | null | undefined): Faq[] =>
  (items ?? []).filter(
    (item): item is Faq => typeof item === 'object' && item !== null && Boolean(item.question),
  )

function SectionHeading({
  id,
  title,
  href,
  linkLabel,
}: {
  id: string
  title: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="text-2xl font-semibold">
        {title}
      </h2>
      {href && linkLabel ? (
        <a href={href} className="shrink-0 text-sm">
          {linkLabel} →
        </a>
      ) : null}
    </div>
  )
}

export default async function HomePage({ params }: PageProps) {
  const { locale, dict } = await resolveLocale(params)
  const homepage = await getHomepage(locale)

  const [latest, featuredFallback, events, faqFallback] = await Promise.all([
    listArticles({ locale, limit: LATEST_COUNT }),
    listArticles({ locale, featuredOnly: true, limit: 6 }),
    listHistoryEvents({ locale, limit: TIMELINE_PREVIEW_COUNT }),
    listFaqs({ locale, featuredOnly: true, limit: FAQ_PREVIEW_COUNT }),
  ])

  const heroTitle = homepage.heroTitle || dict.home.heroTitle
  const heroIntro = homepage.heroIntro || dict.home.heroIntro
  const cmsPathways = (homepage.pathways ?? []).filter((pathway) => pathway.title && pathway.href)
  const pathways =
    cmsPathways.length > 0
      ? cmsPathways.map((pathway) => ({
          title: pathway.title as string,
          description: pathway.description ?? '',
          href: pathway.href,
        }))
      : dict.home.pathways
  const curatedTopics = articlesInLocale(homepage.featuredArticles, locale)
  const featuredTopics = curatedTopics.length > 0 ? curatedTopics : featuredFallback.docs
  const curatedFaqs = faqsInLocale(homepage.featuredFaqs)
  const faqs = curatedFaqs.length > 0 ? curatedFaqs : faqFallback
  const timelineLabels = {
    details: dict.ui.eventDetails,
    location: dict.ui.location,
    uncertain: dict.ui.uncertaintyNotes,
  }

  return (
    <>
      <section className="geometric-motif border-b border-line">
        <Container className="py-16 sm:py-24">
          <h1 className="max-w-3xl text-3xl font-bold text-primary sm:text-5xl">{heroTitle}</h1>
          <p className="mt-6 max-w-2xl text-lg">{heroIntro}</p>
        </Container>
      </section>

      <section aria-labelledby="pathways-heading">
        <Container className="py-16">
          <h2 id="pathways-heading" className="text-2xl font-semibold">
            {dict.home.pathwaysHeading}
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {pathways.map((pathway) => (
              <li key={pathway.href}>
                <a
                  href={localizedHref(locale, pathway.href)}
                  className="group flex h-full flex-col rounded-lg border border-line bg-surface p-6 text-charcoal no-underline shadow-sm transition hover:border-primary"
                >
                  <span aria-hidden="true" className="mb-4 block h-1 w-10 rounded bg-gold" />
                  <span className="font-serif text-xl font-semibold text-primary group-hover:underline">
                    {pathway.title}
                  </span>
                  <span className="mt-3 text-sm text-muted">{pathway.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {featuredTopics.length > 0 ? (
        <section aria-labelledby="featured-heading" className="border-t border-line bg-surface/60">
          <Container className="py-16">
            <SectionHeading
              id="featured-heading"
              title={dict.home.featuredTopics}
              href={`/${locale}/learn`}
              linkLabel={dict.ui.viewAll}
            />
            <div className="mt-8">
              <ArticleGrid
                articles={featuredTopics}
                locale={locale}
                levelLabels={dict.ui.knowledgeLevel}
              />
            </div>
          </Container>
        </section>
      ) : null}

      <section aria-labelledby="timeline-heading" className="border-t border-line">
        <Container className="py-16">
          <SectionHeading
            id="timeline-heading"
            title={dict.home.timelinePreview}
            href={`/${locale}/islam-in-japan`}
            linkLabel={dict.ui.viewAll}
          />
          <p className="mt-3 max-w-2xl text-muted">{dict.home.timelinePreviewIntro}</p>
          <div className="mt-8">
            {events.length > 0 ? (
              <Timeline events={events} locale={locale} labels={timelineLabels} />
            ) : (
              <p className="text-muted">{dict.ui.emptySection}</p>
            )}
          </div>
        </Container>
      </section>

      {faqs.length > 0 ? (
        <section aria-labelledby="faq-heading" className="border-t border-line bg-surface/60">
          <Container className="py-16" size="reading">
            <SectionHeading
              id="faq-heading"
              title={dict.home.recommendedFaqs}
              href={`/${locale}/faq`}
              linkLabel={dict.ui.viewAll}
            />
            <div className="mt-8">
              <FaqList faqs={faqs} locale={locale} />
            </div>
          </Container>
        </section>
      ) : null}

      {latest.docs.length > 0 ? (
        <section aria-labelledby="latest-heading" className="border-t border-line">
          <Container className="py-16">
            <SectionHeading
              id="latest-heading"
              title={dict.home.latestArticles}
              href={`/${locale}/articles`}
              linkLabel={dict.ui.viewAll}
            />
            <div className="mt-8">
              <ArticleGrid
                articles={latest.docs}
                locale={locale}
                levelLabels={dict.ui.knowledgeLevel}
              />
            </div>
          </Container>
        </section>
      ) : null}

      <section aria-labelledby="trust-heading" className="border-t border-line bg-primary-soft/50">
        <Container className="grid gap-10 py-16 md:grid-cols-2">
          <div>
            <h2 id="trust-heading" className="text-2xl font-semibold">
              {dict.home.credibilityHeading}
            </h2>
            <ul className="mt-6 space-y-3">
              {dict.home.credibilityItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-gold"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm">
              <a href={`/${locale}/editorial-policy`}>{dict.nav.editorialPolicy}</a>
              {' · '}
              <a href={`/${locale}/sources-policy`}>{dict.nav.sourcesPolicy}</a>
            </p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-6">
            <p>{homepage.contactInvitation || dict.home.contactInvitation}</p>
            <a
              href={`/${locale}/contact`}
              className="mt-6 inline-block rounded-md bg-primary px-5 py-2 font-medium text-white no-underline hover:bg-primary-dark"
            >
              {dict.nav.contact}
            </a>
          </div>
        </Container>
      </section>
    </>
  )
}
