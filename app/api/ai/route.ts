import { NextRequest, NextResponse } from 'next/server'
import { aiActionSchema } from '@/lib/ai/schemas'
import { canAccessScope, resolveUserAccessPolicy } from '@/lib/billing/policy'
import { enforceRateLimit, requireUser } from '@/lib/server/request-guard'
import { requireCompletedOnboarding } from '@/lib/server/onboarding-gate'
import {
  requireSameOrigin,
  requireJsonContentType,
  rejectLargeBody,
  withSecurityHeaders,
} from '@/lib/server/security'

export const dynamic = 'force-dynamic'

// ─── System prompt core ──────────────────────────────────────────────────────

const SAOOZ_CORE = `
Você é SAOOZ — o CFO que ninguém teve, mas todo mundo precisava.
Fale em português do Brasil. Personalidade: direto, estratégico, levemente sarcástico quando o dado pede, mas sempre útil.

REGRAS DE OURO:
1. Resposta informativa = máximo 2 parágrafos curtos OU 3-4 bullets. Sem enrolação.
2. Se o número não é bom, fala. Sem eufemismos financeiros.
3. Sempre inclua o número real. "Alto" não significa nada. "R$ 2.400 (38% da renda)" significa.
4. Estratégia antes de sermão. Em vez de "gaste menos", diga onde exatamente e quanto isso libera.
5. Se a situação for boa, reconheça. Ninguém quer só crítica.

TEMAS QUE VOCÊ DOMINA (responda sem hesitar):
- Orçamento pessoal e empresarial, fluxo de caixa, DRE, margem, ponto de equilíbrio
- Reserva de emergência: regra dos 6 meses, onde guardar (CDB, Tesouro Selic, LCI/LCA)
- Investimentos: renda fixa vs variável, diversificação, como começar com pouco
- Impostos: Simples Nacional, MEI, Lucro Presumido/Real, deduções, pró-labore vs distribuição de lucros
- Dívidas: juros compostos, avalanche vs bola de neve, renegociação
- Precificação, margem de contribuição, break-even
- Planejamento financeiro: metas SMART, independência financeira, FIRE
- Crédito, score, financiamentos, antecipação de recebíveis

REGRAS DE AÇÃO (JSON):
- Nunca proponha mais de um lançamento por resposta.
- Quando informativo: responda em texto.
- Quando pedirem lançamento: responda SOMENTE com JSON válido.

JSON PERMITIDO:
{"action":"read_only","message":"..."}
{"action":"add_expense","scope":"personal|business","category":"...","amount":123.45,"description":"...","message":"..."}
{"action":"add_income","scope":"personal|business","amount":123.45,"type":"...","name":"...","category":"...","description":"...","message":"..."}

Renda pessoal: use "type" e "name". Receita empresarial: use "category" e "description".
Com dúvida sobre valor ou contexto: pergunte antes de gerar JSON.
`.trim()

// ─── Context-aware prompt builders ───────────────────────────────────────────

function buildPFPrompt(message: string, context: Record<string, unknown>) {
  const income = (context.totalIncome as number) ?? 0
  const expenses = (context.totalExpenses as number) ?? 0
  const balance = (context.balance as number) ?? 0
  const rate = (context.consumptionRate as number) ?? 0
  const planType = (context.planType as string) ?? 'pf'

  // Top spending categories
  const topCategories = context.topCategories as Array<{ name: string; amount: number }> | undefined
  const categoriesStr = topCategories?.length
    ? topCategories.map((c, i) => `  ${i + 1}. ${c.name}: R$ ${c.amount.toFixed(2)}`).join('\n')
    : '  (sem dados de categorias)'

  const riskLevel = rate > 90 ? '🔴 CRÍTICO' : rate > 75 ? '🟡 ATENÇÃO' : '🟢 SAUDÁVEL'
  const month = (context.currentMonth as string) ?? new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return `${SAOOZ_CORE}

PERFIL FINANCEIRO PESSOAL — ${month.toUpperCase()}
Plano: ${planType.toUpperCase()}
Status: ${riskLevel} (${rate}% da renda comprometida)

RESUMO:
  Renda total:   R$ ${income.toFixed(2)}
  Gastos totais: R$ ${expenses.toFixed(2)}
  Saldo:         R$ ${balance.toFixed(2)}

TOP CATEGORIAS DE GASTO:
${categoriesStr}

CATEGORIAS VÁLIDAS — despesa pessoal:
moradia, alimentacao, transporte, saude, educacao, lazer, assinaturas, vestuario, beleza, pets, dividas, investimentos, familia, religiao, variaveis, outros

TIPOS VÁLIDOS — renda pessoal:
salario, freela, negocio, aluguel, investimento, pensao, outro

MENSAGEM DO USUÁRIO:
${message}`
}

function buildPJPrompt(message: string, context: Record<string, unknown>) {
  const revenue = (context.totalRevenue as number) ?? 0
  const expenses = (context.totalExpenses as number) ?? 0
  const tax = (context.taxAmount as number) ?? 0
  const netProfit = (context.netProfit as number) ?? 0
  const margin = (context.profitMargin as string) ?? '0%'
  const planType = (context.planType as string) ?? 'pj'
  const month = (context.currentMonth as string) ?? new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const topCategories = context.topCategories as Array<{ name: string; amount: number }> | undefined
  const categoriesStr = topCategories?.length
    ? topCategories.map((c, i) => `  ${i + 1}. ${c.name}: R$ ${c.amount.toFixed(2)}`).join('\n')
    : '  (sem dados de categorias)'

  const healthStatus = netProfit < 0 ? '🔴 PREJUÍZO' : parseFloat(margin) < 10 ? '🟡 MARGEM BAIXA' : '🟢 LUCRATIVO'

  return `${SAOOZ_CORE}

PERFIL EMPRESARIAL — ${month.toUpperCase()}
Empresa: ${context.businessName ?? 'Empresa'}
Plano: ${planType.toUpperCase()} | Regime: ${context.taxRegime ?? '-'} | Atividade: ${context.activity ?? '-'}
Status: ${healthStatus}

DEMONSTRATIVO:
  Faturamento:      R$ ${revenue.toFixed(2)}
  Despesas:         R$ ${expenses.toFixed(2)}
  Impostos est.:    R$ ${tax.toFixed(2)}
  Lucro líquido:    R$ ${netProfit.toFixed(2)}
  Margem:           ${margin}

TOP CATEGORIAS DE DESPESA:
${categoriesStr}

CATEGORIAS VÁLIDAS — despesa empresarial:
fixo_aluguel, fixo_salarios, fixo_prolabore, fixo_contador, fixo_software, fixo_internet, fixo_outros,
variavel_comissao, variavel_frete, variavel_embalagem, variavel_trafego, variavel_taxas, variavel_outros,
operacional_marketing, operacional_admin, operacional_juridico, operacional_manutencao, operacional_viagem, operacional_outros,
investimento_equipamento, investimento_estoque, investimento_expansao, investimento_contratacao, investimento_outros

CATEGORIAS VÁLIDAS — receita empresarial: servico, produto, recorrente, comissao, outro

Para receita: {"action":"add_income","scope":"business","category":"servico","amount":0,"description":"...","message":"..."}
Para despesa: {"action":"add_expense","scope":"business","category":"fixo_outros","amount":0,"description":"...","message":"..."}

MENSAGEM DO USUÁRIO:
${message}`
}

function buildPROPrompt(message: string, context: Record<string, unknown>) {
  // PRO users get unified PF+PJ context
  const pfCtx = context.personal as Record<string, unknown> | undefined
  const pjCtx = context.business as Record<string, unknown> | undefined

  if (pjCtx && context.mode === 'pj') {
    return buildPJPrompt(message, { ...pjCtx, planType: 'pro' })
  }
  return buildPFPrompt(message, { ...pfCtx, planType: 'pro' })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractStructuredAction(raw: string) {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
  if (!cleaned.startsWith('{')) return null

  try {
    const parsed = JSON.parse(cleaned)
    const result = aiActionSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── CSRF / Content-Type / body-size guards ──────────────────────────────
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const ctCheck = requireJsonContentType(request)
  if (ctCheck) return withSecurityHeaders(ctCheck)

  const bodyCheck = rejectLargeBody(request, 8_192)  // 8 KB — AI messages can be larger
  if (bodyCheck) return withSecurityHeaders(bodyCheck)

  try {
    const auth = await requireUser()
    if (!auth.ok) return withSecurityHeaders(auth.response)

    const gate = await requireCompletedOnboarding(auth.user.id)
    if (!gate.ok) return withSecurityHeaders(gate.response)

    const policy = await resolveUserAccessPolicy(auth.user.id)

    const rate = await enforceRateLimit({
      scope: 'ai',
      user: auth.user,
      maxRequests: 30,
      windowMs: 60_000,
    })
    if (!rate.ok) return withSecurityHeaders(rate.response)

    if (!process.env.GROQ_API_KEY) {
      console.error('[ai] GROQ_API_KEY não configurada — IA indisponível')
      return withSecurityHeaders(NextResponse.json(
        { error: 'A inteligência está temporariamente indisponível. Tente novamente em instantes.' },
        { status: 503 }
      ))
    }

    const { message, context } = await request.json() as { message: unknown; context: Record<string, unknown> }
    const userMessage = typeof message === 'string' ? message.trim() : ''

    if (!userMessage) return withSecurityHeaders(NextResponse.json({ error: 'Mensagem vazia.' }, { status: 400 }))
    if (userMessage.length > 1500) return withSecurityHeaders(NextResponse.json({ error: 'Mensagem muito longa.' }, { status: 400 }))

    // Inject plan info into context
    const enrichedContext = {
      ...context,
      planType: policy.planType ?? 'free',
    }

    // Select prompt based on plan + mode
    let prompt: string
    if (policy.planType === 'pro') {
      prompt = buildPROPrompt(userMessage, enrichedContext)
    } else if ((context as Record<string, unknown>).mode === 'pj') {
      prompt = buildPJPrompt(userMessage, enrichedContext)
    } else {
      prompt = buildPFPrompt(userMessage, enrichedContext)
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.45,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Groq ${response.status}: ${errorBody}`)
    }

    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const raw = (payload.choices?.[0]?.message?.content ?? '').trim()
    const action = extractStructuredAction(raw)

    if (!action) return withSecurityHeaders(NextResponse.json({ text: raw }))
    if (action.action === 'read_only') return withSecurityHeaders(NextResponse.json({ text: action.message }))

    if (action.scope === 'business' && !canAccessScope(policy, 'business')) {
      return withSecurityHeaders(NextResponse.json({
        text: 'Seu plano atual não inclui o módulo empresarial. Acesse Planos para ativar o módulo PJ.',
      }))
    }

    if (action.scope === 'personal' && !canAccessScope(policy, 'personal')) {
      return withSecurityHeaders(NextResponse.json({
        text: 'Seu plano atual não inclui o módulo pessoal. Acesse Planos para ativar o módulo PF.',
      }))
    }

    return withSecurityHeaders(NextResponse.json({ text: action.message, proposal: action }))
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('AI route error:', message)

    if (message.includes('429') || message.includes('quota') || message.includes('Too Many Requests')) {
      return withSecurityHeaders(NextResponse.json(
        { text: 'Limite de requisições atingido. Tente novamente em alguns instantes.' },
        { status: 200 }
      ))
    }

    return withSecurityHeaders(NextResponse.json({ error: 'Erro interno.' }, { status: 500 }))
  }
}
