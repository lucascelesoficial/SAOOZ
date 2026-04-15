import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  if (posthog.__loaded) return

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // We capture manually via PostHogProvider
    capture_pageleave: true,
    autocapture: true,
    persistence: 'localStorage+cookie',
  })
}

// ─── Typed event helpers ─────────────────────────────────────────────────────

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>,
) {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  posthog.capture(event, properties)
}

export function identifyUser(
  userId: string,
  traits?: { name?: string; email?: string; plan?: string; mode?: string },
) {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  posthog.identify(userId, traits)
}

export function resetUser() {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  posthog.reset()
}

// ─── Named events (type-safe, consistent naming) ─────────────────────────────

export const EVENTS = {
  // Auth
  USER_LOGIN:   'user_login',
  USER_SIGNUP:  'user_signup',
  USER_LOGOUT:  'user_logout',

  // Onboarding
  ONBOARDING_STEP: 'onboarding_step_completed',
  ONBOARDING_DONE: 'onboarding_completed',

  // Financeiro PF
  EXPENSE_ADDED:   'expense_added',
  INCOME_ADDED:    'income_added',
  RESERVE_UPDATED: 'reserve_updated',

  // Financeiro PJ
  REVENUE_ADDED:   'business_revenue_added',
  BIZ_EXPENSE:     'business_expense_added',
  CLIENT_ADDED:    'client_added',
  EMPLOYEE_ADDED:  'employee_added',

  // Upgrade
  UPGRADE_CLICKED: 'upgrade_clicked',
  PLAN_PAGE_VIEW:  'plan_page_viewed',

  // IA
  AI_CHAT_SENT:    'ai_chat_message_sent',
  INSIGHT_VIEWED:  'intelligence_insight_viewed',

  // Reports
  PDF_EXPORTED:    'pdf_exported',
  CSV_EXPORTED:    'csv_exported',
} as const
