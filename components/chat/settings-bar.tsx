'use client'

import { KeyRound, Cpu } from 'lucide-react'
import { SUGGESTED_MODELS } from '@/lib/groq'

type SettingsBarProps = {
  apiKey: string
  onApiKeyChange: (value: string) => void
  model: string
  onModelChange: (value: string) => void
  disabled?: boolean
}

const inputClass =
  'h-9 w-full rounded-lg border bg-background pr-3 pl-9 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50'

export function SettingsBar({
  apiKey,
  onApiKeyChange,
  model,
  onModelChange,
  disabled,
}: SettingsBarProps) {
  return (
    <section
      aria-label="Connection settings"
      className="grid gap-3 rounded-xl border bg-card p-3 md:grid-cols-[1fr_280px]"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="api-key" className="text-xs font-medium text-muted-foreground">
          Groq API key
        </label>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="api-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="gsk_..."
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Kept in memory only and sent directly from your browser to Groq.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="model" className="text-xs font-medium text-muted-foreground">
          Model
        </label>
        <div className="relative">
          <Cpu
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="model"
            list="model-options"
            spellCheck={false}
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
          <datalist id="model-options">
            {SUGGESTED_MODELS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
        <p className="text-xs text-muted-foreground">
          Pick a suggestion or type any Groq model ID.
        </p>
      </div>
    </section>
  )
}
