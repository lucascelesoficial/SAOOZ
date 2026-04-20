/**
 * app/api/whatsapp/webhook/route.ts
 * Recebe mensagens do WhatsApp via Infobip.
 *
 * Infobip envia JSON:
 * { results: [{ from, to, message: { type, text }, contact: { name } }] }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { processMessage }            from '@/lib/whatsapp/processor'
import { sendWhatsApp }              from '@/lib/whatsapp/sender'
import { toMonthQueryDate }          from '@/lib/modules/_shared/month'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const CAT_LABEL: Record<string, string> = {
  moradia:'Moradia', alimentacao:'Alimentação', transporte:'Transporte',
  saude:'Saúde', educacao:'Educação', lazer:'Lazer', assinaturas:'Assinaturas',
  vestuario:'Vestuário', beleza:'Beleza', pets:'Pets', dividas:'Dívidas',
  investimentos:'Investimentos', familia:'Família', religiao:'Religião',
  variaveis:'Variáveis', outros:'Outros',
}

const TYPE_LABEL: Record<string, string> = {
  salario:'Salário', freela:'Freela', negocio:'Negócio',
  aluguel:'Aluguel', investimento:'Investimento', pensao:'Pensão', outro:'Outro',
}

// Normaliza número de telefone para buscar no banco
// Infobip envia: 5511934139666 (sem +)
function phoneVariants(raw: string): string[] {
  const digits = raw.replace(/\D/g, '')
  return [
    digits,               // 5511934139666
    '+' + digits,         // +5511934139666
    digits.slice(2),      // 11934139666 (sem código BR)
  ]
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.results?.length) return new NextResponse('OK')

  for (const msg of body.results) {
    const from = msg.from as string                          // 5511934139666
    const text = (msg.message?.text as string)?.trim() ?? ''

    if (!text) continue

    // Busca usuário pelo telefone
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, mode, active_business_id')
      .in('phone', phoneVariants(from))
      .maybeSingle()

    if (!profile) {
      await sendWhatsApp(from,
        '❌ Número não vinculado a nenhuma conta SAOOZ.\n\n' +
        'Acesse saooz.com → Perfil → cadastre este WhatsApp.'
      )
      continue
    }

    const month  = toMonthQueryDate(new Date())
    const action = await processMessage(text)

    // ── Despesa ───────────────────────────────────────────────────────────────
    if (action.type === 'add_expense') {
      const { error } = await supabase.from('expenses').insert({
        user_id:     profile.id,
        category:    action.category,
        amount:      action.amount,
        description: action.description,
        month,
      })

      await sendWhatsApp(from, error
        ? '❌ Erro ao registrar o gasto. Tente de novo.'
        : `✅ *Gasto registrado!*\n\n💸 ${fmt(action.amount)}\n📂 ${CAT_LABEL[action.category] ?? action.category}\n📝 ${action.description}\n\n_Já está no seu SAOOZ._`
      )
      continue
    }

    // ── Receita ───────────────────────────────────────────────────────────────
    if (action.type === 'add_income') {
      const { error } = await supabase.from('income_sources').insert({
        user_id:      profile.id,
        name:         action.name,
        type:         action.incomeType,
        amount:       action.amount,
        month,
        is_recurring: false,
      })

      await sendWhatsApp(from, error
        ? '❌ Erro ao registrar a entrada. Tente de novo.'
        : `✅ *Entrada registrada!*\n\n💰 ${fmt(action.amount)}\n📂 ${TYPE_LABEL[action.incomeType] ?? action.incomeType} — ${action.name}\n\n_Já está no seu SAOOZ._`
      )
      continue
    }

    // ── Não entendeu ──────────────────────────────────────────────────────────
    await sendWhatsApp(from,
      `Não entendi 😅 Tenta assim:\n\n` +
      `• *"Gastei 50 no mercado"*\n` +
      `• *"Paguei 200 de luz"*\n` +
      `• *"Recebi 3000 de salário"*`
    )
  }

  return new NextResponse('OK')
}

export async function GET() {
  return new NextResponse('SAOOZ WhatsApp Webhook OK')
}
