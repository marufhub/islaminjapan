type SearchFormProps = {
  action: string
  defaultValue?: string
  label: string
  placeholder: string
  buttonLabel: string
  /** Extra filters to preserve as hidden fields. */
  hidden?: Record<string, string | undefined>
}

/** Plain GET form: works without JavaScript and produces shareable, crawl-safe URLs. */
export function SearchForm({ action, defaultValue, label, placeholder, buttonLabel, hidden = {} }: SearchFormProps) {
  return (
    <form action={action} method="get" role="search" className="flex w-full max-w-xl gap-2">
      {Object.entries(hidden).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}
      <label className="sr-only" htmlFor={`search-${action}`}>
        {label}
      </label>
      <input
        id={`search-${action}`}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={100}
        className="min-w-0 flex-1 rounded-md border border-line bg-surface px-4 py-2 text-base"
      />
      <button type="submit" className="shrink-0 rounded-md bg-primary px-5 py-2 font-medium text-white hover:bg-primary-dark">
        {buttonLabel}
      </button>
    </form>
  )
}
