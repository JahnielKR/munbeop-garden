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

// Capture `window.location.href = ...` instead of letting it trigger a
// (fake) navigation in happy-dom — we want to assert what URL we tried
// to redirect to.
const hrefSpy = vi.fn()
Object.defineProperty(window.location, 'href', {
  configurable: true,
  get: () => '',
  set: (v: string) => hrefSpy(v),
})

describe('useAuth().signInWithProvider', () => {
  beforeEach(() => {
    signInWithOAuth.mockReset()
    hrefSpy.mockReset()
  })

  it('asks Supabase to skip its own redirect for kakao and strips account_email from the URL', async () => {
    signInWithOAuth.mockResolvedValue({
      data: {
        url:
          'https://kauth.kakao.com/oauth/authorize?client_id=abc&scope=account_email+profile_image+profile_nickname&response_type=code',
      },
      error: null,
    })
    const { signInWithProvider } = useAuth()
    const result = await signInWithProvider('kakao')
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'kakao',
      options: {
        redirectTo: 'https://example.test/auth/callback',
        skipBrowserRedirect: true,
      },
    })
    expect(hrefSpy).toHaveBeenCalledTimes(1)
    const finalUrl = new URL(hrefSpy.mock.calls[0]![0])
    expect(finalUrl.searchParams.get('scope')).toBe(
      'profile_image profile_nickname',
    )
    expect(result.error).toBe(null)
  })

  it('uses Supabase default redirect flow for google (no scope override, no skipBrowserRedirect)', async () => {
    signInWithOAuth.mockResolvedValue({ error: null })
    const { signInWithProvider } = useAuth()
    const result = await signInWithProvider('google')
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'https://example.test/auth/callback' },
    })
    expect(hrefSpy).not.toHaveBeenCalled()
    expect(result.error).toBe(null)
  })

  it('passes through provider errors', async () => {
    signInWithOAuth.mockResolvedValue({ error: { message: 'denied' } })
    const { signInWithProvider } = useAuth()
    const result = await signInWithProvider('google')
    expect(result.error?.message).toBe('denied')
  })

  it('passes through kakao errors without attempting a redirect', async () => {
    signInWithOAuth.mockResolvedValue({ error: { message: 'kakao boom' } })
    const { signInWithProvider } = useAuth()
    const result = await signInWithProvider('kakao')
    expect(result.error?.message).toBe('kakao boom')
    expect(hrefSpy).not.toHaveBeenCalled()
  })
})
