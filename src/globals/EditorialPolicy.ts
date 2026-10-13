import type { GlobalConfig } from 'payload'

import { label } from '@/lib/i18n/config'

import { publicReadAdminWrite } from './access'

/** Policy pages (editorial, sources, privacy). Privacy text requires legal review before launch. */
export const EditorialPolicy: GlobalConfig = {
  slug: 'editorial-policy',
  label: label('編集方針・ポリシー', 'Policies'),
  admin: { group: label('設定', 'Settings') },
  access: publicReadAdminWrite,
  versions: { drafts: false, max: 20 },
  fields: [
    { name: 'editorialPolicy', type: 'richText', localized: true, label: label('編集方針', 'Editorial policy') },
    { name: 'sourcesPolicy', type: 'richText', localized: true, label: label('出典・引用の方針', 'Sources & references policy') },
    { name: 'privacyPolicy', type: 'richText', localized: true, label: label('プライバシーポリシー', 'Privacy policy') },
    { name: 'lastUpdated', type: 'date', label: label('最終更新日', 'Last updated') },
  ],
}
