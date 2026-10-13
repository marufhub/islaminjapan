/**
 * Versions of the server-side prompt templates. Bump the relevant entry whenever a template's wording
 * changes, so usage logs and article AI provenance show which template produced a draft.
 */
export const POLICY_VERSION = 'policy@2'

export const TEMPLATE_VERSIONS: Record<string, string> = {
  explainer: 'explainer@2',
  history_research: 'history-of-islam-in-japan@2',
  faq: 'faq@2',
  muslim_life: 'muslim-life@2',
  topics: 'topics@2',
}

export const promptVersionFor = (template: string): string => `${TEMPLATE_VERSIONS[template] ?? `${template}@1`}+${POLICY_VERSION}`
