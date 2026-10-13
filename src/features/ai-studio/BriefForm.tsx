'use client'

import type { Brief } from '@/lib/ai/schemas'
import { AUDIENCES, CONTENT_TYPES, LENGTHS, LEVELS, PURPOSES, STYLES } from '@/lib/ai/schemas'

import type { StudioSourceOption } from './AIStudioClient'
import { OPTION_LABELS, type StudioText } from './studioText'

type SelectKey = 'contentType' | 'language' | 'audience' | 'knowledgeLevel' | 'purpose' | 'style' | 'length'

const SELECTS: Array<{ key: SelectKey; options: readonly string[] }> = [
  { key: 'contentType', options: CONTENT_TYPES },
  { key: 'language', options: ['ja', 'en'] },
  { key: 'audience', options: AUDIENCES },
  { key: 'knowledgeLevel', options: LEVELS },
  { key: 'purpose', options: PURPOSES },
  { key: 'style', options: STYLES },
  { key: 'length', options: LENGTHS },
]

type BriefFormProps = {
  brief: Brief
  onChange: (brief: Brief) => void
  sources: StudioSourceOption[]
  text: StudioText
  uiLanguage: 'ja' | 'en'
}

export function BriefForm({ brief, onChange, sources, text, uiLanguage }: BriefFormProps) {
  const labels = OPTION_LABELS[uiLanguage]
  const set = <K extends keyof Brief>(key: K, value: Brief[K]) => onChange({ ...brief, [key]: value })
  const toggleSource = (id: number) =>
    set('sourceIds', brief.sourceIds.includes(id) ? brief.sourceIds.filter((value) => value !== id) : [...brief.sourceIds, id])

  return (
    <section className="ai-studio__panel" aria-labelledby="ai-brief">
      <h2 id="ai-brief">{text.brief}</h2>
      <div className="ai-studio__field">
        <label htmlFor="ai-topic">{text.topic}</label>
        <input id="ai-topic" type="text" maxLength={300} value={brief.topic} onChange={(event) => set('topic', event.target.value)} />
      </div>
      <div className="ai-studio__grid">
        {SELECTS.map(({ key, options }) => (
          <div className="ai-studio__field" key={key}>
            <label htmlFor={`ai-${key}`}>{text[key]}</label>
            <select id={`ai-${key}`} value={brief[key]} onChange={(event) => set(key, event.target.value as never)}>
              {options.map((option) => (
                <option key={option} value={option}>
                  {labels[key][option] ?? option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <fieldset className="ai-studio__field">
        <legend className="ai-studio__label">{text.sources}</legend>
        {sources.length === 0 ? (
          <p className="ai-studio__muted">{text.noSources}</p>
        ) : (
          <div className="ai-studio__sources">
            {sources.map((source) => (
              <label key={source.id}>
                <input type="checkbox" checked={brief.sourceIds.includes(source.id)} onChange={() => toggleSource(source.id)} />
                <span>
                  #{source.id} {source.title}
                  {source.year ? ` (${source.year})` : ''} <span className="ai-studio__muted">— {text.excerpts(source.excerptCount)}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <div className="ai-studio__field">
        <label htmlFor="ai-notes">{text.researchNotes}</label>
        <textarea id="ai-notes" rows={5} maxLength={20_000} value={brief.researchNotes} onChange={(event) => set('researchNotes', event.target.value)} />
      </div>
      <div className="ai-studio__field">
        <label htmlFor="ai-instructions">{text.instructions}</label>
        <textarea id="ai-instructions" rows={2} maxLength={2_000} value={brief.instructions} onChange={(event) => set('instructions', event.target.value)} />
      </div>
    </section>
  )
}
