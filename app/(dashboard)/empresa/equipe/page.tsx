'use client'

import { useEffect, useState } from 'react'
import { Loader2, Lock, Mail, Shield, Trash2, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'

interface TeamPermissions {
  view: boolean
  add_transactions: boolean
  edit_transactions: boolean
  delete_transactions: boolean
  export_reports: boolean
}

interface TeamMember {
  id: string
  member_email: string
  member_user_id: string | null
  status: 'pending' | 'active' | 'revoked'
  permissions: TeamPermissions
  invited_at: string
}

const PERM_LABELS: Record<keyof TeamPermissions, string> = {
  view: 'Visualizar dados',
  add_transactions: 'Lançar transações',
  edit_transactions: 'Editar transações',
  delete_transactions: 'Excluir transações',
  export_reports: 'Exportar relatórios',
}

export default function EquipePage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [notPro, setNotPro] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function fetchMembers() {
    const res = await fetch('/api/team/members')
    if (res.status === 403) {
      setNotPro(true)
      setLoading(false)
      return
    }
    const data = await res.json() as { members?: TeamMember[] }
    if (data.members) setMembers(data.members)
    setLoading(false)
  }

  useEffect(() => { void fetchMembers() }, [])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      const data = await res.json() as { error?: string; hasAccount?: boolean }
      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao convidar membro')
        return
      }
      toast.success(
        data.hasAccount
          ? `${inviteEmail} adicionado com sucesso!`
          : `Convite pendente — ${inviteEmail} ainda não tem conta no Pearfy`
      )
      setInviteEmail('')
      await fetchMembers()
    } finally {
      setInviting(false)
    }
  }

  async function handlePermChange(id: string, perm: keyof TeamPermissions, value: boolean) {
    const member = members.find(m => m.id === id)
    if (!member) return
    setUpdatingId(id)
    const newPerms = { ...member.permissions, [perm]: value }
    // view must always be true if any other perm is true
    if (perm !== 'view' && value && !newPerms.view) newPerms.view = true
    if (perm === 'view' && !value) {
      // turning off view turns off everything
      ;(Object.keys(newPerms) as (keyof TeamPermissions)[]).forEach(k => { newPerms[k] = false })
    }
    setMembers(prev => prev.map(m => m.id === id ? { ...m, permissions: newPerms } : m))
    try {
      const res = await fetch(`/api/team/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPerms }),
      })
      if (!res.ok) toast.error('Erro ao atualizar permissão')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id)
    try {
      const res = await fetch(`/api/team/members/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Erro ao remover membro')
        return
      }
      toast.success('Membro removido')
      await fetchMembers()
    } finally {
      setRemovingId(null)
    }
  }

  const activeMembers = members.filter(m => m.status !== 'revoked')

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-app-soft" />
      </div>
    )
  }

  if (notPro) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-app">Equipe</h1>
          <p className="mt-0.5 text-sm text-app-soft">
            Conceda acesso ao módulo empresarial para membros da sua equipe.
          </p>
        </div>
        <div
          className="panel-card flex flex-col items-center gap-4 p-10 text-center"
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'rgba(2,102,72,0.1)' }}
          >
            <Lock className="h-7 w-7" style={{ color: '#026648' }} />
          </div>
          <div>
            <p className="text-base font-semibold text-app">Disponível no plano Comando</p>
            <p className="mt-1 text-sm text-app-soft">
              Adicione até 3 membros à sua equipe e gerencie permissões individualmente.
              Faça upgrade para o plano Comando para desbloquear esse recurso.
            </p>
          </div>
          <a
            href="/planos"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #026648, #014d37)' }}
          >
            Ver planos
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-app">Equipe</h1>
        <p className="mt-0.5 text-sm text-app-soft">
          Conceda acesso ao módulo empresarial para membros da sua equipe.
        </p>
      </div>

      {/* Invite form */}
      <div className="panel-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-app-soft" />
            <span className="text-sm font-semibold text-app">Membros da equipe</span>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{
              background: activeMembers.length >= 3
                ? 'rgba(239,68,68,0.1)' : 'rgba(2,102,72,0.1)',
              color: activeMembers.length >= 3 ? '#ef4444' : '#026648',
            }}
          >
            {activeMembers.length}/3 usados
          </span>
        </div>

        {activeMembers.length < 3 ? (
          <form onSubmit={e => { void handleInvite(e) }} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-soft" />
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full rounded-[10px] border py-2.5 pl-9 pr-3 text-sm text-app outline-none placeholder:text-app-soft"
                style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)' }}
              />
            </div>
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #026648, #014d37)' }}
            >
              {inviting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <UserPlus className="h-4 w-4" />}
              Convidar
            </button>
          </form>
        ) : (
          <p className="text-sm text-app-soft">Limite de 3 membros atingido no plano Comando.</p>
        )}
      </div>

      {/* Member list */}
      <div className="space-y-3">
        {activeMembers.map(member => (
          <div key={member.id} className="panel-card p-5 space-y-4">
            {/* Member header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #026648, #014d37)' }}
                >
                  {member.member_email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-app">{member.member_email}</p>
                  <p className="text-xs text-app-soft">
                    {member.status === 'active'
                      ? 'Acesso ativo'
                      : 'Aguardando conta no Pearfy'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold uppercase"
                  style={
                    member.status === 'active'
                      ? { background: 'rgba(2,102,72,0.12)', color: '#026648' }
                      : { background: 'rgba(245,158,11,0.12)', color: '#d97706' }
                  }
                >
                  {member.status === 'active' ? 'Ativo' : 'Pendente'}
                </span>
                <button
                  onClick={() => { void handleRemove(member.id) }}
                  disabled={removingId === member.id}
                  className="flex h-8 w-8 items-center justify-center rounded-[7px] transition-colors"
                  style={{ color: '#ef4444' }}
                  title="Remover membro"
                >
                  {removingId === member.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-app-soft" />
                <span className="text-xs font-semibold uppercase tracking-wider text-app-soft">
                  Permissões
                </span>
              </div>
              <div className="space-y-2">
                {(Object.keys(PERM_LABELS) as (keyof TeamPermissions)[]).map(perm => (
                  <label key={perm} className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="text-sm text-app">{PERM_LABELS[perm]}</span>
                    <button
                      role="switch"
                      aria-checked={member.permissions[perm]}
                      disabled={updatingId === member.id}
                      onClick={() => { void handlePermChange(member.id, perm, !member.permissions[perm]) }}
                      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50"
                      style={{
                        background: member.permissions[perm] ? '#026648' : 'var(--panel-border)',
                      }}
                    >
                      <span
                        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                        style={{
                          transform: member.permissions[perm]
                            ? 'translateX(18px)'
                            : 'translateX(2px)',
                        }}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}

        {activeMembers.length === 0 && (
          <div className="panel-card flex flex-col items-center gap-3 p-8 text-center">
            <Users className="h-8 w-8 text-app-soft" />
            <p className="text-sm text-app-soft">Nenhum membro convidado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
