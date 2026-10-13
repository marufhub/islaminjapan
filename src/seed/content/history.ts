import type { DatePrecision, HistoryDate } from '@/lib/history/dates'

/**
 * Research leads for the timeline — NOT verified facts. Stored unpublished with
 * verification status "in research" and explicit uncertainty notes.
 */
export type SeedHistoryEvent = {
  title: string
  summary: string
  date: HistoryDate & { precision: DatePrecision }
  location: string
  subjects: Array<'people' | 'organizations' | 'mosques' | 'communities' | 'diplomacy' | 'education'>
  uncertaintyNotes: string
  relatedSlug?: string
}

const NEEDS_SOURCES = '一次資料・研究文献による確認前の調査メモです。公開前に出典を登録し、日付の精度を確認してください。'

export const SEED_HISTORY_EVENTS: SeedHistoryEvent[] = [
  {
    title: 'オスマン帝国の軍艦エルトゥールル号の遭難',
    summary: '日本を訪れたオスマン帝国の軍艦が帰途に和歌山県沖で遭難し、地元住民が救助にあたったとされる出来事。',
    date: { precision: 'year', startYear: 1890 },
    location: '和歌山県串本町沖',
    subjects: ['diplomacy', 'people'],
    uncertaintyNotes: NEEDS_SOURCES,
    relatedSlug: 'islam-in-japan-overview',
  },
  {
    title: '神戸ムスリムモスクの建設',
    summary: '神戸に在住したムスリムらによって建てられたとされるモスク。日本で最初期のモスクのひとつとされる。',
    date: { precision: 'year', startYear: 1935 },
    location: '兵庫県神戸市',
    subjects: ['mosques', 'communities'],
    uncertaintyNotes: NEEDS_SOURCES,
    relatedSlug: 'history-of-kobe-muslim-mosque',
  },
  {
    title: '東京回教礼拝堂（東京モスク）の開設',
    summary: '在日タタール系ムスリムらが中心となって開設されたとされる東京のモスク。現在の東京ジャーミイの前身とされる。',
    date: { precision: 'year', startYear: 1938 },
    location: '東京都渋谷区',
    subjects: ['mosques', 'communities'],
    uncertaintyNotes: NEEDS_SOURCES,
    relatedSlug: 'history-of-tokyo-camii',
  },
  {
    title: '東京ジャーミイの現建物の開館',
    summary: '旧東京モスクの跡地に建てられた現在の東京ジャーミイの開館。',
    date: { precision: 'year', startYear: 2000 },
    location: '東京都渋谷区',
    subjects: ['mosques'],
    uncertaintyNotes: NEEDS_SOURCES,
    relatedSlug: 'history-of-tokyo-camii',
  },
]
