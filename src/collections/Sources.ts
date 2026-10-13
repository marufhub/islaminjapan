import type { Access, CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload'

import { canPublish, isEditorOrAdmin, isStaff, isStaffField } from '@/access/roles'
import { authorField, editorOnlyAccess } from '@/fields/shared'
import { WorkflowError } from '@/hooks/editorialWorkflow'
import { label } from '@/lib/i18n/config'

export const SOURCE_VERIFICATION_STATUSES = [
  { value: 'unverified', label: label('未検証', 'Unverified') },
  { value: 'partially_verified', label: label('一部検証済み', 'Partially verified') },
  { value: 'verified', label: label('検証済み', 'Verified') },
  { value: 'disputed', label: label('疑義あり', 'Disputed') },
]

/**
 * A source may only be marked verified once an editor confirms its contents were actually
 * consulted — a URL or citation alone is not evidence that anyone (human or AI) read it.
 */
const enforceSourceVerification: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  const next = { ...(originalDoc ?? {}), ...data }
  const becameVerified = next.verificationStatus === 'verified' && originalDoc?.verificationStatus !== 'verified'
  if (!becameVerified) return data
  if (req.user && !canPublish(req.user as never)) {
    throw new WorkflowError('出典を検証済みにできるのは編集者のみです (Only editors can verify sources).', 403)
  }
  if (!next.contentAccessed) {
    throw new WorkflowError(
      '内容を実際に確認したことをチェックしてください (Confirm the source contents were actually consulted before verifying).',
    )
  }
  return {
    ...data,
    verifiedBy: req.user?.id ?? next.verifiedBy ?? null,
    lastVerifiedAt: new Date().toISOString(),
  }
}

/**
 * Authors may edit their own sources only until an editor verifies them; a verified source can then
 * only change through an editor, so verified citations cannot be silently altered or downgraded.
 */
const editorOrOwnerOfUnverified: Access = ({ req }) => {
  if (!req.user) return false
  if (canPublish(req.user as never)) return true
  const ownUnverified: Where = {
    and: [{ author: { equals: req.user.id } }, { verificationStatus: { not_equals: 'verified' } }],
  }
  return ownUnverified
}

export const Sources: CollectionConfig = {
  slug: 'sources',
  labels: { singular: label('出典', 'Source'), plural: label('出典・参考文献', 'Sources') },
  admin: {
    useAsTitle: 'title',
    group: label('リサーチ', 'Research'),
    defaultColumns: ['title', 'sourceType', 'verificationStatus', 'publicationYear'],
    description: label(
      '記事・年表・Q&Aで引用する出典。URLがあるだけでは内容確認の証明になりません。',
      'Citable sources. A URL alone does not prove its contents were consulted.',
    ),
  },
  access: {
    // Public pages only list verified sources; drafts and research notes stay internal.
    read: ({ req }) => (req.user ? true : { verificationStatus: { equals: 'verified' } }),
    create: isStaff,
    update: editorOrOwnerOfUnverified,
    delete: isEditorOrAdmin,
  },
  hooks: { beforeChange: [enforceSourceVerification] },
  fields: [
    { name: 'title', type: 'text', required: true, label: label('タイトル', 'Title') },
    {
      type: 'row',
      fields: [
        { name: 'authors', type: 'text', label: label('著者・編者', 'Author(s) / editor(s)') },
        { name: 'institution', type: 'text', label: label('機関・出版社', 'Institution / publisher') },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'publicationYear', type: 'number', label: label('出版年', 'Publication year') },
        {
          name: 'publicationDate',
          type: 'text',
          label: label('出版日（詳細）', 'Publication date (detail)'),
          admin: { description: label('例: 1938-05 / 1938年5月', 'e.g. 1938-05') },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sourceType',
          type: 'select',
          required: true,
          label: label('種類', 'Type'),
          options: [
            { value: 'book', label: label('書籍', 'Book') },
            { value: 'journal_article', label: label('学術論文', 'Journal article') },
            { value: 'archival', label: label('史料・アーカイブ', 'Archival record') },
            { value: 'newspaper', label: label('新聞・雑誌', 'Newspaper / magazine') },
            { value: 'website', label: label('ウェブサイト', 'Website') },
            { value: 'quran', label: label('クルアーン', 'Quran') },
            { value: 'hadith_collection', label: label('ハディース集', 'Hadith collection') },
            { value: 'interview', label: label('インタビュー', 'Interview') },
            { value: 'other', label: label('その他', 'Other') },
          ],
        },
        {
          name: 'originalLanguage',
          type: 'select',
          label: label('原語', 'Original language'),
          options: [
            { value: 'ja', label: label('日本語', 'Japanese') },
            { value: 'en', label: label('英語', 'English') },
            { value: 'ar', label: label('アラビア語', 'Arabic') },
            { value: 'tr', label: label('トルコ語', 'Turkish') },
            { value: 'other', label: label('その他', 'Other') },
          ],
        },
      ],
    },
    { name: 'url', type: 'text', label: 'URL' },
    {
      type: 'row',
      fields: [
        { name: 'doi', type: 'text', label: 'DOI' },
        { name: 'isbn', type: 'text', label: 'ISBN' },
      ],
    },
    { name: 'bibliographicDetails', type: 'textarea', label: label('書誌情報', 'Bibliographic details') },
    {
      name: 'excerpts',
      type: 'array',
      label: label('承認済み抜粋', 'Approved excerpts'),
      access: { read: isStaffField },
      admin: {
        description: label(
          'AI記事作成で根拠として使用できるのは、ここに入力された抜粋のみです。長い著作物の転載は避けてください。',
          'Only these excerpts are given to the AI as evidence. Avoid copying long copyrighted passages.',
        ),
      },
      fields: [
        { name: 'text', type: 'textarea', required: true, label: label('抜粋', 'Excerpt') },
        { name: 'locator', type: 'text', label: label('ページ・箇所', 'Page / locator') },
        {
          name: 'origin',
          type: 'select',
          required: true,
          defaultValue: 'editor_transcribed',
          label: label('入手方法', 'Origin'),
          options: [
            { value: 'editor_transcribed', label: label('編集者が原典から転記', 'Transcribed from original by editor') },
            { value: 'publisher_provided', label: label('出版社・著者提供', 'Provided by publisher/author') },
            { value: 'public_domain_text', label: label('パブリックドメイン本文', 'Public domain text') },
          ],
        },
        { name: 'rightsNote', type: 'text', label: label('権利メモ', 'Rights note') },
      ],
    },
    {
      name: 'researchNotes',
      type: 'textarea',
      label: label('リサーチメモ', 'Research notes'),
      access: { read: isStaffField },
    },
    {
      type: 'collapsible',
      label: label('利用条件', 'Usage & attribution'),
      fields: [
        {
          name: 'usagePermission',
          type: 'select',
          defaultValue: 'unknown',
          label: label('利用許諾', 'Usage permission'),
          options: [
            { value: 'public_domain', label: label('パブリックドメイン', 'Public domain') },
            { value: 'open_license', label: label('オープンライセンス', 'Open license') },
            { value: 'quotation', label: label('引用の範囲で利用', 'Quotation only') },
            { value: 'permission', label: label('許諾取得済み', 'Permission granted') },
            { value: 'restricted', label: label('利用制限あり', 'Restricted') },
            { value: 'unknown', label: label('不明', 'Unknown') },
          ],
        },
        { name: 'attributionRequirements', type: 'textarea', label: label('表示義務', 'Attribution requirements') },
      ],
    },
    {
      name: 'contentAccessed',
      type: 'checkbox',
      defaultValue: false,
      label: label('内容を実際に確認した', 'Contents actually consulted'),
      access: editorOnlyAccess,
      admin: {
        position: 'sidebar',
        description: label(
          '編集者が原典（または承認済み抜粋）を実際に読んだ場合のみチェックしてください。',
          'Check only if an editor actually read the original or approved excerpts.',
        ),
      },
    },
    { name: 'accessedAt', type: 'date', label: label('確認日', 'Accessed on'), admin: { position: 'sidebar' } },
    {
      name: 'verificationStatus',
      type: 'select',
      required: true,
      defaultValue: 'unverified',
      label: label('検証ステータス', 'Verification status'),
      options: SOURCE_VERIFICATION_STATUSES,
      access: editorOnlyAccess,
      admin: { position: 'sidebar' },
    },
    {
      name: 'verifiedBy',
      type: 'relationship',
      relationTo: 'users',
      label: label('検証者', 'Verified by'),
      access: { ...editorOnlyAccess, read: isStaffField },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'lastVerifiedAt',
      type: 'date',
      label: label('最終検証日', 'Last verified'),
      access: editorOnlyAccess,
      admin: { position: 'sidebar', readOnly: true },
    },
    { ...authorField, label: label('登録者', 'Added by'), access: { ...authorField.access, read: isStaffField } },
  ],
}
