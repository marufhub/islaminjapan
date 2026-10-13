import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { safePreviewPath } from '@/lib/preview'

/**
 * Enables draft preview for signed-in CMS users only. The Payload session cookie is verified on
 * every preview request (see getViewer), so a leaked preview URL grants nothing to the public.
 */
export async function GET(request: NextRequest) {
  const path = safePreviewPath(request.nextUrl.searchParams.get('path'))
  if (!path) return new Response('Invalid preview path', { status: 400 })

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Sign in to the CMS to preview drafts', { status: 401 })

  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
