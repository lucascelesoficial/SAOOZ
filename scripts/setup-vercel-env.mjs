/**
 * SAOOZ — Vercel Environment Variables Setup
 *
 * Usage:
 *   node scripts/setup-vercel-env.mjs
 *
 * Requires environment variables to be set before running:
 *   $env:VERCEL_TOKEN  = "seu-token-aqui"
 *   $env:SENTRY_DSN    = "https://xxx@sentry.io/xxx"   (opcional)
 *   $env:POSTHOG_KEY   = "phc_xxx"                     (opcional)
 *
 * Or edit the VALUES object below directly and run the script.
 */

import https from 'https'

// ─── CONFIG ─────────────────────────────────────────────────────────────────

const PROJECT_ID = 'prj_DgaoWHNfEqcA4wGHk76SyE14Hkxo'
const TEAM_ID    = 'team_mdYjbNug1B2iJnO03VWcwwwP'

// Fill in your values here OR pass as env vars
const VALUES = {
  CRON_SECRET:                   process.env.CRON_SECRET    || 'a43f8898f740a17fd0b46eb50de4b7d9fa51cae360d24deb02645a9fbb1e88ce',
  NEXT_PUBLIC_SENTRY_DSN:        process.env.SENTRY_DSN     || '',
  SENTRY_ORG:                    process.env.SENTRY_ORG     || '',
  SENTRY_PROJECT:                process.env.SENTRY_PROJECT || '',
  SENTRY_AUTH_TOKEN:             process.env.SENTRY_TOKEN   || '',
  NEXT_PUBLIC_POSTHOG_KEY:       process.env.POSTHOG_KEY    || '',
  NEXT_PUBLIC_POSTHOG_HOST:      'https://us.i.posthog.com',
}

// Which environments to set each var in
const TARGETS = ['production', 'preview', 'development']

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const TOKEN = process.env.VERCEL_TOKEN
if (!TOKEN) {
  console.error('❌  VERCEL_TOKEN não configurado.')
  console.error('    Execute: $env:VERCEL_TOKEN = "seu-token"')
  process.exit(1)
}

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined
    const req  = https.request(
      {
        hostname: 'api.vercel.com',
        path,
        method,
        headers: {
          Authorization:  `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let raw = ''
        res.on('data', (c) => (raw += c))
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(raw) }) }
          catch { resolve({ status: res.statusCode, body: raw }) }
        })
      },
    )
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function upsertEnvVar(key, value, targets) {
  if (!value) {
    console.log(`⏭   ${key} — vazio, pulando`)
    return
  }

  // Check if exists
  const list = await apiRequest(
    'GET',
    `/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
  )

  const existing = list.body?.envs?.find((e) => e.key === key)

  if (existing) {
    // Update
    const res = await apiRequest(
      'PATCH',
      `/v9/projects/${PROJECT_ID}/env/${existing.id}?teamId=${TEAM_ID}`,
      { value, target: targets, type: 'plain' },
    )
    if (res.status === 200 || res.status === 201) {
      console.log(`✅  ${key} — atualizado`)
    } else {
      console.error(`❌  ${key} — erro ao atualizar:`, res.body)
    }
  } else {
    // Create
    const res = await apiRequest(
      'POST',
      `/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
      { key, value, target: targets, type: 'plain' },
    )
    if (res.status === 200 || res.status === 201) {
      console.log(`✅  ${key} — criado`)
    } else {
      console.error(`❌  ${key} — erro ao criar:`, res.body)
    }
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

console.log('🚀  SAOOZ — configurando variáveis de ambiente na Vercel...\n')

for (const [key, value] of Object.entries(VALUES)) {
  await upsertEnvVar(key, value, TARGETS)
}

console.log('\n✅  Concluído! Faça um redeploy para aplicar as mudanças.')
console.log('   vercel --prod  ou  git push origin main')
