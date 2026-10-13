import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'

import { Container } from '../ui/Container'

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const links = [
    { label: dict.nav.about, href: '/about' },
    { label: dict.nav.contact, href: '/contact' },
    { label: dict.nav.editorialPolicy, href: '/editorial-policy' },
    { label: dict.nav.sourcesPolicy, href: '/sources-policy' },
    { label: dict.nav.privacy, href: '/privacy' },
  ]
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <Container className="flex flex-col gap-6 py-10 text-sm md:flex-row md:items-start md:justify-between">
        <div className="max-w-md space-y-2">
          <p className="font-serif text-lg text-primary">{dict.siteName}</p>
          <p>{dict.footer.tagline}</p>
          <p className="text-muted">{dict.footer.credibility}</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <a href={localizedHref(locale, link.href)} className="text-charcoal">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  )
}
