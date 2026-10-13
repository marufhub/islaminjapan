import type { ReactNode } from 'react'

import type { Crumb } from '@/lib/seo/jsonLd'

import { Breadcrumbs } from './Breadcrumbs'
import { Container } from './Container'

type PageHeaderProps = {
  title: string
  intro?: string | null
  crumbs: Crumb[]
  breadcrumbLabel: string
  children?: ReactNode
}

export function PageHeader({ title, intro, crumbs, breadcrumbLabel, children }: PageHeaderProps) {
  return (
    <header className="geometric-motif border-b border-line">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs crumbs={crumbs} label={breadcrumbLabel} />
        <h1 className="mt-6 text-3xl font-bold text-primary sm:text-4xl">{title}</h1>
        {intro ? <p className="mt-4 max-w-3xl text-lg">{intro}</p> : null}
        {children}
      </Container>
    </header>
  )
}
