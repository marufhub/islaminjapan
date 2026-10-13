import type { GlobalConfig } from 'payload'

import { label } from '@/lib/i18n/config'

import { publicReadEditorWrite } from './access'
import { linkFields } from './linkFields'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: label('ナビゲーション', 'Navigation'),
  admin: { group: label('サイト構成', 'Site structure') },
  access: publicReadEditorWrite,
  fields: [{ name: 'items', type: 'array', label: label('メニュー項目', 'Menu items'), maxRows: 8, fields: linkFields }],
}
