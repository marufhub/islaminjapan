import type { CollectionConfig } from 'payload'

import { editorOrOwner, isEditorOrAdmin, isStaff, publishedInLocaleOrStaff } from '@/access/roles'
import { audiencesField } from '@/fields/audience'
import { authorField, editorialStatusField, publishedLocalesField } from '@/fields/shared'
import { enforceEditorialWorkflow } from '@/hooks/editorialWorkflow'
import { requireVerifiedSources } from '@/hooks/publishChecks'
import { disablePublicLocaleFallback, trackDraftSave } from '@/hooks/requestGuards'
import { label } from '@/lib/i18n/config'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: label('Q&A', 'FAQ'), plural: label('イスラームQ&A', 'FAQs') },
  admin: {
    useAsTitle: 'question',
    group: label('コンテンツ', 'Content'),
    defaultColumns: ['question', 'category', 'editorialStatus', '_status'],
  },
  access: {
    read: publishedInLocaleOrStaff,
    readVersions: isStaff,
    create: isStaff,
    update: editorOrOwner,
    delete: isEditorOrAdmin,
  },
  defaultSort: 'order',
  versions: { drafts: true, maxPerDoc: 30 },
  hooks: {
    beforeOperation: [trackDraftSave, disablePublicLocaleFallback],
    beforeChange: [enforceEditorialWorkflow([requireVerifiedSources('sources')])],
  },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true, label: label('質問', 'Question') },
    { name: 'shortAnswer', type: 'textarea', localized: true, label: label('短い回答', 'Short answer') },
    { name: 'answer', type: 'richText', localized: true, label: label('回答', 'Answer') },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'relationship', relationTo: 'categories', label: label('カテゴリー', 'Category') },
        { name: 'order', type: 'number', defaultValue: 100, label: label('表示順', 'Order') },
      ],
    },
    audiencesField,
    { name: 'relatedArticles', type: 'relationship', relationTo: 'articles', hasMany: true, label: label('関連記事', 'Related articles') },
    { name: 'sources', type: 'relationship', relationTo: 'sources', hasMany: true, label: label('出典', 'Sources') },
    { name: 'featured', type: 'checkbox', defaultValue: false, label: label('トップページに表示', 'Show on homepage'), admin: { position: 'sidebar' } },
    publishedLocalesField,
    editorialStatusField,
    authorField,
  ],
}
