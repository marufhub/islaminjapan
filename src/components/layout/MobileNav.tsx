'use client'

import { useEffect, useId, useState } from 'react'

import type { NavItem } from '@/lib/site'

type MobileNavProps = { items: NavItem[]; menuLabel: string; closeLabel: string; navLabel: string }

export function MobileNav({ items, menuLabel, closeLabel, navLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="whitespace-nowrap rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium"
      >
        {open ? closeLabel : menuLabel}
      </button>
      <nav id={panelId} aria-label={navLabel} hidden={!open} className="absolute inset-x-0 top-full border-b border-line bg-ivory shadow-sm">
        <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
          {items.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="block border-b border-line/60 py-3 text-charcoal no-underline last:border-0">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
