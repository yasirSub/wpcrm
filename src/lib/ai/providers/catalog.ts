import type { AiProvider } from '../types'

/**
 * Catalog of chat providers the setup form and API accept.
 *
 * `openai` / `anthropic` hit those vendors directly. `groq` and
 * `openrouter` are OpenAI-compatible presets (known base URL).
 * `custom` is any other Chat Completions-compatible host — the admin
 * pastes the base URL (e.g. `https://api.together.xyz/v1`).
 */
export const AI_PROVIDERS = [
  'openai',
  'anthropic',
  'groq',
  'openrouter',
  'custom',
] as const

export function isAiProvider(value: unknown): value is AiProvider {
  return (
    typeof value === 'string' &&
    (AI_PROVIDERS as readonly string[]).includes(value)
  )
}

/** Fixed Chat Completions bases. `custom` is supplied by the admin. */
export const AI_PROVIDER_CHAT_BASE: Partial<Record<AiProvider, string>> = {
  openai: 'https://api.openai.com/v1',
  groq: 'https://api.groq.com/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
}

export function usesOpenAiCompat(provider: AiProvider): boolean {
  return provider !== 'anthropic'
}

/**
 * Normalize an admin-entered base URL. Accepts either
 * `https://host/v1` or a full `.../chat/completions` path.
 * Rejects credentials-in-URL and non-http(s) schemes.
 */
export function normalizeProviderBaseUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const u = new URL(trimmed)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (u.username || u.password) return null
    const path = u.pathname.replace(/\/+$/, '') || ''
    return `${u.origin}${path}`
  } catch {
    return null
  }
}

export function chatCompletionsEndpoint(baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  if (/\/chat\/completions$/i.test(base)) return base
  return `${base}/chat/completions`
}

/** Resolve the Chat Completions base for a saved config. */
export function resolveChatBaseUrl(
  provider: AiProvider,
  customBaseUrl?: string | null,
): string | null {
  if (provider === 'anthropic') return null
  if (provider === 'custom') {
    return customBaseUrl ? normalizeProviderBaseUrl(customBaseUrl) : null
  }
  return AI_PROVIDER_CHAT_BASE[provider] ?? null
}
