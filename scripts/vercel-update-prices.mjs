#!/usr/bin/env node
const TOKEN = process.env.VERCEL_TOKEN
const PID = 'prj_DgaoWHNfEqcA4wGHk76SyE14Hkxo'

const MAP = {
  psVz0uxOWfWcuVcm: ['STRIPE_PRICE_PF_1M',  'price_1TMzeqQvDDC4s0W9N2YAQbOZ'],
  '1gT2yB2uxvkil5e2': ['STRIPE_PRICE_PF_3M',  'price_1TMzerQvDDC4s0W96GEYvXaw'],
  t2LMlp7VJJsI7Yut: ['STRIPE_PRICE_PF_6M',  'price_1TMzerQvDDC4s0W9VEA8nltH'],
  QBvGZIT8i4jXcupt: ['STRIPE_PRICE_PF_12M', 'price_1TMzerQvDDC4s0W9kpKLqYtM'],
  Klc0jfk24NYXNQ6C: ['STRIPE_PRICE_PJ_1M',  'price_1TMzesQvDDC4s0W9tMLteZja'],
  OFPieHknw3x7G9GF: ['STRIPE_PRICE_PJ_3M',  'price_1TMzesQvDDC4s0W9EOUMBgzS'],
  SA9EMYJNwMP7UlqF: ['STRIPE_PRICE_PJ_6M',  'price_1TMzesQvDDC4s0W9fYIVLPRn'],
  pI23nxNYt1aUq14M: ['STRIPE_PRICE_PJ_12M', 'price_1TMzetQvDDC4s0W9946TSRVF'],
  '4IXT36Z72WmqHYvP': ['STRIPE_PRICE_PRO_1M',  'price_1TMzetQvDDC4s0W9xbloO2XQ'],
  K56j9t6BLTKteWHA: ['STRIPE_PRICE_PRO_3M',  'price_1TMzetQvDDC4s0W9KqTgW6ES'],
  hDXh7xr1uWsdi2nd: ['STRIPE_PRICE_PRO_6M',  'price_1TMzeuQvDDC4s0W9WPJ2SU5T'],
  nkE6JIYaLATUfjbI: ['STRIPE_PRICE_PRO_12M', 'price_1TMzeuQvDDC4s0W9OUB2FxcQ'],
}

for (const [id, [key, value]] of Object.entries(MAP)) {
  const res = await fetch(`https://api.vercel.com/v9/projects/${PID}/env/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, target: ['production','preview','development'], type: 'encrypted' }),
  })
  const data = await res.json()
  if (!res.ok) console.log(`❌ ${key}: ${JSON.stringify(data)}`)
  else console.log(`✓ ${key} → ${value}`)
}

console.log('\n🚀 Disparando redeploy da branch main...')
// Trigger redeploy by deploying from last git commit via Deployments API
const dep = await fetch('https://api.vercel.com/v13/deployments', {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'saooz',
    project: PID,
    target: 'production',
    gitSource: { type: 'github', repoId: undefined, ref: 'main' },
  }),
})
const depData = await dep.json()
if (dep.ok) {
  console.log(`✓ Deploy criado: ${depData.url}`)
  console.log(`  Status: ${depData.readyState || depData.status || 'QUEUED'}`)
} else {
  console.log(`⚠ Deploy API: ${JSON.stringify(depData).slice(0, 300)}`)
  console.log('  (O git push anterior já dispara deploy automático — env vars serão aplicadas nele)')
}
