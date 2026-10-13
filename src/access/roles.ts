import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

export const ROLES = ['admin', 'editor', 'author'] as const
export type Role = (typeof ROLES)[number]

type MaybeUser = { id?: number | string; role?: Role | null } | null | undefined

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user?.role && roles.includes(user.role))

/** Admins and editors may review, approve and publish. Authors may not. */
export const canPublish = (user: MaybeUser): boolean => hasRole(user, 'admin', 'editor')

const userOf = (req: PayloadRequest): MaybeUser => req.user as MaybeUser

export const isAdmin: Access = ({ req }) => hasRole(userOf(req), 'admin')
export const isEditorOrAdmin: Access = ({ req }) => canPublish(userOf(req))
/** Any authenticated CMS user (admin, editor or author). */
export const isStaff: Access = ({ req }) => Boolean(userOf(req))

export const isAdminField: FieldAccess = ({ req }) => hasRole(userOf(req), 'admin')
export const isEditorOrAdminField: FieldAccess = ({ req }) => canPublish(userOf(req))
export const isStaffField: FieldAccess = ({ req }) => Boolean(userOf(req))

/** Staff see everything (incl. drafts); the public only sees published documents. */
export const publishedOrStaff: Access = ({ req }) =>
  userOf(req) ? true : { _status: { equals: 'published' } }

/**
 * For collections with per-locale publication (`publishedLocales`):
 * the public sees a document only when it is published AND enabled for the requested locale.
 */
export const publishedInLocaleOrStaff: Access = ({ req }) => {
  if (userOf(req)) return true
  const locale = typeof req.locale === 'string' ? req.locale : 'ja'
  const where: Where = {
    and: [{ _status: { equals: 'published' } }, { publishedLocales: { in: [locale] } }],
  }
  return where
}

/** Editors/admins can update anything; authors only documents they own. */
export const editorOrOwner: Access = ({ req }) => {
  const user = userOf(req)
  if (!user) return false
  if (canPublish(user)) return true
  return { author: { equals: user.id } }
}
