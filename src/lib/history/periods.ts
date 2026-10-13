/** Japanese historical periods used to filter the Islam-in-Japan timeline. */
export const HISTORY_PERIODS = [
  { value: 'pre_meiji', from: -Infinity, ja: '明治以前', en: 'Before Meiji' },
  { value: 'meiji', from: 1868, ja: '明治', en: 'Meiji (1868–1912)' },
  { value: 'taisho', from: 1912, ja: '大正', en: 'Taishō (1912–1926)' },
  { value: 'prewar_showa', from: 1926, ja: '昭和戦前・戦中', en: 'Early Shōwa (1926–1945)' },
  { value: 'postwar_showa', from: 1945, ja: '昭和戦後', en: 'Postwar Shōwa (1945–1989)' },
  { value: 'heisei', from: 1989, ja: '平成', en: 'Heisei (1989–2019)' },
  { value: 'reiwa', from: 2019, ja: '令和', en: 'Reiwa (2019–)' },
] as const

export type HistoryPeriod = (typeof HISTORY_PERIODS)[number]['value']

/** Era boundaries fall mid-year; a year-only date maps to the era that begins that year. */
export const periodForYear = (year: number): HistoryPeriod =>
  [...HISTORY_PERIODS].reverse().find((period) => year >= period.from)?.value ?? 'pre_meiji'
