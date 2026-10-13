import type { GlobalConfig } from 'payload'

import { label } from '@/lib/i18n/config'

import { publishedReadEditorWrite } from './access'
import { validateHref } from './linkFields'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: label('トップページ', 'Homepage'),
  admin: { group: label('サイト構成', 'Site structure') },
  access: publishedReadEditorWrite,
  versions: { drafts: true, max: 20 },
  fields: [
    { name: 'heroTitle', type: 'text', required: true, localized: true, label: label('見出し', 'Hero title') },
    { name: 'heroIntro', type: 'textarea', localized: true, label: label('紹介文', 'Introduction') },
    {
      name: 'pathways',
      type: 'array',
      label: label('3つの入口', 'Visitor pathways'),
      minRows: 0,
      maxRows: 3,
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, label: label('タイトル', 'Title') },
        { name: 'description', type: 'textarea', localized: true, label: label('説明', 'Description') },
        { name: 'href', type: 'text', required: true, validate: validateHref, label: label('リンク先', 'Link') },
      ],
    },
    { name: 'featuredArticles', type: 'relationship', relationTo: 'articles', hasMany: true, maxRows: 6, label: label('注目のテーマ', 'Featured topics') },
    { name: 'featuredFaqs', type: 'relationship', relationTo: 'faqs', hasMany: true, maxRows: 6, label: label('おすすめQ&A', 'Recommended FAQs') },
    { name: 'contactInvitation', type: 'textarea', localized: true, label: label('お問い合わせへの案内', 'Contact invitation') },
  ],
}
