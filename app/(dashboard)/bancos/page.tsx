import type { Metadata } from 'next'
import BancosClient from './BancosClient'

export const metadata: Metadata = {
  title: 'Bancos — SAOOZ',
  description: 'Conecte suas contas bancárias e importe despesas automaticamente.',
}

export default function BancosPage() {
  return <BancosClient />
}
