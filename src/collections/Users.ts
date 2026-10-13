import type { CollectionBeforeChangeHook, CollectionConfig, FieldAccess } from 'payload'

import { canPublish, hasRole, isAdmin, ROLES, type Role } from '@/access/roles'
import { label } from '@/lib/i18n/config'

const ROLE_LABELS: Record<Role, Record<'ja' | 'en', string>> = {
  admin: label('管理者', 'Admin'),
  editor: label('編集者', 'Editor'),
  author: label('著者', 'Author'),
}

const noUsersExist = async (req: Parameters<FieldAccess>[0]['req']): Promise<boolean> =>
  (await req.payload.count({ collection: 'users', req })).totalDocs === 0

/** Only admins assign roles. The very first account is promoted by `firstUserIsAdmin`. */
const canSetRole: FieldAccess = ({ req }) => hasRole(req.user as { role?: Role }, 'admin')

const firstUserIsAdmin: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  return (await noUsersExist(req)) ? { ...data, role: 'admin' } : data
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: label('ユーザー', 'User'), plural: label('ユーザー', 'Users') },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: label('設定', 'Settings'),
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: isAdmin,
    // Editors need the staff list to assign reviewers; authors only see their own account.
    read: ({ req }) => {
      if (canPublish(req.user as { role?: Role })) return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    update: ({ req }) => {
      if (hasRole(req.user as { role?: Role }, 'admin')) return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    delete: isAdmin,
  },
  hooks: { beforeChange: [firstUserIsAdmin] },
  fields: [
    { name: 'name', type: 'text', required: true, label: label('表示名', 'Display name') },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'author',
      saveToJWT: true,
      label: label('権限', 'Role'),
      options: ROLES.map((value) => ({ value, label: ROLE_LABELS[value] })),
      access: { create: canSetRole, update: canSetRole },
      admin: {
        position: 'sidebar',
        description: label(
          '著者: 下書きの作成・編集 / 編集者: レビュー・承認・公開 / 管理者: すべて',
          'Author: write drafts / Editor: review, approve, publish / Admin: everything',
        ),
      },
    },
  ],
}
