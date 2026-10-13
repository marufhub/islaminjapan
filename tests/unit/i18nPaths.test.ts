import { describe, expect, it } from 'vitest'

import { isLocale } from '@/lib/i18n/config'
import { isSafeHref, localizedHref, switchLocalePath } from '@/lib/i18n/paths'

describe('i18n paths', () => {
  it('accepts only ja and en', () => {
    expect(isLocale('ja')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('bn')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
  })

  it('prefixes internal links with the locale', () => {
    expect(localizedHref('ja', '/learn')).toBe('/ja/learn')
    expect(localizedHref('en', '/')).toBe('/en')
    expect(localizedHref('en', 'faq')).toBe('/en/faq')
  })

  it('leaves external and anchor links untouched', () => {
    expect(localizedHref('ja', 'https://example.org')).toBe('https://example.org')
    expect(localizedHref('ja', 'mailto:a@b.c')).toBe('mailto:a@b.c')
    expect(localizedHref('ja', '#top')).toBe('#top')
  })

  it('neutralises unsafe link schemes from the CMS', () => {
    expect(localizedHref('ja', 'javascript:alert(1)')).toBe('/ja')
    expect(localizedHref('ja', ' JavaScript:alert(1)')).toBe('/ja')
    expect(localizedHref('en', 'data:text/html,<script>')).toBe('/en')
    expect(localizedHref('ja', '//evil.example')).toBe('/ja')
    expect(isSafeHref('java\tscript:alert(1)')).toBe(false)
    expect(isSafeHref('\u0001javascript:alert(1)')).toBe(false)
    expect(isSafeHref('/\\evil.example')).toBe(false)
    expect(isSafeHref('https://example.org')).toBe(true)
    expect(isSafeHref('/learn')).toBe(true)
  })

  it('switches the locale segment and keeps the rest of the path', () => {
    expect(switchLocalePath('/ja/islam-in-japan', 'en')).toBe('/en/islam-in-japan')
    expect(switchLocalePath('/en', 'ja')).toBe('/ja')
    expect(switchLocalePath('/', 'en')).toBe('/en')
  })
})
