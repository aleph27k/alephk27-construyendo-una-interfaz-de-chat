export const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

export const DEFAULT_MODEL = 'qwen/qwen3.8-27b'

export const SUGGESTED_MODELS = [
  'llama-3.1-8b-instant',
  'llama3-8b-8192',
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
]

export type ChatRole = 'system' | 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
}

export type Usage = {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export type ChatResult = {
  content: string
  usage: Usage
  model: string
  elapsedMs: number
}

export class GroqError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'GroqError'
    this.status = status
  }
}

function describeStatus(status: number) {
  if (status === 400) return 'Bad request'
  if (status === 401) return 'Unauthorized — check your API key'
  if (status === 403) return 'Forbidden'
  if (status === 404) return 'Not found — the model may not exist'
  if (status === 413) return 'Request too large'
  if (status === 429) return 'Rate limit exceeded'
  if (status >= 500) return 'Groq server error'
  return 'Request failed'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export async function sendChat({
  apiKey,
  model,
  messages,
  signal,
}: {
  apiKey: string
  model: string
  messages: ChatMessage[]
  signal?: AbortSignal
}): Promise<ChatResult> {
  const startedAt = performance.now()

  let response: Response
  try {
    response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages }),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new GroqError('Network error — could not reach the Groq API.')
  }

  const elapsedMs = performance.now() - startedAt

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new GroqError(
      response.ok
        ? 'Malformed response — body is not valid JSON.'
        : `${response.status} ${describeStatus(response.status)}`,
      response.status,
    )
  }

  console.log('[v0] Groq raw response:', response.status, data)

  if (!response.ok) {
    const apiMessage =
      (data as { error?: { message?: unknown } })?.error?.message
    const detail = typeof apiMessage === 'string' ? `: ${apiMessage}` : ''
    throw new GroqError(
      `${response.status} ${describeStatus(response.status)}${detail}`,
      response.status,
    )
  }

  const body = data as {
    model?: unknown
    choices?: { message?: { content?: unknown } }[]
    usage?: Partial<Record<keyof Usage, unknown>>
  }

  const content = body.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new GroqError(
      'Malformed response — missing choices[0].message.content.',
    )
  }

  const usage = body.usage
  if (
    !usage ||
    !isNumber(usage.prompt_tokens) ||
    !isNumber(usage.completion_tokens) ||
    !isNumber(usage.total_tokens)
  ) {
    throw new GroqError('Malformed response — missing or invalid usage object.')
  }

  return {
    content,
    usage: {
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
    },
    model: typeof body.model === 'string' ? body.model : model,
    elapsedMs,
  }
}
