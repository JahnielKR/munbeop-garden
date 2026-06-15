import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '~/composables/useAuth'

const invoke = vi.fn()
const signOut = vi.fn(async () => ({ error: null }))
const push = vi.fn(async () => {})
vi.stubGlobal('useNuxtApp', () => ({ $supabase: { functions: { invoke }, auth: { signOut } } }))
vi.stubGlobal('useRouter', () => ({ push }))
vi.stubGlobal('useAuthStore', () => ({ setSession: vi.fn(), user: { id: 'u' } }))
vi.mock('~/stores/grammar', () => ({ useGrammarStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/contexts', () => ({ useContextsStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/auth', () => ({ useAuthStore: () => ({ setSession: vi.fn(), user: { id: 'u' } }) }))

describe('useAuth().deleteAccount', () => {
  beforeEach(() => {
    invoke.mockReset()
    signOut.mockReset()
    signOut.mockResolvedValue({ error: null })
    push.mockReset()
  })

  it('invokes the function then signs out and leaves on success', async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null })
    const result = await useAuth().deleteAccount()
    expect(invoke).toHaveBeenCalledWith('delete-account')
    expect(signOut).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/welcome')
    expect(result.error).toBe(null)
  })

  it('returns the error and does NOT sign out when the function fails', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'boom' } })
    const result = await useAuth().deleteAccount()
    expect(result.error?.message).toBe('boom')
    expect(signOut).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })
})
