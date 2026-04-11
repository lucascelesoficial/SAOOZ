'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, description, children }: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="border-t rounded-t-[16px] max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
      >
        <SheetHeader className="mb-4">
          <SheetTitle style={{ color: 'var(--text-strong)' }}>{title}</SheetTitle>
          {description && (
            <SheetDescription style={{ color: 'var(--text-base)' }}>{description}</SheetDescription>
          )}
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
