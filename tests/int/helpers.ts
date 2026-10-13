import { sql } from '@payloadcms/db-postgres'
import { getPayload, type Payload } from 'payload'

import { migrations } from '@/migrations'
import config from '@/payload.config'
import type { User } from '@/payload-types'

/** Payload client on a freshly migrated test database (DATABASE_URL_TEST). */
export const getTestPayload = async (): Promise<Payload> => {
  if (!process.env.DATABASE_URL?.includes('_test')) {
    throw new Error('Refusing to run integration tests against a non-test database. Set DATABASE_URL_TEST.')
  }
  const payload = await getPayload({ config: await config })
  const db = payload.db as unknown as { drizzle: { execute: (query: unknown) => Promise<unknown> } }
  await db.drizzle.execute(sql`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`)
  // Generated migration modules are typed for the Postgres adapter; the generic signature is wider.
  await payload.db.migrate({ migrations: migrations as never })
  return payload
}

export const createUser = async (payload: Payload, role: User['role'], name: string): Promise<User> =>
  payload.create({
    collection: 'users',
    data: { email: `${name.toLowerCase()}@example.test`, password: 'test-password-123', name, role },
    draft: false,
  })
