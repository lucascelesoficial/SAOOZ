import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DocumentoClient } from './DocumentoClient'

export const metadata: Metadata = { title: 'Documento' }

export default function OnboardingDocumentoPage() {
  return (
    <Suspense>
      <DocumentoClient />
    </Suspense>
  )
}
