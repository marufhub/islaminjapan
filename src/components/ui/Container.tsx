import type { ReactNode } from 'react'

type ContainerProps = { children: ReactNode; className?: string; size?: 'wide' | 'reading' }

/** Consistent page gutters. `reading` keeps line length comfortable for long-form text. */
export function Container({ children, className = '', size = 'wide' }: ContainerProps) {
  const width = size === 'reading' ? 'max-w-3xl' : 'max-w-6xl'
  return <div className={`mx-auto w-full ${width} px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}
