'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  businessId: string
}

/**
 * Fetches the count of pending/overdue AR+AP items and renders
 * a small red pill badge. Renders nothing when count is 0.
 */
export function OverdueBadge({ businessId }: Props) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!businessId) return

    async function fetchCount() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const [revRes, expRes] = await Promise.all([
        supabase
          .from('business_revenues')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .in('status', ['pending', 'overdue'])
          .lt('due_date', today),
        supabase
          .from('business_expenses')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .in('status', ['pending', 'overdue'])
          .lt('due_date', today),
      ])

      const total = (revRes.count ?? 0) + (expRes.count ?? 0)
      setCount(total)
    }

    fetchCount()
  }, [businessId])

  if (count === 0) return null

  return (
    <span
      className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
      style={{ background: '#ef4444' }}
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}
