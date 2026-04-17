#!/usr/bin/env node
/**
 * Inserts `requireCompletedOnboarding` check into mutation API routes
 * right after the authentication block.
 */
import fs from 'node:fs'
import path from 'node:path'

const FILES = [
  'app/api/investments/accounts/route.ts',
  'app/api/investments/assets/route.ts',
  'app/api/investments/movements/route.ts',
  'app/api/reserve/movements/route.ts',
  'app/api/reserve/reserves/route.ts',
  'app/api/reserve/targets/route.ts',
  'app/api/ai/action/route.ts',
  'app/api/ai/route.ts',
  'app/api/businesses/activate/route.ts',
  'app/api/businesses/delete/route.ts',
]

const IMPORT_LINE = `import { requireCompletedOnboarding } from '@/lib/server/onboarding-gate'`

// Match common auth check patterns and inject the gate right after
const PATTERNS = [
  {
    // Pattern A: return NextResponse.json({ error: 'Não autenticado...' }, { status: 401 })
    // (plus close brace) followed by empty line
    re: /(\s*if \(authError \|\| !user\) \{\s*return NextResponse\.json\(\{ error: '[^']*' \}, \{ status: 401 \}\)\s*\}\s*\n)/g,
    inject: (match) =>
      match +
      `\n    const gate = await requireCompletedOnboarding(user.id)\n    if (!gate.ok) return gate.response\n`,
  },
]

let touched = 0
for (const rel of FILES) {
  const full = path.join(process.cwd(), rel)
  if (!fs.existsSync(full)) {
    console.log(`skip (missing): ${rel}`)
    continue
  }
  let src = fs.readFileSync(full, 'utf8')

  // Add import if missing
  if (!src.includes('requireCompletedOnboarding')) {
    // insert after the last top-level import
    const importRegex = /^import .+$/gm
    const imports = [...src.matchAll(importRegex)]
    if (imports.length > 0) {
      const last = imports[imports.length - 1]
      const insertAt = last.index + last[0].length
      src = src.slice(0, insertAt) + '\n' + IMPORT_LINE + src.slice(insertAt)
    }
  }

  // Only inject if not already present in handlers
  const before = src
  // Only inject once per occurrence (multiple handlers per file ok)
  for (const p of PATTERNS) {
    src = src.replace(p.re, (match) => {
      if (/requireCompletedOnboarding/.test(match)) return match
      return p.inject(match)
    })
  }

  if (src !== before) {
    fs.writeFileSync(full, src)
    touched++
    console.log(`✓ ${rel}`)
  } else {
    console.log(`–  ${rel} (no change)`)
  }
}

console.log(`\nTotal alterados: ${touched}`)
