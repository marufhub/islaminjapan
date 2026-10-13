import type { CollectionConfig } from 'payload'

import { isAdmin, isEditorOrAdmin } from '@/access/roles'
import { label } from '@/lib/i18n/config'

/**
 * Inquiries from the public contact form. Created only by the server-side form handler
 * (never through the public API) and visible only to editors and admins.
 */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: { singular: label('お問い合わせ', 'Inquiry'), plural: label('お問い合わせ', 'Inquiries') },
  admin: {
    useAsTitle: 'subject',
    group: label('運営', 'Operations'),
    defaultColumns: ['subject', 'name', 'status', 'deliveryStatus', 'createdAt'],
    description: label(
      '個人情報を含みます。対応後は不要な情報を削除してください。',
      'Contains personal data. Delete what is no longer needed once handled.',
    ),
  },
  access: {
    create: () => false,
    read: isEditorOrAdmin,
    update: isEditorOrAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: label('お名前', 'Name') },
    { name: 'email', type: 'email', required: true, label: label('メールアドレス', 'Email') },
    { name: 'subject', type: 'text', required: true, label: label('件名', 'Subject') },
    { name: 'message', type: 'textarea', required: true, label: label('内容', 'Message') },
    {
      name: 'locale',
      type: 'select',
      options: ['ja', 'en'],
      label: label('送信時の言語', 'Language'),
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      label: label('対応状況', 'Status'),
      options: [
        { value: 'new', label: label('未対応', 'New') },
        { value: 'in_progress', label: label('対応中', 'In progress') },
        { value: 'answered', label: label('回答済み', 'Answered') },
        { value: 'spam', label: label('スパム', 'Spam') },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'deliveryStatus',
      type: 'select',
      defaultValue: 'not_configured',
      label: label('メール通知', 'Email notification'),
      options: [
        { value: 'sent', label: label('送信済み', 'Sent') },
        { value: 'failed', label: label('送信失敗', 'Failed') },
        { value: 'not_configured', label: label('メール未設定（管理画面のみ）', 'Email not configured (admin queue only)') },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'requesterHash',
      type: 'text',
      index: true,
      admin: { hidden: true },
      // Salted hash of the client IP used only for rate limiting; the raw IP is never stored.
    },
    { name: 'internalNotes', type: 'textarea', label: label('対応メモ', 'Internal notes') },
  ],
}
