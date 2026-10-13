import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import { getNavigation } from '@/lib/site'

import { Container } from '../ui/Container'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileNav } from './MobileNav'

/**
 * Two rows on large screens (brand + utilities, then navigation) so CMS-managed menus of any
 * length never collide with the brand; a disclosure menu on smaller screens.
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const items = (await getNavigation(locale)).map((item) => ({ ...item, href: localizedHref(locale, item.href) }))

  return (
    <header className="relative border-b border-line bg-ivory/95">
      <Container className="flex items-center justify-between gap-2 py-4 sm:gap-4">
        <a href={`/${locale}`} className="flex min-w-0 flex-col leading-tight text-charcoal no-underline">
          <span className="whitespace-nowrap font-serif text-lg font-semibold tracking-wide text-primary sm:text-xl">{dict.siteName}</span>
          <span className="whitespace-nowrap text-xs text-muted">{dict.siteSubtitle}</span>
        </a>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <a
            href={`/${locale}/search`}
            aria-label={dict.nav.search}
            className="rounded-full p-2 text-charcoal no-underline hover:bg-primary-soft"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </a>
          <LanguageSwitcher locale={locale} label={dict.languageSwitcher} />
          <MobileNav items={items} menuLabel={dict.menu} closeLabel={dict.closeMenu} navLabel={dict.mainNavigation} />
        </div>
      </Container>
      <nav aria-label={dict.mainNavigation} className="hidden border-t border-line/70 lg:block">
        <Container>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-1 py-2.5 text-sm">
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="whitespace-nowrap text-charcoal no-underline hover:text-primary hover:underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </header>
  )
}
