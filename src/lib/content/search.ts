const MAX_QUERY_LENGTH = 100

/**
 * Normalizes a user search query: removes SQL LIKE wildcards (the database adapter does not escape
 * them), collapses whitespace including full-width spaces, and limits length.
 */
export const normalizeQuery = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.replace(/[%_\\]/g, ' ').replace(/[\s\u3000]+/g, ' ').trim().slice(0, MAX_QUERY_LENGTH)
}

export const parsePage = (value: unknown): number => {
  const page = Number.parseInt(typeof value === 'string' ? value : '', 10)
  return Number.isFinite(page) && page > 0 && page < 10_000 ? page : 1
}

/** Reads a single-valued search param that may arrive as an array. */
export const firstParam = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value
