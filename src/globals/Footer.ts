import type { GlobalConfig } from 'payload'

import { label } from '@/lib/i18n/config'

import { publicReadEditorWrite } from './access'
import { linkFields } from './linkFields'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: label('フッター', 'Footer'),
  admin: { group: label('サイト構成', 'Site structure') },
  access: publicReadEditorWrite,
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: label('列', 'Columns'),
      maxRows: 4,
      fields: [
        { name: 'heading', type: 'text', localized: true, label: label('見出し', 'Heading') },
        { name: 'links', type: 'array', label: label('リンク', 'Links'), fields: linkFields },
      ],
    },
    { name: 'note', type: 'textarea', localized: true, label: label('フッター注記', 'Footer note') },
  ],
}
