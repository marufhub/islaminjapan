import type { ReactNode } from 'react'

import { RichText } from '@/components/content/RichText'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { formatDate } from '@/lib/i18n/format'

type PolicyPageProps = {
  locale: Locale
  dict: Dictionary
  title: string
  path: string
  content: unknown
  lastUpdated?: string | null
  children?: ReactNode
}

const hasContent = (value: unknown): boolean => {
  const root = (value as { root?: { children?: unknown[] } } | null)?.root
  return Array.isArray(root?.children) && root.children.length > 0
}

/** CMS-managed text page. Shows an honest "being prepared" note until editors add content. */
export function PolicyPage({ locale, dict, title, path, content, lastUpdated, children }: PolicyPageProps) {
  const updated = formatDate(lastUpdated, locale)
  return (
    <>
      <PageHeader
        title={title}
        breadcrumbLabel={dict.breadcrumb}
        crumbs={[
          { name: dict.nav.home, path: `/${locale}` },
          { name: title, path: `/${locale}${path}` },
        ]}
      />
      <Container size="reading" className="py-12">
        {hasContent(content) ? <RichText data={content} locale={locale} /> : <p className="text-muted">{dict.policyFallback}</p>}
        {children}
        {updated ? (
          <p className="mt-10 text-sm text-muted">
            {dict.ui.lastReviewed}: <time dateTime={lastUpdated ?? undefined}>{updated}</time>
          </p>
        ) : null}
      </Container>
    </>
  )
}
