import type { Field } from 'payload'

import { label } from '@/lib/i18n/config'

export const AUDIENCE_OPTIONS = [
  { value: 'general_public', label: label('一般の方', 'General public') },
  { value: 'non_muslims', label: label('ムスリム以外の方', 'Non-Muslims') },
  { value: 'new_muslims', label: label('新しくムスリムになった方', 'New Muslims') },
  { value: 'muslim_residents', label: label('日本在住のムスリム', 'Muslim residents') },
]

export const KNOWLEDGE_LEVEL_OPTIONS = [
  { value: 'beginner', label: label('入門', 'Beginner') },
  { value: 'intermediate', label: label('中級', 'Intermediate') },
  { value: 'advanced', label: label('上級', 'Advanced') },
]

export const audiencesField: Field = {
  name: 'audiences',
  type: 'select',
  hasMany: true,
  label: label('対象読者', 'Target audiences'),
  options: AUDIENCE_OPTIONS,
}

export const knowledgeLevelField: Field = {
  name: 'knowledgeLevel',
  type: 'select',
  defaultValue: 'beginner',
  label: label('レベル', 'Knowledge level'),
  options: KNOWLEDGE_LEVEL_OPTIONS,
}
