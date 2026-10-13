import type { CollectionBeforeOperationHook } from 'payload'

/**
 * Records whether this write is a draft save (versions only) or a change to the live document.
 * `beforeChange` hooks cannot see the `draft` argument, so the workflow reads it from `req.context`,
 * which is server-side only and cannot be set by API clients.
 */
export const trackDraftSave: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (operation === 'create' || operation === 'update') {
    // req.context is Payload's per-request scratch space and is designed to be written by hooks.
    req.context.isSavingDraft = Boolean((args as { draft?: boolean }).draft)
  }
  return args
}

/**
 * Public readers must never receive another language's text in place of a missing translation,
 * even if they pass `?fallback-locale=` explicitly.
 */
export const disablePublicLocaleFallback: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (operation === 'read' && !req.user) {
    // The find operations read the fallback from req, so it must be overridden there.
    req.fallbackLocale = false
  }
  return args
}
