'use client'

import { useEffect, useRef } from 'react'
import { Bot, User } from 'lucide-react'
import type { Usage } from '@/lib/groq'
import { cn } from '@/lib/utils'

export type DisplayMessage = {
  role: 'user' | 'assistant'
  content: string
  usage?: Usage
  elapsedMs?: number
}

export function MessageList({
  messages,
  isLoading,
}: {
  messages: DisplayMessage[]
  isLoading: boolean
}) {
  const endRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <Bot className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">Start a conversation</p>
        <p className="max-w-sm text-sm text-pretty text-muted-foreground">
          Every request sends the full conversation history, so the model
          remembers earlier turns.
        </p>
      </div>
    )
  }

  return (
    <ol
      className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
      aria-live="polite"
      aria-label="Conversation"
    >
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
      {isLoading && (
        <li className="flex items-start gap-3">
          <Avatar role="assistant" />
          <div className="flex items-center gap-1 rounded-xl bg-muted px-4 py-3" aria-label="Assistant is typing">
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        </li>
      )}
      <li ref={endRef} aria-hidden="true" />
    </ol>
  )
}

function MessageItem({ message }: { message: DisplayMessage }) {
  const isUser = message.role === 'user'
  return (
    <li className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <Avatar role={message.role} />
      <div className={cn('flex max-w-[85%] flex-col gap-1', isUser && 'items-end')}>
        <span className="sr-only">{isUser ? 'You said:' : 'Assistant said:'}</span>
        <div
          className={cn(
            'rounded-xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
          )}
        >
          {message.content}
        </div>
        {message.usage && (
          <p className="font-mono text-[11px] text-muted-foreground">
            {message.usage.prompt_tokens} in · {message.usage.completion_tokens} out ·{' '}
            {message.usage.total_tokens} total
            {message.elapsedMs !== undefined && ` · ${Math.round(message.elapsedMs)} ms`}
          </p>
        )}
      </div>
    </li>
  )
}

function Avatar({ role }: { role: DisplayMessage['role'] }) {
  const Icon = role === 'user' ? User : Bot
  return (
    <div
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full border',
        role === 'user' ? 'bg-background' : 'bg-accent',
      )}
      aria-hidden="true"
    >
      <Icon className="size-4" />
    </div>
  )
}
