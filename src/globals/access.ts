import type { GlobalConfig } from 'payload'

import { isAdmin, isEditorOrAdmin } from '@/access/roles'

export const publicReadEditorWrite: GlobalConfig['access'] = { read: () => true, update: isEditorOrAdmin }
export const publicReadAdminWrite: GlobalConfig['access'] = { read: () => true, update: isAdmin }
