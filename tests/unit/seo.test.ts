import { describe, expect, it } from 'vitest'

import { normalizeQuery, parsePage } from '@/lib/content/search'
import { serializeJsonLd } from '@/lib/seo/jsonLd'
import { bothLocales, languageAlternates } from '@/lib/seo/urls'

describe('languageAlternates', () => {
  it('lists only languages where the page exists and defaults to Japanese', () => {
    const alternates = languageAlternates({ ja: '/ja/articles/a', en: '/en/articles/b' })
    expect(alternates.ja).toMatch(/\/ja\/articles\/a$/)
    expect(alternates.en).toMatch(/\/en\/articles\/b$/)
    expect(alternates['x-default']).toBe(alternates.ja)
  })

  it('omits a missing translation', () => {
    const alternates = languageAlternates({ en: '/en/articles/only-en' })
    expect(alternates.ja).toBeUndefined()
    expect(alternates['x-default']).toBe(alternates.en)
  })

  it('maps section paths to both locales', () => {
    expect(bothLocales('/faq')).toEqual({ ja: '/ja/faq', en: '/en/faq' })
    expect(bothLocales('/')).toEqual({ ja: '/ja', en: '/en' })
  })
})

describe('serializeJsonLd', () => {
  it('cannot break out of the script tag', () => {
    expect(serializeJsonLd({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>')
  })
})

describe('search input', () => {
  it('normalizes whitespace including full-width spaces and limits length', () => {
    expect(normalizeQuery('  ラマダン　とは  ')).toBe('ラマダン とは')
    expect(normalizeQuery('a'.repeat(500))).toHaveLength(100)
    expect(normalizeQuery(undefined)).toBe('')
    expect(normalizeQuery('100%_off')).toBe('100 off')
  })

  it('parses page numbers defensively', () => {
    expect(parsePage('3')).toBe(3)
    expect(parsePage('-1')).toBe(1)
    expect(parsePage('abc')).toBe(1)
  })
})
