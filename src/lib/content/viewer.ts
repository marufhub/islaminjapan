import { draftMode, headers } from 'next/headers'
import { cache } from 'react'

import type { User } from '@/payload-types'

import { getPayloadClient } from '../payload'

export type Viewer = { user: User | null; isPreview: boolean }

/**
 * Draft preview is only active when Next.js draft mode is on AND the request carries a valid
 * CMS session. Everyone else is an anonymous public reader subject to published-only access.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return { user: null, isPreview: false }
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return user ? { user: user as User, isPreview: true } : { user: null, isPreview: false }
})

/** Local API options that apply access control as the current viewer. */
export const viewerQueryOptions = (viewer: Viewer) => ({
  overrideAccess: false,
  draft: viewer.isPreview,
  user: viewer.user ?? undefined,
})
