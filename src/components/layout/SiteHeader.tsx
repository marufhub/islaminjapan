import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import { getNavigation } from '@/lib/site'

import { Container } from '../ui/Container'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileNav } from './MobileNav'

export async function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const items = (await getNavigation(locale)).map((item) => ({ ...item, href: localizedHref(locale, item.href) }))

  return (
    <header className="relative border-b border-line bg-ivory/95">
      <Container className="flex items-center justify-between gap-2 py-4 sm:gap-4">
        <a href={`/${locale}`} className="flex min-w-0 flex-col leading-tight text-charcoal no-underline">
          <span className="whitespace-nowrap font-serif text-lg font-semibold sm:text-xl tracking-wide text-primary">{dict.siteName}</span>
          <span className="whitespace-nowrap text-xs text-muted">{dict.siteSubtitle}</span>
        </a>
        <nav aria-label={dict.mainNavigation} className="hidden xl:block">
          <ul className="flex items-center gap-5 text-sm">
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="whitespace-nowrap text-charcoal no-underline hover:text-primary hover:underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <LanguageSwitcher locale={locale} label={dict.languageSwitcher} />
          <MobileNav items={items} menuLabel={dict.menu} closeLabel={dict.closeMenu} navLabel={dict.mainNavigation} />
        </div>
      </Container>
    </header>
  )
}
