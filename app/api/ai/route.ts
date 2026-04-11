import { NextRequest, NextResponse } from 'next/server'
import { aiActionSchema } from '@/lib/ai/schemas'
import { getBillingAccess } from '@/lib/billing/access'
import { getBillingSnapshot } from '@/lib/billing/server'
import { enforceRateLimit, requireUser } from '@/lib/server/request-guard'

export const dynamic = 'force-dynamic'

const SAOOZ_CORE = `
Você é SAOOZ, um assistente financeiro preciso, elegante e direto.
Fale sempre em português do Brasil.

Regras:
- Nunca sugira apagar, sobrescrever em massa ou editar histórico inteiro.
- Nunca proponha mais de um lançamento por resposta.
- Quando o pedido for apenas informativo, responda em texto normal.
- Quando o usuário pedir um lançamento, responda SOMENTE com JSON válido.
- JSON permitido:
  {"action":"read_only","message":"..."}
  {"action":"add_expense","scope":"personal|business","category":"...","amount":123.45,"description":"...","message":"..."}
  {"action":"add_income","scope":"personal|business","amount":123.45,"type":"...","name":"...","category":"...","description":"...","message":"..."}
- Para renda pessoal use "type" e "name".
- Para receita empresarial use "category" e "description".
- Se houver dúvida sobre valor, categoria ou contexto, não gere JSON; responda pedindo clarificação.
`.trim()

function buildPFPrompt(message: string, context: Record<string, unknown>) {
  return `${SAOOZ_CORE}

CONTEXTO PESSOAL:
Renda: R$ ${(context.totalIncome as number)?.toFixed(2) ?? '0.00'}
Gastos: R$ ${(context.totalExpenses as number)?.toFixed(2) ?? '0.00'}
Saldo: R$ ${(context.balance as number)?.toFixed(2) ?? '0.00'}
Comprometimento: ${context.consumptionRate ?? 0}%

Categorias validas para despesa pessoal:
moradia, alimentacao, transporte, saude, educacao, lazer, assinaturas, vestuario, beleza, pets, dividas, investimentos, familia, religiao, variaveis, outros

Tipos validos para renda pessoal:
salario, freela, negocio, aluguel, investimento, pensao, outro

Mensagem do usuario:
${message}`
}

function buildPJPrompt(message: string, context: Record<string, unknown>) {
  return `${SAOOZ_CORE}

CONTEXTO EMPRESARIAL:
Empresa: ${context.businessName ?? 'Empresa'}
Regime: ${context.taxRegime ?? '-'}
Atividade: ${context.activity ?? '-'}
Faturamento: R$ ${(context.totalRevenue as number)?.toFixed(2) ?? '0.00'}
Despesas: R$ ${(context.totalExpenses as number)?.toFixed(2) ?? '0.00'}
Imposto estimado: R$ ${(context.taxAmount as number)?.toFixed(2) ?? '0.00'}
Lucro liquido: R$ ${(context.netProfit as number)?.toFixed(2) ?? '0.00'}
Margem: ${context.profitMargin ?? '-'}

Categorias validas para despesa empresarial:
fixo_aluguel, fixo_salarios, fixo_prolabore, fixo_contador, fixo_software, fixo_internet, fixo_outros, variavel_comissao, variavel_frete, variavel_embalagem, variavel_trafego, variavel_taxas, variavel_outros, operacional_marketing, operacional_admin, operacional_juridico, operacional_manutencao, operacional_viagem, operacional_outros, investimento_equipamento, investimento_estoque, investimento_expansao, investimento_contratacao, investimento_outros

Categorias validas para receita empresarial:
servico, produto, recorrente, comissao, outro

Para receita empresarial use:
{"action":"add_income","scope":"business","category":"servico","amount":123.45,"description":"...","message":"..."}

Para despesa empresarial use:
{"action":"add_expense","scope":"business","category":"fixo_outros","amount":123.45,"description":"...","message":"..."}

Mensagem do usuario:
${message}`
}

function extractStructuredAction(raw: string) {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
  if (!cleaned.startsWith('{')) {
    return null
  }

  try {
    const parsed = JSON.parse(cleaned)
    const result = aiActionSchema.safeParse(parsed)
    if (!result.success) {
      return null
    }

    return result.data
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser()
    if (!auth.ok) {
      return auth.response
    }

    const billing = await getBillingSnapshot(auth.user.id)
    const access = getBillingAccess(billing)

    const rate = enforceRateLimit({
      scope: 'ai',
      user: auth.user,
      maxRequests: 30,
      windowMs: 60_000,
    })

    if (!rate.ok) {
      return rate.response
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY não configurada.' }, { status: 500 })
    }

    const { message, context } = await request.json()
    const userMessage = typeof message === 'string' ? message.trim() : ''

    if (!userMessage) {
      return NextResponse.json({ error: 'Mensagem vazia.' }, { status: 400 })
    }

    if (userMessage.length > 1200) {
      return NextResponse.json({ error: 'Mensagem muito longa.' }, { status: 400 })
    }

    const prompt =
      context?.mode === 'pj'
        ? buildPJPrompt(userMessage, context)
        : buildPFPrompt(userMessage, context)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 420,
        temperature: 0.35,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Groq ${response.status}: ${errorBody}`)
    }

    const payload = await response.json()
    const raw = (payload.choices?.[0]?.message?.content ?? '').trim()
    const action = extractStructuredAction(raw)

    if (!action) {
      return NextResponse.json({ text: raw })
    }

    if (action.action === 'read_only') {
      return NextResponse.json({ text: action.message })
    }

    if (action.scope === 'business' && !access.businessModule) {
      return NextResponse.json({
        text: 'Seu plano atual não libera ações empresariais. Vá em Planos para ativar o módulo PJ.',
      })
    }

    if (action.scope === 'personal' && !access.personalModule) {
      return NextResponse.json({
        text: 'Seu plano atual não libera ações pessoais. Vá em Planos para ativar o módulo PF.',
      })
    }

    return NextResponse.json({
      text: action.message,
      proposal: action,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('AI route error:', message)

    if (message.includes('429') || message.includes('quota') || message.includes('Too Many Requests')) {
      return NextResponse.json(
        { text: 'Limite de requisições do modelo atingido no momento. Tente novamente mais tarde.' },
        { status: 200 }
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
