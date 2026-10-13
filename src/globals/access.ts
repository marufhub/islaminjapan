import type { GlobalConfig } from 'payload'

import { isAdmin, isEditorOrAdmin, publishedOrStaff } from '@/access/roles'

export const publicReadEditorWrite: GlobalConfig['access'] = { read: () => true, update: isEditorOrAdmin }
export const publicReadAdminWrite: GlobalConfig['access'] = { read: () => true, update: isAdmin }

/** For globals with drafts: the public only sees the published version. */
export const publishedReadEditorWrite: GlobalConfig['access'] = { read: publishedOrStaff, update: isEditorOrAdmin }
export const publishedReadAdminWrite: GlobalConfig['access'] = { read: publishedOrStaff, update: isAdmin }
