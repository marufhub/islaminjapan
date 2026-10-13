import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { Metadata } from 'next'

import { FaqList } from '@/components/content/FaqList'
import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchForm } from '@/components/ui/SearchForm'
import { listFaqs } from '@/lib/content/faqs'
import { firstParam, normalizeQuery } from '@/lib/content/search'
import { type LocaleParams, resolveLocale, type SearchParams } from '@/lib/i18n/route'
import { faqJsonLd } from '@/lib/seo/jsonLd'
import { buildMetadata } from '@/lib/seo/metadata'
import { bothLocales } from '@/lib/seo/urls'
import type { Faq } from '@/payload-types'

type PageProps = { params: LocaleParams; searchParams: SearchParams }

const UNCATEGORIZED = 'uncategorized'

/** Answer text for structured data: the short answer, else the plain-text answer; null when there is none. */
const answerText = (faq: Faq): string | null => {
  if (faq.shortAnswer) return faq.shortAnswer
  const plain = faq.answer ? convertLexicalToPlaintext({ data: faq.answer as never }).trim() : ''
  return plain || null
}

const groupByCategory = (faqs: Faq[]) => {
  const groups = new Map<string, { title: string | null; faqs: Faq[] }>()
  for (const faq of faqs) {
    const category = typeof faq.category === 'object' && faq.category ? faq.category : null
    const key = category ? String(category.id) : UNCATEGORIZED
    const group = groups.get(key) ?? { title: category?.title ?? null, faqs: [] }
    groups.set(key, { ...group, faqs: [...group.faqs, faq] })
  }
  return [...groups.entries()]
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params)
  const q = firstParam((await searchParams).q)
  const copy = dict.sections.faq
  return buildMetadata({ locale, title: copy.title, description: copy.intro, paths: bothLocales('/faq'), noindex: Boolean(q) })
}

export default async function FaqPage({ params, searchParams }: PageProps) {
  const { locale, dict } = await resolveLocale(params)
  const q = normalizeQuery(firstParam((await searchParams).q))
  const faqs = await listFaqs({ locale, query: q || undefined })
  const copy = dict.sections.faq
  const basePath = `/${locale}/faq`

  return (
    <>
      {!q && faqs.length > 0 ? (
        <JsonLd
          data={faqJsonLd(
            faqs.flatMap((faq) => {
              const answer = answerText(faq)
              return answer ? [{ question: faq.question, answer }] : []
            }),
          )}
        />
      ) : null}
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
          <SearchForm action={basePath} defaultValue={q} label={dict.ui.searchLabel} placeholder={dict.ui.searchPlaceholder} buttonLabel={dict.ui.searchButton} />
        </div>
      </PageHeader>
      <Container size="reading" className="space-y-10 py-12">
        <p className="rounded-md border-l-4 border-gold bg-surface px-4 py-3 text-sm">{copy.notFatwa}</p>
        <div aria-live="polite">
          {q ? (
            <p className="mb-6 text-sm text-muted">
              {dict.ui.resultsFor(q)} — {dict.ui.resultCount(faqs.length)}
            </p>
          ) : null}
          {faqs.length === 0 ? (
            <p className="text-muted">{q ? dict.ui.noResults : dict.ui.emptySection}</p>
          ) : (
            <div className="space-y-10">
              {groupByCategory(faqs).map(([key, group]) => (
                <section key={key} aria-labelledby={group.title ? `faq-group-${key}` : undefined}>
                  {group.title ? (
                    <h2 id={`faq-group-${key}`} className="mb-4 text-xl font-semibold">
                      {group.title}
                    </h2>
                  ) : null}
                  <FaqList faqs={group.faqs} locale={locale} openFirst={Boolean(q)} />
                </section>
              ))}
            </div>
          )}
        </div>
        <aside className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">{copy.askTitle}</h2>
          <p className="mt-2">{copy.askBody}</p>
          <a href={`/${locale}/contact`} className="mt-4 inline-block">
            {dict.nav.contact} →
          </a>
        </aside>
      </Container>
    </>
  )
}
