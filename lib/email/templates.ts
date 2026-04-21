// ─── Email HTML Templates ────────────────────────────────────────────────────
// Brand palette: bg #06080f  card #0e1017  blue #3b82f6  cyan #0ea5e9
// All layouts use tables — CSS Grid/Flex are not supported in email clients.

const YEAR = new Date().getFullYear()

// ─── Shared logo block ───────────────────────────────────────────────────────
const logo = `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding-bottom:36px;">
        <!-- Wordmark -->
        <div style="margin-bottom:6px;">
          <span style="font-size:30px;font-weight:900;letter-spacing:-1.5px;color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
            S<span style="color:#3b82f6;">A</span>OOZ
          </span>
        </div>
        <!-- Tagline -->
        <div style="font-size:10px;font-weight:600;letter-spacing:3.5px;text-transform:uppercase;color:#1e3a5f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
          gestão financeira inteligente
        </div>
      </td>
    </tr>
  </table>
`

// ─── Shared wrapper ───────────────────────────────────────────────────────────
const wrapper = (content: string, preheader = '') => `
<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>SAOOZ</title>
</head>
<body style="margin:0;padding:0;background:#06080f;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#06080f;">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
          <!-- Logo -->
          <tr><td>${logo}</td></tr>
          <!-- Card -->
          <tr>
            <td style="background:#0e1017;border:1px solid #1e293b;border-radius:16px;padding:40px 40px 36px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 6px;font-size:12px;color:#1f2937;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                © ${YEAR} SAOOZ &nbsp;·&nbsp;
                <a href="https://saooz.com" style="color:#1e3a5f;text-decoration:none;">saooz.com</a>
                &nbsp;·&nbsp;
                <a href="https://saooz.com/configuracoes" style="color:#1e3a5f;text-decoration:none;">Cancelar notificações</a>
              </p>
              <p style="margin:0;font-size:11px;color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                Você recebe este e-mail porque possui uma conta no SAOOZ.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// ─── Component helpers ────────────────────────────────────────────────────────

const h1 = (text: string) =>
  `<h1 style="margin:0 0 12px;font-size:22px;font-weight:800;line-height:1.3;color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${text}</h1>`

const p = (text: string) =>
  `<p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${text}</p>`

const btn = (href: string, label: string) =>
  `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td align="center" style="border-radius:10px;background:linear-gradient(135deg,#1d4ed8,#0284c7);">
        <a href="${href}" style="display:inline-block;padding:15px 36px;color:#fff;font-size:15px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;text-decoration:none;letter-spacing:0.3px;border-radius:10px;">${label}</a>
      </td>
    </tr>
  </table>`

const divider = () =>
  `<hr style="margin:28px 0;border:none;border-top:1px solid #1e293b;" />`

const small = (text: string) =>
  `<p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#475569;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${text}</p>`

const infoBox = (children: string) =>
  `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#070a10;border:1px solid #1e2030;border-radius:12px;margin:20px 0;">
    <tr><td style="padding:20px 24px;">${children}</td></tr>
  </table>`

// ─── Welcome / Confirm email ──────────────────────────────────────────────────
export function welcomeEmail(name: string, confirmUrl: string) {
  return wrapper(
    `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;background:#0a1628;border:1px solid #1d4ed840;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:24px;">✉️</div>
        </td>
      </tr>
    </table>
    ${h1('Acesso quase liberado')}
    ${p(`Olá${name ? ` <strong style="color:#e2e8f0;">${name}</strong>` : ''},`)}
    ${p('Clique no botão abaixo para verificar seu endereço de e-mail e ativar sua conta no SAOOZ.')}
    <div style="text-align:center;margin:32px 0;">
      ${btn(confirmUrl, 'Ativar minha conta →')}
    </div>
    ${divider()}
    ${small('Se você não criou uma conta no SAOOZ, ignore este e-mail com segurança.')}
    `,
    'Verifique seu e-mail para acessar o SAOOZ'
  )
}

// Versão texto puro
export function welcomeEmailText(name: string, confirmUrl: string) {
  return `Olá${name ? ` ${name}` : ''},

Sua conta no SAOOZ foi criada. Acesse o link abaixo para verificar seu e-mail e ativar o acesso:

${confirmUrl}

Se você não criou uma conta no SAOOZ, ignore este e-mail.

— Equipe SAOOZ
saooz.com`
}

// ─── Trial Started ────────────────────────────────────────────────────────────
export function trialStartedEmail(name: string, plan: string, trialEnd: string) {
  return wrapper(
    `
    ${h1(`Seu acesso ao SAOOZ está ativo 🚀`)}
    ${p(`Olá ${name}, você tem <strong style="color:#f1f5f9;">7 dias de acesso completo</strong> ao plano <strong style="color:#3b82f6;">${plan}</strong> — sem cobranças durante esse período.`)}
    ${p(`Seu período de avaliação termina em <strong style="color:#f1f5f9;">${trialEnd}</strong>.`)}
    ${infoBox(`
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.08em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">O que explorar agora</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:5px 0;font-size:14px;color:#9ca3af;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">→&nbsp; Registre sua primeira renda ou despesa</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#9ca3af;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">→&nbsp; Configure sua reserva de emergência</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#9ca3af;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">→&nbsp; Converse com a IA financeira</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#9ca3af;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">→&nbsp; Acompanhe sua carteira de investimentos</td></tr>
      </table>
    `)}
    <div style="text-align:center;margin:32px 0;">
      ${btn('https://saooz.com/central', 'Acessar o SAOOZ')}
    </div>
    ${small('Nenhuma cobrança será feita durante o período de avaliação. Cancele a qualquer momento.')}
    `,
    `${plan} ativado — 7 dias de acesso completo`
  )
}

export function trialStartedEmailText(name: string, plan: string, trialEnd: string) {
  return `Olá ${name},

Seu acesso ao SAOOZ está ativo. Você tem 7 dias completos no plano ${plan} sem nenhuma cobrança.

Período de avaliação termina em: ${trialEnd}

Acesse agora: https://saooz.com/central

Nenhum valor será cobrado durante o trial.

— Equipe SAOOZ
saooz.com`
}

// ─── Trial Ending Soon ────────────────────────────────────────────────────────
export function trialEndingSoonEmail(name: string, plan: string, daysLeft: number) {
  return wrapper(
    `
    ${h1(`Seu acesso gratuito termina em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`)}
    ${p(`Olá ${name}, seu período de avaliação do plano <strong style="color:#3b82f6;">${plan}</strong> está chegando ao fim.`)}
    ${p('Para continuar com acesso completo e não perder seus dados e histórico, mantenha seu plano ativo.')}
    <div style="text-align:center;margin:32px 0;">
      ${btn('https://saooz.com/planos', 'Continuar com o SAOOZ')}
    </div>
    ${divider()}
    ${small('Se preferir não assinar, não é necessário fazer nada — nenhum valor será cobrado sem sua confirmação.')}
    `,
    `Faltam ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'} para o fim do seu período gratuito`
  )
}

export function trialEndingSoonEmailText(name: string, plan: string, daysLeft: number) {
  return `Olá ${name},

Seu período gratuito no plano ${plan} termina em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}.

Para manter o acesso: https://saooz.com/planos

Se preferir não continuar, não é necessário fazer nada.

— Equipe SAOOZ
saooz.com`
}

// ─── Subscription Active ──────────────────────────────────────────────────────
export function subscriptionActiveEmail(name: string, plan: string, nextBilling: string) {
  return wrapper(
    `
    ${h1('Assinatura confirmada ✅')}
    ${p(`Olá ${name}, sua assinatura do plano <strong style="color:#3b82f6;">${plan}</strong> está ativa e tudo certo por aqui.`)}
    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:13px;color:#4b5563;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">Próxima renovação</td>
          <td align="right" style="font-size:14px;font-weight:700;color:#4ade80;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${nextBilling}</td>
        </tr>
      </table>
    `)}
    <div style="text-align:center;margin:32px 0;">
      ${btn('https://saooz.com/central', 'Acessar o SAOOZ')}
    </div>
    ${small('Gerencie sua assinatura em <a href="https://saooz.com/configuracoes" style="color:#3b82f6;text-decoration:none;">Configurações → Plano</a>.')}
    `,
    `Plano ${plan} ativo — bem-vindo ao SAOOZ`
  )
}

export function subscriptionActiveEmailText(name: string, plan: string, nextBilling: string) {
  return `Olá ${name},

Sua assinatura do plano ${plan} está confirmada e ativa.

Próxima renovação: ${nextBilling}

Acesse o SAOOZ: https://saooz.com/central
Gerenciar assinatura: https://saooz.com/configuracoes

— Equipe SAOOZ
saooz.com`
}

// ─── Password Reset ───────────────────────────────────────────────────────────
export function passwordResetEmail(resetUrl: string) {
  return wrapper(
    `
    ${h1('Redefinir senha')}
    ${p('Recebemos uma solicitação de redefinição de senha para esta conta. Clique no botão abaixo para criar uma nova senha.')}
    <div style="text-align:center;margin:32px 0;">
      ${btn(resetUrl, 'Criar nova senha →')}
    </div>
    ${divider()}
    ${p('Este link é válido por <strong style="color:#f1f5f9;">1 hora</strong>. Se você não solicitou, ignore este e-mail — sua senha permanece inalterada.')}
    ${small('Por segurança, nunca compartilhe este link com ninguém.')}
    `,
    'Link para redefinir sua senha do SAOOZ'
  )
}

export function passwordResetEmailText(resetUrl: string) {
  return `Recebemos uma solicitação de redefinição de senha.

Acesse o link abaixo para criar uma nova senha (válido por 1 hora):

${resetUrl}

Se você não solicitou, ignore este e-mail. Sua senha permanece inalterada.

— Equipe SAOOZ
saooz.com`
}

// ─── Due Date Reminder ────────────────────────────────────────────────────────
export interface DueItem {
  description: string
  amount:      number
  dueDate:     string
  type:        'receber' | 'pagar'
}

export function dueDateReminderEmail(name: string, items: DueItem[], scope: 'pf' | 'pj') {
  const count       = items.length
  const totalAmount = items.reduce((s, i) => s + i.amount, 0)
  const formatted   = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)
  const dashUrl     = scope === 'pj' ? 'https://saooz.com/empresa/fluxo-de-caixa' : 'https://saooz.com/financas'

  const rows = items.map((item) => {
    const color = item.type === 'receber' ? '#4ade80' : '#f87171'
    const label = item.type === 'receber' ? 'Receber' : 'Pagar'
    const amt   = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1e2030;font-size:13px;color:#9ca3af;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${item.description}</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e2030;font-size:12px;color:${color};text-align:center;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e2030;font-size:13px;color:#f1f5f9;text-align:right;font-weight:700;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${amt}</td>
      </tr>
    `
  }).join('')

  return wrapper(
    `
    ${h1(`${count} vencimento${count !== 1 ? 's' : ''} nos próximos dias`)}
    ${p(`Olá ${name}, estes lançamentos vencem em breve. Total: <strong style="color:#f1f5f9;">${formatted}</strong>.`)}
    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <th style="padding:0 0 12px;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;text-align:left;letter-spacing:.05em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">Descrição</th>
          <th style="padding:0 0 12px;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;text-align:center;letter-spacing:.05em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">Tipo</th>
          <th style="padding:0 0 12px;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;text-align:right;letter-spacing:.05em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">Valor</th>
        </tr>
        ${rows}
      </table>
    `)}
    <div style="text-align:center;margin:32px 0;">
      ${btn(dashUrl, 'Ver no SAOOZ')}
    </div>
    ${small('Você recebe este aviso porque tem lançamentos vencendo em até 3 dias. <a href="https://saooz.com/configuracoes" style="color:#3b82f6;text-decoration:none;">Gerenciar notificações</a>')}
    `,
    `${count} vencimento${count !== 1 ? 's' : ''} chegando — total ${formatted}`
  )
}

export function dueDateReminderEmailText(name: string, items: DueItem[], scope: 'pf' | 'pj') {
  const dashUrl = scope === 'pj' ? 'https://saooz.com/empresa/fluxo-de-caixa' : 'https://saooz.com/financas'
  const lines = items.map(i => {
    const amt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(i.amount)
    return `- ${i.description} (${i.type === 'receber' ? 'A receber' : 'A pagar'}): ${amt}`
  }).join('\n')
  return `Olá ${name},

Você tem ${items.length} vencimento${items.length !== 1 ? 's' : ''} nos próximos dias:

${lines}

Acesse o SAOOZ para gerenciar: ${dashUrl}

— Equipe SAOOZ
saooz.com`
}

// ─── Overdue Alert ────────────────────────────────────────────────────────────
export function overdueAlertEmail(name: string, items: DueItem[], scope: 'pf' | 'pj') {
  const count     = items.length
  const totalAmt  = items.reduce((s, i) => s + i.amount, 0)
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmt)
  const dashUrl   = scope === 'pj' ? 'https://saooz.com/empresa/fluxo-de-caixa' : 'https://saooz.com/financas'

  return wrapper(
    `
    ${h1(`${count} lançamento${count !== 1 ? 's' : ''} em atraso`)}
    ${p(`Olá ${name}, você possui <strong style="color:#f87171;">${count} lançamento${count !== 1 ? 's' : ''} em atraso</strong>, totalizando <strong style="color:#f1f5f9;">${formatted}</strong>.`)}
    ${p('Regularize o quanto antes para manter suas finanças em dia.')}
    <div style="text-align:center;margin:32px 0;">
      ${btn(dashUrl, 'Resolver agora')}
    </div>
    ${divider()}
    ${small('<a href="https://saooz.com/configuracoes" style="color:#3b82f6;text-decoration:none;">Gerenciar notificações</a>')}
    `,
    `Atenção: ${count} lançamento${count !== 1 ? 's' : ''} vencido${count !== 1 ? 's' : ''}`
  )
}

export function overdueAlertEmailText(name: string, items: DueItem[], scope: 'pf' | 'pj') {
  const dashUrl = scope === 'pj' ? 'https://saooz.com/empresa/fluxo-de-caixa' : 'https://saooz.com/financas'
  const total = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    items.reduce((s, i) => s + i.amount, 0)
  )
  return `Olá ${name},

Você tem ${items.length} lançamento${items.length !== 1 ? 's' : ''} em atraso totalizando ${total}.

Acesse o SAOOZ para regularizar: ${dashUrl}

— Equipe SAOOZ
saooz.com`
}

// ─── Monthly Digest ───────────────────────────────────────────────────────────
export interface MonthlyDigestData {
  month:         string
  totalIncome:   number
  totalExpenses: number
  balance:       number
  topCategory:   string
  topAmount:     number
  savingsRate:   number  // 0–1
  scope:         'pf' | 'pj'
  businessName?: string
}

export function monthlyDigestEmail(name: string, data: MonthlyDigestData) {
  const fmt        = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
  const isPositive = data.balance >= 0
  const balColor   = isPositive ? '#4ade80' : '#f87171'
  const balSign    = isPositive ? '+' : ''
  const srPct      = Math.round(data.savingsRate * 100)
  const srColor    = srPct >= 20 ? '#4ade80' : srPct >= 10 ? '#f59e0b' : '#f87171'
  const dashUrl    = data.scope === 'pj' ? 'https://saooz.com/empresa/dre' : 'https://saooz.com/analise'
  const subtitle   = data.scope === 'pj' && data.businessName ? `${data.businessName} · ` : ''

  return wrapper(
    `
    ${h1(`Fechamento de ${data.month} 📊`)}
    ${p(`Olá ${name}, ${subtitle}aqui está o resumo financeiro de <strong style="color:#f1f5f9;">${data.month}</strong>.`)}

    <!-- Income / Expenses side by side via table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
      <tr>
        <td width="48%" style="background:#070a10;border:1px solid #1e2030;border-radius:12px;padding:16px 20px;vertical-align:top;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.08em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${data.scope === 'pj' ? 'Receitas' : 'Rendas'}</p>
          <p style="margin:0;font-size:20px;font-weight:800;color:#4ade80;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${fmt(data.totalIncome)}</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background:#070a10;border:1px solid #1e2030;border-radius:12px;padding:16px 20px;vertical-align:top;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.08em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">Despesas</p>
          <p style="margin:0;font-size:20px;font-weight:800;color:#f87171;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${fmt(data.totalExpenses)}</p>
        </td>
      </tr>
    </table>

    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#4b5563;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${isPositive ? 'Saldo / Lucro' : 'Déficit'}</td>
          <td align="right" style="padding:4px 0;font-size:16px;font-weight:800;color:${balColor};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${balSign}${fmt(data.balance)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0 4px;font-size:13px;color:#4b5563;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">Taxa de poupança</td>
          <td align="right" style="padding:10px 0 4px;font-size:15px;font-weight:700;color:${srColor};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${srPct}%</td>
        </tr>
        <tr>
          <td style="padding:10px 0 4px;font-size:13px;color:#4b5563;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">Maior gasto</td>
          <td align="right" style="padding:10px 0 4px;font-size:13px;color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${data.topCategory} · ${fmt(data.topAmount)}</td>
        </tr>
      </table>
    `)}

    <div style="text-align:center;margin:32px 0;">
      ${btn(dashUrl, 'Ver análise completa')}
    </div>
    ${small('<a href="https://saooz.com/configuracoes" style="color:#3b82f6;text-decoration:none;">Gerenciar preferências de e-mail</a>')}
    `,
    `Seu fechamento de ${data.month} está pronto`
  )
}

export function monthlyDigestEmailText(name: string, data: MonthlyDigestData) {
  const fmt     = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
  const srPct   = Math.round(data.savingsRate * 100)
  const dashUrl = data.scope === 'pj' ? 'https://saooz.com/empresa/dre' : 'https://saooz.com/analise'
  return `Olá ${name},

Fechamento de ${data.month}:

${data.scope === 'pj' ? 'Receitas' : 'Rendas'}: ${fmt(data.totalIncome)}
Despesas:     ${fmt(data.totalExpenses)}
Saldo:        ${fmt(data.balance)}
Poupança:     ${srPct}%
Maior gasto:  ${data.topCategory} (${fmt(data.topAmount)})

Ver análise completa: ${dashUrl}

— Equipe SAOOZ
saooz.com`
}
