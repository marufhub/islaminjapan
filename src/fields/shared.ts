import { randomUUID } from 'node:crypto'
import type { Field, FieldHook, RelationshipField, TextareaField } from 'payload'

import { canPublish, isEditorOrAdminField } from '@/access/roles'
import { EDITORIAL_STATUSES } from '@/hooks/editorialWorkflow'
import { label, LOCALE_OPTIONS } from '@/lib/i18n/config'

const EDITORIAL_STATUS_LABELS: Record<(typeof EDITORIAL_STATUSES)[number], Record<'ja' | 'en', string>> = {
  idea: label('アイデア', 'Idea'),
  researching: label('調査中', 'Researching'),
  draft: label('下書き', 'Draft'),
  in_review: label('レビュー中', 'In review'),
  approved: label('承認済み', 'Approved'),
}

export const editorialStatusField: Field = {
  name: 'editorialStatus',
  type: 'select',
  label: label('編集ステータス', 'Editorial status'),
  defaultValue: 'draft',
  required: true,
  options: EDITORIAL_STATUSES.map((value) => ({ value, label: EDITORIAL_STATUS_LABELS[value] })),
  admin: {
    position: 'sidebar',
    description: label(
      '公開には「承認済み」が必要です。承認・公開は編集者のみ可能です。',
      'Publishing requires "Approved". Only editors can approve and publish.',
    ),
  },
}

/** Editor-only on both create and update (update-only access would let authors set it at creation). */
export const editorOnlyAccess = { create: isEditorOrAdminField, update: isEditorOrAdminField }

/** New documents belong to their creator; only editors may create on someone else's behalf. */
const defaultToCurrentUser: FieldHook = ({ value, req, operation }) => {
  if (operation !== 'create' || !req.user) return value
  if (!canPublish(req.user as never)) return req.user.id
  return value ?? req.user.id
}

/** Owning author. Defaults to the creator; only editors can reassign it. */
export const authorField: RelationshipField = {
  name: 'author',
  type: 'relationship',
  relationTo: 'users',
  label: label('著者', 'Author'),
  access: editorOnlyAccess,
  hooks: { beforeChange: [defaultToCurrentUser] },
  admin: { position: 'sidebar' },
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')

const fillSlug: FieldHook = ({ value, siblingData }) => {
  if (typeof value === 'string' && value.length > 0) return value
  const title = typeof siblingData?.title === 'string' ? siblingData.title : ''
  return slugify(title) || value
}

/** URL slug (ASCII). Auto-generated from English titles; Japanese titles need a manual slug. */
export const slugField: Field = {
  name: 'slug',
  type: 'text',
  label: label('スラッグ（URL）', 'Slug (URL)'),
  index: true,
  required: true,
  hooks: { beforeValidate: [fillSlug] },
  validate: (value: unknown) =>
    typeof value === 'string' && SLUG_PATTERN.test(value)
      ? true
      : '半角英小文字・数字・ハイフンで入力してください (lowercase letters, numbers and hyphens only)',
  admin: {
    position: 'sidebar',
    description: label('例: what-is-islam', 'e.g. what-is-islam'),
  },
}

export const languageField: Field = {
  name: 'language',
  type: 'select',
  label: label('言語', 'Language'),
  required: true,
  defaultValue: 'ja',
  options: [...LOCALE_OPTIONS],
  index: true,
  admin: { position: 'sidebar' },
}

export const translationGroupField: Field = {
  name: 'translationGroup',
  type: 'text',
  label: label('翻訳グループID', 'Translation group ID'),
  index: true,
  defaultValue: () => randomUUID(),
  admin: {
    position: 'sidebar',
    description: label(
      '日本語版と英語版で同じIDを使うと翻訳として関連付けられます。',
      'Japanese and English versions sharing this ID are linked as translations.',
    ),
  },
}

/** Per-locale publication switch for documents with localized fields. Editors only. */
export const publishedLocalesField: Field = {
  name: 'publishedLocales',
  type: 'select',
  hasMany: true,
  label: label('公開する言語', 'Published languages'),
  options: [...LOCALE_OPTIONS],
  defaultValue: [],
  access: editorOnlyAccess,
  admin: {
    position: 'sidebar',
    description: label(
      'レビュー済みの言語のみ選択してください。未選択の言語では公開されません。',
      'Select only reviewed languages. The document is hidden in other languages.',
    ),
  },
}

/** Hidden plain-text index maintained by `buildSearchText`; never edited by hand. */
export const searchTextField: TextareaField = {
  name: 'searchText',
  type: 'textarea',
  admin: { hidden: true },
  access: { create: () => false, update: () => false },
}

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    { name: 'title', type: 'text', label: label('SEOタイトル', 'SEO title'), maxLength: 70 },
    {
      name: 'description',
      type: 'textarea',
      label: label('メタディスクリプション', 'Meta description'),
      maxLength: 160,
    },
  ],
}
