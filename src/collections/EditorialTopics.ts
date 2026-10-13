import type { CollectionConfig } from 'payload'

import { editorOrOwner, isEditorOrAdmin, isStaff } from '@/access/roles'
import { AUDIENCE_OPTIONS } from '@/fields/audience'
import { authorField } from '@/fields/shared'
import { label, LOCALE_OPTIONS } from '@/lib/i18n/config'

export const EditorialTopics: CollectionConfig = {
  slug: 'editorial-topics',
  labels: { singular: label('企画', 'Editorial topic'), plural: label('編集カレンダー', 'Editorial calendar') },
  admin: {
    useAsTitle: 'topic',
    group: label('リサーチ', 'Research'),
    defaultColumns: ['topic', 'language', 'priority', 'status', 'plannedDate', 'author'],
    description: label(
      '目安: 丁寧にレビューした記事を週2本程度。量より質を優先してください。',
      'Guideline: about two carefully reviewed articles per week. Quality over volume.',
    ),
  },
  access: {
    read: isStaff,
    create: isStaff,
    update: editorOrOwner,
    delete: isEditorOrAdmin,
  },
  fields: [
    { name: 'topic', type: 'text', required: true, label: label('テーマ', 'Topic') },
    {
      type: 'row',
      fields: [
        { name: 'language', type: 'select', required: true, defaultValue: 'ja', options: [...LOCALE_OPTIONS], label: label('言語', 'Language') },
        { name: 'audience', type: 'select', options: AUDIENCE_OPTIONS, label: label('対象読者', 'Audience') },
        {
          name: 'priority',
          type: 'select',
          defaultValue: 'medium',
          label: label('優先度', 'Priority'),
          options: [
            { value: 'high', label: label('高', 'High') },
            { value: 'medium', label: label('中', 'Medium') },
            { value: 'low', label: label('低', 'Low') },
          ],
        },
      ],
    },
    { name: 'category', type: 'relationship', relationTo: 'categories', label: label('カテゴリー', 'Category') },
    {
      type: 'row',
      fields: [
        { name: 'plannedDate', type: 'date', label: label('予定日', 'Planned date') },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'idea',
          label: label('ステータス', 'Status'),
          options: [
            { value: 'idea', label: label('アイデア', 'Idea') },
            { value: 'researching', label: label('調査中', 'Researching') },
            { value: 'drafting', label: label('執筆中', 'Drafting') },
            { value: 'in_review', label: label('レビュー中', 'In review') },
            { value: 'published', label: label('公開済み', 'Published') },
            { value: 'dropped', label: label('見送り', 'Dropped') },
          ],
        },
      ],
    },
    { name: 'linkedArticle', type: 'relationship', relationTo: 'articles', label: label('関連記事', 'Linked article') },
    { name: 'notes', type: 'textarea', label: label('メモ', 'Notes') },
    { ...authorField, label: label('担当者', 'Owner') },
  ],
}
