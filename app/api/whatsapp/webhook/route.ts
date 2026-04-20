/**
 * app/api/whatsapp/webhook/route.ts
 *
 * Recebe mensagens do WhatsApp via Twilio.
 * Fluxo:
 *   1. Valida que veio do Twilio (AccountSid)
 *   2. Busca o usuário pelo telefone em profiles.phone
 *   3. Processa a mensagem com Gemini (processor.ts)
 *   4. Cria o lançamento no Supabase
 *   5. Responde via WhatsApp (sender.ts)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { processWhatsAppMessage }    from '@/lib/whatsapp/processor'
import { sendWhatsApp }              from '@/lib/whatsapp/sender'
import { toMonthQueryDate }          from '@/lib/modules/_shared/month'

export const dynamic = 'force-dynamic'

// Supabase com service role para escrever direto
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Formatação ───────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const CAT_LABEL: Record<string, string> = {
  moradia: 'Moradia', alimentacao: 'Alimentação', transporte: 'Transporte',
  saude: 'Saúde', educacao: 'Educação', lazer: 'Lazer',
  assinaturas: 'Assinaturas', vestuario: 'Vestuário', beleza: 'Beleza',
  pets: 'Pets', dividas: 'Dívidas', investimentos: 'Investimentos',
  familia: 'Família', religiao: 'Religião', variaveis: 'Variáveis', outros: 'Outros',
}

const TYPE_LABEL: Record<string, string> = {
  salario: 'Salário', freela: 'Freela', negocio: 'Negócio',
  aluguel: 'Aluguel', investimento: 'Investimento', pensao: 'Pensão', outro: 'Outro',
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Twilio envia form-urlencoded
  const form = await req.formData()
  const from       = form.get('From')       as string // whatsapp:+5511999999999
  const body       = form.get('Body')       as string
  const accountSid = form.get('AccountSid') as string
  const numMedia   = parseInt(form.get('NumMedia') as string || '0', 10)

  // Validação básica: rejeita se não veio do Twilio correto
  if (accountSid !== process.env.TWILIO_ACCOUNT_SID) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Extrai número e gera variantes para buscar no banco
  // Twilio envia: +5511934139666 — banco pode ter: 11934139666, 5511934139666, +5511934139666
  const rawPhone = from.replace('whatsapp:', '').replace('+', '')
  const phoneVariants = [
    '+' + rawPhone,           // +5511934139666
    rawPhone,                 // 5511934139666
    rawPhone.slice(2),        // 11934139666  (remove código BR 55)
    rawPhone.slice(2, 4) + rawPhone.slice(5), // sem dígito 9 (legado)
  ]

  // Busca usuário pelo telefone — tenta todas as variantes
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, mode, active_business_id')
    .in('phone', phoneVariants)
    .maybeSingle()

  if (!profile) {
    await sendWhatsApp(from,
      '❌ Número não vinculado a nenhuma conta SAOOZ.\n\n' +
      'Acesse saooz.com → Perfil → Meu número e cadastre esse WhatsApp.'
    )
    return new NextResponse('OK')
  }

  const month = toMonthQueryDate(new Date())

  // ── Arquivo/imagem enviada (extrato) ─────────────────────────────────────
  if (numMedia > 0) {
    await sendWhatsApp(from,
      '📄 Recebi o arquivo! O processamento de extratos via WhatsApp está chegando em breve.\n\n' +
      'Por enquanto, importe o extrato diretamente no app em saooz.com'
    )
    return new NextResponse('OK')
  }

  // ── Mensagem de texto ─────────────────────────────────────────────────────
  const text = body?.trim()
  if (!text) return new NextResponse('OK')

  const action = await processWhatsAppMessage(text)

  // ── Adicionar despesa ─────────────────────────────────────────────────────
  if (action.type === 'add_expense') {
    const { error } = await supabase.from('expenses').insert({
      user_id:     profile.id,
      category:    action.category,
      amount:      action.amount,
      description: action.description,
      month,
    })

    if (error) {
      await sendWhatsApp(from, '❌ Erro ao registrar o gasto. Tente de novo.')
    } else {
      const cat = CAT_LABEL[action.category] ?? action.category
      await sendWhatsApp(from,
        `✅ *Gasto registrado!*\n\n` +
        `💸 ${fmt(action.amount)}\n` +
        `📂 ${cat}\n` +
        `📝 ${action.description}\n\n` +
        `_Já está no seu SAOOZ._`
      )
    }
    return new NextResponse('OK')
  }

  // ── Adicionar receita ─────────────────────────────────────────────────────
  if (action.type === 'add_income') {
    const { error } = await supabase.from('income_sources').insert({
      user_id:  profile.id,
      name:     action.name,
      type:     action.incomeType,
      amount:   action.amount,
      month,
      is_recurring: false,
    })

    if (error) {
      await sendWhatsApp(from, '❌ Erro ao registrar a entrada. Tente de novo.')
    } else {
      const typeLabel = TYPE_LABEL[action.incomeType] ?? action.incomeType
      await sendWhatsApp(from,
        `✅ *Entrada registrada!*\n\n` +
        `💰 ${fmt(action.amount)}\n` +
        `📂 ${typeLabel} — ${action.name}\n\n` +
        `_Já está no seu SAOOZ._`
      )
    }
    return new NextResponse('OK')
  }

  // ── Consulta ──────────────────────────────────────────────────────────────
  if (action.type === 'query') {
    await sendWhatsApp(from,
      `🔍 Para consultas detalhadas, acesse seu painel em *saooz.com*\n\n` +
      `_Em breve você poderá perguntar diretamente aqui no WhatsApp!_`
    )
    return new NextResponse('OK')
  }

  // ── Não entendeu ──────────────────────────────────────────────────────────
  await sendWhatsApp(from,
    `Não entendi 😅 Tenta assim:\n\n` +
    `• *"Gastei 50 no mercado"*\n` +
    `• *"Paguei 200 de luz"*\n` +
    `• *"Recebi 3000 de salário"*\n\n` +
    `_Pode mandar foto de cupom ou extrato também (em breve)._`
  )

  return new NextResponse('OK')
}

// ── GET: verificação do webhook pelo Twilio (opcional) ────────────────────────
export async function GET() {
  return new NextResponse('SAOOZ WhatsApp Webhook OK')
}
