'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Camera, Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/Modal'
import { StepUpDialog } from '@/components/security/StepUpDialog'
import { MfaSection } from '@/components/security/MfaSection'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

interface ProfileValues {
  name: string
  email: string
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}

function maskCPF(v: string) {
  return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14)
}

function validateCPF(raw: string): boolean {
  const cpf = raw.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(.)\1+$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i)
  let rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cpf[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  return rest === parseInt(cpf[10])
}

interface PasswordValues {
  newPassword: string
  confirmPassword: string
}

function PasswordReq({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {met ? <Check className="h-3 w-3 text-[#026648]" /> : <X className="h-3 w-3 text-app-soft" />}
      <span className={met ? 'text-[#026648]' : 'text-app-soft'}>{label}</span>
    </div>
  )
}

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [cpf, setCpf] = useState('')
  const [savingCpf, setSavingCpf] = useState(false)
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [city, setCity] = useState('')
  const [brazilState, setBrazilState] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm<ProfileValues>({ defaultValues: { name: '', email: '' } })
  const passwordForm = useForm<PasswordValues>({ defaultValues: { newPassword: '', confirmPassword: '' } })
  const newPassword = passwordForm.watch('newPassword', '')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (p) {
        setProfile(p)
        profileForm.reset({ name: p.name, email: p.email })
        if (p.cpf) setCpf(maskCPF(p.cpf))
        if (p.phone) setPhone(maskPhone(p.phone))
        if (p.birth_date) setBirthDate(p.birth_date.slice(0, 10))
        if (p.city) setCity(p.city)
        if (p.state) setBrazilState(p.state)
      }
    })
  }, [profileForm])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido')
      return
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Arquivo muito grande (max 100MB)')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadErr) {
      toast.error('Erro ao fazer upload', { description: uploadErr.message })
      return
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const stampedAvatarUrl = `${urlData.publicUrl}${urlData.publicUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ avatar_url: stampedAvatarUrl })
      .eq('id', profile.id)
    if (updateErr) {
      toast.error('Erro ao salvar foto', { description: updateErr.message })
      return
    }

    // Cache busting: forçar o browser a carregar a nova imagem mesmo com mesmo nome de arquivo
    setAvatarPreview(stampedAvatarUrl)
    setProfile((prev) => (prev ? { ...prev, avatar_url: stampedAvatarUrl } : prev))
    router.refresh()
    toast.success('Foto atualizada')
  }

  async function onSaveProfile(values: ProfileValues) {
    if (!profile) return

    setSavingProfile(true)
    const supabase = createClient()
    const normalizedEmail = values.email.trim().toLowerCase()
    const normalizedName = values.name.trim()

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        name: normalizedName,
        email: normalizedEmail,
        phone: phone.replace(/\D/g, '') || null,
        birth_date: birthDate || null,
        city: city.trim() || null,
        state: brazilState || null,
      })
      .eq('id', profile.id)

    if (profileErr) {
      setSavingProfile(false)
      toast.error('Erro ao salvar', { description: profileErr.message })
      return
    }

    if (normalizedEmail !== profile.email.toLowerCase()) {
      const { error: authErr } = await supabase.auth.updateUser({ email: normalizedEmail })
      if (authErr) {
        setSavingProfile(false)
        toast.error('E-mail não atualizado no login', { description: authErr.message })
        return
      }
    }

    setSavingProfile(false)
    setProfile((prev) => prev ? {
      ...prev,
      name: normalizedName,
      email: normalizedEmail,
      phone: phone.replace(/\D/g, '') || null,
      birth_date: birthDate || null,
      city: city.trim() || null,
      state: brazilState || null,
    } : prev)
    router.refresh()
    toast.success('Dados salvos')
  }

  async function onChangePassword(values: PasswordValues) {
    if (values.newPassword !== values.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Senhas não coincidem' })
      return
    }

    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: values.newPassword })
    setSavingPassword(false)

    if (error) {
      toast.error('Erro ao alterar senha', { description: error.message })
      return
    }

    toast.success('Senha alterada')
    passwordForm.reset()
  }

  async function handleSaveCpf() {
    if (!profile) return
    if (!validateCPF(cpf)) { toast.error('CPF inválido'); return }
    setSavingCpf(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ cpf: cpf.replace(/\D/g, '') })
      .eq('id', profile.id)
    setSavingCpf(false)
    if (error) { toast.error('Erro ao salvar CPF', { description: error.message }); return }
    toast.success('CPF salvo')
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error('Erro ao excluir conta', { description: data.error ?? 'Falha inesperada' })
        setDeletingAccount(false)
        return
      }

      window.location.href = '/login'
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Falha inesperada'
      toast.error('Erro ao excluir conta', { description: msg })
      setDeletingAccount(false)
    }
  }

  const avatarSrc = avatarPreview || profile?.avatar_url
  const initials = profile?.name?.charAt(0).toUpperCase() ?? 'U'

  return (
    <div className="max-w-[520px] mx-auto space-y-6 pb-6">
      <h1 className="text-xl font-bold text-app">Configurações</h1>

      <div className="panel-card p-6 flex flex-col items-center gap-3">
        <div className="relative">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="h-24 w-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
              {initials}
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 text-white rounded-full p-2 shadow-lg transition-colors"
            style={{ background: 'var(--accent-blue)' }}
            aria-label="Alterar foto"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleAvatarChange} />
        <p className="text-xs text-app-soft">PNG, JPG ou WebP, max. 100MB</p>
      </div>

      <div className="panel-card p-6">
        <h2 className="text-sm font-semibold text-app-base uppercase tracking-wider mb-4">Dados pessoais</h2>
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-app-base">Nome completo</Label>
            <Input
              className="rounded-[8px]"
              style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
              {...profileForm.register('name', { required: 'Nome é obrigatório', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
            />
            {profileForm.formState.errors.name && <p className="text-[#f87171] text-xs">{profileForm.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-app-base">Email</Label>
            <Input
              type="email"
              className="rounded-[8px]"
              style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
              {...profileForm.register('email', { required: 'Email é obrigatório', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })}
            />
            {profileForm.formState.errors.email && <p className="text-[#f87171] text-xs">{profileForm.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-app-base">Telefone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              placeholder="(11) 99999-9999"
              className="rounded-[8px] font-mono tracking-wide"
              style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-app-base">Data de nascimento</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="rounded-[8px]"
              style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-app-base">Cidade</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="São Paulo"
                className="rounded-[8px]"
                style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-app-base">Estado (UF)</Label>
              <select
                value={brazilState}
                onChange={(e) => setBrazilState(e.target.value)}
                className="w-full h-10 rounded-[8px] border px-3 text-sm outline-none"
                style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
              >
                <option value="">--</option>
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>
          <Button
            type="submit"
            disabled={savingProfile}
            className="w-full text-white rounded-[8px]"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar dados'}
          </Button>
        </form>
      </div>

      <div className="panel-card p-6">
        <h2 className="text-sm font-semibold text-app-base uppercase tracking-wider mb-4">Documento</h2>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-app-base">CPF</Label>
            <Input
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              className="rounded-[8px] font-mono tracking-wide"
              style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            />
            {cpf && !validateCPF(cpf) && (
              <p className="text-[#f87171] text-xs">CPF inválido. Verifique os números.</p>
            )}
            {cpf && validateCPF(cpf) && (
              <div className="flex items-center gap-1.5 text-xs text-[#026648]">
                <Check className="h-3.5 w-3.5" /> CPF válido
              </div>
            )}
          </div>
          <Button
            onClick={handleSaveCpf}
            disabled={savingCpf || !validateCPF(cpf)}
            className="w-full text-white rounded-[8px]"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            {savingCpf ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar CPF'}
          </Button>
        </div>
      </div>

      <div className="panel-card p-6">
        <h2 className="text-sm font-semibold text-app-base uppercase tracking-wider mb-4">Segurança</h2>

        {/* MFA / Two-factor authentication */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-app-soft uppercase tracking-wider mb-3">Autenticação em dois fatores</p>
          <MfaSection />
        </div>

        <div className="border-t mb-6" style={{ borderColor: 'var(--panel-border)' }} />

        <p className="text-xs font-semibold text-app-soft uppercase tracking-wider mb-3">Alterar senha</p>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-app-base">Nova senha</Label>
            <Input
              type="password"
              placeholder="********"
              className="rounded-[8px]"
              style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
              {...passwordForm.register('newPassword', {
                required: 'Senha é obrigatória',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                validate: {
                  hasNumber: (v) => /[0-9]/.test(v) || 'Precisa de número',
                  hasUpper: (v) => /[A-Z]/.test(v) || 'Precisa de maiúscula',
                },
              })}
            />
            {newPassword && (
              <div className="space-y-1 pt-1">
                <PasswordReq met={newPassword.length >= 8} label="Mínimo 8 caracteres" />
                <PasswordReq met={/[0-9]/.test(newPassword)} label="Ao menos 1 número" />
                <PasswordReq met={/[A-Z]/.test(newPassword)} label="Ao menos 1 maiúscula" />
              </div>
            )}
            {passwordForm.formState.errors.newPassword && <p className="text-[#f87171] text-xs">{passwordForm.formState.errors.newPassword.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-app-base">Confirmar nova senha</Label>
            <Input
              type="password"
              placeholder="********"
              className="rounded-[8px]"
              style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
              {...passwordForm.register('confirmPassword', { required: 'Confirme sua senha' })}
            />
            {passwordForm.formState.errors.confirmPassword && <p className="text-[#f87171] text-xs">{passwordForm.formState.errors.confirmPassword.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={savingPassword}
            className="w-full text-white rounded-[8px]"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Alterar senha'}
          </Button>
        </form>
      </div>

      <div className="rounded-[12px] p-6" style={{ background: 'var(--panel-bg)', border: '1px solid color-mix(in oklab, #f87171 30%, transparent)' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: '#f87171' }}>Zona de perigo</h2>
        <p className="text-sm text-app-base mb-4">A exclusão da conta é irreversível e remove todos os seus dados permanentemente.</p>
        <Button
          variant="outline"
          onClick={() => setStepUpOpen(true)}
          className="rounded-[8px] w-full"
          style={{ borderColor: '#f87171', color: '#f87171' }}
        >
          Excluir minha conta
        </Button>
      </div>

      {/* Step-up auth before destructive deletion */}
      <StepUpDialog
        open={stepUpOpen}
        onClose={() => setStepUpOpen(false)}
        onConfirmed={() => {
          setStepUpOpen(false)
          setDeleteConfirmation('')
          setDeleteModalOpen(true)
        }}
        title="Confirme sua identidade"
        description="Para excluir sua conta, confirme sua senha antes de continuar."
        confirmVariant="danger"
      />

      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteConfirmation('')
        }}
        title="Excluir conta?"
        description="Todos os seus dados serão apagados permanentemente. Esta ação não pode ser desfeita."
      >
        <div className="mt-4">
          <Label className="text-app-base">Confirmacao</Label>
          <Input
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder="Digite EXCLUIR"
            className="mt-2 rounded-[8px]"
            style={{
              background: 'var(--panel-bg-soft)',
              borderColor: 'var(--panel-border)',
              color: 'var(--text-strong)',
            }}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteModalOpen(false)
              setDeleteConfirmation('')
            }}
            className="flex-1 rounded-[8px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteAccount}
            disabled={deletingAccount || deleteConfirmation.trim().toUpperCase() !== 'EXCLUIR'}
            className="flex-1 text-white rounded-[8px]"
            style={{ background: '#f87171' }}
          >
            {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sim, excluir'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
