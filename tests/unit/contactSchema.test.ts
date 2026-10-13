import { describe, expect, it } from 'vitest'

import { clientAddress } from '@/features/contact/clientAddress'
import { issueFormToken, verifyFormToken } from '@/features/contact/formToken'
import { MIN_FILL_MS, parseSubmission } from '@/features/contact/schema'

const NOW = 1_800_000_000_000
const SECRET = 'test-secret'

const form = (overrides: Record<string, string> = {}) => {
  const data = new FormData()
  const values = {
    name: '山田 花子',
    email: 'hanako@example.test',
    subject: '礼拝について',
    message: '職場での礼拝について質問があります。',
    locale: 'ja',
    formToken: issueFormToken(SECRET, NOW - MIN_FILL_MS - 1000),
    website: '',
    ...overrides,
  }
  for (const [key, value] of Object.entries(values)) data.set(key, value)
  return data
}

describe('parseSubmission', () => {
  it('accepts a valid inquiry and trims fields', () => {
    const result = parseSubmission(form({ name: '  山田 花子  ' }), SECRET, NOW)
    expect(result).toMatchObject({ kind: 'valid', data: { name: '山田 花子', locale: 'ja' } })
  })

  it('reports each invalid field', () => {
    const result = parseSubmission(form({ email: 'not-an-email', message: 'short' }), SECRET, NOW)
    expect(result).toEqual({ kind: 'invalid', fields: expect.arrayContaining(['email', 'message']) })
  })

  it('rejects unsupported locales', () => {
    expect(parseSubmission(form({ locale: 'bn' }), SECRET, NOW).kind).toBe('invalid')
  })

  it('treats a filled honeypot as a bot', () => {
    expect(parseSubmission(form({ website: 'https://spam.example' }), SECRET, NOW).kind).toBe('bot')
  })

  it('treats implausibly fast submissions as a bot, using server time only', () => {
    expect(parseSubmission(form({ formToken: issueFormToken(SECRET, NOW - 500) }), SECRET, NOW).kind).toBe('bot')
  })

  it('asks for a reload when the token is missing, forged or stale', () => {
    expect(parseSubmission(form({ formToken: '' }), SECRET, NOW).kind).toBe('expired')
    expect(parseSubmission(form({ formToken: issueFormToken('other-secret', NOW - 10_000) }), SECRET, NOW).kind).toBe('expired')
    expect(parseSubmission(form({ formToken: `${NOW - 10_000}.forged` }), SECRET, NOW).kind).toBe('expired')
    expect(parseSubmission(form({ formToken: issueFormToken(SECRET, NOW - 2 * 24 * 3600 * 1000) }), SECRET, NOW).kind).toBe('expired')
  })
})

describe('form token', () => {
  it('round-trips the issue time', () => {
    expect(verifyFormToken(issueFormToken(SECRET, NOW), SECRET)).toBe(NOW)
  })
})

describe('clientAddress', () => {
  it('uses the rightmost X-Forwarded-For hop, which the client cannot spoof', () => {
    expect(clientAddress(new Headers({ 'x-forwarded-for': '6.6.6.6, 203.0.113.5' }))).toBe('203.0.113.5')
  })

  it('uses only the configured trusted header when set', () => {
    const headers = new Headers({ 'x-forwarded-for': '6.6.6.6', 'cf-connecting-ip': '198.51.100.2' })
    expect(clientAddress(headers, 'cf-connecting-ip')).toBe('198.51.100.2')
  })

  it('falls back to a shared unknown bucket', () => {
    expect(clientAddress(new Headers())).toBe('unknown')
  })
})
