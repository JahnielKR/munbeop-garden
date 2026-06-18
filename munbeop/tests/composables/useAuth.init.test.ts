import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '~/composables/useAuth'
import { useAppStatus } from '~/stores/appStatus'

// Capture the onAuthStateChange callback so a test can drive the events
// Supabase would fire (INITIAL_SESSION on a hard reload, SIGNED_IN, etc.).
let authCallback: (event: string, session: unknown) => Promise<void> | void = () => {}

const getSession = vi.fn(async () => ({ data: { session: null } }))
const signInWithPassword = vi.fn(async () => ({ error: null as { message: string } | null }))
const onAuthStateChange = vi.fn((cb: typeof authCallback) => {
  authCallback = cb
  return { data: { subscription: { unsubscribe: vi.fn() } } }
})

const grammarHydrate = vi.fn(async () => {})
const contextsHydrate = vi.fn(async () => {})
const srsHydrate = vi.fn(async () => {})
const logHydrate = vi.fn(async () => {})
const settingsHydrate = vi.fn(async () => {})
const escapeRoomHydrate = vi.fn(async () => {})

vi.stubGlobal('useNuxtApp', () => ({
  $supabase: { auth: { getSession, onAuthStateChange, signInWithPassword } },
}))
vi.stubGlobal('useRouter', () => ({ push: vi.fn(), currentRoute: { value: { path: '/welcome' } } }))
vi.stubGlobal('useAuthStore', () => ({ setSession: vi.fn(), user: { id: 'u' } }))
vi.mock('~/stores/auth', () => ({ useAuthStore: () => ({ setSession: vi.fn(), user: { id: 'u' } }) }))
vi.mock('~/stores/grammar', () => ({ useGrammarStore: () => ({ hydrate: grammarHydrate }) }))
vi.mock('~/stores/contexts', () => ({ useContextsStore: () => ({ hydrate: contextsHydrate }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ hydrate: srsHydrate }) }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ hydrate: logHydrate }) }))
vi.mock('~/stores/settings', () => ({ useSettingsStore: () => ({ hydrate: settingsHydrate }) }))
vi.mock('~/composables/useEscapeRoomProgress', () => ({
  useEscapeRoomProgress: () => ({ hydrate: escapeRoomHydrate }),
}))

describe('useAuth().init — session restored on reload', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getSession.mockResolvedValue({ data: { session: null } })
  })

  // The bug: on a hard reload, the layout hydrates the data stores against the
  // noop adapter BEFORE getSession() resolves, so they hold seed defaults. When
  // Supabase then restores the persisted session it fires INITIAL_SESSION — but
  // the handler only re-pulled settings, leaving the data stores stale (and a
  // later write could overwrite the account's real cloud data with seeds).
  it('re-hydrates the data stores on INITIAL_SESSION, not just settings', async () => {
    await useAuth().init()
    await authCallback('INITIAL_SESSION', { user: { id: 'u' } })

    expect(settingsHydrate).toHaveBeenCalled()
    expect(grammarHydrate).toHaveBeenCalled()
    expect(contextsHydrate).toHaveBeenCalled()
    expect(srsHydrate).toHaveBeenCalled()
    expect(logHydrate).toHaveBeenCalled()
    expect(escapeRoomHydrate).toHaveBeenCalled()
  })

  it('does not hydrate data stores on INITIAL_SESSION when there is no session', async () => {
    await useAuth().init()
    await authCallback('INITIAL_SESSION', null)

    expect(grammarHydrate).not.toHaveBeenCalled()
    expect(settingsHydrate).not.toHaveBeenCalled()
  })

  // Now that the adapter throws on a Supabase error, a failed hydrate must not
  // become an unhandled rejection inside the onAuthStateChange callback or
  // reject out of the sign-in flow — the user is still authed; the data just
  // didn't load this round.
  it('swallows a data-store hydrate failure on INITIAL_SESSION', async () => {
    grammarHydrate.mockRejectedValueOnce(new Error('rls denied'))
    await useAuth().init()
    await expect(authCallback('INITIAL_SESSION', { user: { id: 'u' } })).resolves.toBeUndefined()
  })

  it('signIn resolves error:null even if post-auth data hydration fails', async () => {
    signInWithPassword.mockResolvedValueOnce({ error: null })
    logHydrate.mockRejectedValueOnce(new Error('network'))
    const res = await useAuth().signIn('a@b.com', 'pw')
    expect(res.error).toBeNull()
  })

  // The failure must be visible to the user, not just logged — the shell reads
  // appStatus to show an error+retry banner.
  it('marks app data status error when INITIAL_SESSION hydration fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    grammarHydrate.mockRejectedValueOnce(new Error('rls denied'))
    await useAuth().init()
    await authCallback('INITIAL_SESSION', { user: { id: 'u' } })
    expect(useAppStatus().status).toBe('error')
  })

  it('marks app data status ready when INITIAL_SESSION hydration succeeds', async () => {
    await useAuth().init()
    await authCallback('INITIAL_SESSION', { user: { id: 'u' } })
    expect(useAppStatus().status).toBe('ready')
  })
})
