'use client'

import { useMemo, useState } from 'react'

import type { Brief, Draft, Outline, StudioAction, Suggestions } from '@/lib/ai/schemas'

import { type ApiError, studioApi } from './api'
import { BriefForm } from './BriefForm'
import { DraftEditor, VerificationPanel } from './DraftEditor'
import type { GenerateResponse } from './generate'
import { OutlineEditor } from './OutlineEditor'
import { getStudioText } from './studioText'
import { TopicPlanner } from './TopicPlanner'

import './studio.css'

export type StudioSourceOption = { id: number; title: string; year: number | null; excerptCount: number }

type Saved = { id: number; slug: string; updatedAt: string; language: 'ja' | 'en'; submitted: boolean }
/** Everything an undo must restore, so undoing a translation also restores its language and links. */
type Snapshot = { draft: Draft; language: Brief['language']; saved: Saved | null; translationOfId: number | null }
type Generation = { model: string; action: StudioAction; generatedAt: string; promptVersion: string }

const INITIAL_BRIEF: Brief = {
  topic: '',
  contentType: 'explainer',
  language: 'ja',
  audience: 'general_public',
  knowledgeLevel: 'beginner',
  purpose: 'explanation',
  style: 'beginner_friendly',
  length: 'medium',
  sourceIds: [],
  researchNotes: '',
  instructions: '',
}

type AIStudioClientProps = {
  uiLanguage: 'ja' | 'en'
  configured: boolean
  models: { main: string; fast: string }
  role: string
  sources: StudioSourceOption[]
}

export function AIStudioClient({ uiLanguage, configured, models, sources }: AIStudioClientProps) {
  const text = getStudioText(uiLanguage)
  const [brief, setBrief] = useState<Brief>(INITIAL_BRIEF)
  const [outline, setOutline] = useState<Outline | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  // Previous states in this session, so an AI rewrite never discards the editor's work.
  const [history, setHistory] = useState<Snapshot[]>([])
  const [generation, setGeneration] = useState<Generation | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [busy, setBusy] = useState<StudioAction | 'save' | 'submit' | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [lastAction, setLastAction] = useState<(() => void) | null>(null)
  const [saved, setSaved] = useState<Saved | null>(null)
  // Set when the current draft is a translation of a saved article.
  const [translationOfId, setTranslationOfId] = useState<number | null>(null)
  const sourceTitles = useMemo(() => new Map(sources.map((source) => [source.id, source.title])), [sources])

  const snapshot = (): Snapshot | null => (draft ? { draft, language: brief.language, saved, translationOfId } : null)

  const replaceDraft = (next: Draft, meta: GenerateResponse) => {
    const current = snapshot()
    if (current) setHistory((previous) => [...previous, current])
    setDraft(next)
    setGeneration({ model: meta.model, action: meta.action, generatedAt: meta.generatedAt, promptVersion: meta.promptVersion })
  }

  const undo = () => {
    const previous = history[history.length - 1]
    if (!previous) return
    setDraft(previous.draft)
    setBrief((current) => ({ ...current, language: previous.language }))
    setSaved(previous.saved)
    setTranslationOfId(previous.translationOfId)
    setHistory(history.slice(0, -1))
  }

  const run = async (request: Parameters<typeof studioApi.generate>[0]) => {
    setBusy(request.action)
    setError(null)
    setLastAction(() => () => run(request))
    const result = await studioApi.generate(request)
    setBusy(null)
    if (!result.ok) return setError(result.error)
    const response = result.data
    setWarnings(response.warnings)
    switch (response.action) {
      case 'outline':
        setOutline(response.data)
        break
      case 'draft':
      case 'improve':
      case 'simplify':
        replaceDraft(response.data, response)
        break
      case 'translate': {
        // The translation becomes a separate, new draft linked to the saved original.
        replaceDraft(response.data, response)
        setTranslationOfId(saved?.id ?? null)
        setBrief({ ...brief, language: brief.language === 'ja' ? 'en' : 'ja' })
        setSaved(null)
        break
      }
      case 'seo': {
        const current = snapshot()
        if (current) setHistory((previous) => [...previous, current])
        // Functional update: keeps any edits typed while the request was running.
        setDraft((latest) => (latest ? { ...latest, ...response.data } : latest))
        break
      }
      case 'suggest':
      case 'topics':
        setSuggestions(response.data)
        break
    }
  }

  const save = async (mode: 'new' | 'update') => {
    if (!draft || !generation) return
    setBusy('save')
    setError(null)
    const target =
      mode === 'update' && saved ? { mode: 'update' as const, articleId: saved.id, expectedUpdatedAt: saved.updatedAt } : { mode: 'new' as const }
    const result = await studioApi.save({
      draft,
      meta: { language: brief.language, contentType: brief.contentType, audience: brief.audience, knowledgeLevel: brief.knowledgeLevel },
      generation,
      target,
      translationOfId: mode === 'new' ? translationOfId : null,
    })
    setBusy(null)
    if (!result.ok) return setError(result.error)
    setSaved({ ...result.data, language: brief.language, submitted: false })
  }

  const submit = async () => {
    if (!saved) return
    setBusy('submit')
    setError(null)
    const result = await studioApi.submitReview(saved.id)
    setBusy(null)
    if (!result.ok) return setError(result.error)
    setSaved({ ...saved, submitted: true, updatedAt: result.data.updatedAt })
  }

  const disabled = !configured || busy !== null
  const canDraft = brief.topic.trim().length >= 2
  const draftActions: Array<{ action: 'improve' | 'simplify' | 'seo' | 'suggest' | 'translate'; label: string }> = [
    { action: 'improve', label: text.improve },
    { action: 'simplify', label: text.simplify },
    { action: 'seo', label: text.seo },
    { action: 'suggest', label: text.suggest },
    { action: 'translate', label: text.translate },
  ]

  return (
    <div className="ai-studio">
      <h1>{text.title}</h1>
      <p className="ai-studio__intro">{text.intro}</p>
      <p className="ai-studio__muted">
        {text.model}: {models.main} / {text.fastModel}: {models.fast} · OpenAI
      </p>
      {!configured ? <p className="ai-studio__notice ai-studio__notice--warning" role="status">{text.notConfigured}</p> : null}

      <BriefForm brief={brief} onChange={setBrief} sources={sources} text={text} uiLanguage={uiLanguage} />
      <div className="ai-studio__actions">
        <button type="button" className="ai-studio__button ai-studio__button--primary" disabled={disabled || !canDraft} onClick={() => run({ action: 'outline', brief })}>
          {busy === 'outline' ? text.generating : text.generateOutline}
        </button>
      </div>

      {outline ? (
        <>
          <OutlineEditor outline={outline} onChange={setOutline} text={text} />
          <div className="ai-studio__actions">
            <button type="button" className="ai-studio__button ai-studio__button--primary" disabled={disabled} onClick={() => run({ action: 'draft', brief, outline })}>
              {busy === 'draft' ? text.generating : text.generateDraft}
            </button>
          </div>
        </>
      ) : null}

      {busy && busy !== 'save' && busy !== 'submit' ? <p className="ai-studio__notice" role="status" aria-live="polite">{text.generating}</p> : null}
      {error ? (
        <div className="ai-studio__notice ai-studio__notice--error" role="alert">
          {error.message}
          {error.retryable && lastAction ? (
            <button type="button" className="ai-studio__button" style={{ marginLeft: 12 }} onClick={() => lastAction()}>
              {text.retry}
            </button>
          ) : null}
        </div>
      ) : null}
      {warnings.length > 0 ? (
        <div className="ai-studio__notice ai-studio__notice--warning">
          <strong>{text.warnings}:</strong>
          <ul>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
        </div>
      ) : null}

      {draft ? (
        <>
          {translationOfId ? <p className="ai-studio__notice">{text.translationReady}</p> : null}
          <DraftEditor draft={draft} onChange={setDraft} text={text} />
          <VerificationPanel draft={draft} text={text} sourceTitles={sourceTitles} />
          <div className="ai-studio__actions">
            {draftActions.map(({ action, label }) => (
              <button
                key={action}
                type="button"
                className="ai-studio__button"
                // A translation must be linked to a saved original, so save first.
                disabled={disabled || (action === 'translate' && !saved)}
                title={action === 'translate' && !saved ? text.translateNeedsSave : undefined}
                onClick={() => run({ action, brief, draft })}
              >
                {busy === action ? text.generating : label}
              </button>
            ))}
            {history.length > 0 ? (
              <button
                type="button"
                className="ai-studio__button"
                disabled={busy !== null}
                onClick={undo}
              >
                {text.undo}
              </button>
            ) : null}
          </div>
          <div className="ai-studio__actions">
            <button type="button" className="ai-studio__button ai-studio__button--primary" disabled={busy !== null || !generation} onClick={() => save(saved ? 'update' : 'new')}>
              {busy === 'save' ? text.saving : text.save}
            </button>
            {saved ? (
              <button type="button" className="ai-studio__button" disabled={busy !== null} onClick={() => save('new')}>
                {text.saveAsNew}
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      {saved ? (
        <div className="ai-studio__notice ai-studio__notice--success" role="status">
          {saved.submitted ? text.submitted : text.saved}{' '}
          <a href={`/admin/collections/articles/${saved.id}`}>{text.openInEditor}</a>
          {' · '}
          <a href={`/preview?path=${encodeURIComponent(`/${saved.language}/articles/${saved.slug}`)}`} target="_blank" rel="noreferrer">
            {text.preview}
          </a>
          {!saved.submitted ? (
            <button type="button" className="ai-studio__button" style={{ marginLeft: 12 }} disabled={busy !== null} onClick={submit}>
              {text.submitReview}
            </button>
          ) : null}
        </div>
      ) : null}

      {suggestions && (suggestions.faqs.length > 0 || suggestions.topics.length > 0) ? (
        <section className="ai-studio__panel" aria-labelledby="ai-suggestions">
          <h2 id="ai-suggestions">{text.suggestions}</h2>
          {suggestions.faqs.length > 0 ? (
            <>
              <p className="ai-studio__label">{text.relatedFaqs}</p>
              <ul>{suggestions.faqs.map((faq) => <li key={faq.question}>{faq.question} <span className="ai-studio__muted">— {faq.reason}</span></li>)}</ul>
            </>
          ) : null}
          {suggestions.topics.length > 0 ? (
            <>
              <p className="ai-studio__label">{text.relatedTopics}</p>
              <ul>{suggestions.topics.map((topic) => <li key={topic.topic}>{topic.topic} <span className="ai-studio__muted">— {topic.reason}</span></li>)}</ul>
            </>
          ) : null}
        </section>
      ) : null}

      <TopicPlanner text={text} configured={configured} onError={setError} />
    </div>
  )
}
