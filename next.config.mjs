import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' }
    ]
  },
  // Required for Sentry instrumentation hook
  experimental: {
    instrumentationHook: true,
  },
}

export default withSentryConfig(nextConfig, {
  // Sentry org and project (set in CI or Vercel env vars)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for source map upload (set in CI or Vercel env vars)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress source map upload warnings locally when token is absent
  silent: !process.env.CI,

  // Disable source map upload if DSN is not set (local dev without Sentry)
  disableClientWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  disableServerWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Automatically tree-shake Sentry logger statements in production
  disableLogger: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,
})
