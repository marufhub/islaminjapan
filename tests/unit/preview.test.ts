import { describe, expect, it } from 'vitest'

import { safePreviewPath } from '@/lib/preview'
import { buildRss } from '@/lib/seo/rss'

describe('safePreviewPath', () => {
  it('accepts locale-prefixed site paths', () => {
    expect(safePreviewPath('/ja/articles/what-is-islam')).toBe('/ja/articles/what-is-islam')
    expect(safePreviewPath('/en/history-of-islam-in-japan/events/3')).toBe('/en/history-of-islam-in-japan/events/3')
  })

  it('rejects open redirects and non-locale paths', () => {
    expect(safePreviewPath('https://evil.example')).toBeNull()
    expect(safePreviewPath('//evil.example')).toBeNull()
    expect(safePreviewPath('/\\evil.example')).toBeNull()
    expect(safePreviewPath('/admin')).toBeNull()
    expect(safePreviewPath(null)).toBeNull()
  })
})

describe('buildRss', () => {
  it('escapes XML special characters', () => {
    const xml = buildRss({
      title: 'A & B',
      url: 'https://example.org',
      description: '<desc>',
      language: 'ja',
      items: [{ title: '"Q" & <A>', url: 'https://example.org/a?x=1&y=2' }],
    })
    expect(xml).toContain('A &amp; B')
    expect(xml).toContain('&quot;Q&quot; &amp; &lt;A&gt;')
    expect(xml).not.toContain('<desc>')
  })
})
