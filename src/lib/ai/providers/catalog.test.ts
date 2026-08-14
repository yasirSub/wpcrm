import { describe, it, expect } from 'vitest'
import {
  chatCompletionsEndpoint,
  isAiProvider,
  normalizeProviderBaseUrl,
  resolveChatBaseUrl,
} from './catalog'

describe('isAiProvider', () => {
  it('accepts the catalog and rejects unknowns', () => {
    expect(isAiProvider('openai')).toBe(true)
    expect(isAiProvider('custom')).toBe(true)
    expect(isAiProvider('claude')).toBe(false)
  })
})

describe('normalizeProviderBaseUrl', () => {
  it('strips trailing slashes and query strings', () => {
    expect(normalizeProviderBaseUrl('https://openrouter.ai/api/v1/')).toBe(
      'https://openrouter.ai/api/v1',
    )
  })

  it('rejects credentials and non-http schemes', () => {
    expect(normalizeProviderBaseUrl('https://user:pass@host/v1')).toBeNull()
    expect(normalizeProviderBaseUrl('javascript:alert(1)')).toBeNull()
  })
})

describe('chatCompletionsEndpoint', () => {
  it('appends /chat/completions unless already present', () => {
    expect(chatCompletionsEndpoint('https://api.together.xyz/v1')).toBe(
      'https://api.together.xyz/v1/chat/completions',
    )
    expect(
      chatCompletionsEndpoint('https://api.together.xyz/v1/chat/completions'),
    ).toBe('https://api.together.xyz/v1/chat/completions')
  })
})

describe('resolveChatBaseUrl', () => {
  it('uses presets and requires a URL for custom', () => {
    expect(resolveChatBaseUrl('groq')).toBe('https://api.groq.com/openai/v1')
    expect(resolveChatBaseUrl('custom', 'https://example.com/v1/')).toBe(
      'https://example.com/v1',
    )
    expect(resolveChatBaseUrl('custom')).toBeNull()
    expect(resolveChatBaseUrl('anthropic')).toBeNull()
  })
})
