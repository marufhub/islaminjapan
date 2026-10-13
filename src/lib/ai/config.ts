/** Server-only AI configuration. Never import this from client components. */

export const DEFAULT_MODEL = 'gpt-6.1-sol'
export const DEFAULT_FAST_MODEL = 'gpt-6-luna'

export type ModelTier = 'main' | 'fast'

/** USD per 1M tokens for the default models (verify on the OpenAI pricing page; override via env). */
const KNOWN_PRICES: Record<string, { input: number; output: number }> = {
  'gpt-6.1-sol': { input: 2, output: 10 },
  'gpt-6-luna': { input: 0.1, output: 0.5 },
}

const intFromEnv = (name: string, fallback: number): number => {
  const value = Number.parseInt(process.env[name] ?? '', 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const numberFromEnv = (name: string): number | null => {
  const value = Number.parseFloat(process.env[name] ?? '')
  return Number.isFinite(value) && value >= 0 ? value : null
}

export const aiConfig = () => ({
  provider: 'openai' as const,
  models: {
    main: process.env.OPENAI_MODEL || DEFAULT_MODEL,
    fast: process.env.OPENAI_FAST_MODEL || DEFAULT_FAST_MODEL,
  } satisfies Record<ModelTier, string>,
  /** Upper bound for any single response; reasoning tokens count toward it. */
  maxOutputTokens: intFromEnv('AI_MAX_OUTPUT_TOKENS', 6000),
  /** Site-wide ESTIMATED spend limit per calendar month (Asia/Tokyo). Not the billed amount. */
  monthlyBudgetUsd: numberFromEnv('AI_MONTHLY_BUDGET_USD') ?? 20,
  /** Whether OpenAI may store responses (`store`). Off by default for editorial drafts. */
  store: process.env.OPENAI_STORE === 'true',
  /** Per-user cap on AI requests per rolling hour. */
  hourlyRequestLimit: intFromEnv('AI_HOURLY_REQUEST_LIMIT', 30),
  /** Per-user cap on input+output tokens per rolling 24 hours. */
  dailyTokenBudget: intFromEnv('AI_DAILY_TOKEN_BUDGET', 600_000),
  /** Request timeout in milliseconds (the SDK retries transient failures twice with backoff). */
  timeoutMs: intFromEnv('AI_TIMEOUT_MS', 5 * 60 * 1000),
})

/** Real generation is enabled only when an OpenAI API key is present in the server environment. */
export const isAIConfigured = (): boolean => {
  const key = process.env.OPENAI_API_KEY?.trim()
  // The .env.example placeholder must not count as a configured key.
  return Boolean(key) && !key!.startsWith('replace_with')
}

/**
 * Estimated cost in USD from token usage. Uses env overrides when set, else the known price table.
 * Returns null for an unknown model without overrides (only the token budget then applies).
 */
export const estimateCostUsd = (model: string, usage: { inputTokens: number; outputTokens: number }): number | null => {
  const overrideInput = numberFromEnv('AI_PRICE_INPUT_PER_MTOK')
  const overrideOutput = numberFromEnv('AI_PRICE_OUTPUT_PER_MTOK')
  const known = KNOWN_PRICES[model] ?? Object.entries(KNOWN_PRICES).find(([id]) => model.startsWith(`${id}-`))?.[1]
  const input = overrideInput ?? known?.input
  const output = overrideOutput ?? known?.output
  if (input == null || output == null) return null
  return Number(((usage.inputTokens * input + usage.outputTokens * output) / 1_000_000).toFixed(6))
}
