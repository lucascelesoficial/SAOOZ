// ─── Email HTML Templates ───────────────────────────────────────────────────
// All templates share the same dark-brand wrapper for a premium feel.

const wrapper = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SAOOZ</title>
</head>
<body style="margin:0;padding:0;background:#06080f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#06080f;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:800;letter-spacing:-1px;color:#fff;">
                SAO<span style="color:#8b5cf6;">OZ</span>
              </span>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#0e1017;border:1px solid #1e2030;border-radius:16px;padding:40px 36px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#4b5563;">
                © ${new Date().getFullYear()} SAOOZ · <a href="https://saooz.com" style="color:#6b7280;text-decoration:none;">saooz.com</a>
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#374151;">
                Você está recebendo este email porque tem uma conta no SAOOZ.
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
  `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#fff;">${text}</h1>`

const p = (text: string) =>
  `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#9ca3af;">${text}</p>`

const btn = (href: string, label: string, color = '#8b5cf6') =>
  `<a href="${href}" style="display:inline-block;padding:14px 32px;background:${color};color:#fff;font-size:15px;font-weight:600;border-radius:10px;text-decoration:none;">${label}</a>`

const divider = () =>
  `<hr style="margin:28px 0;border:none;border-top:1px solid #1e2030;" />`

const small = (text: string) =>
  `<p style="margin:16px 0 0;font-size:12px;color:#4b5563;">${text}</p>`

// ─── Welcome ──────────────────────────────────────────────────────────────────
export function welcomeEmail(name: string, confirmUrl: string) {
  return wrapper(`
    ${h1('Bem-vindo ao SAOOZ 👋')}
    ${p(`Olá ${name}, sua conta foi criada com sucesso. Confirme seu email para ativar o acesso completo à plataforma.`)}
    <div style="text-align:center;margin:28px 0;">
      ${btn(confirmUrl, 'Confirmar meu email')}
    </div>
    ${divider()}
    ${small('Se você não criou uma conta no SAOOZ, ignore este email com segurança.')}
  `)
}

// ─── Trial Started ─────────────────────────────────────────────────────────
export function trialStartedEmail(name: string, plan: string, trialEnd: string) {
  return wrapper(`
    ${h1('Seu teste grátis começou 🚀')}
    ${p(`Olá ${name}, você agora tem <strong style="color:#fff;">7 dias grátis</strong> no plano <strong style="color:#8b5cf6;">${plan}</strong>.`)}
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
    ${p(`Olá ${name}, seu período grátis no plano <strong style="color:#8b5cf6;">${plan}</strong> está chegando ao fim.`)}
    ${p('Continue com acesso completo e não perca o controle das suas finanças.')}
    <div style="text-align:center;margin:28px 0;">
      ${btn('https://saooz.com/planos', 'Manter meu plano', '#7c3aed')}
    </div>
    ${divider()}
    ${small('Se preferir cancelar, basta não fazer nada — nenhum valor será cobrado automaticamente sem sua confirmação.')}
  `)
}

// ─── Subscription Active ───────────────────────────────────────────────────
export function subscriptionActiveEmail(name: string, plan: string, nextBilling: string) {
  return wrapper(`
    ${h1('Assinatura ativada com sucesso ✅')}
    ${p(`Olá ${name}, sua assinatura do plano <strong style="color:#8b5cf6;">${plan}</strong> está ativa.`)}
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
