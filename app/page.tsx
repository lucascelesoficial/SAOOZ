import { redirect } from 'next/navigation'
import { SalesLanding } from '@/components/marketing/SalesLanding'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'PearFy — Gestão Financeira PF e PJ',
  description:
    'PearFy organiza sua vida financeira pessoal e empresarial em um único sistema com inteligência artificial.',
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
