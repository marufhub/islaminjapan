import { createHmac, timingSafeEqual } from 'node:crypto'

/** Tokens older than this are rejected (stale tab); the visitor simply reloads the form. */
export const FORM_TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000

const sign = (issuedAt: number, secret: string): string =>
  createHmac('sha256', secret).update(`contact-form:${issuedAt}`).digest('base64url')

/** Server-issued render timestamp, signed so it cannot be forged or affected by the visitor's clock. */
export const issueFormToken = (secret: string, now: number = Date.now()): string => `${now}.${sign(now, secret)}`

/** Returns the verified issue time, or null if the token is missing, malformed or forged. */
export const verifyFormToken = (token: string, secret: string): number | null => {
  const [issuedRaw, signature] = token.split('.')
  const issuedAt = Number(issuedRaw)
  if (!signature || !Number.isSafeInteger(issuedAt)) return null
  const expected = Buffer.from(sign(issuedAt, secret))
  const actual = Buffer.from(signature)
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? issuedAt : null
}
