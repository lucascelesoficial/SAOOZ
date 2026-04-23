'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, Send, ShieldCheck, X } from 'lucide-react'
import { SaoozIcon } from '@/components/ui/SaoozLogo'
import type { OrbState } from '@/components/ui/SaoozLogo'
import { useFinancialData } from '@/lib/hooks/useFinancialData'
import { useVoice } from '@/lib/hooks/useVoice'
import { speak, stopSpeaking, primeTTS } from '@/lib/utils/tts'
import { toMonthISO } from '@/lib/utils/formatters'
import type { FinancialTotals, CategorySummary } from '@/types/financial.types'
import type { AIExecutableAction } from '@/lib/ai/schemas'

interface Message {
  role: 'user' | 'ai'
  text: string
  proposal?: AIExecutableAction
  action?: ActionResult
  streaming?: boolean
}

interface ActionResult {
  label: string
  success: boolean
  upgradeRequired?: boolean
}

interface SaoozAIProps {
  userId: string
  totals: FinancialTotals
  categoryData: CategorySummary[]
}

const STATE_HINT: Record<OrbState, string> = {
  idle: 'Toque no núcleo para falar',
  listening: 'Ouvindo — pode falar',
  thinking: 'Processando...',
  speaking: 'Falando...',
}

const QUICK_ACTIONS = [
  'Analise meu mês',
  'Onde posso economizar?',
  'Adicione R$ 50 em lazer',
  'Como está meu saldo?',
]

export function SaoozAI({ totals, categoryData }: SaoozAIProps) {
  const { refresh, currentMonth } = useFinancialData()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: 'Estou pronto. Posso analisar, sugerir e preparar lançamentos para você confirmar.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [orbState, setOrbState] = useState<OrbState>('idle')
  const [confirmingIndex, setConfirmingIndex] = useState<number | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sendRef = useRef<(text: string) => void>(() => {})

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handler = () => {
      primeTTS()
      document.removeEventListener('click', handler)
    }

    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const { listening, isSupported, startListening, stopListening, pauseForTTS, resumeAfterTTS } =
    useVoice({
      onResult: (text) => sendRef.current(text),
    })

  useEffect(() => {
    if (listening) {
      setOrbState('listening')
    } else if (orbState === 'listening') {
      setOrbState('idle')
    }
  }, [listening, orbState])

  useEffect(() => {
    if (loading) {
      setOrbState('thinking')
      stopSpeaking()
    } else if (orbState === 'thinking') {
      setOrbState('idle')
    }
  }, [loading, orbState])

  async function send(text: string) {
    if (!text.trim() || loading) {
      return
    }

    if (listening) {
      pauseForTTS()
    }

    setMessages((previous) => [...previous, { role: 'user', text: text.trim() }])
    setInput('')
    setLoading(true)
    setMessages((previous) => [...previous, { role: 'ai', text: '', streaming: true }])

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          context: {
            mode: 'pf',
            totalIncome: totals.totalIncome,
            totalExpenses: totals.totalExpenses,
            balance: totals.balance,
            consumptionRate: totals.consumptionRate,
            currentMonth: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            topCategories: categoryData
              .sort((a, b) => b.total - a.total)
              .slice(0, 5)
              .map((item) => ({ name: item.label, amount: item.total })),
          },
        }),
      })

      const data = await response.json()
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erro ao processar a IA.')
      }

      const replyText =
        typeof data.text === 'string' && data.text.trim()
          ? data.text.trim()
          : 'Pronto. Analisei seu pedido.'

      const proposal = data.proposal as AIExecutableAction | undefined

      setMessages((previous) => {
        const next = [...previous]
        next[next.length - 1] = {
          role: 'ai',
          text: replyText,
          proposal,
          streaming: false,
        }
        return next
      })

      if (voiceMode) {
        speak(replyText, {
          onStart: () => setOrbState('speaking'),
          onEnd: () => {
            setOrbState('idle')
            resumeAfterTTS()
          },
        })
      } else {
        resumeAfterTTS()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido.'
      setMessages((previous) => {
        const next = [...previous]
        next[next.length - 1] = { role: 'ai', text: message, streaming: false }
        return next
      })
      resumeAfterTTS()
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  sendRef.current = send

  async function confirmProposal(index: number, proposal: AIExecutableAction) {
    setConfirmingIndex(index)

    try {
      const response = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal,
          month: toMonthISO(currentMonth),
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw Object.assign(new Error(data.error || 'Não foi possível executar a ação.'), {
          upgradeRequired: Boolean(data.upgradeRequired),
        })
      }

      await refresh()

      setMessages((previous) =>
        previous.map((message, messageIndex) =>
          messageIndex === index
            ? {
                ...message,
                text: data.text ?? 'Ação concluída com sucesso.',
                proposal: undefined,
                action: {
                  label: data.label ?? 'Ação executada',
                  success: true,
                },
              }
            : message
        )
      )
    } catch (error) {
      const upgradeRequired =
        typeof error === 'object' &&
        error !== null &&
        'upgradeRequired' in error &&
        Boolean(error.upgradeRequired)

      const message =
        error instanceof Error ? error.message : 'Não foi possível executar a ação.'

      setMessages((previous) =>
        previous.map((item, messageIndex) =>
          messageIndex === index
            ? {
                ...item,
                text: message,
                proposal: undefined,
                action: {
                  label: upgradeRequired ? 'Upgrade necessário' : 'Execução falhou',
                  success: false,
                  upgradeRequired,
                },
              }
            : item
        )
      )
    } finally {
      setConfirmingIndex(null)
    }
  }

  function cancelProposal(index: number) {
    setMessages((previous) =>
      previous.map((message, messageIndex) =>
        messageIndex === index
          ? {
              ...message,
              text: `${message.text}\n\nAção cancelada. Nada foi registrado.`,
              proposal: undefined,
            }
          : message
      )
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function toggleVoice() {
    primeTTS()

    if (voiceMode) {
      stopListening()
      stopSpeaking()
      setVoiceMode(false)
      setOrbState('idle')
      return
    }

    setVoiceMode(true)
    if (isSupported) {
      startListening()
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send(input)
    }
  }

  return (
    <div
      className="flex h-full min-h-[420px] flex-col rounded-[12px]"
      style={{
        background: 'var(--surface-bg)',
        border: '1px solid var(--panel-border)',
        boxShadow: '0 4px 32px color-mix(in oklab, var(--accent-blue) 4%, transparent)',
      }}
    >
      <div
        className="flex items-center gap-3 border-b px-4 py-3"
        style={{
          borderColor: 'transparent',
          background: 'linear-gradient(135deg, #0A1D13, #163424)',
        }}
      >
        <div className="shrink-0">
          <SaoozIcon size={34} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-none" style={{ color: '#ffffff' }}>
            Pearfy <span style={{ color: 'rgba(232,246,212,0.85)' }}>IA</span>
          </p>
          <p
            className="mt-0.5 text-[10px] transition-all duration-300"
            style={{
              color:
                orbState === 'listening'
                  ? '#B7D98A'
                  : orbState === 'speaking'
                    ? '#86efac'
                    : orbState === 'thinking'
                      ? '#fcd34d'
                      : 'rgba(255,255,255,0.60)',
            }}
          >
            {voiceMode ? STATE_HINT[orbState] : 'Assistente seguro · sugere antes de executar'}
          </p>
        </div>

        <span
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            background: 'rgba(34,197,94,0.18)',
            color: '#86efac',
            border: '1px solid rgba(34,197,94,0.25)',
          }}
        >
          <ShieldCheck className="h-3 w-3" />
          confirmação
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3" style={{ maxHeight: 320 }}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'ai' && (
              <div className="mt-0.5 shrink-0">
                <SaoozIcon size={20} />
              </div>
            )}

            <div className="max-w-[85%] space-y-1.5">
              <div
                className="rounded-[10px] px-3 py-2 text-sm leading-relaxed"
                style={
                  message.role === 'user'
                    ? {
                        background: 'linear-gradient(135deg, #026648, #026648)',
                        color: '#fff',
                        borderBottomRightRadius: 3,
                      }
                    : {
                        background: 'var(--panel-bg-soft)',
                        color: 'var(--text-strong)',
                        borderBottomLeftRadius: 3,
                        border: '1px solid var(--panel-border-strong)',
                        whiteSpace: 'pre-line',
                      }
                }
              >
                {message.streaming && !message.text ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-app-soft" />
                ) : (
                  message.text
                )}
              </div>

              {message.proposal && (
                <div
                  className="rounded-[10px] border px-3 py-3"
                  style={{
                    background: 'var(--panel-bg-soft)',
                    borderColor: 'var(--panel-border)',
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--accent-blue)' }}
                  >
                    Ação sugerida
                  </p>
                  <p className="mt-2 text-xs text-app-soft">
                    Revise e confirme. Nada é gravado sem sua aprovação.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => void confirmProposal(index, message.proposal!)}
                      disabled={confirmingIndex === index}
                      className="inline-flex h-8 items-center justify-center gap-2 rounded-[8px] px-3 text-xs font-semibold text-white transition-opacity disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #026648, #026648)' }}
                    >
                      {confirmingIndex === index ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Confirmar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => cancelProposal(index)}
                      disabled={confirmingIndex === index}
                      className="inline-flex h-8 items-center justify-center gap-2 rounded-[8px] border px-3 text-xs font-semibold text-app-soft transition-opacity disabled:opacity-60"
                      style={{ borderColor: 'var(--panel-border)' }}
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {message.action && (
                <div
                  className="flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[11px]"
                  style={
                    message.action.success
                      ? {
                          background: '#22c55e10',
                          border: '1px solid #22c55e20',
                          color: '#22c55e',
                        }
                      : {
                          background: '#f8717110',
                          border: '1px solid #f8717120',
                          color: '#f87171',
                        }
                  }
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {message.action.label}
                  {message.action.upgradeRequired && (
                    <Link href="/planos" className="ml-1 underline">
                      Ver planos
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && !loading && !voiceMode && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => void send(action)}
              className="rounded-full px-2.5 py-1 text-[11px] transition-all"
              style={{
                background: 'var(--panel-border)',
                border: '1px solid var(--panel-border-strong)',
                color: 'var(--text-base)',
              }}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {!voiceMode && (
        <div className="px-3 pb-3">
          <div
            className="flex items-center gap-2 rounded-[10px] px-3 py-2"
            style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border-strong)' }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva sua mensagem..."
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-app outline-none placeholder:text-app-soft disabled:opacity-50"
            />
            <button
              onClick={() => void send(input)}
              disabled={loading || !input.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] transition-all disabled:opacity-30"
              style={{
                background: input.trim()
                  ? 'linear-gradient(135deg, #026648, #026648)'
                  : 'var(--panel-border)',
              }}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              ) : (
                <Send className="h-3.5 w-3.5 text-white" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
