import { cleanupFixtures } from '../helpers/fixtures'

export default async function globalTeardown() {
  await cleanupFixtures()
}
