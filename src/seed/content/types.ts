import type { RichBlock } from '@/lib/richtext/build'
import type { Article } from '@/payload-types'

export type SeedClaim = { claim: string; reason: string; suggestedEvidence: string }

export type SeedArticle = {
  slug: string
  language: 'ja' | 'en'
  /** Articles sharing a key are linked as translations. */
  translationKey: string
  title: string
  summary: string
  section: NonNullable<Article['section']>
  articleType: NonNullable<Article['articleType']>
  categorySlug: string
  audiences: NonNullable<Article['audiences']>
  knowledgeLevel: NonNullable<Article['knowledgeLevel']>
  japanRelevance: NonNullable<Article['japanRelevance']>
  editorialStatus: 'researching' | 'draft'
  learningJourneyOrder?: number
  body: RichBlock[]
  claims: SeedClaim[]
}
