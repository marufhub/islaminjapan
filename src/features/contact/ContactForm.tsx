'use client'

import { useActionState, useState } from 'react'

import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'

import { submitContact } from './action'
import type { ContactField, ContactFormState } from './schema'

type Labels = Dictionary['contact']

const FIELDS: Array<{ name: ContactField; type: 'text' | 'email' | 'textarea'; autoComplete?: string; maxLength: number }> = [
  { name: 'name', type: 'text', autoComplete: 'name', maxLength: 100 },
  { name: 'email', type: 'email', autoComplete: 'email', maxLength: 254 },
  { name: 'subject', type: 'text', maxLength: 150 },
  { name: 'message', type: 'textarea', maxLength: 5000 },
]

const ERROR_MESSAGES = (labels: Labels): Record<'validation' | 'rate_limited' | 'server' | 'expired', string> => ({
  validation: labels.errorValidation,
  rate_limited: labels.errorRateLimited,
  server: labels.errorServer,
  expired: labels.errorExpired,
})

export function ContactForm({ locale, labels, formToken }: { locale: Locale; labels: Labels; formToken: string }) {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(submitContact, { status: 'idle' })
  // Controlled values: React resets uncontrolled forms after an action, which would erase the
  // visitor's text whenever validation fails.
  const [values, setValues] = useState<Record<ContactField, string>>({ name: '', email: '', subject: '', message: '' })

  if (state.status === 'success') {
    return (
      <p role="status" className="rounded-lg border border-primary bg-primary-soft p-6">
        {labels.success}
      </p>
    )
  }

  const invalid = new Set(state.status === 'error' ? (state.fields ?? []) : [])

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.status === 'error' ? (
        <p role="alert" className="rounded-md border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
          {ERROR_MESSAGES(labels)[state.reason]}
        </p>
      ) : null}
      <input type="hidden" name="locale" value={locale} />
      {/* Server-signed render time: lets the server reject implausibly fast (automated) submissions. */}
      <input type="hidden" name="formToken" value={formToken} />
      {/* Honeypot: hidden from people and assistive technology; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {FIELDS.map((field) => {
        const id = `contact-${field.name}`
        const errorId = `${id}-error`
        const isInvalid = invalid.has(field.name)
        const common = {
          id,
          name: field.name,
          value: values[field.name],
          onChange: (event: { target: { value: string } }) =>
            setValues((current) => ({ ...current, [field.name]: event.target.value })),
          required: true,
          maxLength: field.maxLength,
          'aria-invalid': isInvalid || undefined,
          'aria-describedby': isInvalid ? errorId : undefined,
          className: `w-full rounded-md border bg-surface px-4 py-2 ${isInvalid ? 'border-red-700' : 'border-line'}`,
        }
        return (
          <div key={field.name}>
            <label htmlFor={id} className="mb-1 block font-medium">
              {labels[field.name]} <span className="text-sm font-normal text-muted">({labels.required})</span>
            </label>
            {field.type === 'textarea' ? (
              <textarea {...common} rows={8} />
            ) : (
              <input {...common} type={field.type} autoComplete={field.autoComplete} />
            )}
            {isInvalid ? (
              <p id={errorId} className="mt-1 text-sm text-red-800">
                {labels.fieldErrors[field.name]}
              </p>
            ) : null}
          </div>
        )
      })}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  )
}
