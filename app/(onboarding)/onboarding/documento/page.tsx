import { Suspense } from 'react'
import { DocumentoClient } from './DocumentoClient'

export default function OnboardingDocumentoPage() {
  return (
    <Suspense>
      <DocumentoClient />
    </Suspense>
  )
}
