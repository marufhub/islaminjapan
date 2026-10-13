import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Self-contained server bundle used by the Dockerfile.
  output: 'standalone',
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
  },
  // Japanese is the default language; the site root sends visitors to /ja.
  redirects: async () => [
    { source: '/', destination: '/ja', permanent: false },
    // The history section was renamed to "History of Islam in Japan".
    { source: '/:locale(ja|en)/islam-in-japan/:path*', destination: '/:locale/history-of-islam-in-japan/:path*', permanent: true },
  ],
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
