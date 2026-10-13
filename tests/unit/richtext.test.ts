import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import { describe, expect, it } from 'vitest'

import { toLexical } from '@/lib/richtext/build'

describe('toLexical', () => {
  it('builds headings, paragraphs and lists that round-trip to plain text', () => {
    const state = toLexical([
      { type: 'heading', level: 2, text: '五行とは' },
      { type: 'paragraph', text: 'イスラームの実践の柱です。' },
      { type: 'list', items: ['信仰告白', '礼拝'] },
    ])
    const text = convertLexicalToPlaintext({ data: state as never })
    expect(text).toContain('五行とは')
    expect(text).toContain('イスラームの実践の柱です。')
    expect(text).toContain('信仰告白')
  })

  it('treats markup as literal text, never HTML', () => {
    const state = toLexical([{ type: 'paragraph', text: '<script>alert(1)</script>' }])
    const node = state.root.children[0] as unknown as { children: Array<{ type: string; text: string }> }
    expect(node.children[0]).toMatchObject({ type: 'text', text: '<script>alert(1)</script>' })
  })

  it('drops empty blocks', () => {
    expect(toLexical([{ type: 'paragraph', text: '  ' }, { type: 'list', items: [''] }]).root.children).toHaveLength(0)
  })
})
