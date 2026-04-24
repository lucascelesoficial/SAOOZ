import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from './client'
import {
  welcomeEmail,          welcomeEmailText,
  trialStartedEmail,     trialStartedEmailText,
  trialEndingSoonEmail,  trialEndingSoonEmailText,
  subscriptionActiveEmail, subscriptionActiveEmailText,
  passwordResetEmail,    passwordResetEmailText,
  dueDateReminderEmail,  dueDateReminderEmailText,
  overdueAlertEmail,     overdueAlertEmailText,
  monthlyDigestEmail,    monthlyDigestEmailText,
  teamInviteEmail,       teamInviteEmailText,
  type DueItem,
  type MonthlyDigestData,
} from './templates'

// ─── Headers comuns a todos os e-mails ────────────────────────────────────────
// List-Unsubscribe é exigido por Gmail e Yahoo para remetentes em volume.
// Sem ele os provedores aumentam a pontuação de spam automaticamente.
const BASE_HEADERS = {
  'List-Unsubscribe': '<https://saooz.com/configuracoes>, <mailto:suporte@saooz.com?subject=unsubscribe>',
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  'X-Entity-Ref-ID': 'saooz-transactional',
}

// ─── Helper central ───────────────────────────────────────────────────────────
async function send(to: string, subject: string, html: string, text: string) {
  try {
    const { data, error } = await resend.emails.send({
      from:    FROM_EMAIL,
      to,
      subject,
      html,
      text,                 // plain-text obrigatório para evitar spam
      replyTo: REPLY_TO_EMAIL,
      headers: BASE_HEADERS,
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

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, confirmUrl: string) {
  return send(
    to,
    'Ative sua conta no SAOOZ',
    welcomeEmail(name, confirmUrl),
    welcomeEmailText(name, confirmUrl),
  )
}

export async function sendTrialStartedEmail(
  to: string,
  name: string,
  plan: string,
  trialEnd: string,
) {
  return send(
    to,
    `Seu acesso ao SAOOZ está ativo — plano ${plan}`,
    trialStartedEmail(name, plan, trialEnd),
    trialStartedEmailText(name, plan, trialEnd),
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
    `Seu período gratuito termina em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`,
    trialEndingSoonEmail(name, plan, daysLeft),
    trialEndingSoonEmailText(name, plan, daysLeft),
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
    `Plano ${plan} confirmado — SAOOZ`,
    subscriptionActiveEmail(name, plan, nextBilling),
    subscriptionActiveEmailText(name, plan, nextBilling),
  )
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return send(
    to,
    'Sua solicitação de nova senha — SAOOZ',
    passwordResetEmail(resetUrl),
    passwordResetEmailText(resetUrl),
  )
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
    `${count} vencimento${count !== 1 ? 's' : ''} chegando — SAOOZ`,
    dueDateReminderEmail(name, items, scope),
    dueDateReminderEmailText(name, items, scope),
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
    `${count} lançamento${count !== 1 ? 's' : ''} em atraso — SAOOZ`,
    overdueAlertEmail(name, items, scope),
    overdueAlertEmailText(name, items, scope),
  )
}

export async function sendMonthlyDigestEmail(
  to:   string,
  name: string,
  data: MonthlyDigestData,
) {
  return send(
    to,
    `Fechamento de ${data.month} disponível — SAOOZ`,
    monthlyDigestEmail(name, data),
    monthlyDigestEmailText(name, data),
  )
}

export async function sendTeamInviteEmail(
  to: string,
  businessName: string,
  ownerName: string,
  hasAccount: boolean,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pearfy.com.br'
  const subject = hasAccount
    ? `Você foi adicionado à equipe de ${businessName} — PearFy`
    : `Convite para a equipe de ${businessName} no PearFy`
  return send(
    to,
    subject,
    teamInviteEmail(businessName, ownerName, hasAccount, appUrl),
    teamInviteEmailText(businessName, ownerName, hasAccount, appUrl),
  )
}

// Re-export types
export type { DueItem, MonthlyDigestData }
