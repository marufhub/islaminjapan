import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticleMeta } from '@/components/content/ArticleMeta'
import { MediaImage } from '@/components/content/MediaImage'
import { RichText } from '@/components/content/RichText'
import { ShareLinks } from '@/components/content/ShareLinks'
import { SourceList } from '@/components/content/SourceList'
import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { findArticleInOtherLocale, getArticleBySlug, getTranslations } from '@/lib/content/articles'
import { displayName, getDisplayNames } from '@/lib/content/people'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { resolveLocale } from '@/lib/i18n/route'
import { articleJsonLd } from '@/lib/seo/jsonLd'
import { buildMetadata } from '@/lib/seo/metadata'
import { absoluteUrl, type LocalizedPaths } from '@/lib/seo/urls'
import { getSiteSettings } from '@/lib/site'
import type { Article } from '@/payload-types'

type PageProps = { params: Promise<{ locale: string; slug: string }> }

const SECTION_PATHS: Record<NonNullable<Article['section']>, { path: string; key: keyof Dictionary['nav'] }> = {
  learn: { path: '/learn', key: 'learn' },
  'islam-in-japan': { path: '/history-of-islam-in-japan', key: 'history' },
  'muslim-life': { path: '/muslim-life', key: 'muslimLife' },
  resources: { path: '/articles', key: 'articles' },
}

const articlePath = (locale: Locale, slug: string) => `/${locale}/articles/${slug}`

const loadArticle = async (params: PageProps['params']) => {
  const { locale, dict } = await resolveLocale(params)
  const { slug } = await params
  const article = await getArticleBySlug(locale, slug)
  return { locale, dict, slug, article }
}

const pathsFor = async (locale: Locale, article: Article): Promise<LocalizedPaths> => {
  const translations = await getTranslations(article)
  return {
    [locale]: articlePath(locale, article.slug),
    ...Object.fromEntries(translations.map((item) => [item.locale, articlePath(item.locale, item.slug)])),
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, article } = await loadArticle(params)
  if (!article) return { robots: { index: false, follow: false } }
  const cover = typeof article.coverImage === 'object' ? article.coverImage?.url : null
  return buildMetadata({
    locale,
    type: 'article',
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.summary,
    paths: await pathsFor(locale, article),
    imageUrl: cover,
    publishedTime: article.publishedAt,
    modifiedTime: article.lastReviewedAt ?? article.updatedAt,
    // Draft previews must never be indexed.
    noindex: article._status !== 'published',
  })
}

/** Honest "not in this language" state instead of silently showing another language. */
async function NotAvailable({ locale, dict, slug }: { locale: Locale; dict: Dictionary; slug: string }) {
  const other = await findArticleInOtherLocale(locale, slug)
  if (!other) notFound()
  return (
    <Container size="reading" className="py-20">
      <h1 className="text-2xl font-bold text-primary">{dict.ui.notAvailableTitle}</h1>
      <p className="mt-4">{dict.ui.notAvailableBody}</p>
      <p className="mt-6">
        <a href={articlePath(other.locale, other.slug)} hrefLang={other.locale} lang={other.locale}>
          {dict.ui.readInOther} →
        </a>
      </p>
    </Container>
  )
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale, dict, slug, article } = await loadArticle(params)
  if (!article) return <NotAvailable locale={locale} dict={dict} slug={slug} />

  const [translations, names, settings] = await Promise.all([
    getTranslations(article),
    getDisplayNames([article.author, article.reviewer]),
    getSiteSettings(locale),
  ])
  const section = SECTION_PATHS[article.section ?? 'resources']
  const path = articlePath(locale, article.slug)
  const authorName = displayName(names, article.author)
  const cover = typeof article.coverImage === 'object' ? article.coverImage : null
  const related = (article.relatedArticles ?? []).filter(
    (item): item is Article => typeof item === 'object' && item.language === locale,
  )
  const translation = translations[0]

  return (
    <article lang={locale}>
      <JsonLd
        data={articleJsonLd({
          locale,
          path,
          headline: article.title,
          description: article.summary,
          datePublished: article.publishedAt,
          dateModified: article.lastReviewedAt ?? article.updatedAt,
          authorName,
          imageUrl: cover?.url,
          publisherName: settings.organizationName || settings.siteName || dict.siteName,
        })}
      />
      <PageHeader
        title={article.title}
        intro={article.summary}
        breadcrumbLabel={dict.breadcrumb}
        crumbs={[
          { name: dict.nav.home, path: `/${locale}` },
          { name: dict.nav[section.key], path: `/${locale}${section.path}` },
          { name: article.title, path },
        ]}
      >
        <ArticleMeta
          locale={locale}
          dict={dict}
          authorName={authorName}
          reviewerName={displayName(names, article.reviewer)}
          publishedAt={article.publishedAt}
          lastReviewedAt={article.lastReviewedAt}
        />
        {translation ? (
          <p className="mt-3 text-sm">
            <a href={articlePath(translation.locale, translation.slug)} hrefLang={translation.locale} lang={translation.locale}>
              {dict.ui.otherLanguageVersion} →
            </a>
          </p>
        ) : null}
      </PageHeader>
      <Container size="reading" className="py-12">
        <MediaImage media={cover} aiLabel={dict.ui.aiGeneratedImage} className="mb-10" priority sizes="(min-width: 768px) 768px, 100vw" />
        <RichText data={article.body} locale={locale} />
        <SourceList sources={article.sources} heading={dict.ui.references} locale={locale} />
        {related.length > 0 ? (
          <section aria-labelledby="related-heading" className="mt-12 border-t border-line pt-8">
            <h2 id="related-heading" className="text-xl font-semibold">
              {dict.ui.relatedArticles}
            </h2>
            <ul className="mt-4 space-y-2">
              {related.map((item) => (
                <li key={item.id}>
                  <a href={articlePath(locale, item.slug)}>{item.title}</a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <ShareLinks url={absoluteUrl(path)} title={article.title} dict={dict} />
      </Container>
    </article>
  )
}
