import type { Locale } from '@/lib/i18n/config'

export const DATE_PRECISIONS = ['day', 'month', 'year', 'circa', 'decade', 'range', 'unknown'] as const
export type DatePrecision = (typeof DATE_PRECISIONS)[number]

/**
 * Historical event dates are stored as parts (not JS Dates) so we can represent
 * approximate, partial, ranged and unknown dates without inventing precision.
 */
export type HistoryDate = {
  precision?: DatePrecision | null
  startYear?: number | null
  startMonth?: number | null
  startDay?: number | null
  endYear?: number | null
  endMonth?: number | null
  endDay?: number | null
}

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const daysInMonth = (year: number, month: number): number => new Date(Date.UTC(year, month, 0)).getUTCDate()

const partsKey = (year: number, month?: number | null, day?: number | null): number =>
  year * 10000 + (month ?? 0) * 100 + (day ?? 0)

/** Latest possible key for a partial end date (1930 → 1930-12-31). */
const endKey = (year: number, month?: number | null, day?: number | null): number =>
  partsKey(year, month ?? 12, day ?? 31)

export const computeSortKey = (date: HistoryDate): number | null =>
  typeof date.startYear === 'number' ? partsKey(date.startYear, date.startMonth, date.startDay) : null

const validateParts = (year: number, month?: number | null, day?: number | null): string | null => {
  if (month != null && (month < 1 || month > 12)) return 'month must be between 1 and 12 / 月は1〜12'
  if (day != null) {
    if (month == null) return 'a day requires a month / 日を入力する場合は月も必要です'
    if (day < 1 || day > daysInMonth(year, month)) return 'invalid day for this month / 日付が不正です'
  }
  return null
}

/** Returns an error message (bilingual) or null when the date is internally consistent. */
export const validateHistoryDate = (date: HistoryDate): string | null => {
  const precision = date.precision ?? 'year'
  if (precision === 'unknown') return null
  if (typeof date.startYear !== 'number') return 'a start year is required / 開始年を入力してください'

  if (precision === 'day' && (date.startMonth == null || date.startDay == null)) {
    return 'day precision requires month and day / 「日」精度には月と日が必要です'
  }
  if (precision === 'month' && date.startMonth == null) {
    return 'month precision requires a month / 「月」精度には月が必要です'
  }

  const startError = validateParts(date.startYear, date.startMonth, date.startDay)
  if (startError) return startError

  if (precision === 'range') {
    if (typeof date.endYear !== 'number') return 'a range requires an end year / 期間には終了年が必要です'
    const endError = validateParts(date.endYear, date.endMonth, date.endDay)
    if (endError) return endError
    const start = partsKey(date.startYear, date.startMonth, date.startDay)
    const end = endKey(date.endYear, date.endMonth, date.endDay)
    if (end < start) return 'the end must be after the start / 終了は開始より後にしてください'
  }
  return null
}

const formatPoint = (
  locale: Locale,
  year: number,
  month?: number | null,
  day?: number | null,
): string => {
  if (locale === 'ja') {
    return `${year}年${month ? `${month}月` : ''}${month && day ? `${day}日` : ''}`
  }
  if (!month) return String(year)
  const monthName = EN_MONTHS[month - 1]
  return day ? `${monthName} ${day}, ${year}` : `${monthName} ${year}`
}

export const formatHistoryDate = (date: HistoryDate, locale: Locale): string => {
  const precision = date.precision ?? 'year'
  if (precision === 'unknown' || typeof date.startYear !== 'number') {
    return locale === 'ja' ? '年代不詳' : 'Date unknown'
  }
  const year = date.startYear
  switch (precision) {
    case 'day':
      return formatPoint(locale, year, date.startMonth, date.startDay)
    case 'month':
      return formatPoint(locale, year, date.startMonth)
    case 'circa':
      return locale === 'ja' ? `${year}年頃` : `c. ${year}`
    case 'decade':
      return locale === 'ja' ? `${year}年代` : `${year}s`
    case 'range': {
      const start = formatPoint(locale, year, date.startMonth, date.startDay)
      if (typeof date.endYear !== 'number') return start
      const end = formatPoint(locale, date.endYear, date.endMonth, date.endDay)
      return locale === 'ja' ? `${start}〜${end}` : `${start}–${end}`
    }
    default:
      return formatPoint(locale, year)
  }
}
