import { seedFixtures } from '../helpers/fixtures'

export default async function globalSetup() {
  await seedFixtures()
}
