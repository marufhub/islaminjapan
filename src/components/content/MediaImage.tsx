import Image from 'next/image'

import type { Media } from '@/payload-types'

type MediaImageProps = {
  media: Media | number | null | undefined
  aiLabel?: string
  className?: string
  sizes?: string
  priority?: boolean
  showCaption?: boolean
}

/** Renders a CMS image with alt text, caption, credit and an explicit label for AI-generated images. */
export function MediaImage({ media, aiLabel, className = '', sizes = '100vw', priority = false, showCaption = true }: MediaImageProps) {
  if (!media || typeof media !== 'object' || !media.url) return null
  const caption = [media.caption, media.originalDate, media.credit].filter(Boolean).join(' — ')
  return (
    <figure className={className}>
      <Image
        src={media.url}
        alt={media.alt ?? ''}
        width={media.width ?? 1200}
        height={media.height ?? 800}
        sizes={sizes}
        priority={priority}
        unoptimized={!media.url.startsWith('/')}
        className="h-auto w-full rounded-lg"
      />
      {showCaption && (caption || media.isAIGenerated) ? (
        <figcaption className="mt-2 text-sm text-muted">
          {media.isAIGenerated && aiLabel ? <strong className="mr-2 text-charcoal">{aiLabel}</strong> : null}
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
