'use client'

import { useState } from 'react'

import type { Suggestions } from '@/lib/ai/schemas'

import { type ApiError, studioApi } from './api'
import type { StudioText } from './studioText'

type Topic = Suggestions['topics'][number]

/** On-demand topic suggestions; nothing is created until the editor selects topics and confirms. */
export function TopicPlanner({ text, configured, onError }: { text: StudioText; configured: boolean; onError: (error: ApiError | null) => void }) {
  const [language, setLanguage] = useState<'ja' | 'en'>('ja')
  const [focus, setFocus] = useState('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const suggest = async () => {
    setBusy(true)
    setMessage(null)
    onError(null)
    const result = await studioApi.generate({ action: 'topics', language, focus })
    setBusy(false)
    if (!result.ok) return onError(result.error)
    if (result.data.action === 'topics') {
      setTopics(result.data.data.topics)
      setSelected(new Set())
    }
  }

  const add = async () => {
    setBusy(true)
    onError(null)
    const chosen = topics.filter((_, index) => selected.has(index))
    const result = await studioApi.addTopics({ language, topics: chosen })
    setBusy(false)
    if (!result.ok) return onError(result.error)
    setMessage(text.added(result.data.created.length))
    setTopics(topics.filter((_, index) => !selected.has(index)))
    setSelected(new Set())
  }

  const toggle = (index: number) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  return (
    <section className="ai-studio__panel" aria-labelledby="ai-planner">
      <h2 id="ai-planner">{text.planner}</h2>
      <p className="ai-studio__muted">{text.plannerHelp}</p>
      <div className="ai-studio__grid">
        <div className="ai-studio__field">
          <label htmlFor="ai-planner-language">{text.language}</label>
          <select id="ai-planner-language" value={language} onChange={(event) => setLanguage(event.target.value as 'ja' | 'en')}>
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="ai-studio__field">
          <label htmlFor="ai-planner-focus">{text.focus}</label>
          <input id="ai-planner-focus" type="text" maxLength={500} value={focus} onChange={(event) => setFocus(event.target.value)} />
        </div>
      </div>
      <div className="ai-studio__actions">
        <button type="button" className="ai-studio__button" disabled={!configured || busy} onClick={suggest}>
          {busy ? text.generating : text.suggestTopics}
        </button>
      </div>
      {topics.length > 0 ? (
        <>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--base)' }}>
            {topics.map((topic, index) => (
              <li key={`${topic.topic}-${index}`}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontWeight: 400 }}>
                  <input type="checkbox" checked={selected.has(index)} onChange={() => toggle(index)} />
                  <span>
                    <strong>{topic.topic}</strong> <span className="ai-studio__muted">({topic.audience})</span>
                    <br />
                    <span className="ai-studio__muted">{topic.reason}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <button type="button" className="ai-studio__button ai-studio__button--primary" disabled={busy || selected.size === 0} onClick={add}>
            {text.addSelected}
          </button>
        </>
      ) : null}
      {message ? <p className="ai-studio__notice ai-studio__notice--success" role="status">{message}</p> : null}
    </section>
  )
}
