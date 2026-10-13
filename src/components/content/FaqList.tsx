import type { Locale } from '@/lib/i18n/config'
import type { Faq } from '@/payload-types'

import { RichText } from './RichText'

/**
 * Accessible accordion using native <details>/<summary>: keyboard operable, announced by screen
 * readers, and content stays in the HTML for search engines.
 */
export function FaqList({ faqs, locale, openFirst = false }: { faqs: Faq[]; locale: Locale; openFirst?: boolean }) {
  return (
    <div className="divide-y divide-line rounded-lg border border-line bg-surface">
      {faqs.map((faq, index) => (
        <details key={faq.id} id={`faq-${faq.id}`} open={openFirst && index === 0} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 font-medium marker:hidden">
            <span>{faq.question}</span>
            <span aria-hidden="true" className="mt-1 text-primary transition-transform group-open:rotate-45">
              ＋
            </span>
          </summary>
          <div className="px-5 pb-5">
            {faq.shortAnswer ? <p className="font-medium">{faq.shortAnswer}</p> : null}
            <RichText data={faq.answer} locale={locale} className="mt-3" />
            {(faq.relatedArticles ?? []).some((item) => typeof item === 'object') ? (
              <ul className="mt-4 space-y-1 text-sm">
                {(faq.relatedArticles ?? []).map((item) =>
                  typeof item === 'object' && item.language === locale ? (
                    <li key={item.id}>
                      → <a href={`/${locale}/articles/${item.slug}`}>{item.title}</a>
                    </li>
                  ) : null,
                )}
              </ul>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  )
}
