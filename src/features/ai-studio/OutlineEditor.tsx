'use client'

import type { Outline } from '@/lib/ai/schemas'

import type { StudioText } from './studioText'

const linesToList = (value: string): string[] => value.split('\n').map((line) => line.trim()).filter(Boolean)

/** Editor-confirmed outline: headings and points can be edited, added or removed before drafting. */
export function OutlineEditor({ outline, onChange, text }: { outline: Outline; onChange: (outline: Outline) => void; text: StudioText }) {
  const updateSection = (index: number, next: Partial<Outline['sections'][number]>) =>
    onChange({ ...outline, sections: outline.sections.map((section, i) => (i === index ? { ...section, ...next } : section)) })

  return (
    <section className="ai-studio__panel" aria-labelledby="ai-outline">
      <h2 id="ai-outline">{text.outline}</h2>
      <div className="ai-studio__field">
        <label htmlFor="ai-outline-title">{text.draftTitle}</label>
        <input id="ai-outline-title" type="text" value={outline.title} onChange={(event) => onChange({ ...outline, title: event.target.value })} />
      </div>
      {outline.sections.map((section, index) => (
        <div className="ai-studio__block" key={index}>
          <div className="ai-studio__row">
            <input
              type="text"
              aria-label={`${text.outline} ${index + 1}`}
              value={section.heading}
              onChange={(event) => updateSection(index, { heading: event.target.value })}
            />
            <button
              type="button"
              className="ai-studio__button"
              onClick={() => onChange({ ...outline, sections: outline.sections.filter((_, i) => i !== index) })}
            >
              {text.removeSection}
            </button>
          </div>
          <textarea
            aria-label={`${section.heading} — ${text.listHint}`}
            rows={3}
            value={section.points.join('\n')}
            onChange={(event) => updateSection(index, { points: linesToList(event.target.value) })}
          />
        </div>
      ))}
      <button type="button" className="ai-studio__button" onClick={() => onChange({ ...outline, sections: [...outline.sections, { heading: '', points: [] }] })}>
        {text.addSection}
      </button>
    </section>
  )
}
