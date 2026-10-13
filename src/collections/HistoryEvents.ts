import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { editorOrOwner, isEditorOrAdmin, isStaff, isStaffField, publishedInLocaleOrStaff } from '@/access/roles'
import { authorField, editorialStatusField, editorOnlyAccess, publishedLocalesField } from '@/fields/shared'
import { enforceEditorialWorkflow, WorkflowError } from '@/hooks/editorialWorkflow'
import { requireFactChecked, requireReviewer, requireVerifiedSources } from '@/hooks/publishChecks'
import { disablePublicLocaleFallback, trackDraftSave } from '@/hooks/requestGuards'
import { computeSortKey, DATE_PRECISIONS, validateHistoryDate, type HistoryDate } from '@/lib/history/dates'
import { HISTORY_PERIODS, periodForYear } from '@/lib/history/periods'
import { label } from '@/lib/i18n/config'

const PRECISION_LABELS: Record<(typeof DATE_PRECISIONS)[number], Record<'ja' | 'en', string>> = {
  day: label('年月日まで確定', 'Exact day'),
  month: label('年月まで確定', 'Month'),
  year: label('年のみ確定', 'Year'),
  circa: label('おおよその年（頃）', 'Approximate (circa)'),
  decade: label('年代', 'Decade'),
  range: label('期間', 'Range'),
  unknown: label('不明', 'Unknown'),
}

const VERIFICATION_STATUSES = [
  { value: 'unverified', label: label('未検証', 'Unverified') },
  { value: 'in_research', label: label('調査中', 'In research') },
  { value: 'verified', label: label('検証済み', 'Verified') },
  { value: 'disputed', label: label('諸説あり', 'Disputed') },
]

const requireSupportingSource = (doc: Record<string, unknown>) =>
  Array.isArray(doc.sources) && doc.sources.length > 0
    ? null
    : '年表の項目には検証済みの出典が1件以上必要です (History events need at least one verified source).'

/** Validates date parts, derives the timeline sort key and default period. */
const deriveTimelineFields: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const date: HistoryDate = { ...(originalDoc?.date ?? {}), ...(data.date ?? {}) }
  const error = validateHistoryDate(date)
  if (error) throw new WorkflowError(`日付が不正です: ${error}`)

  const computed = computeSortKey(date)
  const sortKey = computed ?? data.sortKey ?? originalDoc?.sortKey
  if (sortKey == null) {
    throw new WorkflowError('日付が不明な場合は並び順キーを入力してください (Enter a sort key when the date is unknown).')
  }
  // The period follows the evidence: recomputed whenever the start year is known, manual otherwise.
  const period =
    date.startYear != null ? periodForYear(date.startYear) : (data.period ?? originalDoc?.period)
  return { ...data, sortKey, period }
}

export const HistoryEvents: CollectionConfig = {
  slug: 'history-events',
  // Scope: the history of Islam and Muslim communities in Japan — not general Japanese history.
  labels: {
    singular: label('日本におけるイスラームの歴史：年表項目', 'History of Islam in Japan event'),
    plural: label('日本におけるイスラームの歴史（年表）', 'History of Islam in Japan events'),
  },
  admin: {
    useAsTitle: 'title',
    group: label('コンテンツ', 'Content'),
    defaultColumns: ['title', 'sortKey', 'period', 'verificationStatus', '_status'],
    preview: (doc, { locale }) =>
      doc?.id ? `/preview?path=${encodeURIComponent(`/${locale === 'en' ? 'en' : 'ja'}/history-of-islam-in-japan/events/${String(doc.id)}`)}` : null,
  },
  access: {
    read: publishedInLocaleOrStaff,
    readVersions: isStaff,
    create: isStaff,
    update: editorOrOwner,
    delete: isEditorOrAdmin,
  },
  defaultSort: 'sortKey',
  versions: { drafts: true, maxPerDoc: 50 },
  hooks: {
    beforeOperation: [trackDraftSave, disablePublicLocaleFallback],
    beforeChange: [
      deriveTimelineFields,
      enforceEditorialWorkflow([
        requireFactChecked,
        requireReviewer,
        requireSupportingSource,
        requireVerifiedSources((doc) => [
          doc.sources,
          ...(Array.isArray(doc.conflictingAccounts) ? doc.conflictingAccounts.map((account) => (account as Record<string, unknown>)?.sources) : []),
        ]),
      ]),
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: label('タイトル', 'Title') },
    { name: 'summary', type: 'textarea', localized: true, label: label('概要', 'Summary') },
    { name: 'body', type: 'richText', localized: true, label: label('詳細', 'Details') },
    {
      name: 'date',
      type: 'group',
      label: label('日付', 'Date'),
      admin: {
        description: label(
          '確認できた精度のみ入力してください。推測で日付を補完しないでください。',
          'Enter only the precision the evidence supports. Never fill in guessed dates.',
        ),
      },
      fields: [
        {
          name: 'precision',
          type: 'select',
          required: true,
          defaultValue: 'year',
          label: label('精度', 'Precision'),
          options: DATE_PRECISIONS.map((value) => ({ value, label: PRECISION_LABELS[value] })),
        },
        {
          type: 'row',
          fields: [
            { name: 'startYear', type: 'number', label: label('開始年', 'Start year') },
            { name: 'startMonth', type: 'number', min: 1, max: 12, label: label('月', 'Month') },
            { name: 'startDay', type: 'number', min: 1, max: 31, label: label('日', 'Day') },
          ],
        },
        {
          type: 'row',
          admin: { condition: (_, siblingData) => siblingData?.precision === 'range' },
          fields: [
            { name: 'endYear', type: 'number', label: label('終了年', 'End year') },
            { name: 'endMonth', type: 'number', min: 1, max: 12, label: label('月', 'Month') },
            { name: 'endDay', type: 'number', min: 1, max: 31, label: label('日', 'Day') },
          ],
        },
      ],
    },
    {
      name: 'dateDisplayOverride',
      type: 'text',
      localized: true,
      label: label('日付の表示（任意）', 'Date display override'),
      admin: { description: label('例: 「1930年代後半」', 'e.g. "late 1930s"') },
    },
    { name: 'uncertaintyNotes', type: 'textarea', localized: true, label: label('不確実性に関する注記', 'Uncertainty notes') },
    {
      name: 'conflictingAccounts',
      type: 'array',
      label: label('異なる説・記録', 'Conflicting accounts'),
      fields: [
        { name: 'account', type: 'textarea', required: true, localized: true, label: label('内容', 'Account') },
        { name: 'sources', type: 'relationship', relationTo: 'sources', hasMany: true, label: label('出典', 'Sources') },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'period',
          type: 'select',
          label: label('時代', 'Period'),
          options: HISTORY_PERIODS.map(({ value, ja, en }) => ({ value, label: { ja, en } })),
          admin: { description: label('開始年から自動設定（年代不明の場合のみ手入力）', 'Derived from the start year; set manually only for unknown dates') },
        },
        { name: 'location', type: 'text', localized: true, label: label('場所', 'Location') },
      ],
    },
    {
      name: 'subjects',
      type: 'select',
      hasMany: true,
      label: label('主題', 'Subjects'),
      options: [
        { value: 'people', label: label('人物', 'People') },
        { value: 'organizations', label: label('団体', 'Organizations') },
        { value: 'mosques', label: label('モスク', 'Mosques') },
        { value: 'communities', label: label('コミュニティ', 'Communities') },
        { value: 'diplomacy', label: label('外交・交流', 'Diplomacy & exchange') },
        { value: 'education', label: label('教育・出版', 'Education & publishing') },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: label('画像', 'Images'),
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: label('画像', 'Image') },
        { name: 'caption', type: 'text', localized: true, label: label('キャプション', 'Caption') },
      ],
    },
    { name: 'relatedArticles', type: 'relationship', relationTo: 'articles', hasMany: true, label: label('関連記事', 'Related articles') },
    { name: 'sources', type: 'relationship', relationTo: 'sources', hasMany: true, label: label('出典', 'Sources') },
    {
      name: 'sortKey',
      type: 'number',
      index: true,
      label: label('並び順キー', 'Timeline sort key'),
      admin: {
        position: 'sidebar',
        description: label('日付から自動計算（不明の場合のみ手入力）', 'Computed from the date; enter manually only for unknown dates'),
      },
    },
    {
      name: 'verificationStatus',
      type: 'select',
      required: true,
      defaultValue: 'unverified',
      label: label('事実確認', 'Fact-check status'),
      options: VERIFICATION_STATUSES,
      access: editorOnlyAccess,
      admin: { position: 'sidebar' },
    },
    { name: 'verificationNotes', type: 'textarea', label: label('検証メモ', 'Verification notes'), access: { read: isStaffField }, admin: { position: 'sidebar' } },
    {
      name: 'reviewer',
      type: 'relationship',
      relationTo: 'users',
      label: label('レビュー承認者', 'Approved by reviewer'),
      // Internal: the public page shows only the reviewer's display name, resolved server-side.
      access: { ...editorOnlyAccess, read: isStaffField },
      admin: { position: 'sidebar', description: label('公開には承認者の設定が必要です。', 'A reviewer is required before publishing.') },
    },
    { name: 'lastReviewedAt', type: 'date', label: label('最終レビュー日', 'Last reviewed'), access: { ...editorOnlyAccess, read: isStaffField }, admin: { position: 'sidebar' } },
    publishedLocalesField,
    editorialStatusField,
    authorField,
  ],
}
