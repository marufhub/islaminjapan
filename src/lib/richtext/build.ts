/**
 * Builds Payload Lexical rich-text state from a small, explicit block model.
 * Only plain text is ever emitted — never HTML — so content from scripts or AI output
 * cannot inject markup.
 */
export type RichBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'quote'; text: string }

const MAX_TEXT_LENGTH = 10_000

/** Structural type compatible with Payload's generated rich-text field type. */
export type LexicalNode = { type: string; version: number; [key: string]: unknown }
export type LexicalState = {
  root: {
    type: string
    format: ''
    indent: number
    version: number
    direction: 'ltr'
    children: LexicalNode[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

const textNode = (text: string): LexicalNode => ({
  type: 'text',
  text: text.slice(0, MAX_TEXT_LENGTH),
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const element = (type: string, children: LexicalNode[], extra: Record<string, unknown> = {}) => ({
  type,
  format: '' as const,
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  children,
  ...extra,
})

const blockToNode = (block: RichBlock): LexicalNode => {
  switch (block.type) {
    case 'heading':
      return element('heading', [textNode(block.text)], { tag: `h${block.level}` })
    case 'quote':
      return element('quote', [textNode(block.text)])
    case 'list':
      return element(
        'list',
        block.items.map((item, index) => element('listitem', [textNode(item)], { value: index + 1 })),
        { listType: block.ordered ? 'number' : 'bullet', tag: block.ordered ? 'ol' : 'ul', start: 1 },
      )
    default:
      return element('paragraph', [textNode(block.text)], { textFormat: 0, textStyle: '' })
  }
}

export const toLexical = (blocks: RichBlock[]): LexicalState => ({
  root: element('root', blocks.filter((block) => blockHasText(block)).map(blockToNode)),
})

const blockHasText = (block: RichBlock): boolean =>
  block.type === 'list' ? block.items.some((item) => item.trim().length > 0) : block.text.trim().length > 0

/** Convenience: paragraphs separated by blank lines. */
export const paragraphs = (...texts: string[]): RichBlock[] => texts.map((text) => ({ type: 'paragraph', text }))
