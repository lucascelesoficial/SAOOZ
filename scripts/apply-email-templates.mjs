/**
 * apply-email-templates.mjs
 *
 * Applies SAOOZ custom email templates + Resend SMTP to Supabase.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxxx node scripts/apply-email-templates.mjs
 *
 * Get your token at: https://app.supabase.com/account/tokens
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))

const PROJECT_REF   = 'usegvbsijgeemdtgujrl'
const MGMT_API      = 'https://api.supabase.com/v1'
const ACCESS_TOKEN  = process.env.SUPABASE_ACCESS_TOKEN
const RESEND_KEY    = process.env.RESEND_API_KEY ?? 're_CYPZyaVf_EeJeWQUoAgz8LPqvuAVu5fKN'

if (!ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN is required.')
  console.error('   Get yours at: https://app.supabase.com/account/tokens')
  console.error('   Then run:  SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-email-templates.mjs')
  process.exit(1)
}

const confirmHtml = readFileSync(
  join(__dir, '../supabase/email-templates/confirm-signup.html'), 'utf8'
)
const resetHtml = readFileSync(
  join(__dir, '../supabase/email-templates/reset-password.html'), 'utf8'
)

const payload = {
  // ── SMTP via Resend ────────────────────────────────────────────────────
  smtp_admin_email:   'noreply@saooz.com',
  smtp_host:          'smtp.resend.com',
  smtp_port:          465,
  smtp_user:          'resend',
  smtp_pass:          RESEND_KEY,
  smtp_sender_name:   'SAOOZ',
  smtp_max_frequency: 60,

  // ── Email subjects ─────────────────────────────────────────────────────
  mailer_subjects: {
    confirmation:   'Confirme seu e-mail — SAOOZ',
    recovery:       'Redefina sua senha — SAOOZ',
    magic_link:     'Seu link de acesso — SAOOZ',
    email_change:   'Confirme a alteração de e-mail — SAOOZ',
    invite:         'Você foi convidado para o SAOOZ',
  },

  // ── Email templates ────────────────────────────────────────────────────
  mailer_templates: {
    confirmation: { content: confirmHtml },
    recovery:     { content: resetHtml },
  },
}

console.log('🚀 Applying email templates to Supabase project:', PROJECT_REF)

const res = await fetch(`${MGMT_API}/projects/${PROJECT_REF}/config/auth`, {
  method:  'PATCH',
  headers: {
    Authorization:  `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

const data = await res.json().catch(() => null)

if (!res.ok) {
  console.error('❌ Failed:', res.status, JSON.stringify(data, null, 2))
  process.exit(1)
}

console.log('✅ Email templates and SMTP applied successfully!')
console.log('   Sender:   SAOOZ <noreply@saooz.com>')
console.log('   SMTP:     smtp.resend.com:465 (via Resend)')
console.log('')
console.log('   Templates updated:')
console.log('   • Confirm signup  →  supabase/email-templates/confirm-signup.html')
console.log('   • Reset password  →  supabase/email-templates/reset-password.html')
console.log('')
console.log('   Test by signing up at: https://saooz.com/cadastro')
