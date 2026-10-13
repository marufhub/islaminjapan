'use client'

import { usePathname } from 'next/navigation'

import { LOCALES, type Locale } from '@/lib/i18n/config'
import { switchLocalePath } from '@/lib/i18n/paths'

const LOCALE_NAMES: Record<Locale, string> = { ja: '日本語', en: 'English' }

type LanguageSwitcherProps = { locale: Locale; label: string }

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? `/${locale}`
  return (
    <nav aria-label={label}>
      <ul className="flex items-center text-sm sm:gap-1">
        {LOCALES.map((target) => {
          const isCurrent = target === locale
          return (
            <li key={target}>
              <a
                href={switchLocalePath(pathname, target)}
                hrefLang={target}
                lang={target}
                aria-current={isCurrent ? 'true' : undefined}
                className={`block whitespace-nowrap rounded-full px-2 py-1 sm:px-3 no-underline transition-colors ${
                  isCurrent
                    ? 'bg-primary text-white'
                    : 'text-charcoal hover:bg-primary-soft'
                }`}
              >
                {LOCALE_NAMES[target]}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
