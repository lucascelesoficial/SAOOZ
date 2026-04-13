import { Resend } from 'resend'

// During build time RESEND_API_KEY may not be present — that is fine.
// All callers are server-side and only execute at runtime.
export const resend = new Resend(process.env.RESEND_API_KEY ?? 'missing')

export const FROM_EMAIL = 'SAOOZ <noreply@saooz.com>'
export const SUPPORT_EMAIL = 'suporte@saooz.com'
