import { UNKNOWN_REQUESTER } from './service'

/**
 * Client address for rate limiting.
 * - If the hosting platform sets a trusted header (e.g. `x-real-ip`, `cf-connecting-ip`), configure it via
 *   TRUSTED_CLIENT_IP_HEADER and only that header is used.
 * - Otherwise the RIGHTMOST `x-forwarded-for` entry is used: it is appended by the nearest proxy, whereas
 *   leftmost entries can be set freely by the client.
 */
export const clientAddress = (headerList: Headers, trustedHeader?: string): string => {
  if (trustedHeader) return headerList.get(trustedHeader)?.trim() || UNKNOWN_REQUESTER
  const forwarded = headerList.get('x-forwarded-for')?.split(',').map((part) => part.trim()).filter(Boolean)
  return forwarded?.at(-1) || headerList.get('x-real-ip')?.trim() || UNKNOWN_REQUESTER
}
