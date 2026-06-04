import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '~/composables/useAuth'

const signInWithOAuth = vi.fn()
const useNuxtApp = vi.fn(() => ({ $supabase: { auth: { signInWithOAuth } } }))
const useRuntimeConfig = vi.fn(() => ({ public: { appUrl: 'https://example.test' } }))

vi.stubGlobal('useNuxtApp', useNuxtApp)
vi.stubGlobal('useRuntimeConfig', useRuntimeConfig)
vi.stubGlobal('useAuthStore', () => ({ setSession: vi.fn(), user: null }))

vi.mock('~/lib/auth/migration', () => ({ migrateLocalToSupabase: vi.fn() }))
vi.mock('~/lib/storage/facade', () => ({ pickAdapter: vi.fn() }))
vi.mock('~/stores/grammar', () => ({ useGrammarStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/contexts', () => ({ useContextsStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/auth', () => ({ useAuthStore: () => ({ setSession: vi.fn(), user: null }) }))

describe('useAuth().signInWithProvider', () => {
  beforeEach(() => { signInWithOAuth.mockReset() })

  it('calls supabase.auth.signInWithOAuth with the right provider + redirectTo', async () => {
    signInWithOAuth.mockResolvedValue({ error: null })
    const { signInWithProvider } = useAuth()
    const result = await signInWithProvider('kakao')
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'kakao',
      options: { redirectTo: 'https://example.test/auth/callback' },
    })
    expect(result.error).toBe(null)
  })

  it('passes through provider errors', async () => {
    signInWithOAuth.mockResolvedValue({ error: { message: 'denied' } })
    const { signInWithProvider } = useAuth()
    const result = await signInWithProvider('google')
    expect(result.error?.message).toBe('denied')
  })
})
