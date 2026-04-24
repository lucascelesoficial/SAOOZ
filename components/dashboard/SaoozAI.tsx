'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, Minus, Send, ShieldCheck, X } from 'lucide-react'
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
  const [open, setOpen] = useState(false)
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
  const [unread, setUnread] = useState(0)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sendRef = useRef<(text: string) => void>(() => {})

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

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
    useVoice({ onResult: (text) => sendRef.current(text) })

  useEffect(() => {
    if (listening) setOrbState('listening')
    else if (orbState === 'listening') setOrbState('idle')
  }, [listening, orbState])

  useEffect(() => {
    if (loading) { setOrbState('thinking'); stopSpeaking() }
    else if (orbState === 'thinking') setOrbState('idle')
  }, [loading, orbState])

  async function send(text: string) {
    if (!text.trim() || loading) return
    if (listening) pauseForTTS()

    setMessages((prev) => [...prev, { role: 'user', text: text.trim() }])
    setInput('')
    setLoading(true)
    setMessages((prev) => [...prev, { role: 'ai', text: '', streaming: true }])

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
      if (!response.ok || data.error) throw new Error(data.error || 'Erro ao processar a IA.')

      const replyText =
        typeof data.text === 'string' && data.text.trim()
          ? data.text.trim()
          : 'Pronto. Analisei seu pedido.'

      const proposal = data.proposal as AIExecutableAction | undefined

      setMessages((prev) => {
        const next = [...prev]
        next[next.length - 1] = { role: 'ai', text: replyText, proposal, streaming: false }
        return next
      })

      if (!open) setUnread((n) => n + 1)

      if (voiceMode) {
        speak(replyText, {
          onStart: () => setOrbState('speaking'),
          onEnd: () => { setOrbState('idle'); resumeAfterTTS() },
        })
      } else {
        resumeAfterTTS()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido.'
      setMessages((prev) => {
        const next = [...prev]
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
        body: JSON.stringify({ proposal, month: toMonthISO(currentMonth) }),
      })
      const data = await response.json()
      if (!response.ok || data.error)
        throw Object.assign(new Error(data.error || 'Não foi possível executar a ação.'), {
          upgradeRequired: Boolean(data.upgradeRequired),
        })
      await refresh()
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === index
            ? { ...msg, text: data.text ?? 'Ação concluída.', proposal: undefined, action: { label: data.label ?? 'Ação executada', success: true } }
            : msg
        )
      )
    } catch (error) {
      const upgradeRequired = typeof error === 'object' && error !== null && 'upgradeRequired' in error && Boolean(error.upgradeRequired)
      const message = error instanceof Error ? error.message : 'Não foi possível executar a ação.'
      setMessages((prev) =>
        prev.map((item, i) =>
          i === index
            ? { ...item, text: message, proposal: undefined, action: { label: upgradeRequired ? 'Upgrade necessário' : 'Execução falhou', success: false, upgradeRequired } }
            : item
        )
      )
    } finally {
      setConfirmingIndex(null)
    }
  }

  function cancelProposal(index: number) {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index
          ? { ...msg, text: `${msg.text}\n\nAção cancelada. Nada foi registrado.`, proposal: undefined }
          : msg
      )
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function toggleVoice() {
    primeTTS()
    if (voiceMode) { stopListening(); stopSpeaking(); setVoiceMode(false); setOrbState('idle'); return }
    setVoiceMode(true)
    if (isSupported) startListening()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input) }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ai-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(2,102,72,0.55), 0 4px 20px rgba(2,102,72,0.35); }
          50%       { box-shadow: 0 0 0 10px rgba(2,102,72,0), 0 4px 20px rgba(2,102,72,0.35); }
        }
        @keyframes ai-panel-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .ai-panel-enter { animation: ai-panel-in 0.22s cubic-bezier(0.34,1.4,0.64,1) forwards; }

        /* FAB: above BottomNav on mobile, fixed bottom-right on desktop */
        .ai-fab {
          bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 14px);
          right: 16px;
        }
        @media (min-width: 768px) {
          .ai-fab { bottom: 24px; right: 24px; }
        }

        /* Panel: full-width on mobile, fixed size on desktop */
        .ai-panel {
          left: 12px;
          right: 12px;
          bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 14px + 56px + 10px);
          width: auto;
          height: min(520px, calc(100dvh - 160px));
        }
        @media (min-width: 768px) {
          .ai-panel { left: auto; right: 24px; bottom: 88px; width: 380px; height: 520px; }
        }
      ` }} />

      {/* ── Floating chat panel ── */}
      {open && (
        <div
          className="ai-panel ai-panel-enter fixed z-50 flex flex-col rounded-[16px] overflow-hidden"
          style={{
            background: 'var(--surface-bg)',
            border: '1px solid var(--panel-border)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 4px 16px rgba(2,102,72,0.12)',
          }}
        >
          {/* Header */}
          <div
            className="flex shrink-0 items-center gap-3 px-4 py-3"
            style={{ background: 'linear-gradient(135deg, #0A1D13, #163424)' }}
          >
            <SaoozIcon size={32} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-none text-white">
                Pearfy <span style={{ color: 'rgba(232,246,212,0.85)' }}>IA</span>
              </p>
              <p className="mt-0.5 text-[10px] transition-all duration-300"
                style={{
                  color: orbState === 'listening' ? '#B7D98A'
                    : orbState === 'speaking' ? '#86efac'
                    : orbState === 'thinking' ? '#fcd34d'
                    : 'rgba(255,255,255,0.55)',
                }}>
                {voiceMode ? STATE_HINT[orbState] : 'Assistente seguro · sugere antes de executar'}
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: 'rgba(34,197,94,0.18)', color: '#86efac', border: '1px solid rgba(34,197,94,0.25)' }}>
              <ShieldCheck className="h-3 w-3" />
              confirmação
            </span>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
              style={{ color: 'rgba(255,255,255,0.55)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)', e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="mt-0.5 shrink-0"><SaoozIcon size={20} /></div>
                )}
                <div className="max-w-[85%] space-y-1.5">
                  <div className="rounded-[10px] px-3 py-2 text-sm leading-relaxed"
                    style={msg.role === 'user'
                      ? { background: 'linear-gradient(135deg, #026648, #014d37)', color: '#fff', borderBottomRightRadius: 3 }
                      : { background: 'var(--panel-bg-soft)', color: 'var(--text-strong)', borderBottomLeftRadius: 3, border: '1px solid var(--panel-border-strong)', whiteSpace: 'pre-line' }
                    }
                  >
                    {msg.streaming && !msg.text
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin text-app-soft" />
                      : msg.text}
                  </div>

                  {msg.proposal && (
                    <div className="rounded-[10px] border px-3 py-3"
                      style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-blue)' }}>
                        Ação sugerida
                      </p>
                      <p className="mt-2 text-xs text-app-soft">Revise e confirme. Nada é gravado sem sua aprovação.</p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => void confirmProposal(index, msg.proposal!)} disabled={confirmingIndex === index}
                          className="inline-flex h-8 items-center justify-center gap-2 rounded-[8px] px-3 text-xs font-semibold text-white transition-opacity disabled:opacity-60"
                          style={{ background: 'linear-gradient(135deg, #026648, #014d37)' }}>
                          {confirmingIndex === index
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <><CheckCircle2 className="h-3.5 w-3.5" />Confirmar</>}
                        </button>
                        <button onClick={() => cancelProposal(index)} disabled={confirmingIndex === index}
                          className="inline-flex h-8 items-center justify-center gap-2 rounded-[8px] border px-3 text-xs font-semibold text-app-soft transition-opacity disabled:opacity-60"
                          style={{ borderColor: 'var(--panel-border)' }}>
                          <X className="h-3.5 w-3.5" />Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.action && (
                    <div className="flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[11px]"
                      style={msg.action.success
                        ? { background: '#02664812', border: '1px solid #02664820', color: '#026648' }
                        : { background: '#f8717110', border: '1px solid #f8717120', color: '#f87171' }}>
                      <CheckCircle2 className="h-3 w-3" />
                      {msg.action.label}
                      {msg.action.upgradeRequired && (
                        <Link href="/planos" className="ml-1 underline">Ver planos</Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && !loading && !voiceMode && (
            <div className="flex shrink-0 flex-wrap gap-1.5 px-4 pb-2">
              {QUICK_ACTIONS.map((action) => (
                <button key={action} onClick={() => void send(action)}
                  className="rounded-full px-2.5 py-1 text-[11px] transition-all"
                  style={{ background: 'var(--panel-border)', border: '1px solid var(--panel-border-strong)', color: 'var(--text-base)' }}>
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          {!voiceMode && (
            <div className="shrink-0 px-3 pb-3">
              <div className="flex items-center gap-2 rounded-[10px] px-3 py-2"
                style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border-strong)' }}>
                <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder="Escreva sua mensagem..." disabled={loading}
                  className="flex-1 bg-transparent text-sm text-app outline-none placeholder:text-app-soft disabled:opacity-50" />
                <button onClick={() => void send(input)} disabled={loading || !input.trim()}
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] transition-all disabled:opacity-30"
                  style={{ background: input.trim() ? 'linear-gradient(135deg, #026648, #014d37)' : 'var(--panel-border)' }}>
                  {loading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    : <Send className="h-3.5 w-3.5 text-white" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FAB ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Fechar assistente' : 'Abrir assistente Pearfy IA'}
        className="ai-fab fixed z-50 flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{
          width: 56,
          height: 56,
          background: 'linear-gradient(135deg, #026648 0%, #013d2c 100%)',
          animation: open ? 'none' : 'ai-pulse 2.8s ease-in-out infinite',
          boxShadow: open
            ? '0 4px 20px rgba(2,102,72,0.45)'
            : undefined,
        }}
      >
        {open
          ? <X style={{ width: 22, height: 22, color: '#fff' }} />
          : <SaoozIcon size={34} />
        }

        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: '#ef4444' }}>
            {unread}
          </span>
        )}
      </button>
    </>
  )
}
