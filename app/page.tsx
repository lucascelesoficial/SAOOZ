import { redirect } from 'next/navigation'
import { SalesLanding } from '@/components/marketing/SalesLanding'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'SAOOZ | Sistema Financeiro Premium com IA',
  description:
    'SAOOZ organiza PF e PJ em um único sistema. Controle financeiro com clareza, previsibilidade e inteligência.',
}

export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/central')
  }

  return <SalesLanding />
}
