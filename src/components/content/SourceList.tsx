import type { Locale } from '@/lib/i18n/config'
import { isSafeHref } from '@/lib/i18n/paths'
import type { Source } from '@/payload-types'

const citation = (source: Source): string =>
  [source.authors, source.title, source.institution, source.publicationDate ?? source.publicationYear]
    .filter(Boolean)
    .join('. ')

/**
 * Reference list. Only populated (i.e. publicly readable = verified) sources are shown;
 * unverified ones come back as bare IDs from access control and are skipped.
 */
export function SourceList({ sources, heading, id = 'references' }: { sources: Array<number | Source> | null | undefined; heading: string; locale: Locale; id?: string }) {
  const visible = (sources ?? []).filter((source): source is Source => typeof source === 'object' && source !== null)
  if (visible.length === 0) return null
  return (
    <section aria-labelledby={id} className="mt-12 border-t border-line pt-8">
      <h2 id={id} className="text-xl font-semibold">
        {heading}
      </h2>
      <ol className="mt-4 list-decimal space-y-3 pl-6 text-sm">
        {visible.map((source) => (
          <li key={source.id} id={`source-${source.id}`}>
            {citation(source)}
            {source.doi ? <span> DOI: {source.doi}</span> : null}
            {source.isbn ? <span> ISBN: {source.isbn}</span> : null}
            {source.url && isSafeHref(source.url) ? (
              <>
                {' '}
                <a href={source.url} rel="noopener noreferrer" className="break-all">
                  {source.url}
                </a>
              </>
            ) : null}
            {source.attributionRequirements ? <p className="mt-1 text-muted">{source.attributionRequirements}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
