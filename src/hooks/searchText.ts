import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { CollectionBeforeChangeHook } from 'payload'

type LexicalState = Parameters<typeof convertLexicalToPlaintext>[0]['data']

const MAX_SEARCH_TEXT = 20_000

const toPlainText = (value: unknown): string => {
  if (!value || typeof value !== 'object' || !('root' in value)) return ''
  return convertLexicalToPlaintext({ data: value as LexicalState })
}

/**
 * Maintains a hidden plain-text copy of searchable fields so public search can use simple
 * substring matching, which works for Japanese text without word segmentation.
 */
export const buildSearchText =
  (fields: { text: string[]; richText: string[] }): CollectionBeforeChangeHook =>
  ({ data, originalDoc }) => {
    const merged: Record<string, unknown> = { ...(originalDoc ?? {}), ...data }
    const parts = [
      ...fields.text.map((name) => (typeof merged[name] === 'string' ? (merged[name] as string) : '')),
      ...fields.richText.map((name) => toPlainText(merged[name])),
    ]
    const searchText = parts.filter(Boolean).join('\n').slice(0, MAX_SEARCH_TEXT)
    return { ...data, searchText }
  }
