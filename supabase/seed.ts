/**
 * Seed script — populates demo user data.
 * Run with: npx tsx supabase/seed.ts
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from '@supabase/supabase-js'
import type { Database, ExpenseCategory, IncomeType } from '../types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_EMAIL = 'demo@saooz.com'
const DEMO_PASSWORD = 'Demo1234'

const currentMonth = new Date()
currentMonth.setDate(1)
const monthStr = currentMonth.toISOString().split('T')[0]

async function seed() {
  console.log('🌱 Seeding demo user...')

  // Create or fetch demo user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name: 'Lucas Demo' },
  })

  if (authError && !authError.message.includes('already been registered')) {
    console.error('Auth error:', authError)
    process.exit(1)
  }

  const userId = authData?.user?.id ?? (
    await supabase.auth.admin.listUsers().then(({ data }) =>
      data.users.find((u) => u.email === DEMO_EMAIL)?.id
    )
  )

  if (!userId) {
    console.error('Could not find/create demo user')
    process.exit(1)
  }

  console.log('✅ User:', userId)

  // Update profile
  await supabase.from('profiles').upsert({
    id: userId,
    name: 'Lucas Demo',
    email: DEMO_EMAIL,
  })

  // Clear existing demo data
  await supabase.from('income_sources').delete().eq('user_id', userId)
  await supabase.from('expenses').delete().eq('user_id', userId).eq('month', monthStr)

  // Income sources
  const incomes: Array<{ user_id: string; name: string; amount: number; type: IncomeType; active: boolean; month: string }> = [
    { user_id: userId, name: 'Salário Empresa X', amount: 5000, type: 'salario', active: true, month: monthStr },
    { user_id: userId, name: 'Freela Design', amount: 1500, type: 'freela', active: true, month: monthStr },
  ]
  const { error: incomeErr } = await supabase.from('income_sources').insert(incomes)
  if (incomeErr) console.error('Income error:', incomeErr)
  else console.log('✅ Income sources seeded')

  // Expenses
  const expenses: Array<{ user_id: string; category: ExpenseCategory; description: string; amount: number; month: string }> = [
    { user_id: userId, category: 'moradia', description: 'Aluguel', amount: 1200, month: monthStr },
    { user_id: userId, category: 'moradia', description: 'Condomínio', amount: 300, month: monthStr },
    { user_id: userId, category: 'moradia', description: 'Luz', amount: 120, month: monthStr },
    { user_id: userId, category: 'alimentacao', description: 'Supermercado', amount: 600, month: monthStr },
    { user_id: userId, category: 'alimentacao', description: 'iFood', amount: 250, month: monthStr },
    { user_id: userId, category: 'transporte', description: 'Combustível', amount: 300, month: monthStr },
    { user_id: userId, category: 'transporte', description: 'Uber', amount: 150, month: monthStr },
    { user_id: userId, category: 'saude', description: 'Plano de Saúde', amount: 350, month: monthStr },
    { user_id: userId, category: 'saude', description: 'Academia', amount: 120, month: monthStr },
    { user_id: userId, category: 'educacao', description: 'Cursos Online', amount: 200, month: monthStr },
    { user_id: userId, category: 'assinaturas', description: 'Netflix + Spotify', amount: 80, month: monthStr },
    { user_id: userId, category: 'lazer', description: 'Passeios', amount: 200, month: monthStr },
    { user_id: userId, category: 'vestuario', description: 'Roupas', amount: 150, month: monthStr },
    { user_id: userId, category: 'dividas', description: 'Cartão de crédito', amount: 400, month: monthStr },
  ]
  const { error: expErr } = await supabase.from('expenses').insert(expenses)
  if (expErr) console.error('Expenses error:', expErr)
  else console.log('✅ Expenses seeded')

  console.log('\n🎉 Done! Demo credentials:')
  console.log('   Email:', DEMO_EMAIL)
  console.log('   Password:', DEMO_PASSWORD)
}

seed().catch(console.error)
