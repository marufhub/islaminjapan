'use client'

import { useTranslation } from '@payloadcms/ui'
import Link from 'next/link'

/** Admin sidebar link to the AI Content Studio. */
export function AIStudioNavLink() {
  const { i18n } = useTranslation()
  return (
    <Link href="/admin/ai-studio" className="nav__link" style={{ marginTop: '1rem', display: 'block' }}>
      <span className="nav__link-label">{i18n.language === 'ja' ? 'AI記事作成（AI Studio）' : 'AI Content Studio'}</span>
    </Link>
  )
}
