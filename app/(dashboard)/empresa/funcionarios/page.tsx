'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Loader2, Pencil, Trash2, Users, Mail, Phone, BadgeCheck, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency } from '@/lib/utils/formatters'
import type { EmployeeStatus, Database } from '@/types/database.types'

type Employee = Database['public']['Tables']['business_employees']['Row']

// ── Labor cost calculation (simplified Brazilian model) ────────────────────────
// INSS patronal ≈ 20%, FGTS ≈ 8%, Férias+13o ≈ 22.2% (1/12 each + 1/3 férias)
const LABOR_OVERHEAD = 0.503 // 50.3% over gross salary

function totalLaborCost(salary: number) {
  return salary * (1 + LABOR_OVERHEAD)
}

const STATUS_CONFIG: Record<EmployeeStatus, { label: string; color: string; icon: typeof BadgeCheck }> = {
  active: { label: 'Ativo', color: '#026648', icon: BadgeCheck },
  on_leave: { label: 'Afastado', color: '#f59e0b', icon: Clock },
  terminated: { label: 'Desligado', color: '#6B7280', icon: AlertCircle },
}

interface FormValues {
  name: string
  cpf: string
  role: string
  monthly_salary: string
  hire_date: string
  email: string
  phone: string
  status: EmployeeStatus
  notes: string
}

function EmployeeForm({
  onClose,
  businessId,
  userId,
  editing,
  onSaved,
}: {
  onClose: () => void
  businessId: string
  userId: string
  editing?: Employee | null
  onSaved: () => void
}) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, watch, setError, formState: { errors } } = useForm<FormValues>({
    defaultValues: editing
      ? {
          name: editing.name,
          cpf: editing.cpf ?? '',
          role: editing.role ?? '',
          monthly_salary: String(editing.monthly_salary),
          hire_date: editing.hire_date ?? '',
          email: editing.email ?? '',
          phone: editing.phone ?? '',
          status: editing.status,
          notes: editing.notes ?? '',
        }
      : { name: '', cpf: '', role: '', monthly_salary: '', hire_date: '', email: '', phone: '', status: 'active', notes: '' },
  })

  const status = watch('status')
  const salaryWatch = watch('monthly_salary')
  const salaryNum = parseFloat((salaryWatch ?? '').replace(',', '.')) || 0
  const totalCost = totalLaborCost(salaryNum)

  const inputStyle = {
    background: 'var(--panel-bg-soft)',
    borderColor: 'var(--panel-border)',
    color: 'var(--text-strong)',
  }

  async function onSubmit(values: FormValues) {
    const salary = parseFloat(values.monthly_salary.replace(',', '.'))
    if (!values.monthly_salary || Number.isNaN(salary) || salary < 0) {
      setError('monthly_salary', { message: 'Salário inválido' })
      return
    }
    setLoading(true)
    const supabase = createClient()

    const payload = {
      name: values.name.trim(),
      cpf: values.cpf.trim() || null,
      role: values.role.trim() || null,
      monthly_salary: salary,
      hire_date: values.hire_date || null,
      email: values.email.trim() || null,
      phone: values.phone.trim() || null,
      status: values.status,
      notes: values.notes.trim() || null,
    }

    if (editing) {
      const { error } = await supabase.from('business_employees').update(payload).eq('id', editing.id)
      if (error) {
        toast.error('Erro ao atualizar', { description: error.message })
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from('business_employees').insert({
        ...payload,
        user_id: userId,
        business_id: businessId,
      })
      if (error) {
        toast.error('Erro ao adicionar', { description: error.message })
        setLoading(false)
        return
      }
    }

    toast.success(editing ? 'Funcionário atualizado' : 'Funcionário adicionado')
    onSaved()
    onClose()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-app-base">Nome *</Label>
          <Input
            placeholder="Nome completo"
            className="rounded-[8px]"
            style={inputStyle}
            {...register('name', { required: 'Nome obrigatório' })}
          />
          {errors.name && <p className="text-xs text-[#f87171]">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Cargo</Label>
          <Input placeholder="Ex: Desenvolvedor, Analista" className="rounded-[8px]" style={inputStyle} {...register('role')} />
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">CPF</Label>
          <Input placeholder="000.000.000-00" className="rounded-[8px]" style={inputStyle} {...register('cpf')} />
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Salário bruto (R$) *</Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            className="rounded-[8px]"
            style={inputStyle}
            {...register('monthly_salary')}
          />
          {errors.monthly_salary && <p className="text-xs text-[#f87171]">{errors.monthly_salary.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Data de admissão</Label>
          <Input type="date" className="rounded-[8px]" style={inputStyle} {...register('hire_date')} />
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Status</Label>
          <Select onValueChange={(v) => v && setValue('status', v as EmployeeStatus)} value={status ?? 'active'}>
            <SelectTrigger className="rounded-[8px]" style={inputStyle}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className="rounded-[8px]"
              style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            >
              <SelectItem value="active"><span style={{ color: '#026648' }}>Ativo</span></SelectItem>
              <SelectItem value="on_leave"><span style={{ color: '#f59e0b' }}>Afastado</span></SelectItem>
              <SelectItem value="terminated"><span style={{ color: '#6B7280' }}>Desligado</span></SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">E-mail</Label>
          <Input type="email" placeholder="funcionario@email.com" className="rounded-[8px]" style={inputStyle} {...register('email')} />
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Telefone</Label>
          <Input placeholder="(11) 99999-9999" className="rounded-[8px]" style={inputStyle} {...register('phone')} />
        </div>
      </div>

      {/* Labor cost estimate */}
      {salaryNum > 0 && (
        <div
          className="rounded-[8px] border px-3 py-2.5 text-xs"
          style={{
            borderColor: 'color-mix(in oklab, var(--accent-blue) 25%, transparent)',
            background: 'color-mix(in oklab, var(--accent-blue) 6%, transparent)',
          }}
        >
          <p className="font-semibold text-app">Custo total estimado</p>
          <p className="mt-1 text-app-soft">
            Salário bruto {formatCurrency(salaryNum)} + encargos ~50,3% (INSS patronal, FGTS, 13o, férias)
            = <span className="font-bold text-app">{formatCurrency(totalCost)}/mês</span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-app-base">Observações</Label>
        <Input placeholder="Anotações internas" className="rounded-[8px]" style={inputStyle} {...register('notes')} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-[8px]">Cancelar</Button>
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

export default function FuncionariosPage() {
  const { business } = useBusinessData()
  const [userId, setUserId] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const fetchEmployees = useCallback(async () => {
    if (!business) return
    setLoadingList(true)
    const { data } = await createClient()
      .from('business_employees')
      .select('*')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('name')
    setEmployees(data ?? [])
    setLoadingList(false)
  }, [business])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  async function handleDelete(id: string) {
    if (!confirm('Remover este funcionário?')) return
    setDeleting(id)
    const { error } = await createClient()
      .from('business_employees')
      .update({ is_active: false })
      .eq('id', id)
    if (error) {
      toast.error('Erro ao remover', { description: error.message })
      setDeleting(null)
      return
    }
    setEmployees((prev) => prev.filter((e) => e.id !== id))
    setDeleting(null)
    toast.success('Funcionário removido')
  }

  const activeEmployees = employees.filter((e) => e.status === 'active')
  const totalSalaryBruto = activeEmployees.reduce((s, e) => s + e.monthly_salary, 0)
  const totalCustoTotal = activeEmployees.reduce((s, e) => s + totalLaborCost(e.monthly_salary), 0)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Funcionários</h1>
          <p className="mt-1 text-sm text-app-base">{business?.name ?? ''}</p>
        </div>
        <Button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="rounded-[8px] text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
        >
          <Plus className="mr-1 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {/* Summary strip */}
      {activeEmployees.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="panel-card p-4 text-center">
            <p className="text-xs text-app-soft">Ativos</p>
            <p className="mt-1 text-2xl font-bold text-app">{activeEmployees.length}</p>
          </div>
          <div className="panel-card p-4 text-center">
            <p className="text-xs text-app-soft">Folha bruta</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-app">{formatCurrency(totalSalaryBruto)}</p>
          </div>
          <div className="panel-card p-4 text-center">
            <p className="text-xs text-app-soft">Custo total est.</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-[#f87171]">{formatCurrency(totalCustoTotal)}</p>
          </div>
        </div>
      )}

      {loadingList ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-app-soft" />
        </div>
      ) : employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum funcionário cadastrado"
          description="Adicione colaboradores para controlar a folha de pagamento e os custos de pessoal."
          action={{ label: 'Adicionar funcionário', onClick: () => setModalOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => {
            const sc = STATUS_CONFIG[emp.status] ?? STATUS_CONFIG.active
            const StatusIcon = sc.icon
            const cost = totalLaborCost(emp.monthly_salary)

            return (
              <div key={emp.id} className="panel-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-app">{emp.name}</p>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: `color-mix(in oklab, ${sc.color} 14%, transparent)`,
                          color: sc.color,
                        }}
                      >
                        <StatusIcon className="h-2.5 w-2.5" />
                        {sc.label}
                      </span>
                    </div>
                    {emp.role && <p className="mt-0.5 text-xs text-app-soft">{emp.role}</p>}
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                      {emp.email && (
                        <span className="flex items-center gap-1 text-xs text-app-soft">
                          <Mail className="h-3 w-3" />{emp.email}
                        </span>
                      )}
                      {emp.phone && (
                        <span className="flex items-center gap-1 text-xs text-app-soft">
                          <Phone className="h-3 w-3" />{emp.phone}
                        </span>
                      )}
                      {emp.hire_date && (
                        <span className="text-xs text-app-soft">
                          Desde {emp.hire_date.split('-').reverse().join('/')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums text-app">{formatCurrency(emp.monthly_salary)}</p>
                      <p className="text-[10px] text-app-soft">Custo: {formatCurrency(cost)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditing(emp); setModalOpen(true) }}
                        className="rounded-[6px] p-1.5 text-app-soft hover:text-app"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        disabled={deleting === emp.id}
                        className="rounded-[6px] p-1.5 text-app-soft hover:text-[#f87171]"
                      >
                        {deleting === emp.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {userId && business && (
        <Modal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          title={editing ? 'Editar funcionário' : 'Novo funcionário'}
        >
          <EmployeeForm
            onClose={() => { setModalOpen(false); setEditing(null) }}
            businessId={business.id}
            userId={userId}
            editing={editing}
            onSaved={fetchEmployees}
          />
        </Modal>
      )}
    </div>
  )
}
