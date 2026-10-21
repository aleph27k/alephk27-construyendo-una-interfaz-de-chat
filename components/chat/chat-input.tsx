'use client'

import { ArrowUp, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onStop: () => void
  isLoading: boolean
}

export function ChatInput({ value, onChange, onSend, onStop, isLoading }: ChatInputProps) {
  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSend()
      }}
    >
      <label htmlFor="chat-input" className="sr-only">
        Message
      </label>
      <textarea
        id="chat-input"
        rows={1}
        value={value}
        placeholder="Send a message… (Shift+Enter for a new line)"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.shiftKey) return
          if (e.nativeEvent.isComposing || e.keyCode === 229) return
          e.preventDefault()
          onSend()
        }}
        className="max-h-40 min-h-10 flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none field-sizing-content placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {isLoading ? (
        <Button type="button" size="icon-lg" variant="outline" onClick={onStop} aria-label="Stop request">
          <Square />
        </Button>
      ) : (
        <Button type="submit" size="icon-lg" disabled={!value.trim()} aria-label="Send message">
          <ArrowUp />
        </Button>
      )}
    </form>
  )
}
