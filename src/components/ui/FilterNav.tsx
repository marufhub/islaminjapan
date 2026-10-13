type FilterOption = { label: string; href: string; active: boolean }

/** Filter links (not buttons) so every filtered view has its own URL and works without JavaScript. */
export function FilterNav({ label, options }: { label: string; options: FilterOption[] }) {
  return (
    <nav aria-label={label}>
      <p className="mb-2 text-sm font-medium text-muted">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => (
          <li key={option.href}>
            <a
              href={option.href}
              aria-current={option.active ? 'true' : undefined}
              className={`block rounded-full border px-3 py-1 text-sm no-underline ${
                option.active ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-charcoal hover:border-primary'
              }`}
            >
              {option.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
