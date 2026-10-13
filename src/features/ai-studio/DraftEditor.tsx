'use client'

import type { Draft, DraftBlock } from '@/lib/ai/schemas'

import type { StudioText } from './studioText'

const BLOCK_TYPES: DraftBlock['type'][] = ['h2', 'h3', 'paragraph', 'bullets', 'numbered', 'quote']
const isList = (type: DraftBlock['type']) => type === 'bullets' || type === 'numbered'

function BlockEditor({ block, index, onChange, onRemove, text }: { block: DraftBlock; index: number; onChange: (block: DraftBlock) => void; onRemove: () => void; text: StudioText }) {
  return (
    <div className="ai-studio__block">
      <div className="ai-studio__block-head">
        <select aria-label={`${text.body} ${index + 1}`} value={block.type} onChange={(event) => onChange({ ...block, type: event.target.value as DraftBlock['type'] })}>
          {BLOCK_TYPES.map((type) => (
            <option key={type} value={type}>
              {text.blockTypes[type]}
            </option>
          ))}
        </select>
        <button type="button" className="ai-studio__button" onClick={onRemove}>
          {text.removeSection}
        </button>
      </div>
      {isList(block.type) ? (
        <textarea
          aria-label={text.listHint}
          rows={Math.max(3, block.items.length)}
          value={block.items.join('\n')}
          onChange={(event) => onChange({ ...block, items: event.target.value.split('\n') })}
        />
      ) : (
        <textarea aria-label={text.blockTypes[block.type]} rows={block.type === 'paragraph' ? 4 : 1} value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} />
      )}
    </div>
  )
}

/** Human-editable draft. Editors' changes here are what gets saved — the AI never overwrites them silently. */
export function DraftEditor({ draft, onChange, text }: { draft: Draft; onChange: (draft: Draft) => void; text: StudioText }) {
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => onChange({ ...draft, [key]: value })
  const setBlock = (index: number, block: DraftBlock) => set('body', draft.body.map((current, i) => (i === index ? block : current)))

  return (
    <section className="ai-studio__panel" aria-labelledby="ai-draft">
      <h2 id="ai-draft">{text.draft}</h2>
      <div className="ai-studio__field">
        <label htmlFor="ai-draft-title">{text.draftTitle}</label>
        <input id="ai-draft-title" type="text" maxLength={300} value={draft.title} onChange={(event) => set('title', event.target.value)} />
      </div>
      <div className="ai-studio__field">
        <label htmlFor="ai-draft-summary">{text.summary}</label>
        <textarea id="ai-draft-summary" rows={3} maxLength={400} value={draft.summary} onChange={(event) => set('summary', event.target.value)} />
      </div>
      <p className="ai-studio__label">{text.body}</p>
      {draft.body.map((block, index) => (
        <BlockEditor
          key={index}
          block={block}
          index={index}
          text={text}
          onChange={(next) => setBlock(index, next)}
          onRemove={() => set('body', draft.body.filter((_, i) => i !== index))}
        />
      ))}
      <button type="button" className="ai-studio__button" onClick={() => set('body', [...draft.body, { type: 'paragraph', text: '', items: [] }])}>
        {text.addSection}
      </button>
      <div className="ai-studio__grid" style={{ marginTop: 'var(--base)' }}>
        <div className="ai-studio__field">
          <label htmlFor="ai-seo-title">{text.seoTitle}</label>
          <input id="ai-seo-title" type="text" maxLength={70} value={draft.seoTitle} onChange={(event) => set('seoTitle', event.target.value)} />
        </div>
        <div className="ai-studio__field">
          <label htmlFor="ai-tags">{text.tags}</label>
          <input
            id="ai-tags"
            type="text"
            value={draft.tags.join(', ')}
            onChange={(event) => set('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))}
          />
        </div>
      </div>
      <div className="ai-studio__field">
        <label htmlFor="ai-seo-description">{text.seoDescription}</label>
        <textarea id="ai-seo-description" rows={2} maxLength={160} value={draft.seoDescription} onChange={(event) => set('seoDescription', event.target.value)} />
      </div>
    </section>
  )
}

/** Verification panel: claims, used sources and AI notes stay visible through review. */
export function VerificationPanel({ draft, text, sourceTitles }: { draft: Draft; text: StudioText; sourceTitles: Map<number, string> }) {
  return (
    <section className="ai-studio__panel" aria-labelledby="ai-claims">
      <h2 id="ai-claims">
        {text.claims} ({draft.claimsRequiringVerification.length})
      </h2>
      <p className="ai-studio__muted">{text.claimsHelp}</p>
      {draft.claimsRequiringVerification.length === 0 ? (
        <p>{text.noClaims}</p>
      ) : (
        <ol className="ai-studio__claims">
          {draft.claimsRequiringVerification.map((claim, index) => (
            <li key={index}>
              <strong>{claim.claim}</strong>
              <div className="ai-studio__muted">
                {text.reason}: {claim.reason}
              </div>
              <div className="ai-studio__muted">
                {text.evidence}: {claim.suggestedEvidence}
              </div>
            </li>
          ))}
        </ol>
      )}
      <p className="ai-studio__label">{text.usedSources}</p>
      <p>{draft.usedSourceIds.length > 0 ? draft.usedSourceIds.map((id) => `#${id} ${sourceTitles.get(id) ?? ''}`).join(' / ') : '—'}</p>
      {draft.editorialNotes ? (
        <>
          <p className="ai-studio__label">{text.editorialNotes}</p>
          <p style={{ whiteSpace: 'pre-line' }}>{draft.editorialNotes}</p>
        </>
      ) : null}
    </section>
  )
}
