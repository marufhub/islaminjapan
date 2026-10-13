import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import { getHomepage } from '@/lib/site'

type PageProps = { params: Promise<{ locale: string }> }

export const revalidate = 60

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const homepage = await getHomepage(locale)

  const heroTitle = homepage.heroTitle || dict.home.heroTitle
  const heroIntro = homepage.heroIntro || dict.home.heroIntro
  const cmsPathways = (homepage.pathways ?? []).filter((pathway) => pathway.title && pathway.href)
  const pathways =
    cmsPathways.length > 0
      ? cmsPathways.map((pathway) => ({ title: pathway.title as string, description: pathway.description ?? '', href: pathway.href }))
      : dict.home.pathways

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
                  <span className="font-serif text-xl font-semibold text-primary group-hover:underline">{pathway.title}</span>
                  <span className="mt-3 text-sm text-muted">{pathway.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  )
}
