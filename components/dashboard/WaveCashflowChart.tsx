'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/lib/utils/formatters'
import type { Database } from '@/types/database.types'

type Income = Database['public']['Tables']['income_sources']['Row']
type Expense = Database['public']['Tables']['expenses']['Row']

interface WaveCashflowChartProps {
  incomes: Income[]
  expenses: Expense[]
}

type Point = {
  day: string
  cashIn: number
  cashOut: number
  balance: number
}

function dayOfMonth(value: string) {
  return new Date(value).getDate()
}

export function WaveCashflowChart({ incomes, expenses }: WaveCashflowChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const data = useMemo<Point[]>(() => {
    const checkpoints = [1, 5, 10, 15, 20, 25, 31]
    return checkpoints.map((checkpoint) => {
      const cashIn = incomes
        .filter((row) => dayOfMonth(row.created_at) <= checkpoint)
        .reduce((sum, row) => sum + row.amount, 0)

      const cashOut = expenses
        .filter((row) => dayOfMonth(row.created_at) <= checkpoint)
        .reduce((sum, row) => sum + row.amount, 0)

      return {
        day: `${checkpoint}`,
        cashIn,
        cashOut,
        balance: cashIn - cashOut,
      }
    })
  }, [incomes, expenses])

  const hasAnyData = data.some((point) => point.cashIn > 0 || point.cashOut > 0)

  return (
    <div className="panel-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-app-base">Fluxo em Ondas</h2>
        <span className="text-xs text-app-soft">Acumulado do mes</span>
      </div>

      {!isMounted ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-app-soft">
          Carregando grafico...
        </div>
      ) : !hasAnyData ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-app-soft">
          Adicione receitas e gastos para ver a ondulacao do seu caixa.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="waveIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="waveExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="waveBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#74A93D" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#74A93D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fill: 'var(--text-soft)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(value) => `R$${Math.round(value / 1000)}k`}
              tick={{ fill: 'var(--text-soft)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={46}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--panel-bg)',
                border: '1px solid var(--panel-border)',
                borderRadius: 10,
              }}
              formatter={(value: unknown, name: unknown) => {
                const labelMap: Record<string, string> = {
                  cashIn: 'Entradas',
                  cashOut: 'Saidas',
                  balance: 'Saldo',
                }
                const key = String(name ?? '')
                return [formatCurrency(Number(value ?? 0)), labelMap[key] ?? key]
              }}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Area type="monotone" dataKey="cashIn" stroke="#22c55e" fill="url(#waveIncome)" strokeWidth={2} />
            <Area type="monotone" dataKey="cashOut" stroke="#f87171" fill="url(#waveExpense)" strokeWidth={2} />
            <Area type="monotone" dataKey="balance" stroke="#74A93D" fill="url(#waveBalance)" strokeWidth={2} strokeDasharray="5 4" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
