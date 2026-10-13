'use server'

import { headers } from 'next/headers'

import { getPayloadClient } from '@/lib/payload'

import { clientAddress } from './clientAddress'
import { type ContactFormState, parseSubmission } from './schema'
import { hashRequester, limitFor, submitInquiry } from './service'

export async function submitContact(_previous: ContactFormState, form: FormData): Promise<ContactFormState> {
  const secret = process.env.PAYLOAD_SECRET ?? ''
  const parsed = parseSubmission(form, secret)
  if (parsed.kind === 'bot') return { status: 'success' }
  if (parsed.kind === 'expired') return { status: 'error', reason: 'expired' }
  if (parsed.kind === 'invalid') return { status: 'error', reason: 'validation', fields: parsed.fields }

  const payload = await getPayloadClient()
  const ip = clientAddress(await headers(), process.env.TRUSTED_CLIENT_IP_HEADER)
  const result = await submitInquiry(payload, parsed.data, hashRequester(ip, secret), { limit: limitFor(ip) })
  return result.ok ? { status: 'success' } : { status: 'error', reason: result.reason }
}
