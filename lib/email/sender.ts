import { resend, FROM_EMAIL } from './client'
import {
  welcomeEmail,
  trialStartedEmail,
  trialEndingSoonEmail,
  subscriptionActiveEmail,
  passwordResetEmail,
  dueDateReminderEmail,
  overdueAlertEmail,
  monthlyDigestEmail,
  type DueItem,
  type MonthlyDigestData,
} from './templates'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
    if (error) {
      console.error('[email] send error:', error)
      return { ok: false, error }
    }
    return { ok: true, id: data?.id }
  } catch (err) {
    console.error('[email] unexpected error:', err)
    return { ok: false, error: err }
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, confirmUrl: string) {
  return send(to, 'Confirme seu email no SAOOZ', welcomeEmail(name, confirmUrl))
}

export async function sendTrialStartedEmail(
  to: string,
  name: string,
  plan: string,
  trialEnd: string,
) {
  return send(
    to,
    `Seu teste grátis de 7 dias no SAOOZ começou 🚀`,
    trialStartedEmail(name, plan, trialEnd),
  )
}

export async function sendTrialEndingSoonEmail(
  to: string,
  name: string,
  plan: string,
  daysLeft: number,
) {
  return send(
    to,
    `Seu teste no SAOOZ termina em ${daysLeft} dias`,
    trialEndingSoonEmail(name, plan, daysLeft),
  )
}

export async function sendSubscriptionActiveEmail(
  to: string,
  name: string,
  plan: string,
  nextBilling: string,
) {
  return send(
    to,
    'Sua assinatura SAOOZ está ativa ✅',
    subscriptionActiveEmail(name, plan, nextBilling),
  )
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return send(to, 'Redefina sua senha no SAOOZ', passwordResetEmail(resetUrl))
}

export async function sendDueDateReminderEmail(
  to:    string,
  name:  string,
  items: DueItem[],
  scope: 'pf' | 'pj',
) {
  const count = items.length
  return send(
    to,
    `Você tem ${count} vencimento${count !== 1 ? 's' : ''} nos próximos dias ⏰`,
    dueDateReminderEmail(name, items, scope),
  )
}

export async function sendOverdueAlertEmail(
  to:    string,
  name:  string,
  items: DueItem[],
  scope: 'pf' | 'pj',
) {
  const count = items.length
  return send(
    to,
    `Atenção: ${count} lançamento${count !== 1 ? 's' : ''} em atraso no SAOOZ ⚠️`,
    overdueAlertEmail(name, items, scope),
  )
}

export async function sendMonthlyDigestEmail(
  to:   string,
  name: string,
  data: MonthlyDigestData,
) {
  return send(
    to,
    `Seu fechamento de ${data.month} está pronto 📊`,
    monthlyDigestEmail(name, data),
  )
}

// Re-export types for convenience
export type { DueItem, MonthlyDigestData }
