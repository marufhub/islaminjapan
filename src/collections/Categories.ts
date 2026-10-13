import type { CollectionConfig } from 'payload'

import { isEditorOrAdmin } from '@/access/roles'
import { slugField } from '@/fields/shared'
import { disablePublicLocaleFallback } from '@/hooks/requestGuards'
import { label } from '@/lib/i18n/config'

export const CATEGORY_GROUPS = [
  { value: 'beliefs', label: label('イスラームの信仰', 'Islamic Beliefs') },
  { value: 'quran_hadith', label: label('クルアーンとハディース', 'Quran & Hadith') },
  { value: 'history_japan', label: label('日本のイスラーム史', 'Islam in Japan History') },
  { value: 'muslim_life', label: label('日本でのムスリム生活', 'Muslim Life in Japan') },
  { value: 'ethics_culture', label: label('倫理と文化', 'Islamic Ethics & Culture') },
  { value: 'community', label: label('相互理解', 'Community Understanding') },
]

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: label('カテゴリー', 'Category'), plural: label('カテゴリー', 'Categories') },
  admin: { useAsTitle: 'title', group: label('コンテンツ', 'Content') },
  hooks: { beforeOperation: [disablePublicLocaleFallback] },
  access: {
    read: () => true,
    create: isEditorOrAdmin,
    update: isEditorOrAdmin,
    delete: isEditorOrAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: label('名前', 'Name') },
    slugField,
    { name: 'group', type: 'select', required: true, label: label('グループ', 'Group'), options: CATEGORY_GROUPS },
    { name: 'description', type: 'textarea', localized: true, label: label('説明', 'Description') },
  ],
}
