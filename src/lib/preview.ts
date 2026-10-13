import { isLocale } from '@/lib/i18n/config'

/** Only same-site paths under a locale may be previewed (prevents open redirects). */
export const safePreviewPath = (value: string | null): string | null => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  const [, locale] = value.split('/')
  return isLocale(locale) ? value : null
}
