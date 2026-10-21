'use client'

import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="flex-1 break-words">{message}</p>
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <X />
      </Button>
    </div>
  )
}
