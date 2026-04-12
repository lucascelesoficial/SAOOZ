'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle, Building2, Camera, Check, Loader2, Shield, User, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import type { BusinessActivity, BusinessTaxRegime } from '@/types/database.types'

function SectionCard({
  title,
  icon: Icon,
  color,
  children,
  danger,
}: {
  title: string
  icon: React.ElementType
  color: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div
      className="panel-card rounded-[14px] p-5 space-y-4"
      style={{ border: danger ? '1px solid #f8717130' : '1px solid var(--panel-border)' }}
    >
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <h2 className="text-sm font-bold" style={{ color: danger ? '#f87171' : 'var(--text-strong)' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-app-soft uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-[#f87171] text-xs">{error}</p>}
    </div>
  )
}

const TAX_REGIMES: Array<{ id: BusinessTaxRegime; label: string; desc: string; tooltip: string }> = [
  { id: 'mei', label: 'MEI', desc: 'Até R$ 81k/ano', tooltip: 'Microempreendedor Individual. Porte mínimo, tributação fixa mensal (DAS).' },
  { id: 'simples', label: 'Simples Nacional', desc: 'Até R$ 4,8M/ano', tooltip: 'Regime unificado para ME e EPP. Alíquota progressiva sobre a receita bruta.' },
  { id: 'presumido', label: 'Lucro Presumido', desc: 'Margem de lucro presumida', tooltip: 'IRPJ e CSLL calculados sobre percentual fixo da receita. Ideal para empresas com boa margem.' },
  { id: 'real', label: 'Lucro Real', desc: 'Lucro apurado', tooltip: 'Tributação sobre o lucro contábil real. Recomendado para empresas com margens baixas ou prejuízo.' },
]

const ACTIVITIES: Array<{ id: BusinessActivity; label: string }> = [
  { id: 'servico', label: 'Serviço' },
  { id: 'comercio', label: 'Comércio' },
  { id: 'industria', label: 'Indústria' },
  { id: 'misto', label: 'Misto' },
]

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {met ? <Check className="h-3 w-3 text-[#22c55e]" /> : <X className="h-3 w-3 text-app-soft" />}
      <span className={met ? 'text-[#22c55e]' : 'text-app-soft'}>{label}</span>
    </div>
  )
}

export default function EmpresaConfiguracoesPage() {
  const router = useRouter()
  const { business, refresh: refreshBusiness } = useBusinessData()

  const [bizName, setBizName] = useState('')
  const [bizCnpj, setBizCnpj] = useState('')
  const [bizRegime, setBizRegime] = useState<BusinessTaxRegime>('simples')
  const [bizActivity, setBizActivity] = useState<BusinessActivity>('servico')
  const [savingBiz, setSavingBiz] = useState(false)

  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newPass, setNewPass] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [passError, setPassError] = useState('')

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingAcct, setDeletingAcct] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const [deleteBizOpen, setDeleteBizOpen] = useState(false)
  const [deletingBiz, setDeletingBiz] = useState(false)
  const [deleteBizConfirm, setDeleteBizConfirm] = useState('')

  const hasLength = newPass.length >= 8
  const hasNumber = /[0-9]/.test(newPass)
  const hasUpper = /[A-Z]/.test(newPass)

  useEffect(() => {
    if (!business) return
    setBizName(business.name)
    setBizCnpj(business.cnpj ?? '')
    setBizRegime(business.tax_regime)
    setBizActivity(business.activity)
  }, [business])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (!p) return
      setUserName(p.name ?? '')
      setUserEmail(p.email ?? '')
      setAvatarSrc(p.avatar_url)
    })
  }, [])

  async function saveBusiness(e: React.FormEvent) {
    e.preventDefault()
    if (!business || bizName.trim().length < 2) return

    setSavingBiz(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('business_profiles')
      .update({
        name: bizName.trim(),
        cnpj: bizCnpj.trim() || null,
        tax_regime: bizRegime,
        activity: bizActivity,
      })
      .eq('id', business.id)
    setSavingBiz(false)

    if (error) {
      toast.error('Erro ao salvar empresa', { description: error.message })
      return
    }
    await refreshBusiness()
    toast.success('Dados da empresa atualizados')
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    setSavingProfile(true)
    const supabase = createClient()
    const normalizedEmail = userEmail.trim().toLowerCase()
    const normalizedName = userName.trim()

    const { data: currentAuth } = await supabase.auth.getUser()
    const currentEmail = currentAuth.user?.email?.toLowerCase() ?? ''

    const { error: profileErr } = await supabase.from('profiles').update({ name: normalizedName, email: normalizedEmail }).eq('id', userId)
    if (profileErr) {
      setSavingProfile(false)
      toast.error('Erro ao salvar perfil', { description: profileErr.message })
      return
    }

    if (normalizedEmail !== currentEmail) {
      const { error: authErr } = await supabase.auth.updateUser({ email: normalizedEmail })
      if (authErr) {
        setSavingProfile(false)
        toast.error('E-mail não atualizado no login', { description: authErr.message })
        return
      }
    }

    setSavingProfile(false)
    router.refresh()
    toast.success('Dados pessoais atualizados')
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande (max 5MB)')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadErr) {
      toast.error('Erro no upload', { description: uploadErr.message })
      return
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const stampedAvatarUrl = `${urlData.publicUrl}${urlData.publicUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ avatar_url: stampedAvatarUrl })
      .eq('id', userId)
    if (updateErr) {
      toast.error('Erro ao salvar avatar', { description: updateErr.message })
      return
    }

    setAvatarSrc(stampedAvatarUrl)
    setAvatarPreview(stampedAvatarUrl)
    router.refresh()
    toast.success('Foto atualizada')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!hasLength || !hasNumber || !hasUpper) {
      setPassError('A senha não atende aos requisitos.')
      return
    }
    if (newPass !== confirmPw) {
      setPassError('As senhas não coincidem.')
      return
    }

    setPassError('')
    setSavingPass(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setSavingPass(false)

    if (error) {
      toast.error('Erro ao alterar senha', { description: error.message })
      return
    }

    toast.success('Senha alterada')
    setNewPass('')
    setConfirmPw('')
  }

  async function deleteBusiness() {
    if (!business) return
    setDeletingBiz(true)
    try {
      const res = await fetch('/api/businesses/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error('Erro ao excluir empresa', { description: data.error ?? 'Falha inesperada' })
        setDeletingBiz(false)
        return
      }
      toast.success('Empresa excluída')
      window.location.href = data.redirectTo ?? '/central'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha inesperada'
      toast.error('Erro ao excluir empresa', { description: msg })
      setDeletingBiz(false)
    }
  }

  async function deleteAccount() {
    setDeletingAcct(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error('Erro ao excluir conta', { description: data.error ?? 'Falha inesperada' })
        setDeletingAcct(false)
        return
      }
      window.location.href = '/login'
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Falha inesperada'
      toast.error('Erro ao excluir conta', { description: msg })
      setDeletingAcct(false)
    }
  }

  const displayAvatar = avatarPreview || avatarSrc

  return (
    <div className="max-w-[560px] mx-auto space-y-4 pb-6">
      <h1 className="text-xl font-bold text-app">Configurações</h1>

      {/* Empresa */}
      <SectionCard title="Empresa" icon={Building2} color="#0ea5e9">
        <form onSubmit={saveBusiness} className="space-y-4">
          <Field label="Nome da empresa">
            <input
              type="text"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              placeholder="Ex: Studio Criativo LTDA"
              className="theme-input w-full h-10 px-3 rounded-[9px] text-sm"
            />
          </Field>

          <Field label="CNPJ (opcional)">
            <input
              type="text"
              value={bizCnpj}
              onChange={(e) => setBizCnpj(e.target.value)}
              placeholder="00.000.000/0001-00"
              className="theme-input w-full h-10 px-3 rounded-[9px] text-sm"
            />
          </Field>

          <Field label="Regime tributário">
            <div className="grid grid-cols-2 gap-2">
              {TAX_REGIMES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  title={r.tooltip}
                  onClick={() => setBizRegime(r.id)}
                  className="text-left rounded-[9px] px-3 py-2.5 transition-all"
                  style={{
                    background: bizRegime === r.id ? '#0ea5e912' : 'var(--panel-bg-soft)',
                    border: bizRegime === r.id ? '1px solid #0ea5e9' : '1px solid var(--panel-border)',
                  }}
                >
                  <p className="text-xs font-semibold" style={{ color: bizRegime === r.id ? '#0ea5e9' : 'var(--text-base)' }}>{r.label}</p>
                  <p className="text-[10px] text-app-soft mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-app-soft px-0.5">Passe o mouse sobre cada opção para saber mais</p>
          </Field>

          <Field label="Atividade principal">
            <div className="grid grid-cols-4 gap-2">
              {ACTIVITIES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setBizActivity(a.id)}
                  className="rounded-[9px] py-2 text-xs font-semibold transition-all"
                  style={{
                    background: bizActivity === a.id ? '#0ea5e912' : 'var(--panel-bg-soft)',
                    border: bizActivity === a.id ? '1px solid #0ea5e9' : '1px solid var(--panel-border)',
                    color: bizActivity === a.id ? '#0ea5e9' : 'var(--text-soft)',
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Field>

          <button
            type="submit"
            disabled={savingBiz}
            className="w-full h-10 rounded-[9px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 16px #0ea5e925' }}
          >
            {savingBiz ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar empresa'}
          </button>
        </form>
      </SectionCard>

      {/* Dados pessoais */}
      <SectionCard title="Dados pessoais" icon={User} color="#3b82f6">
        <div className="flex items-center gap-4 pb-2" style={{ borderBottom: '1px solid var(--panel-border)' }}>
          <div className="relative">
            {displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayAvatar} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                {userName?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            )}
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 h-6 w-6 rounded-full flex items-center justify-center text-white transition-colors" style={{ background: '#3b82f6' }} aria-label="Alterar foto">
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-app">{userName || 'Usuário'}</p>
            <p className="text-xs text-app-soft">PNG ou JPG, max. 5MB</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleAvatarChange} />
        </div>

        <form onSubmit={saveProfile} className="space-y-3">
          <Field label="Nome completo">
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="theme-input w-full h-10 px-3 rounded-[9px] text-sm" />
          </Field>
          <Field label="E-mail">
            <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="theme-input w-full h-10 px-3 rounded-[9px] text-sm" />
          </Field>
          <button
            type="submit"
            disabled={savingProfile}
            className="w-full h-10 rounded-[9px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 4px 16px #3b82f625' }}
          >
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar dados'}
          </button>
        </form>
      </SectionCard>

      {/* Segurança */}
      <SectionCard title="Segurança" icon={Shield} color="#22c55e">
        <form onSubmit={changePassword} className="space-y-3">
          {passError && (
            <div className="rounded-[8px] px-3 py-2 text-xs text-[#f87171]" style={{ background: '#f8717110', border: '1px solid #f8717130' }}>
              {passError}
            </div>
          )}
          <Field label="Nova senha">
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => { setNewPass(e.target.value); setPassError('') }}
                placeholder="********"
                className="theme-input w-full h-10 px-3 pr-10 rounded-[9px] text-sm"
                style={passError ? { border: '1px solid #f87171' } : undefined}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-soft hover:text-app text-xs">
                {showPass ? 'ocultar' : 'mostrar'}
              </button>
            </div>
          </Field>
          {newPass && (
            <div className="flex gap-3 flex-wrap px-1">
              <Req met={hasLength} label="8 caracteres" />
              <Req met={hasNumber} label="1 número" />
              <Req met={hasUpper} label="1 maiúscula" />
            </div>
          )}
          <Field label="Confirmar nova senha">
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); setPassError('') }}
              placeholder="********"
              className="theme-input w-full h-10 px-3 rounded-[9px] text-sm"
              style={passError ? { border: '1px solid #f87171' } : undefined}
            />
          </Field>
          <button
            type="submit"
            disabled={savingPass}
            className="w-full h-10 rounded-[9px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 16px #22c55e20' }}
          >
            {savingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Alterar senha'}
          </button>
        </form>
      </SectionCard>

      {/* Zona de perigo */}
      <SectionCard title="Zona de Perigo" icon={AlertTriangle} color="#f87171" danger>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-app-base mb-1">Excluir perfil empresarial</p>
            <p className="text-xs text-app-soft mb-2">Remove esta empresa e todos os seus dados financeiros (receitas, despesas). Sua conta continua ativa.</p>
            <button
              onClick={() => { setDeleteBizConfirm(''); setDeleteBizOpen(true) }}
              className="w-full h-9 rounded-[9px] text-sm font-semibold transition-all"
              style={{ background: 'transparent', border: '1px solid #f8717130', color: '#f87171' }}
            >
              Excluir empresa
            </button>
          </div>
          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '12px' }}>
            <p className="text-xs font-semibold text-app-base mb-1">Excluir minha conta</p>
            <p className="text-xs text-app-soft mb-2">Esta ação é irreversível e apagará todos os seus dados.</p>
            <button
              onClick={() => { setDeleteConfirmation(''); setDeleteOpen(true) }}
              className="w-full h-9 rounded-[9px] text-sm font-semibold transition-all"
              style={{ background: 'transparent', border: '1px solid #f8717140', color: '#f87171' }}
            >
              Excluir minha conta
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Modal exclusão empresa */}
      {deleteBizOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => { setDeleteBizOpen(false); setDeleteBizConfirm('') }}
        >
          <div
            className="panel-card rounded-[16px] p-6 max-w-sm w-full space-y-4"
            style={{ border: '1px solid #f8717130' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-app">Excluir empresa?</h3>
            <p className="text-sm text-app-soft">
              Todos os dados desta empresa serão apagados permanentemente: receitas, despesas e configurações. Sua conta pessoal continua ativa.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-app-base">
                Digite o nome da empresa para confirmar
              </label>
              <input
                value={deleteBizConfirm}
                onChange={(e) => setDeleteBizConfirm(e.target.value)}
                placeholder={business?.name ?? 'Nome da empresa'}
                className="theme-input w-full h-10 px-3 rounded-[9px] text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setDeleteBizOpen(false); setDeleteBizConfirm('') }}
                className="flex-1 h-10 rounded-[9px] text-sm font-semibold transition-all"
                style={{ background: 'var(--panel-bg-soft)', color: 'var(--text-base)', border: '1px solid var(--panel-border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={deleteBusiness}
                disabled={deletingBiz || deleteBizConfirm.trim() !== (business?.name ?? '')}
                className="flex-1 h-10 rounded-[9px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ background: '#f87171' }}
              >
                {deletingBiz ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal exclusão conta */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => { setDeleteOpen(false); setDeleteConfirmation('') }}
        >
          <div
            className="panel-card rounded-[16px] p-6 max-w-sm w-full space-y-4"
            style={{ border: '1px solid #f8717130' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-app">Excluir conta?</h3>
            <p className="text-sm text-app-soft">Todos os seus dados serão apagados permanentemente. Esta ação não pode ser desfeita.</p>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-app-base">Confirmação</label>
              <input
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                placeholder="Digite EXCLUIR"
                className="theme-input w-full h-10 px-3 rounded-[9px] text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setDeleteOpen(false); setDeleteConfirmation('') }}
                className="flex-1 h-10 rounded-[9px] text-sm font-semibold transition-all"
                style={{ background: 'var(--panel-bg-soft)', color: 'var(--text-base)', border: '1px solid var(--panel-border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={deleteAccount}
                disabled={deletingAcct || deleteConfirmation.trim().toUpperCase() !== 'EXCLUIR'}
                className="flex-1 h-10 rounded-[9px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ background: '#f87171' }}
              >
                {deletingAcct ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
