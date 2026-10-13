import { isLocale, LOCALES, type Locale } from './config'

const SAFE_EXTERNAL = /^(https?:\/\/|mailto:)/i
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i

// Browsers ignore ASCII control characters and whitespace inside a scheme ("java\tscript:").
const CONTROL_AND_SPACE = /[\u0000-\u0020\u007f-\u009f]/g

/** CMS links may only be site paths, anchors, http(s) or mailto — never javascript:, data:, etc. */
export const isSafeHref = (href: string): boolean => {
  const value = href.replace(CONTROL_AND_SPACE, '')
  // Backslashes are treated as slashes by browsers ("/\\evil.example" → "//evil.example").
  if (value.length === 0 || value.includes('\\') || value.startsWith('//')) return false
  if (HAS_SCHEME.test(value)) return SAFE_EXTERNAL.test(value)
  return true
}

/** Prefixes an internal, locale-independent path ("/learn") with the locale ("/ja/learn"). */
export const localizedHref = (locale: Locale, href: string): string => {
  if (!isSafeHref(href)) return `/${locale}`
  if (HAS_SCHEME.test(href.trim()) || href.startsWith('#')) return href.trim()
  const path = href.startsWith('/') ? href : `/${href}`
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

/** Swaps the locale segment of a pathname ("/ja/faq" → "/en/faq"). */
export const switchLocalePath = (pathname: string, target: Locale): string => {
  const segments = pathname.split('/').filter(Boolean)
  const rest = segments.length > 0 && isLocale(segments[0]) ? segments.slice(1) : segments
  return ['', target, ...rest].join('/')
}

export const otherLocales = (current: Locale): Locale[] => LOCALES.filter((locale) => locale !== current)
