/**
 * SAOOZ — Onboarding Gate (server)
 *
 * Server-side helper that blocks mutation endpoints when the user hasn't
 * finished cadastro (profiles.onboarding_completed_at is NULL).
 *
 * Usage em rotas POST/PATCH/DELETE:
 *
 *   const auth = await requireUser()
 *   if (!auth.ok) return auth.response
 *
 *   const gate = await requireCompletedOnboarding(auth.user.id)
 *   if (!gate.ok) return gate.response
 *
 *   // ... proceed with mutation
 */

import { NextResponse } from 'next/server'
import { createAdminClient, hasAdminCredentials } from '@/lib/supabase/admin'

export async function requireCompletedOnboarding(userId: string) {
  // Fail-open se o admin client não está disponível (ambiente quebrado),
  // pra não bloquear todas as requisições por erro de env.
  if (!hasAdminCredentials()) {
    console.warn('[onboarding-gate] SUPABASE_SERVICE_ROLE_KEY missing — gate disabled')
    return { ok: true as const }
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .select('onboarding_completed_at')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      // Se a coluna ainda não foi criada (migration 023 não aplicada),
      // fail-open para não quebrar produção.
      const msg = error.message || ''
      if (/onboarding_completed_at/i.test(msg) && /column|does not exist/i.test(msg)) {
        return { ok: true as const }
      }
      console.error('[onboarding-gate] DB error:', msg)
      return { ok: true as const } // fail-open on unexpected errors
    }

    if (!data || data.onboarding_completed_at) {
      return { ok: true as const }
    }

    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: 'Cadastro incompleto',
          code: 'ONBOARDING_REQUIRED',
          message: 'Finalize seu cadastro para usar esta função.',
          redirect: '/onboarding',
        },
        {
          status: 403,
          headers: {
            'Cache-Control': 'no-store',
            'X-Onboarding-Required': '1',
          },
        }
      ),
    }
  } catch (err) {
    console.error('[onboarding-gate] unexpected error:', err)
    return { ok: true as const } // fail-open
  }
}
