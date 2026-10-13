import { describe, expect, it } from 'vitest'

import { computeSortKey, formatHistoryDate, validateHistoryDate } from '@/lib/history/dates'

describe('computeSortKey', () => {
  it('orders by year, month, day', () => {
    expect(computeSortKey({ startYear: 1935, startMonth: 8, startDay: 12 })).toBe(19350812)
    expect(computeSortKey({ startYear: 1935 })).toBe(19350000)
  })

  it('returns null when the year is unknown', () => {
    expect(computeSortKey({})).toBeNull()
  })
})

describe('validateHistoryDate', () => {
  it('accepts a valid exact date', () => {
    expect(validateHistoryDate({ precision: 'day', startYear: 1938, startMonth: 5, startDay: 12 })).toBeNull()
  })

  it('rejects an impossible day', () => {
    expect(validateHistoryDate({ precision: 'day', startYear: 1938, startMonth: 2, startDay: 30 })).toMatch(/day/)
  })

  it('requires month and day for day precision', () => {
    expect(validateHistoryDate({ precision: 'day', startYear: 1938 })).toMatch(/month/)
  })

  it('requires an end year for ranges and end after start', () => {
    expect(validateHistoryDate({ precision: 'range', startYear: 1930 })).toMatch(/end/)
    expect(validateHistoryDate({ precision: 'range', startYear: 1930, endYear: 1920 })).toMatch(/after/)
    expect(validateHistoryDate({ precision: 'range', startYear: 1920, endYear: 1930 })).toBeNull()
    // A year-only end in the same year covers the whole year.
    expect(validateHistoryDate({ precision: 'range', startYear: 1930, startMonth: 5, endYear: 1930 })).toBeNull()
    expect(validateHistoryDate({ precision: 'range', startYear: 1930, startMonth: 5, endYear: 1930, endMonth: 3 })).toMatch(/after/)
  })

  it('requires a year unless the date is unknown', () => {
    expect(validateHistoryDate({ precision: 'year' })).toMatch(/year/)
    expect(validateHistoryDate({ precision: 'unknown' })).toBeNull()
  })
})

describe('formatHistoryDate', () => {
  it('formats exact dates in both languages', () => {
    const date = { precision: 'day', startYear: 1938, startMonth: 5, startDay: 12 } as const
    expect(formatHistoryDate(date, 'ja')).toBe('1938年5月12日')
    expect(formatHistoryDate(date, 'en')).toBe('May 12, 1938')
  })

  it('marks approximate dates honestly', () => {
    expect(formatHistoryDate({ precision: 'circa', startYear: 1890 }, 'ja')).toBe('1890年頃')
    expect(formatHistoryDate({ precision: 'circa', startYear: 1890 }, 'en')).toBe('c. 1890')
    expect(formatHistoryDate({ precision: 'decade', startYear: 1930 }, 'ja')).toBe('1930年代')
    expect(formatHistoryDate({ precision: 'decade', startYear: 1930 }, 'en')).toBe('1930s')
  })

  it('formats ranges and unknown dates', () => {
    expect(formatHistoryDate({ precision: 'range', startYear: 1920, endYear: 1930 }, 'ja')).toBe('1920年〜1930年')
    expect(formatHistoryDate({ precision: 'range', startYear: 1920, endYear: 1930 }, 'en')).toBe('1920–1930')
    expect(formatHistoryDate({ precision: 'unknown' }, 'ja')).toBe('年代不詳')
    expect(formatHistoryDate({ precision: 'unknown' }, 'en')).toBe('Date unknown')
  })

  it('formats month precision', () => {
    expect(formatHistoryDate({ precision: 'month', startYear: 1938, startMonth: 5 }, 'en')).toBe('May 1938')
  })
})

describe('periodForYear', async () => {
  const { periodForYear } = await import('@/lib/history/periods')
  it('maps years to Japanese periods', () => {
    expect(periodForYear(1600)).toBe('pre_meiji')
    expect(periodForYear(1890)).toBe('meiji')
    expect(periodForYear(1938)).toBe('prewar_showa')
    expect(periodForYear(1960)).toBe('postwar_showa')
    expect(periodForYear(2024)).toBe('reiwa')
  })
})
