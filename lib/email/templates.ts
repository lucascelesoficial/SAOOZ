// ─── Email HTML Templates ───────────────────────────────────────────────────
// All templates share the same dark-brand wrapper for a premium feel.
// Brand palette: bg #06080f, card #0e1017, blue #3b82f6, cyan #0ea5e9

const YEAR = new Date().getFullYear()

const wrapper = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SAOOZ</title>
</head>
<body style="margin:0;padding:0;background:#06080f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#06080f;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <!-- Wordmark -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#f1f5f9;">
                S<span style="color:#3b82f6;">A</span>OOZ
              </span>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#0e1017;border:1px solid #1e293b;border-radius:16px;padding:40px 36px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#374151;">
                © ${YEAR} SAOOZ &nbsp;·&nbsp;
                <a href="https://saooz.com" style="color:#4b5563;text-decoration:none;">saooz.com</a>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#1f2937;">
                Você está recebendo este e-mail porque tem uma conta no SAOOZ.
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

const h1 = (text: string) =>
  `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">${text}</h1>`

const p = (text: string) =>
  `<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#94a3b8;">${text}</p>`

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3b82f6,#0ea5e9);color:#fff;font-size:15px;font-weight:700;border-radius:10px;text-decoration:none;letter-spacing:0.2px;">${label}</a>`

const divider = () =>
  `<hr style="margin:28px 0;border:none;border-top:1px solid #1e293b;" />`

const small = (text: string) =>
  `<p style="margin:16px 0 0;font-size:12px;color:#475569;">${text}</p>`

// ─── Confirm signup (Resend-sent version) ─────────────────────────────────────
export function welcomeEmail(name: string, confirmUrl: string) {
  return wrapper(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#1e3a5f;border:1px solid #1d4ed830;border-radius:50%;width:60px;height:60px;line-height:60px;font-size:26px;">
        ✉️
      </div>
    </div>
    ${h1('Confirme seu e-mail')}
    ${p(`Olá${name ? ` <strong style="color:#e2e8f0;">${name}</strong>` : ''},`)}
    ${p('Sua conta SAOOZ foi criada com sucesso. Clique no botão abaixo para confirmar seu endereço de e-mail e ter acesso completo à plataforma.')}
    <div style="text-align:center;margin:32px 0;">
      ${btn(confirmUrl, 'Confirmar meu e-mail →')}
    </div>
    ${divider()}
    ${small('Se você não criou uma conta no SAOOZ, ignore este e-mail com segurança. Nenhuma ação será tomada.')}
  `)
}

// ─── Trial Started ─────────────────────────────────────────────────────────
export function trialStartedEmail(name: string, plan: string, trialEnd: string) {
  return wrapper(`
    ${h1('Seu teste grátis começou 🚀')}
    ${p(`Olá ${name}, você agora tem <strong style="color:#fff;">7 dias grátis</strong> no plano <strong style="color:#3b82f6;">${plan}</strong>.`)}
    ${p(`Explore todos os recursos sem limites. Seu período de teste termina em <strong style="color:#fff;">${trialEnd}</strong>.`)}
    <div style="background:#0a0c13;border:1px solid #1e2030;border-radius:12px;padding:20px 24px;margin:20px 0;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">O que você pode fazer agora</p>
      <ul style="margin:0;padding:0 0 0 18px;color:#9ca3af;font-size:14px;line-height:2;">
        <li>Registrar rendas, despesas e fluxo de caixa</li>
        <li>Controlar reservas de emergência</li>
        <li>Acompanhar carteira de investimentos</li>
        <li>Análise com inteligência artificial</li>
      </ul>
    </div>
    <div style="text-align:center;margin:28px 0;">
      ${btn('https://saooz.com/dashboard', 'Acessar o SAOOZ')}
    </div>
    ${small('Nenhuma cobrança será feita durante o período de teste. Cancele a qualquer momento.')}
  `)
}

// ─── Trial Ending Soon (3 days left) ─────────────────────────────────────────
export function trialEndingSoonEmail(name: string, plan: string, daysLeft: number) {
  return wrapper(`
    ${h1(`Seu teste termina em ${daysLeft} dias ⏳`)}
    ${p(`Olá ${name}, seu período grátis no plano <strong style="color:#3b82f6;">${plan}</strong> está chegando ao fim.`)}
    ${p('Continue com acesso completo e não perca o controle das suas finanças.')}
    <div style="text-align:center;margin:28px 0;">
      ${btn('https://saooz.com/planos', 'Manter meu plano')}
    </div>
    ${divider()}
    ${small('Se preferir cancelar, basta não fazer nada — nenhum valor será cobrado automaticamente sem sua confirmação.')}
  `)
}

// ─── Subscription Active ───────────────────────────────────────────────────
export function subscriptionActiveEmail(name: string, plan: string, nextBilling: string) {
  return wrapper(`
    ${h1('Assinatura ativada com sucesso ✅')}
    ${p(`Olá ${name}, sua assinatura do plano <strong style="color:#3b82f6;">${plan}</strong> está ativa.`)}
    <div style="background:#0a0c13;border:1px solid #1a2d1a;border-radius:12px;padding:20px 24px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#6b7280;">Próxima cobrança</td>
          <td align="right" style="font-size:14px;font-weight:600;color:#4ade80;">${nextBilling}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;margin:28px 0;">
      ${btn('https://saooz.com/dashboard', 'Acessar o SAOOZ')}
    </div>
    ${small('Para gerenciar sua assinatura, acesse <a href="https://saooz.com/perfil-financeiro" style="color:#6b7280;">Configurações → Plano</a>.')}
  `)
}

// ─── Password Reset ────────────────────────────────────────────────────────
export function passwordResetEmail(resetUrl: string) {
  return wrapper(`
    ${h1('Redefinição de senha 🔐')}
    ${p('Recebemos uma solicitação para redefinir a senha da sua conta SAOOZ.')}
    <div style="text-align:center;margin:28px 0;">
      ${btn(resetUrl, 'Redefinir minha senha')}
    </div>
    ${divider()}
    ${p('Este link expira em <strong style="color:#fff;">1 hora</strong>. Se você não solicitou a redefinição, ignore este email.')}
    ${small('Por segurança, nunca compartilhe este link com ninguém.')}
  `)
}

// ─── Due Date Reminder ─────────────────────────────────────────────────────
export interface DueItem {
  description: string
  amount:      number
  dueDate:     string
  type:        'receber' | 'pagar'
}

export function dueDateReminderEmail(
  name:  string,
  items: DueItem[],
  scope: 'pf' | 'pj',
) {
  const count       = items.length
  const totalAmount = items.reduce((s, i) => s + i.amount, 0)
  const formatted   = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)
  const dashUrl     = scope === 'pj'
    ? 'https://saooz.com/empresa/fluxo-de-caixa'
    : 'https://saooz.com/financas'

  const rows = items.map((item) => {
    const color = item.type === 'receber' ? '#4ade80' : '#f87171'
    const label = item.type === 'receber' ? 'A Receber' : 'A Pagar'
    const amt   = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1e2030;font-size:13px;color:#9ca3af;">
          ${item.description}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #1e2030;font-size:12px;color:${color};text-align:center;white-space:nowrap;">
          ${label}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #1e2030;font-size:13px;color:#fff;text-align:right;font-weight:600;white-space:nowrap;">
          ${amt}
        </td>
      </tr>
    `
  }).join('')

  return wrapper(`
    ${h1(`Você tem ${count} vencimento${count !== 1 ? 's' : ''} próximo${count !== 1 ? 's' : ''} ⏰`)}
    ${p(`Olá ${name}, estes lançamentos vencem nos próximos dias. Total envolvido: <strong style="color:#fff;">${formatted}</strong>.`)}
    <div style="background:#0a0c13;border:1px solid #1e2030;border-radius:12px;padding:4px 20px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <th style="padding:12px 0 8px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;text-align:left;">Descrição</th>
          <th style="padding:12px 0 8px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;text-align:center;">Tipo</th>
          <th style="padding:12px 0 8px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;text-align:right;">Valor</th>
        </tr>
        ${rows}
      </table>
    </div>
    <div style="text-align:center;margin:28px 0;">
      ${btn(dashUrl, 'Ver no SAOOZ')}
    </div>
    ${small('Você recebe este aviso porque tem lançamentos vencendo em até 3 dias. <a href="https://saooz.com/configuracoes" style="color:#6b7280;">Gerenciar notificações</a>')}
  `)
}

// ─── Overdue Alert ─────────────────────────────────────────────────────────
export function overdueAlertEmail(
  name:    string,
  items:   DueItem[],
  scope:   'pf' | 'pj',
) {
  const count     = items.length
  const totalAmt  = items.reduce((s, i) => s + i.amount, 0)
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmt)
  const dashUrl   = scope === 'pj'
    ? 'https://saooz.com/empresa/fluxo-de-caixa'
    : 'https://saooz.com/financas'

  return wrapper(`
    ${h1(`Atenção: ${count} lançamento${count !== 1 ? 's' : ''} em atraso ⚠️`)}
    ${p(`Olá ${name}, você possui <strong style="color:#f87171;">${count} lançamento${count !== 1 ? 's' : ''} em atraso</strong>, totalizando <strong style="color:#fff;">${formatted}</strong>. Regularize o quanto antes para manter suas finanças em dia.`)}
    <div style="text-align:center;margin:28px 0;">
      ${btn(dashUrl, 'Resolver agora')}
    </div>
    ${divider()}
    ${small('Acesse o SAOOZ para marcar como pago ou renegociar os lançamentos. <a href="https://saooz.com/configuracoes" style="color:#6b7280;">Gerenciar notificações</a>')}
  `)
}

// ─── Monthly Digest ────────────────────────────────────────────────────────
export interface MonthlyDigestData {
  month:          string     // e.g. "Março 2025"
  totalIncome:    number
  totalExpenses:  number
  balance:        number
  topCategory:    string
  topAmount:      number
  savingsRate:    number     // 0–1
  scope:          'pf' | 'pj'
  businessName?:  string
}

export function monthlyDigestEmail(name: string, data: MonthlyDigestData) {
  const fmt         = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
  const isPositive  = data.balance >= 0
  const balColor    = isPositive ? '#4ade80' : '#f87171'
  const balSign     = isPositive ? '+' : ''
  const srPct       = Math.round(data.savingsRate * 100)
  const srColor     = srPct >= 20 ? '#4ade80' : srPct >= 10 ? '#f59e0b' : '#f87171'
  const dashUrl     = data.scope === 'pj'
    ? 'https://saooz.com/empresa/dre'
    : 'https://saooz.com/analise'
  const subtitle    = data.scope === 'pj' && data.businessName
    ? `${data.businessName} · `
    : ''

  return wrapper(`
    ${h1(`Fechamento ${data.month} 📊`)}
    ${p(`Olá ${name}, ${subtitle}aqui está o resumo financeiro do mês de <strong style="color:#fff;">${data.month}</strong>.`)}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0;">
      <div style="background:#0a0c13;border:1px solid #1e2030;border-radius:12px;padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:.05em;">
          ${data.scope === 'pj' ? 'Receitas' : 'Rendas'}
        </p>
        <p style="margin:0;font-size:20px;font-weight:700;color:#4ade80;">${fmt(data.totalIncome)}</p>
      </div>
      <div style="background:#0a0c13;border:1px solid #1e2030;border-radius:12px;padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:.05em;">Despesas</p>
        <p style="margin:0;font-size:20px;font-weight:700;color:#f87171;">${fmt(data.totalExpenses)}</p>
      </div>
    </div>

    <div style="background:#0a0c13;border:1px solid #1e2030;border-radius:12px;padding:16px 20px;margin:12px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#6b7280;">${isPositive ? 'Saldo / Lucro' : 'Déficit'}</td>
          <td align="right" style="font-size:16px;font-weight:700;color:${balColor};">${balSign}${fmt(data.balance)}</td>
        </tr>
        <tr>
          <td style="padding-top:12px;font-size:13px;color:#6b7280;">Taxa de poupança</td>
          <td align="right" style="padding-top:12px;font-size:15px;font-weight:700;color:${srColor};">${srPct}%</td>
        </tr>
        <tr>
          <td style="padding-top:12px;font-size:13px;color:#6b7280;">Maior categoria</td>
          <td align="right" style="padding-top:12px;font-size:13px;color:#fff;">${data.topCategory} · ${fmt(data.topAmount)}</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin:28px 0;">
      ${btn(dashUrl, 'Ver análise completa')}
    </div>
    ${small('Receba este digest mensalmente. <a href="https://saooz.com/configuracoes" style="color:#6b7280;">Gerenciar preferências</a>')}
  `)
}
