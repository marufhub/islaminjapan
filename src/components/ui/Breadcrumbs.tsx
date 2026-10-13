import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, type Crumb } from '@/lib/seo/jsonLd'

/** Visible breadcrumb trail plus matching BreadcrumbList structured data. The last crumb is the current page. */
export function Breadcrumbs({ crumbs, label }: { crumbs: Crumb[]; label: string }) {
  return (
    <>
      <nav aria-label={label} className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {crumbs.map((crumb, index) => {
            const isCurrent = index === crumbs.length - 1
            return (
              <li key={crumb.path} className="flex items-center gap-2">
                {isCurrent ? (
                  <span aria-current="page" className="text-charcoal">
                    {crumb.name}
                  </span>
                ) : (
                  <>
                    <a href={crumb.path} className="text-muted">
                      {crumb.name}
                    </a>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  )
}
