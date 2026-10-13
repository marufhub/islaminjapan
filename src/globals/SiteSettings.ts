import type { GlobalConfig } from 'payload'

import { isAdminField } from '@/access/roles'
import { label } from '@/lib/i18n/config'

import { publicReadAdminWrite } from './access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: label('サイト設定', 'Site settings'),
  admin: { group: label('設定', 'Settings') },
  access: publicReadAdminWrite,
  fields: [
    { name: 'siteName', type: 'text', required: true, localized: true, label: label('サイト名', 'Site name') },
    { name: 'tagline', type: 'text', localized: true, label: label('キャッチコピー', 'Tagline') },
    { name: 'defaultDescription', type: 'textarea', localized: true, label: label('サイトの説明（SEO）', 'Default meta description') },
    { name: 'defaultOgImage', type: 'upload', relationTo: 'media', label: label('既定のOGP画像', 'Default social image') },
    {
      type: 'collapsible',
      label: label('運営者情報', 'Organization'),
      admin: {
        description: label(
          '実際の運営者情報のみ入力してください。空欄の項目はサイトに表示されません。',
          'Enter only real organization details. Empty fields are not shown on the site.',
        ),
      },
      fields: [
        { name: 'organizationName', type: 'text', localized: true, label: label('運営者名', 'Organization name') },
        { name: 'representative', type: 'text', localized: true, label: label('代表者', 'Representative') },
        { name: 'address', type: 'textarea', localized: true, label: label('所在地', 'Address') },
        { name: 'publicEmail', type: 'email', label: label('公開用メールアドレス', 'Public email') },
        { name: 'legalNotes', type: 'textarea', localized: true, label: label('法的情報', 'Legal information') },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: label('SNSリンク', 'Social links'),
      fields: [
        { name: 'platform', type: 'text', required: true, label: label('サービス名', 'Platform') },
        { name: 'url', type: 'text', required: true, label: 'URL' },
      ],
    },
    {
      name: 'allowIndexing',
      type: 'checkbox',
      defaultValue: false,
      label: label('検索エンジンのインデックスを許可', 'Allow search engine indexing'),
      access: { update: isAdminField },
      admin: { description: label('本番公開の準備が整ってから有効にしてください。', 'Enable only when ready for public launch.') },
    },
  ],
}
