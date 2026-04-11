'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="rounded-[12px] max-w-md w-full"
        style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-strong)' }}>{title}</DialogTitle>
          {description && (
            <DialogDescription style={{ color: 'var(--text-base)' }}>{description}</DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
