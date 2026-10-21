'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_MODEL,
  GroqError,
  sendChat,
  type ChatMessage,
  type Usage,
} from '@/lib/groq'
import { ChatInput } from './chat-input'
import { ErrorBanner } from './error-banner'
import { MessageList, type DisplayMessage } from './message-list'
import { MetricsPanel, type Metrics } from './metrics-panel'
import { SettingsBar } from './settings-bar'

const SYSTEM_PROMPT =
  'You are a helpful, friendly assistant. Reply conversationally in plain natural language.'
const SESSION_STORAGE_KEY = 'groq-chat-session-v1'

const initialMetrics: Metrics = {
  promptTokensTotal: 0,
  completionTokensTotal: 0,
  tokensTotal: 0,
  lastResponseMs: null,
  tokensPerSecond: null,
  modelName: null,
  turns: 0,
}

export function ChatApp() {
  const [apiKey, setApiKey] = useState(
    process.env.NEXT_PUBLIC_GROQ_API_KEY ?? '',
  )
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const isClearingRef = useRef(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SESSION_STORAGE_KEY)
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const restored = parsed.filter(isDisplayMessage)
          setMessages(restored)
          setMetrics(metricsFromMessages(restored))
        }
      }
    } catch {
      setError('Could not restore the saved conversation from this browser.')
    } finally {
      setSessionLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!sessionLoaded) return

    try {
      if (messages.length === 0) {
        window.localStorage.removeItem(SESSION_STORAGE_KEY)
      } else {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages))
      }
    } catch {
      setError('Could not save the conversation in this browser.')
    }
  }, [messages, sessionLoaded])

  async function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return

    if (!apiKey.trim()) {
      setError('Add your Groq API key above before sending a message.')
      return
    }
    if (!model.trim()) {
      setError('Choose a model before sending a message.')
      return
    }
    isClearingRef.current = false

    const userMessage: DisplayMessage = { role: 'user', content: text }
    const history = [...messages, userMessage]
    const payload: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(({ role, content }) => ({ role, content })),
    ]

    setMessages(history)
    setInput('')
    setError(null)
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const result = await sendChat({
        apiKey: apiKey.trim(),
        model: model.trim(),
        messages: payload,
        signal: controller.signal,
      })

      setMessages([
        ...history,
        {
          role: 'assistant',
          content: result.content,
          usage: result.usage,
          elapsedMs: result.elapsedMs,
          model: result.model,
        },
      ])
      setMetrics((prev) => accumulate(prev, result.usage, result))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        if (!isClearingRef.current) {
          setMessages(messages)
          setInput(text)
        }
        return
      }
      setMessages(messages)
      setInput(text)
      setError(
        err instanceof GroqError
          ? err.message
          : 'Unexpected error while contacting the Groq API.',
      )
    } finally {
      abortRef.current = null
      isClearingRef.current = false
      setIsLoading(false)
    }
  }

  function handleStop() {
    abortRef.current?.abort()
  }

  function handleReset() {
    isClearingRef.current = abortRef.current !== null
    abortRef.current?.abort()
    setMessages([])
    setMetrics(initialMetrics)
    setError(null)
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-balance">
          Groq Chat
        </h1>
        <p className="text-sm text-muted-foreground">
          Browser-side calls to the Groq Chat Completions API with live token
          metrics.
        </p>
      </header>

      <SettingsBar
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        model={model}
        onModelChange={setModel}
        disabled={isLoading}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
          <MessageList messages={messages} isLoading={isLoading} />
          <div className="flex flex-col gap-3 border-t p-3">
            {error && (
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            )}
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              onStop={handleStop}
              isLoading={isLoading}
            />
          </div>
        </main>

        <MetricsPanel
          metrics={metrics}
          historyLength={messages.length}
          onReset={handleReset}
        />
      </div>
    </div>
  )
}

function accumulate(
  prev: Metrics,
  usage: Usage,
  result: { elapsedMs: number; model: string },
): Metrics {
  const seconds = result.elapsedMs / 1000
  return {
    promptTokensTotal: prev.promptTokensTotal + usage.prompt_tokens,
    completionTokensTotal: prev.completionTokensTotal + usage.completion_tokens,
    tokensTotal: prev.tokensTotal + usage.total_tokens,
    lastResponseMs: result.elapsedMs,
    tokensPerSecond: seconds > 0 ? usage.completion_tokens / seconds : null,
    modelName: result.model,
    turns: prev.turns + 1,
  }
}

function isDisplayMessage(value: unknown): value is DisplayMessage {
  if (typeof value !== 'object' || value === null) return false
  const message = value as Record<string, unknown>
  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    (message.usage === undefined || isUsage(message.usage)) &&
    (message.elapsedMs === undefined ||
      (typeof message.elapsedMs === 'number' && Number.isFinite(message.elapsedMs))) &&
    (message.model === undefined || typeof message.model === 'string')
  )
}

function isUsage(value: unknown): value is Usage {
  if (typeof value !== 'object' || value === null) return false
  const usage = value as Record<string, unknown>
  return (
    typeof usage.prompt_tokens === 'number' &&
    Number.isFinite(usage.prompt_tokens) &&
    typeof usage.completion_tokens === 'number' &&
    Number.isFinite(usage.completion_tokens) &&
    typeof usage.total_tokens === 'number' &&
    Number.isFinite(usage.total_tokens)
  )
}

function metricsFromMessages(messages: DisplayMessage[]): Metrics {
  return messages.reduce((metrics, message) => {
    if (message.role !== 'assistant' || !message.usage) return metrics

    const seconds = (message.elapsedMs ?? 0) / 1000
    return {
      promptTokensTotal: metrics.promptTokensTotal + message.usage.prompt_tokens,
      completionTokensTotal:
        metrics.completionTokensTotal + message.usage.completion_tokens,
      tokensTotal: metrics.tokensTotal + message.usage.total_tokens,
      lastResponseMs: message.elapsedMs ?? metrics.lastResponseMs,
      tokensPerSecond:
        seconds > 0
          ? message.usage.completion_tokens / seconds
          : metrics.tokensPerSecond,
      modelName: message.model ?? metrics.modelName,
      turns: metrics.turns + 1,
    }
  }, initialMetrics)
}
