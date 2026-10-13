import { DefaultTemplate } from '@payloadcms/next/templates'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { aiConfig, isAIConfigured } from '@/lib/ai/config'
import type { User } from '@/payload-types'

import { AIStudioClient, type StudioSourceOption } from './AIStudioClient'

/**
 * AI Content Studio admin view. Custom Payload views are not protected automatically, so the
 * session is checked here; every API call is authorized again on the server.
 */
export async function AIStudioView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, visibleEntities, permissions, locale } = initPageResult
  const user = req.user as User | null
  if (!user) redirect('/admin/login?redirect=%2Fadmin%2Fai-studio')

  const sources = await req.payload.find({
    collection: 'sources',
    where: { verificationStatus: { equals: 'verified' } },
    // Large enough for the editorial team's library; the picker lists the first 1000 alphabetically.
    limit: 1000,
    depth: 0,
    sort: 'title',
    select: { title: true, excerpts: true, publicationYear: true },
    user,
    overrideAccess: false,
  })
  const sourceOptions: StudioSourceOption[] = sources.docs.map((source) => ({
    id: source.id,
    title: source.title,
    year: source.publicationYear ?? null,
    excerptCount: source.excerpts?.length ?? 0,
  }))
  const config = aiConfig()

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <AIStudioClient
        uiLanguage={req.i18n.language === 'en' ? 'en' : 'ja'}
        configured={isAIConfigured()}
        models={config.models}
        role={user.role}
        sources={sourceOptions}
      />
    </DefaultTemplate>
  )
}
