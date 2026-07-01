import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '~/composables/useAuth'

const signUp = vi.fn()
const signOut = vi.fn()
const push = vi.fn(async () => {})
vi.stubGlobal('useNuxtApp', () => ({ $supabase: { auth: { signUp, signOut } } }))
vi.stubGlobal('useRouter', () => ({ push }))
// user null → hydrateUserStores() no-ops, so signUp doesn't pull the stores.
vi.mock('~/stores/auth', () => ({ useAuthStore: () => ({ setSession: vi.fn(), user: null }) }))
vi.mock('~/stores/grammar', () => ({ useGrammarStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/contexts', () => ({ useContextsStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ hydrate: vi.fn() }) }))

beforeEach(() => {
  signUp.mockReset()
  signOut.mockReset()
  push.mockReset()
})

describe('useAuth().signUp', () => {
  it('flags needsConfirmation when signUp yields NO session (Confirm email ON)', async () => {
    signUp.mockResolvedValue({ data: { session: null, user: { id: 'u' } }, error: null })
    const r = await useAuth().signUp('a@b.co', 'password123')
    expect(r.error).toBe(null)
    expect(r.needsConfirmation).toBe(true)
  })

  it('does NOT flag needsConfirmation when a session IS returned (Confirm email OFF)', async () => {
    signUp.mockResolvedValue({ data: { session: { access_token: 'x' }, user: { id: 'u' } }, error: null })
    const r = await useAuth().signUp('a@b.co', 'password123')
    expect(r.error).toBe(null)
    expect(r.needsConfirmation).toBe(false)
  })

  it('propagates a sign-up error and never flags confirmation', async () => {
    signUp.mockResolvedValue({ data: { session: null }, error: { message: 'weak password' } })
    const r = await useAuth().signUp('a@b.co', 'x')
    expect(r.error?.message).toBe('weak password')
    expect(r.needsConfirmation).toBe(false)
  })
})

describe('useAuth().signOutAndExit', () => {
  it('navigates to /welcome on a clean global sign-out', async () => {
    signOut.mockResolvedValue({ error: null })
    const r = await useAuth().signOutAndExit()
    expect(push).toHaveBeenCalledWith('/welcome')
    expect(r.error).toBe(null)
  })

  it('falls back to a LOCAL sign-out and still navigates when the global sign-out ERRORS', async () => {
    signOut.mockResolvedValueOnce({ error: { message: '5xx' } }) // global fails
    signOut.mockResolvedValueOnce({ error: null }) // local fallback succeeds
    const r = await useAuth().signOutAndExit()
    expect(signOut).toHaveBeenNthCalledWith(2, { scope: 'local' })
    expect(push).toHaveBeenCalledWith('/welcome')
    expect(r.error?.message).toBe('5xx')
  })

  it('falls back to a LOCAL sign-out and still navigates when the global sign-out REJECTS (offline)', async () => {
    signOut.mockRejectedValueOnce(new Error('network down')) // global throws
    signOut.mockResolvedValueOnce({ error: null }) // local fallback
    const r = await useAuth().signOutAndExit()
    expect(signOut).toHaveBeenNthCalledWith(2, { scope: 'local' })
    expect(push).toHaveBeenCalledWith('/welcome')
    expect(r.error?.message).toContain('network down')
  })
})
