import config from '@payload-config'
import { getPayload } from 'payload'

import { seed } from './seed'

const payload = await getPayload({ config })
try {
  const report = await seed(payload)
  payload.logger.info(`Seed complete: ${report.created.length} created, ${report.skipped.length} already existed.`)
  payload.logger.info('All seeded articles, FAQs and history events are UNPUBLISHED drafts awaiting editorial review.')
  process.exit(0)
} catch (error) {
  payload.logger.error({ err: error }, 'Seed failed')
  process.exit(1)
}
