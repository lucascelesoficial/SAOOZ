import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'color-mix(in oklab, var(--accent-blue) 10%, transparent)' }}
      >
        <Icon className="h-8 w-8" style={{ color: 'var(--accent-blue)' }} aria-hidden />
      </div>
      <h3 className="text-app font-semibold text-base mb-1">{title}</h3>
      <p className="text-app-base text-sm max-w-xs">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6 text-white rounded-[8px]"
          style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
