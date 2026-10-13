import { z } from 'zod'

import { LOCALES } from '@/lib/i18n/config'

import { FORM_TOKEN_MAX_AGE_MS, verifyFormToken } from './formToken'

/** Submissions faster than this after the form rendered are treated as automated. */
export const MIN_FILL_MS = 3000

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().max(254).pipe(z.email()),
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(10).max(5000),
  locale: z.enum(LOCALES),
})

export type ContactInput = z.infer<typeof contactSchema>
export type ContactField = 'name' | 'email' | 'subject' | 'message'

export type ContactFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; reason: 'validation' | 'rate_limited' | 'server' | 'expired'; fields?: ContactField[] }

export type ParsedSubmission =
  | { kind: 'valid'; data: ContactInput }
  | { kind: 'invalid'; fields: ContactField[] }
  /** Honeypot filled or submitted implausibly fast: silently accepted, never stored. */
  | { kind: 'bot' }
  /** Missing, forged or stale form token: the visitor is asked to reload the form. */
  | { kind: 'expired' }

const text = (form: FormData, key: string): string => {
  const value = form.get(key)
  return typeof value === 'string' ? value : ''
}

/**
 * `formToken` is a server-signed render timestamp (see formToken.ts), so timing checks use server
 * time only and cannot be skipped by omitting or forging the field.
 */
export const parseSubmission = (form: FormData, secret: string, now: number = Date.now()): ParsedSubmission => {
  if (text(form, 'website') !== '') return { kind: 'bot' }
  const issuedAt = verifyFormToken(text(form, 'formToken'), secret)
  if (issuedAt === null || now - issuedAt > FORM_TOKEN_MAX_AGE_MS) return { kind: 'expired' }
  if (now - issuedAt < MIN_FILL_MS) return { kind: 'bot' }
  const result = contactSchema.safeParse({
    name: text(form, 'name'),
    email: text(form, 'email'),
    subject: text(form, 'subject'),
    message: text(form, 'message'),
    locale: text(form, 'locale'),
  })
  if (result.success) return { kind: 'valid', data: result.data }
  const fields = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))].filter(
    (field): field is ContactField => ['name', 'email', 'subject', 'message'].includes(field),
  )
  return { kind: 'invalid', fields }
}
