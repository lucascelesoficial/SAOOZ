export const ACTIVE_BUSINESS_COOKIE = 'saooz_active_business_id'
export const ACTIVE_BUSINESS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180

export function isMissingActiveBusinessColumnError(message: string) {
  const normalized = message.toLowerCase()

  return (
    normalized.includes("active_business_id") &&
    (normalized.includes('schema cache') ||
      normalized.includes('does not exist') ||
      normalized.includes('could not find the'))
  )
}
