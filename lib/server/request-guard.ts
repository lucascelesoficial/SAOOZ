import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type RateBucket = {
  count: number
  resetAt: number
}

const RATE_BUCKETS = new Map<string, RateBucket>()

export async function requireUser() {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    }
  }

  return { ok: true as const, user }
}

export function enforceRateLimit(input: {
  scope: string
  user: User
  maxRequests: number
  windowMs: number
}) {
  const { scope, user, maxRequests, windowMs } = input
  const now = Date.now()
  const key = `${scope}:${user.id}`
  const current = RATE_BUCKETS.get(key)

  if (!current || current.resetAt <= now) {
    RATE_BUCKETS.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true as const }
  }

  if (current.count >= maxRequests) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em instantes.' },
        { status: 429 }
      ),
    }
  }

  current.count += 1
  RATE_BUCKETS.set(key, current)
  return { ok: true as const }
}
