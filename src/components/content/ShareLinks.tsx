import type { Dictionary } from '@/lib/i18n/dictionaries'

/** Plain share links — no third-party scripts or trackers are loaded. */
export function ShareLinks({ url, title, dict }: { url: string; title: string; dict: Dictionary }) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  return (
    <aside aria-label={dict.ui.share} className="mt-12 flex flex-wrap items-center gap-4 border-t border-line pt-6 text-sm">
      <span className="text-muted">{dict.ui.share}:</span>
      <a href={`https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`} rel="noopener noreferrer" target="_blank">
        {dict.ui.shareOnX}
      </a>
      <a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}>{dict.ui.shareByEmail}</a>
    </aside>
  )
}
