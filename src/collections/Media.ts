import type { CollectionConfig } from 'payload'

import { editorOrOwner, isEditorOrAdmin, isStaff } from '@/access/roles'
import { authorField } from '@/fields/shared'
import { label } from '@/lib/i18n/config'

export const LICENSE_OPTIONS = [
  { value: 'owned', label: label('自作・権利保有', 'Owned / commissioned') },
  { value: 'permission', label: label('使用許諾済み', 'Used with permission') },
  { value: 'cc_by', label: { ja: 'CC BY', en: 'CC BY' } },
  { value: 'cc_by_sa', label: { ja: 'CC BY-SA', en: 'CC BY-SA' } },
  { value: 'cc0', label: { ja: 'CC0', en: 'CC0' } },
  { value: 'public_domain', label: label('パブリックドメイン', 'Public domain') },
  { value: 'licensed', label: label('ライセンス購入', 'Licensed stock') },
  { value: 'unknown', label: label('不明（公開前に要確認）', 'Unknown (verify before use)') },
]

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: label('メディア', 'Media'), plural: label('メディア', 'Media') },
  admin: { group: label('コンテンツ', 'Content'), defaultColumns: ['filename', 'alt', 'license'] },
  access: {
    // Files must be publicly readable to render on the site. Do not upload private material.
    read: () => true,
    create: isStaff,
    // Rights metadata on media used by published pages must not be changed by other authors.
    update: editorOrOwner,
    delete: isEditorOrAdmin,
  },
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1600, height: undefined, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: label('代替テキスト', 'Alt text'),
      admin: { description: label('画像の内容を簡潔に説明してください。', 'Briefly describe the image.') },
    },
    { name: 'caption', type: 'textarea', localized: true, label: label('キャプション', 'Caption') },
    { name: 'credit', type: 'text', label: label('クレジット・撮影者', 'Credit / creator') },
    { name: 'sourceUrl', type: 'text', label: label('出典URL', 'Source URL') },
    {
      name: 'originalDate',
      type: 'text',
      label: label('撮影・作成時期', 'Original date'),
      admin: { description: label('史料画像の場合。例: 1938年 / 1930年代頃', 'For archival images, e.g. 1938 / c. 1930s') },
    },
    {
      name: 'license',
      type: 'select',
      required: true,
      defaultValue: 'unknown',
      label: label('ライセンス', 'License'),
      options: LICENSE_OPTIONS,
    },
    { name: 'rightsNotes', type: 'textarea', label: label('権利・利用条件メモ', 'Rights notes') },
    {
      name: 'isAIGenerated',
      type: 'checkbox',
      defaultValue: false,
      label: label('AI生成画像', 'AI-generated image'),
      admin: {
        description: label(
          'AI生成画像は歴史的資料として使用できません。サイト上では「AI生成」と表示されます。',
          'AI-generated images must never be presented as historical evidence and are labelled on the site.',
        ),
      },
    },
    { ...authorField, label: label('アップロード者', 'Uploaded by') },
  ],
}
