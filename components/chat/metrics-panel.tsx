'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type Metrics = {
  promptTokensTotal: number
  completionTokensTotal: number
  tokensTotal: number
  lastResponseMs: number | null
  tokensPerSecond: number | null
  modelName: string | null
  turns: number
}

const fmt = new Intl.NumberFormat('en-US')

export function MetricsPanel({
  metrics,
  historyLength,
  onReset,
}: {
  metrics: Metrics
  historyLength: number
  onReset: () => void
}) {
  return (
    <aside
      aria-label="Session metrics"
      className="flex shrink-0 flex-col gap-4 overflow-y-auto rounded-xl border bg-card p-4 lg:w-72"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Session metrics</h2>
        <Button size="sm" variant="ghost" onClick={onReset} disabled={historyLength === 0}>
          <RotateCcw data-icon="inline-start" />
          Reset
        </Button>
      </div>

      <div className="rounded-lg bg-primary p-4 text-primary-foreground">
        <p className="text-xs opacity-70">Total tokens</p>
        <p className="font-mono text-3xl font-semibold tabular-nums" aria-live="polite">
          {fmt.format(metrics.tokensTotal)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <Stat label="Prompt tokens" value={fmt.format(metrics.promptTokensTotal)} />
        <Stat label="Completion tokens" value={fmt.format(metrics.completionTokensTotal)} />
        <Stat
          label="Last response"
          value={metrics.lastResponseMs === null ? '—' : `${Math.round(metrics.lastResponseMs)} ms`}
        />
        <Stat
          label="Tokens / sec"
          value={metrics.tokensPerSecond === null ? '—' : metrics.tokensPerSecond.toFixed(1)}
        />
        <Stat label="Turns" value={fmt.format(metrics.turns)} />
        <Stat label="Messages sent" value={fmt.format(historyLength)} />
      </dl>

      <div className="flex flex-col gap-1 border-t pt-3">
        <p className="text-xs text-muted-foreground">Model (from response)</p>
        <p className="font-mono text-sm break-all">{metrics.modelName ?? '—'}</p>
      </div>
    </aside>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border p-2.5">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="font-mono text-sm font-medium tabular-nums">{value}</dd>
    </div>
  )
}
