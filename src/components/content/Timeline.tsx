import { formatHistoryDate } from '@/lib/history/dates'
import type { Locale } from '@/lib/i18n/config'
import type { HistoryEvent } from '@/payload-types'

type TimelineProps = {
  events: HistoryEvent[]
  locale: Locale
  labels: { details: string; location: string; uncertain: string }
  headingLevel?: 'h2' | 'h3'
}

export const eventDateLabel = (event: HistoryEvent, locale: Locale): string =>
  event.dateDisplayOverride || formatHistoryDate(event.date ?? {}, locale)

const isApproximate = (event: HistoryEvent): boolean =>
  ['circa', 'decade', 'unknown'].includes(event.date?.precision ?? '') || Boolean(event.uncertaintyNotes)

/**
 * Chronological, semantic timeline: an ordered list of events, each with its date as visible text,
 * so it reads correctly with screen readers and without CSS.
 */
export function Timeline({ events, locale, labels, headingLevel = 'h3' }: TimelineProps) {
  const Heading = headingLevel
  return (
    <ol className="relative border-l-2 border-gold/60 pl-6 sm:pl-8">
      {events.map((event) => (
        <li key={event.id} className="relative pb-10 last:pb-0">
          <span aria-hidden="true" className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 border-gold bg-ivory sm:-left-[41px]" />
          <p className="text-sm font-semibold text-primary-dark">
            {eventDateLabel(event, locale)}
            {isApproximate(event) ? <span className="ml-2 rounded bg-gold-soft px-1.5 py-0.5 text-xs font-normal text-charcoal">{labels.uncertain}</span> : null}
          </p>
          <Heading className="mt-1 text-lg font-semibold">
            <a href={`/${locale}/islam-in-japan/events/${event.id}`} className="text-charcoal hover:text-primary">
              {event.title}
            </a>
          </Heading>
          {event.location ? (
            <p className="text-sm text-muted">
              {labels.location}: {event.location}
            </p>
          ) : null}
          {event.summary ? <p className="mt-2 max-w-3xl">{event.summary}</p> : null}
        </li>
      ))}
    </ol>
  )
}
