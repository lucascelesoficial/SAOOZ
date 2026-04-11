/**
 * SAOOZ — Stripe Setup Script
 * Cria todos os produtos e preços no Stripe para os planos PF, PJ e PRO.
 *
 * USO:
 *   node scripts/stripe-setup.mjs
 *
 * Requer: STRIPE_SECRET_KEY no ambiente (ou cole abaixo).
 * Após rodar, cole os Price IDs gerados no .env.local.
 */

import Stripe from 'stripe'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_SECRET_KEY) {
  console.error('\n❌  STRIPE_SECRET_KEY não encontrada.')
  console.error('    Export a variável antes de rodar:')
  console.error('    $env:STRIPE_SECRET_KEY="sk_test_..." ; node scripts/stripe-setup.mjs\n')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' })

// ─── Planos base ────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'pf',
    name: 'SAOOZ PF',
    description: 'Gestão financeira pessoal com visão clara, controle diário e IA assistida.',
    priceMonthly: 47_00, // centavos BRL
  },
  {
    id: 'pj',
    name: 'SAOOZ PJ',
    description: 'Operação empresarial com faturamento, despesas, impostos e IA assistida.',
    priceMonthly: 67_00,
  },
  {
    id: 'pro',
    name: 'SAOOZ PRO',
    description: 'Operação completa PF + PJ com IA sem limite e inteligência avançada.',
    priceMonthly: 97_00,
  },
]

// Ciclos e descontos (igual ao plans.ts)
const CYCLES = [
  { duration: 1,  label: 'Mensal',      discount: 0    },
  { duration: 3,  label: 'Trimestral',  discount: 0    },
  { duration: 6,  label: 'Semestral',   discount: 0.15 },
  { duration: 12, label: 'Anual',       discount: 0.25 },
]

function calcTotal(priceMonthly, duration, discount) {
  const effective = Math.round(priceMonthly * (1 - discount))
  return effective * duration
}

// ─── Helpers ────────────────────────────────────────────────────────────────
async function findOrCreateProduct(plan) {
  // Procura produto existente pelo metadata.saooz_plan_id
  const existing = await stripe.products.search({
    query: `metadata['saooz_plan_id']:'${plan.id}'`,
    limit: 1,
  })

  if (existing.data.length > 0) {
    console.log(`  ✓ Produto já existe: ${existing.data[0].id} (${plan.name})`)
    return existing.data[0]
  }

  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: { saooz_plan_id: plan.id },
  })

  console.log(`  + Produto criado: ${product.id} (${plan.name})`)
  return product
}

async function findOrCreatePrice(productId, planId, cycle, totalCents) {
  const metaKey = `${planId}_${cycle.duration}m`

  // Procura preço existente
  const existing = await stripe.prices.search({
    query: `metadata['saooz_price_key']:'${metaKey}'`,
    limit: 1,
  })

  if (existing.data.length > 0) {
    console.log(`    ✓ Preço já existe: ${existing.data[0].id} (${cycle.label} R$${(totalCents / 100).toFixed(2)})`)
    return existing.data[0]
  }

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: totalCents,
    currency: 'brl',
    metadata: {
      saooz_price_key: metaKey,
      saooz_plan_id: planId,
      saooz_duration_months: String(cycle.duration),
    },
  })

  console.log(`    + Preço criado: ${price.id} (${cycle.label} R$${(totalCents / 100).toFixed(2)})`)
  return price
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const mode = STRIPE_SECRET_KEY.startsWith('sk_live') ? 'PRODUÇÃO 🔴' : 'TESTE 🟡'
  console.log(`\n🚀  SAOOZ Stripe Setup — ${mode}`)
  console.log('=' .repeat(55))

  const envLines = []
  const priceMap = {}

  for (const plan of PLANS) {
    console.log(`\n📦  ${plan.name}`)
    const product = await findOrCreateProduct(plan)

    priceMap[plan.id] = {}

    for (const cycle of CYCLES) {
      const totalCents = calcTotal(plan.priceMonthly, cycle.duration, cycle.discount)
      const price = await findOrCreatePrice(product.id, plan.id, cycle, totalCents)
      priceMap[plan.id][cycle.duration] = price.id

      const envKey = `STRIPE_PRICE_${plan.id.toUpperCase()}_${cycle.duration}M`
      envLines.push(`${envKey}=${price.id}`)
    }
  }

  // ─── Webhook info ─────────────────────────────────────────────────────────
  console.log('\n\n' + '='.repeat(55))
  console.log('✅  SETUP CONCLUÍDO')
  console.log('='.repeat(55))

  console.log('\n📋  Cole estas variáveis no seu .env.local:\n')
  console.log('# Stripe')
  console.log(`STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}`)
  envLines.forEach(line => console.log(line))

  console.log('\n# Adicione manualmente após criar o webhook no Stripe Dashboard:')
  console.log('STRIPE_WEBHOOK_SECRET=whsec_...')
  console.log('NEXT_PUBLIC_APP_URL=https://seudominio.com.br')

  console.log('\n\n📡  CONFIGURAR WEBHOOK no Stripe Dashboard:')
  console.log('   1. Acesse: https://dashboard.stripe.com/webhooks')
  console.log('   2. Clique "Add endpoint"')
  console.log('   3. URL: https://seudominio.com.br/api/billing/webhook')
  console.log('      (ou use ngrok em dev: https://xxxx.ngrok.io/api/billing/webhook)')
  console.log('   4. Eventos a escutar:')
  console.log('      - checkout.session.completed')
  console.log('      - invoice.payment_succeeded    (para renovações futuras)')
  console.log('      - customer.subscription.deleted (para cancelamentos)')
  console.log('   5. Copie o "Signing secret" gerado (whsec_...) e cole no .env.local')

  console.log('\n\n📊  Mapa de Price IDs criados:\n')
  for (const [planId, cycles] of Object.entries(priceMap)) {
    console.log(`  ${planId.toUpperCase()}:`)
    for (const [duration, priceId] of Object.entries(cycles)) {
      console.log(`    ${duration}m → ${priceId}`)
    }
  }

  console.log('\n🔑  Próximo passo: adicione o STRIPE_WEBHOOK_SECRET e o NEXT_PUBLIC_APP_URL no .env.local')
  console.log('    Depois rode: npm run dev\n')

  return priceMap
}

main().catch(err => {
  console.error('\n❌  Erro durante setup:', err.message)
  process.exit(1)
})
