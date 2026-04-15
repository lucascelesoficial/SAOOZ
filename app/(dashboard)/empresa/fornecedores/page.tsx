'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Loader2, Pencil, Trash2, Truck, Mail, Phone, MapPin, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import type { Database } from '@/types/database.types'

type Counterparty = Database['public']['Tables']['business_counterparties']['Row']

interface FormValues {
  name: string
  legal_name: string
  document: string
  email: string
  phone: string
  city: string
  state: string
  notes: string
}

function CounterpartyForm({
  onClose,
  businessId,
  userId,
  editing,
  onSaved,
}: {
  onClose: () => void
  businessId: string
  userId: string
  editing?: Counterparty | null
  onSaved: () => void
}) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: editing
      ? {
          name: editing.name,
          legal_name: editing.legal_name ?? '',
          document: editing.document ?? '',
          email: editing.email ?? '',
          phone: editing.phone ?? '',
          city: editing.city ?? '',
          state: editing.state ?? '',
          notes: editing.notes ?? '',
        }
      : { name: '', legal_name: '', document: '', email: '', phone: '', city: '', state: '', notes: '' },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const supabase = createClient()

    const payload = {
      name: values.name.trim(),
      legal_name: values.legal_name.trim() || null,
      document: values.document.trim() || null,
      email: values.email.trim() || null,
      phone: values.phone.trim() || null,
      city: values.city.trim() || null,
      state: values.state.trim() || null,
      notes: values.notes.trim() || null,
    }

    if (editing) {
      const { error } = await supabase
        .from('business_counterparties')
        .update(payload)
        .eq('id', editing.id)
      if (error) {
        toast.error('Erro ao atualizar fornecedor', { description: error.message })
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from('business_counterparties').insert({
        ...payload,
        user_id: userId,
        business_id: businessId,
        type: 'fornecedor',
      })
      if (error) {
        toast.error('Erro ao adicionar fornecedor', { description: error.message })
        setLoading(false)
        return
      }
    }

    toast.success(editing ? 'Fornecedor atualizado' : 'Fornecedor adicionado')
    onSaved()
    onClose()
    setLoading(false)
  }

  const inputStyle = {
    background: 'var(--panel-bg-soft)',
    borderColor: 'var(--panel-border)',
    color: 'var(--text-strong)',
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-app-base">Nome *</Label>
          <Input
            placeholder="Nome do fornecedor"
            className="rounded-[8px]"
            style={inputStyle}
            {...register('name', { required: 'Nome obrigatorio' })}
          />
          {errors.name && <p className="text-xs text-[#f87171]">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Razao social / Nome completo</Label>
          <Input
            placeholder="Razao social ou nome legal"
            className="rounded-[8px]"
            style={inputStyle}
            {...register('legal_name')}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">CPF / CNPJ</Label>
          <Input
            placeholder="000.000.000-00"
            className="rounded-[8px]"
            style={inputStyle}
            {...register('document')}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">E-mail</Label>
          <Input
            type="email"
            placeholder="fornecedor@email.com"
            className="rounded-[8px]"
            style={inputStyle}
            {...register('email')}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Telefone</Label>
          <Input
            placeholder="(11) 99999-9999"
            className="rounded-[8px]"
            style={inputStyle}
            {...register('phone')}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Cidade / Estado</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Cidade"
              className="rounded-[8px]"
              style={inputStyle}
              {...register('city')}
            />
            <Input
              placeholder="UF"
              maxLength={2}
              className="w-16 shrink-0 rounded-[8px] uppercase"
              style={inputStyle}
              {...register('state')}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Observacoes</Label>
        <Input
          placeholder="Notas internas sobre este fornecedor"
          className="rounded-[8px]"
          style={inputStyle}
          {...register('notes')}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-[8px]">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-[8px] text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}

export default function FornecedoresPage() {
  const { business } = useBusinessData()
  const [userId, setUserId] = useState<string | null>(null)
  const [fornecedores, setFornecedores] = useState<Counterparty[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Counterparty | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const fetchFornecedores = useCallback(async () => {
    if (!business) return
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('business_counterparties')
      .select('*')
      .eq('business_id', business.id)
      .eq('type', 'fornecedor')
      .eq('is_active', true)
      .order('name')
    setFornecedores(data ?? [])
    setLoadingList(false)
  }, [business])

  useEffect(() => {
    fetchFornecedores()
  }, [fetchFornecedores])

  async function handleDelete(id: string) {
    if (!confirm('Remover este fornecedor?')) return
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('business_counterparties')
      .update({ is_active: false })
      .eq('id', id)
    if (error) {
      toast.error('Erro ao remover', { description: error.message })
      setDeleting(null)
      return
    }
    setFornecedores((prev) => prev.filter((f) => f.id !== id))
    setDeleting(null)
    toast.success('Fornecedor removido')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Fornecedores</h1>
          <p className="mt-1 text-sm text-app-base">
            Cadastro de fornecedores — {business?.name ?? ''}
          </p>
        </div>
        <Button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="rounded-[8px] text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
        >
          <Plus className="mr-1 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {loadingList ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-app-soft" />
        </div>
      ) : fornecedores.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Nenhum fornecedor cadastrado"
          description="Adicione fornecedores para associa-los as suas despesas e pagamentos."
          action={{ label: 'Adicionar fornecedor', onClick: () => setModalOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {fornecedores.map((f) => (
            <div key={f.id} className="panel-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-app">{f.name}</p>
                  {f.legal_name && (
                    <p className="mt-0.5 text-xs text-app-soft">{f.legal_name}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {f.document && (
                      <span className="flex items-center gap-1 text-xs text-app-soft">
                        <FileText className="h-3 w-3" /> {f.document}
                      </span>
                    )}
                    {f.email && (
                      <span className="flex items-center gap-1 text-xs text-app-soft">
                        <Mail className="h-3 w-3" /> {f.email}
                      </span>
                    )}
                    {f.phone && (
                      <span className="flex items-center gap-1 text-xs text-app-soft">
                        <Phone className="h-3 w-3" /> {f.phone}
                      </span>
                    )}
                    {(f.city || f.state) && (
                      <span className="flex items-center gap-1 text-xs text-app-soft">
                        <MapPin className="h-3 w-3" />
                        {[f.city, f.state].filter(Boolean).join(' - ')}
                      </span>
                    )}
                  </div>
                  {f.notes && (
                    <p className="mt-2 text-xs text-app-soft">{f.notes}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => { setEditing(f); setModalOpen(true) }}
                    className="rounded-[6px] p-1.5 text-app-soft hover:text-app"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    disabled={deleting === f.id}
                    className="rounded-[6px] p-1.5 text-app-soft hover:text-[#f87171]"
                  >
                    {deleting === f.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {userId && business && (
        <Modal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          title={editing ? 'Editar fornecedor' : 'Novo fornecedor'}
        >
          <CounterpartyForm
            onClose={() => { setModalOpen(false); setEditing(null) }}
            businessId={business.id}
            userId={userId}
            editing={editing}
            onSaved={fetchFornecedores}
          />
        </Modal>
      )}
    </div>
  )
}
