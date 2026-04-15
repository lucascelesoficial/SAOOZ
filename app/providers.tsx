'use client'

import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { AppStateProvider } from '@/lib/context/AppStateContext'
import { PostHogProvider } from '@/components/analytics/PostHogProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </AppStateProvider>
    </ThemeProvider>
  )
}
