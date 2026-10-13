import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'

import type { Locale } from '@/lib/i18n/config'
import { isSafeHref } from '@/lib/i18n/paths'

type InternalLink = { relationTo?: string; value?: unknown }

const internalHref = (locale: Locale, doc: InternalLink | undefined): string => {
  const value = doc?.value
  if (doc?.relationTo === 'articles' && value && typeof value === 'object' && 'slug' in value) {
    return `/${locale}/articles/${String((value as { slug: unknown }).slug)}`
  }
  return `/${locale}`
}

const convertersFor =
  (locale: Locale): JSXConvertersFunction =>
  ({ defaultConverters }) => {
    const linkConverters = LinkJSXConverter({
      internalDocToHref: ({ linkNode }) => internalHref(locale, linkNode.fields.doc as InternalLink),
    })
    // External URLs from the editor are rendered only if they use a safe scheme.
    const isUnsafe = (fields: { linkType?: string; url?: string }) =>
      fields.linkType !== 'internal' && (!fields.url || !isSafeHref(fields.url))
    const link: typeof linkConverters.link = (args) =>
      isUnsafe(args.node.fields) ? (
        <span>{args.nodesToJSX({ nodes: args.node.children })}</span>
      ) : typeof linkConverters.link === 'function' ? (
        linkConverters.link(args)
      ) : null
    const autolink: typeof linkConverters.autolink = (args) =>
      isUnsafe(args.node.fields) ? (
        <span>{args.nodesToJSX({ nodes: args.node.children })}</span>
      ) : typeof linkConverters.autolink === 'function' ? (
        linkConverters.autolink(args)
      ) : null
    return { ...defaultConverters, link, autolink }
  }

/** Renders Payload rich text as React elements (no raw HTML injection). */
export function RichText({ data, locale, className = '' }: { data: unknown; locale: Locale; className?: string }) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  return (
    <PayloadRichText
      data={data as SerializedEditorState}
      converters={convertersFor(locale)}
      className={`prose-content ${className}`}
    />
  )
}
