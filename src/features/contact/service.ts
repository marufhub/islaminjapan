import { createHash } from 'node:crypto'

import type { Payload } from 'payload'

import { isEmailConfigured } from '@/lib/email'

import type { ContactInput } from './schema'

export const RATE_LIMIT_MAX = 5
/** Shared bucket used only when no client address is available (misconfigured proxy). */
export const UNKNOWN_REQUESTER_LIMIT = 30
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
export const UNKNOWN_REQUESTER = 'unknown'

/** Salted one-way hash of the client address, so rate limiting never stores raw IPs. */
export const hashRequester = (ip: string, secret: string): string =>
  createHash('sha256').update(`${secret}:${ip}`).digest('hex')

export const limitFor = (ip: string): number => (ip === UNKNOWN_REQUESTER ? UNKNOWN_REQUESTER_LIMIT : RATE_LIMIT_MAX)

export type SubmitResult = { ok: true } | { ok: false; reason: 'rate_limited' | 'server' }

const isRateLimited = async (payload: Payload, requesterHash: string, limit: number, now: Date): Promise<boolean> => {
  const since = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS).toISOString()
  const { totalDocs } = await payload.count({
    collection: 'contact-submissions',
    where: { and: [{ requesterHash: { equals: requesterHash } }, { createdAt: { greater_than: since } }] },
    overrideAccess: true,
  })
  // Count-then-create is not atomic; a burst can exceed the limit slightly, which is acceptable for spam control.
  return totalDocs >= limit
}

const notifyEditors = async (payload: Payload, submissionId: number, input: ContactInput): Promise<'sent' | 'failed' | 'not_configured'> => {
  if (!isEmailConfigured()) return 'not_configured'
  const settings = await payload.findGlobal({ slug: 'contact-settings', overrideAccess: true, depth: 0 })
  if (!settings.recipientEmail) return 'not_configured'
  try {
    await payload.sendEmail({
      to: settings.recipientEmail,
      replyTo: input.email,
      subject: `[Islam in Japan] ${input.subject}`,
      text: `${input.name} <${input.email}>\n\n${input.message}\n\n— Inquiry #${submissionId} (${input.locale})`,
    })
    return 'sent'
  } catch (error) {
    // Log the failure without the visitor's personal data.
    payload.logger.error({ err: error, submissionId }, 'Contact notification email failed')
    return 'failed'
  }
}

/** Stores an inquiry in the admin queue and, when SMTP is configured, notifies editors. */
export const submitInquiry = async (
  payload: Payload,
  input: ContactInput,
  requesterHash: string,
  { limit = RATE_LIMIT_MAX, now = new Date() }: { limit?: number; now?: Date } = {},
): Promise<SubmitResult> => {
  try {
    if (await isRateLimited(payload, requesterHash, limit, now)) return { ok: false, reason: 'rate_limited' }
    const submission = await payload.create({
      collection: 'contact-submissions',
      data: { ...input, requesterHash, status: 'new', deliveryStatus: 'not_configured' },
      overrideAccess: true,
    })
    const deliveryStatus = await notifyEditors(payload, submission.id, input)
    if (deliveryStatus !== 'not_configured') {
      await payload.update({ collection: 'contact-submissions', id: submission.id, data: { deliveryStatus }, overrideAccess: true })
    }
    return { ok: true }
  } catch (error) {
    payload.logger.error({ err: error }, 'Contact submission failed')
    return { ok: false, reason: 'server' }
  }
}
