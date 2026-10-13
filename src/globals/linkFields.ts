import type { Field } from 'payload'

import { label } from '@/lib/i18n/config'
import { isSafeHref } from '@/lib/i18n/paths'

export const validateHref = (value: unknown): true | string =>
  typeof value === 'string' && isSafeHref(value)
    ? true
    : 'サイト内パス（/learn）、https://、mailto: のみ使用できます (Use a site path, https:// or mailto: only)'

/** A localized label + locale-independent path (e.g. "/learn"; the locale prefix is added automatically). */
export const linkFields: Field[] = [
  { name: 'label', type: 'text', required: true, localized: true, label: label('表示名', 'Label') },
  {
    name: 'href',
    type: 'text',
    required: true,
    validate: validateHref,
    label: label('リンク先', 'Link'),
    admin: { description: label('サイト内は /learn の形式。外部は https://…', 'Internal: /learn. External: https://…') },
  },
]
