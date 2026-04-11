'use client'

import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { AppStateProvider } from '@/lib/context/AppStateContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppStateProvider>{children}</AppStateProvider>
    </ThemeProvider>
  )
}
