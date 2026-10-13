type PaginationProps = {
  page: number
  totalPages: number
  hrefForPage: (page: number) => string
  labels: { nav: string; previous: string; next: string; pageOf: (page: number, total: number) => string }
}

export function Pagination({ page, totalPages, hrefForPage, labels }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label={labels.nav} className="mt-10 flex items-center justify-between gap-4 text-sm">
      {page > 1 ? <a href={hrefForPage(page - 1)} rel="prev">← {labels.previous}</a> : <span />}
      <span className="text-muted">{labels.pageOf(page, totalPages)}</span>
      {page < totalPages ? <a href={hrefForPage(page + 1)} rel="next">{labels.next} →</a> : <span />}
    </nav>
  )
}
