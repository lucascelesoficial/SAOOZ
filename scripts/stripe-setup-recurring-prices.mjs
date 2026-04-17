#!/usr/bin/env node
/**
 * SAOOZ — Stripe setup: recria produtos + 12 preços recorrentes.
 *
 * Lê STRIPE_SECRET_KEY de .env.local e:
 *   1. Arquiva os preços antigos (STRIPE_PRICE_*) se existirem
 *   2. Cria/reaproveita produtos PF, PJ, PRO
 *   3. Cria 4 preços Recurring por produto (1M, 3M, 6M, 12M)
 *   4. Imprime as 12 novas env vars prontas para colar na Vercel
 *   5. Atualiza .env.local localmente
 */
import Stripe from 'stripe'
import fs from 'node:fs'
import path from 'node:path'

const ENV_PATH = path.join(process.cwd(), '.env.local')
const envRaw = fs.readFileSync(ENV_PATH, 'utf8')
const env = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const key = env.STRIPE_SECRET_KEY
if (!key?.startsWith('sk_')) {
  console.error('STRIPE_SECRET_KEY inválida em .env.local')
  process.exit(1)
}

const stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
const mode = key.startsWith('sk_live_') ? 'LIVE' : 'TEST'
console.log(`\n🔧 SAOOZ Stripe Setup — modo ${mode}\n`)

// ─── Plans (BRL, em centavos) ────────────────────────────────────────────────
// Base mensal × duração × (1 - desconto)
// PF 47 / PJ 67 / PRO 97 mensal
// Descontos: 1M=0, 3M=0, 6M=15%, 12M=25%
const PLANS = [
  {
    code: 'PF',
    name: 'SAOOZ PF',
    description: 'Gestão financeira pessoal com IA assistida',
    prices: [
      { key: '1M',  amount: 4700,  interval: 'month', count: 1  },
      { key: '3M',  amount: 14100, interval: 'month', count: 3  },
      { key: '6M',  amount: 23970, interval: 'month', count: 6  }, // 47*6*0.85
      { key: '12M', amount: 42300, interval: 'year',  count: 1  }, // 47*12*0.75
    ],
  },
  {
    code: 'PJ',
    name: 'SAOOZ PJ',
    description: 'Operação empresarial completa com IA',
    prices: [
      { key: '1M',  amount: 6700,  interval: 'month', count: 1  },
      { key: '3M',  amount: 20100, interval: 'month', count: 3  },
      { key: '6M',  amount: 34170, interval: 'month', count: 6  }, // 67*6*0.85
      { key: '12M', amount: 60300, interval: 'year',  count: 1  }, // 67*12*0.75
    ],
  },
  {
    code: 'PRO',
    name: 'SAOOZ PRO',
    description: 'PF + PJ com IA sem limite e inteligência avançada',
    prices: [
      { key: '1M',  amount: 9700,  interval: 'month', count: 1  },
      { key: '3M',  amount: 29100, interval: 'month', count: 3  },
      { key: '6M',  amount: 49470, interval: 'month', count: 6  }, // 97*6*0.85
      { key: '12M', amount: 87300, interval: 'year',  count: 1  }, // 97*12*0.75
    ],
  },
]

// ─── 1. Arquivar preços antigos ─────────────────────────────────────────────
const oldPriceIds = Object.entries(env)
  .filter(([k]) => k.startsWith('STRIPE_PRICE_'))
  .map(([, v]) => v)
  .filter(v => v?.startsWith('price_'))

console.log(`📦 Arquivando ${oldPriceIds.length} preço(s) antigo(s)...`)
for (const id of oldPriceIds) {
  try {
    await stripe.prices.update(id, { active: false })
    console.log(`  ✓ arquivado ${id}`)
  } catch (e) {
    console.log(`  ⚠ ${id}: ${e.message}`)
  }
}

// ─── 2. Criar/reaproveitar produtos ─────────────────────────────────────────
console.log('\n🏷️  Configurando produtos...')
const products = {}
const existing = await stripe.products.list({ limit: 100, active: true })

for (const plan of PLANS) {
  let product = existing.data.find(p =>
    p.metadata?.saooz_plan === plan.code || p.name === plan.name
  )
  if (product) {
    console.log(`  ✓ reaproveitado ${plan.code}: ${product.id}`)
  } else {
    product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { saooz_plan: plan.code },
    })
    console.log(`  ✓ criado ${plan.code}: ${product.id}`)
  }
  products[plan.code] = product
}

// ─── 3. Criar preços recorrentes ────────────────────────────────────────────
console.log('\n💰 Criando preços recurring...')
const newPrices = {}

for (const plan of PLANS) {
  for (const p of plan.prices) {
    const price = await stripe.prices.create({
      product: products[plan.code].id,
      currency: 'brl',
      unit_amount: p.amount,
      recurring: {
        interval: p.interval,
        interval_count: p.count,
      },
      metadata: {
        saooz_plan: plan.code,
        saooz_duration: p.key,
      },
      nickname: `${plan.code} ${p.key}`,
    })
    const envKey = `STRIPE_PRICE_${plan.code}_${p.key}`
    newPrices[envKey] = price.id
    console.log(`  ✓ ${envKey} = ${price.id} (R$${(p.amount/100).toFixed(2)} / ${p.count} ${p.interval})`)
  }
}

// ─── 4. Atualizar .env.local ────────────────────────────────────────────────
console.log('\n📝 Atualizando .env.local...')
let updated = envRaw
for (const [k, v] of Object.entries(newPrices)) {
  if (updated.match(new RegExp(`^${k}=.*$`, 'm'))) {
    updated = updated.replace(new RegExp(`^${k}=.*$`, 'm'), `${k}=${v}`)
  } else {
    updated += `\n${k}=${v}`
  }
}
fs.writeFileSync(ENV_PATH, updated)
console.log('  ✓ .env.local atualizado')

// ─── 5. Output para Vercel ──────────────────────────────────────────────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 COLE NA VERCEL (Production + Preview + Development):\n')
for (const [k, v] of Object.entries(newPrices)) {
  console.log(`${k}=${v}`)
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`\n✅ Setup completo — modo ${mode}`)
