'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface OnboardingStep {
  id:          string
  label:       string
  description: string
  href:        string
  completed:   boolean
}

interface UseOnboardingProgressOptions {
  scope:              'pf' | 'pj'
  userId:             string
  activeBusinessId?:  string | null
}

const DISMISSED_KEY = (scope: string) => `saooz_onboarding_dismissed_${scope}`

export function useOnboardingProgress({
  scope,
  userId,
  activeBusinessId,
}: UseOnboardingProgressOptions) {
  const [steps, setSteps]         = useState<OnboardingStep[]>([])
  const [loading, setLoading]     = useState(true)
  const [dismissed, setDismissed] = useState(false)

  // Check localStorage dismiss state immediately on mount (avoid flash)
  useEffect(() => {
    const val = localStorage.getItem(DISMISSED_KEY(scope))
    if (val === 'true') setDismissed(true)
  }, [scope])

  const loadProgress = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    if (scope === 'pf') {
      const [
        { count: incomeCount },
        { count: expenseCount },
        { data: profile },
      ] = await Promise.all([
        supabase
          .from('income_sources')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('expenses')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('profiles')
          .select('cpf, phone, city')
          .eq('id', userId)
          .single(),
      ])

      const profileFilled =
        !!profile?.cpf || !!profile?.phone || !!profile?.city

      const visited = localStorage.getItem(`saooz_visited_inteligencia_pf`) === 'true'

      setSteps([
        {
          id:          'add_income',
          label:       'Adicionar primeira renda',
          description: 'Registre suas fontes de renda para calcular seu saldo.',
          href:        '/financas',
          completed:   (incomeCount ?? 0) > 0,
        },
        {
          id:          'add_expense',
          label:       'Registrar primeira despesa',
          description: 'Lance uma despesa para ver sua distribuição por categoria.',
          href:        '/despesas',
          completed:   (expenseCount ?? 0) > 0,
        },
        {
          id:          'complete_profile',
          label:       'Completar perfil financeiro',
          description: 'Preencha seus dados para análises mais precisas.',
          href:        '/perfil-financeiro',
          completed:   profileFilled,
        },
        {
          id:          'explore_intelligence',
          label:       'Explorar Inteligência',
          description: 'Veja os insights gerados sobre suas finanças.',
          href:        '/inteligencia',
          completed:   visited,
        },
      ])
    } else {
      if (!activeBusinessId) {
        setSteps([])
        setLoading(false)
        return
      }

      const [
        { count: revenueCount },
        { count: expenseCount },
        { count: clientCount },
      ] = await Promise.all([
        supabase
          .from('business_revenues')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', activeBusinessId),
        supabase
          .from('business_expenses')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', activeBusinessId),
        supabase
          .from('business_counterparties')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', activeBusinessId)
          .eq('type', 'cliente'),
      ])

      const dreVisited = localStorage.getItem(`saooz_visited_dre`) === 'true'

      setSteps([
        {
          id:          'add_revenue',
          label:       'Registrar primeiro faturamento',
          description: 'Adicione uma receita para ver seu DRE tomar forma.',
          href:        '/empresa/financas',
          completed:   (revenueCount ?? 0) > 0,
        },
        {
          id:          'add_expense',
          label:       'Lançar primeira despesa',
          description: 'Registre um custo para calcular seu lucro operacional.',
          href:        '/empresa/despesas',
          completed:   (expenseCount ?? 0) > 0,
        },
        {
          id:          'add_client',
          label:       'Cadastrar primeiro cliente',
          description: 'Vincule um cliente às suas receitas para rastrear A Receber.',
          href:        '/empresa/clientes',
          completed:   (clientCount ?? 0) > 0,
        },
        {
          id:          'view_dre',
          label:       'Ver seu DRE',
          description: 'Entenda a demonstração de resultado da sua empresa.',
          href:        '/empresa/dre',
          completed:   dreVisited,
        },
      ])
    }

    setLoading(false)
  }, [scope, userId, activeBusinessId])

  useEffect(() => {
    if (!dismissed) loadProgress()
  }, [dismissed, loadProgress])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY(scope), 'true')
    setDismissed(true)
  }

  function markVisited(key: string) {
    localStorage.setItem(`saooz_visited_${key}`, 'true')
    loadProgress()
  }

  const completed  = steps.filter((s) => s.completed).length
  const total      = steps.length
  const allDone    = total > 0 && completed === total
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    steps,
    loading,
    dismissed,
    dismiss,
    markVisited,
    completed,
    total,
    allDone,
    percentage,
  }
}
