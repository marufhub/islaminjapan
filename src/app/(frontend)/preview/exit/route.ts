import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { safePreviewPath } from '@/lib/preview'

export async function GET(request: NextRequest) {
  const draft = await draftMode()
  draft.disable()
  redirect(safePreviewPath(request.nextUrl.searchParams.get('path')) ?? '/ja')
}
