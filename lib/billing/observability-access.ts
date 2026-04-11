const ADMIN_EMAILS_ENV_KEYS = [
  'BILLING_OBSERVABILITY_ADMIN_EMAILS',
  'INTERNAL_ADMIN_EMAILS',
] as const

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function parseEmailList(input: string | undefined) {
  if (!input) {
    return []
  }

  return input
    .split(',')
    .map((value) => normalizeEmail(value))
    .filter((value) => value.length > 0)
}

export function getBillingObservabilityAdminEmails() {
  const values = ADMIN_EMAILS_ENV_KEYS.flatMap((envKey) =>
    parseEmailList(process.env[envKey])
  )

  return new Set(values)
}

export function canAccessBillingObservability(userEmail: string | null | undefined) {
  const normalizedEmail = userEmail ? normalizeEmail(userEmail) : null
  const allowedEmails = getBillingObservabilityAdminEmails()

  if (allowedEmails.size === 0) {
    return process.env.NODE_ENV !== 'production'
  }

  if (!normalizedEmail) {
    return false
  }

  return allowedEmails.has(normalizedEmail)
}
