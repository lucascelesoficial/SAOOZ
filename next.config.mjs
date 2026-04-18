// ── Security Headers ─────────────────────────────────────────────────────────
// Applied to every response via next.config headers array.
// These are the first layer of defense — enforce at CDN/edge level.

const APP_HOST = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
  : 'saooz.com'

/**
 * Content-Security-Policy
 *
 * - default-src 'self'           → only same-origin by default
 * - script-src                   → self + unsafe-inline (Next.js hydration) + Stripe + Cloudflare Turnstile
 * - style-src                    → self + unsafe-inline (Tailwind inline styles)
 * - img-src                      → self + data: + Supabase CDN + Stripe assets
 * - connect-src                  → self + Supabase RT + Groq + PostHog + Sentry
 * - frame-src                    → Stripe Checkout iframes only
 * - object-src 'none'            → blocks Flash / plugins
 * - base-uri 'self'              → prevents base tag injection
 * - form-action 'self' + Stripe  → prevents form hijacking
 * - upgrade-insecure-requests    → auto-upgrade HTTP → HTTPS
 */
const CSP = [
  "default-src 'self'",
  // unsafe-eval removed — not required by Next.js 14 App Router in production
  // unsafe-inline retained for Next.js hydration inline scripts
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://maps.stripe.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com`,
  [
    "connect-src 'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://api.stripe.com',
    'https://us.i.posthog.com',
    'https://o*.ingest.sentry.io',
    'https://api.groq.com',
    'https://api.elevenlabs.io',
    'https://challenges.cloudflare.com',
  ].join(' '),
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' https://checkout.stripe.com`,
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  // ── Transport ───────────────────────────────────────────────────────────
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',  // 2 years
  },
  // ── Content injection ───────────────────────────────────────────────────
  {
    key: 'Content-Security-Policy',
    value: CSP,
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // ── Framing / clickjacking ──────────────────────────────────────────────
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // ── Referrer ───────────────────────────────────────────────────────────
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // ── Permissions ────────────────────────────────────────────────────────
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'interest-cohort=()',  // blocks FLoC / Topics API
    ].join(', '),
  },
  // ── Server fingerprint removal ──────────────────────────────────────────
  {
    key: 'X-Powered-By',
    value: '',  // empty removes the header
  },
  // ── DNS prefetch control ────────────────────────────────────────────────
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // ── Cross-origin policies ───────────────────────────────────────────────
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups',  // allows Stripe popup
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' }
    ]
  },

  experimental: {},

  // ── Security headers on all routes ────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to all routes except static assets (handled by CDN)
        source: '/((?!_next/static|_next/image|favicon\\.ico).*)',
        headers: securityHeaders,
      },
      {
        // CORS: restrict API routes to same origin + known allowed origins
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL ?? `https://${APP_HOST}`,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ]
  },

  // ── Redirects: enforce HTTPS in production ────────────────────────────
  async redirects() {
    if (process.env.NODE_ENV !== 'production') return []
    return [
      {
        source: '/(.*)',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: `https://${APP_HOST}/:path*`,
        permanent: true,
      },
    ]
  },
}

// Sentry desabilitado até DSN ser configurado — withSentryConfig com
// instrumentationHook travava todas as serverless functions em produção.
export default nextConfig
