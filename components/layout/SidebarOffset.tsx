'use client'

import { useSidebar } from '@/lib/context/SidebarContext'

export function SidebarOffset({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div
      className="flex min-w-0 flex-1 flex-col"
      style={{
        // On md+ screens the sidebar is fixed, so we push the content with margin.
        // Below md the sidebar is hidden (BottomNav handles mobile nav) so no margin.
        // Using a CSS custom property trick so the media query still applies.
        transition: 'margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      // We apply the responsive margin via a data attribute and CSS instead of
      // Tailwind so the transition works smoothly.
      data-sidebar-collapsed={collapsed ? 'true' : 'false'}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          [data-sidebar-collapsed="false"] {
            margin-left: 240px;
          }
          [data-sidebar-collapsed="true"] {
            margin-left: 64px;
          }
        }
      ` }} />
      {children}
    </div>
  )
}
