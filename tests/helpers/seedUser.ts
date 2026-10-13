import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

export type TestUser = { email: string; password: string; name: string; role: 'admin' | 'editor' | 'author' }

export const testUser: TestUser = {
  email: 'e2e-admin@example.test',
  password: 'e2e-test-password',
  name: 'E2E Admin',
  role: 'admin',
}

/** Separate account per spec file, because Playwright runs spec files in parallel. */
export const studioTestUser: TestUser = { ...testUser, email: 'e2e-studio@example.test', name: 'E2E Studio' }

/**
 * Seeds a test user for e2e admin tests (replacing any previous copy).
 */
export async function seedTestUser(user: TestUser = testUser): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: { email: { equals: user.email } } })
  await payload.create({ collection: 'users', data: user, draft: false })
}

/**
 * Cleans up the test user after tests
 */
export async function cleanupTestUser(user: TestUser = testUser): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: { email: { equals: user.email } } })
}
