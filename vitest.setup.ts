// Load .env, then point integration tests at the dedicated test database.
import 'dotenv/config'

if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
}
