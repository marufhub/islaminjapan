import type { User } from '@/payload-types'

import { getPayloadClient } from '../payload'

type Relation = number | User | null | undefined

const relationId = (value: Relation): number | null =>
  typeof value === 'number' ? value : value && typeof value === 'object' ? value.id : null

/**
 * Public bylines. User accounts are private, so only display names are read (server-side),
 * never emails or roles.
 */
export const getDisplayNames = async (relations: Relation[]): Promise<Map<number, string>> => {
  const ids = [...new Set(relations.map(relationId).filter((id): id is number => id !== null))]
  if (ids.length === 0) return new Map()
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'users',
    where: { id: { in: ids } },
    limit: ids.length,
    depth: 0,
    select: { name: true },
    overrideAccess: true,
  })
  return new Map(docs.map((doc) => [doc.id, doc.name]))
}

export const displayName = (names: Map<number, string>, relation: Relation): string | null => {
  const id = relationId(relation)
  return id === null ? null : (names.get(id) ?? null)
}
