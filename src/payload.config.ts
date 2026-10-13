import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { ja } from '@payloadcms/translations/languages/ja'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { EditorialTopics } from './collections/EditorialTopics'
import { FAQs } from './collections/FAQs'
import { HistoryEvents } from './collections/HistoryEvents'
import { Media } from './collections/Media'
import { Sources } from './collections/Sources'
import { Users } from './collections/Users'
import { ContactSettings } from './globals/ContactSettings'
import { EditorialPolicy } from './globals/EditorialPolicy'
import { Footer } from './globals/Footer'
import { Homepage } from './globals/Homepage'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'
import { DEFAULT_LOCALE } from './lib/i18n/config'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}. See .env.example.`)
  return value
}

const s3Enabled = Boolean(process.env.S3_BUCKET)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — Islam in Japan CMS' },
  },
  collections: [Articles, HistoryEvents, FAQs, Sources, Categories, Media, EditorialTopics, Users],
  globals: [SiteSettings, Navigation, Homepage, Footer, ContactSettings, EditorialPolicy],
  localization: {
    locales: [
      { code: 'ja', label: '日本語' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: DEFAULT_LOCALE,
    // Never silently show another language as if it were a translation.
    fallback: false,
  },
  i18n: {
    supportedLanguages: { ja, en },
    fallbackLanguage: 'ja',
  },
  editor: lexicalEditor(),
  secret: requireEnv('PAYLOAD_SECRET'),
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: requireEnv('DATABASE_URL') },
    // Schema changes always go through migrations (`pnpm migrate:create`), in every environment.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    s3Storage({
      enabled: s3Enabled,
      collections: { media: true },
      bucket: process.env.S3_BUCKET ?? '',
      config: {
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
        },
      },
    }),
  ],
})
