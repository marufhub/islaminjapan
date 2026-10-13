import type { GlobalConfig } from 'payload'

import { isEditorOrAdminField } from '@/access/roles'
import { label } from '@/lib/i18n/config'

import { publicReadAdminWrite } from './access'

export const ContactSettings: GlobalConfig = {
  slug: 'contact-settings',
  label: label('お問い合わせ設定', 'Contact settings'),
  admin: { group: label('設定', 'Settings') },
  access: publicReadAdminWrite,
  fields: [
    { name: 'intro', type: 'textarea', localized: true, label: label('案内文', 'Introduction') },
    { name: 'privacyNotice', type: 'textarea', localized: true, label: label('個人情報の取り扱い', 'Privacy notice') },
    {
      name: 'recipientEmail',
      type: 'email',
      label: label('通知先メールアドレス', 'Notification recipient'),
      access: { read: isEditorOrAdminField },
      admin: { description: label('サイトには表示されません。', 'Never shown on the site.') },
    },
  ],
}
