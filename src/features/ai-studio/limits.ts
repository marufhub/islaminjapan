import type { Payload } from 'payload'

import { aiConfig, type ModelTier } from '@/lib/ai/config'
import { AIError, type TokenUsage } from '@/lib/ai/errors'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const since = (now: Date, ms: number) => new Date(now.getTime() - ms).toISOString()

/** Start of the current calendar month in Japan time, as an ISO timestamp. */
export const startOfMonthTokyo = (now: Date): string => {
  const tokyo = new Date(now.getTime() + 9 * HOUR_MS)
  return new Date(Date.UTC(tokyo.getUTCFullYear(), tokyo.getUTCMonth(), 1) - 9 * HOUR_MS).toISOString()
}

/** Site-wide ESTIMATED spend this month (all users). */
export const estimatedSpendThisMonth = async (payload: Payload, now: Date = new Date()): Promise<number> => {
  const { docs } = await payload.find({
    collection: 'ai-usage',
    where: { createdAt: { greater_than_equal: startOfMonthTokyo(now) } },
    select: { estimatedCostUsd: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  return docs.reduce((total, doc) => total + (doc.estimatedCostUsd ?? 0), 0)
}

const tokensUsedToday = async (payload: Payload, userId: number, now: Date): Promise<number> => {
  const { docs } = await payload.find({
    collection: 'ai-usage',
    where: { and: [{ user: { equals: userId } }, { createdAt: { greater_than: since(now, DAY_MS) } }] },
    select: { inputTokens: true, outputTokens: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  return docs.reduce((total, doc) => total + (doc.inputTokens ?? 0) + (doc.outputTokens ?? 0), 0)
}

/**
 * Reserves an AI request: writes a `pending` usage row FIRST (carrying a worst-case cost estimate),
 * then checks the per-user hourly count and the site-wide monthly estimated spend including in-flight
 * requests. Inserting before checking means a burst of parallel requests cannot all pass. The per-user
 * daily token budget counts completed requests only (soft limit). Returns the reservation id, which
 * must be finished with `finishUsage`, replacing the reserved estimate with the actual one.
 */
export const reserveRequest = async (
  payload: Payload,
  userId: number,
  action: string,
  meta: { tier: ModelTier; promptVersion: string; reservedCostUsd: number | null },
  now: Date = new Date(),
): Promise<number> => {
  const { hourlyRequestLimit, dailyTokenBudget, monthlyBudgetUsd } = aiConfig()

  if ((await tokensUsedToday(payload, userId, now)) >= dailyTokenBudget) {
    payload.logger.info({ userId, action }, 'AI request rejected: daily token budget reached')
    throw new AIError('budget_exceeded', 'Daily AI token budget reached. It resets on a rolling 24-hour basis.')
  }

  const reservation = await payload.create({
    collection: 'ai-usage',
    data: {
      user: userId,
      action,
      status: 'pending',
      inputTokens: 0,
      outputTokens: 0,
      modelTier: meta.tier,
      promptVersion: meta.promptVersion,
      estimatedCostUsd: meta.reservedCostUsd ?? undefined,
    },
    overrideAccess: true,
  })
  const { totalDocs } = await payload.count({
    collection: 'ai-usage',
    where: { and: [{ user: { equals: userId } }, { createdAt: { greater_than: since(now, HOUR_MS) } }] },
    overrideAccess: true,
  })
  // Rejected requests are not kept, so throttled clients cannot grow the table.
  const reject = async (error: AIError, reason: string) => {
    await payload.delete({ collection: 'ai-usage', id: reservation.id, overrideAccess: true })
    payload.logger.info({ userId, action }, `AI request rejected: ${reason}`)
    throw error
  }
  if (totalDocs > hourlyRequestLimit) {
    await reject(new AIError('rate_limited', `Hourly AI request limit reached (${hourlyRequestLimit}). Please try again later.`), 'hourly limit reached')
  }
  if ((await estimatedSpendThisMonth(payload, now)) > monthlyBudgetUsd) {
    await reject(
      new AIError(
        'budget_exceeded',
        `The site's monthly AI budget (estimated US$${monthlyBudgetUsd}) has been reached. An admin can raise AI_MONTHLY_BUDGET_USD. This is an estimate, not the billed amount.`,
      ),
      'monthly site budget reached',
    )
  }
  return reservation.id
}

export type UsageOutcome = {
  status: 'success' | 'error'
  model?: string
  errorKind?: string
  usage?: TokenUsage
  requestId?: string | null
  estimatedCostUsd?: number | null
}

/** Completes a reservation with outcome metadata only — never prompts, sources or generated text. */
export const finishUsage = async (payload: Payload, reservationId: number, outcome: UsageOutcome): Promise<void> => {
  try {
    await payload.update({
      collection: 'ai-usage',
      id: reservationId,
      data: {
        status: outcome.status,
        model: outcome.model,
        errorKind: outcome.errorKind,
        // Failed calls (truncated, refused, malformed) still consumed tokens and count toward the budget.
        inputTokens: outcome.usage?.inputTokens ?? 0,
        outputTokens: outcome.usage?.outputTokens ?? 0,
        requestId: outcome.requestId ?? undefined,
        // Replaces the worst-case reservation with the estimate for actual usage.
        estimatedCostUsd: outcome.estimatedCostUsd ?? null,
      },
      overrideAccess: true,
    })
  } catch (error) {
    payload.logger.error({ err: error, reservationId }, 'Failed to record AI usage')
  }
}
