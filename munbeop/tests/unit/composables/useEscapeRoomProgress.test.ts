import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEscapeRoomProgress } from '~/composables/useEscapeRoomProgress'
import { useEscapeRoomStore } from '~/stores/escape-room'
import { useAuthStore } from '~/stores/auth'

// Mock the storage adapter so the composable's read/write are fully controlled
// (no Supabase, no Nuxt app). vi.mock + vi.hoisted are hoisted above the imports
// by vitest, so the mock still intercepts useStorageAdapter despite living here.
const { read, write } = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn() }))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read, write, remove: vi.fn(), clear: vi.fn() }),
}))
vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

const KEY = 'munbeop.v1.escapeRoom'

describe('useEscapeRoomProgress', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    read.mockReset()
    write.mockReset()
    write.mockResolvedValue(undefined)
  })

  it('hydrates the store from the cloud blob (incl. equipped choices)', async () => {
    read.mockResolvedValue({
      unlockedCosmetics: ['cosmetic-frame-apron', 'cosmetic-bg-sunrise'],
      consecutiveCleanRuns: 3,
      equipped: { frame: 'cosmetic-frame-apron', bg: 'cosmetic-bg-sunrise' },
    })
    await useEscapeRoomProgress().hydrate()
    const store = useEscapeRoomStore()
    expect(store.unlockedCosmetics).toEqual(['cosmetic-frame-apron', 'cosmetic-bg-sunrise'])
    expect(store.consecutiveCleanRuns).toBe(3)
    expect(store.equipped).toEqual({ frame: 'cosmetic-frame-apron', bg: 'cosmetic-bg-sunrise' })
  })

  it('clears to defaults when the cloud blob is null (e.g. signed out → noop adapter)', async () => {
    const store = useEscapeRoomStore()
    store.unlockedCosmetics = ['stale-from-prev-user']
    store.consecutiveCleanRuns = 5
    store.equipped = { avatar: 'stale' }
    read.mockResolvedValue(null)
    await useEscapeRoomProgress().hydrate()
    expect(store.unlockedCosmetics).toEqual([])
    expect(store.consecutiveCleanRuns).toBe(0)
    expect(store.equipped).toEqual({})
  })

  it('ignores malformed cloud data (incl. a non-object equipped)', async () => {
    read.mockResolvedValue({
      unlockedCosmetics: 'nope',
      consecutiveCleanRuns: -2,
      equipped: ['not', 'an', 'object'],
    })
    await useEscapeRoomProgress().hydrate()
    const store = useEscapeRoomStore()
    expect(store.unlockedCosmetics).toEqual([])
    expect(store.consecutiveCleanRuns).toBe(0)
    expect(store.equipped).toEqual({})
  })

  it('does not wipe in-memory progress when the read throws (table not deployed)', async () => {
    const store = useEscapeRoomStore()
    store.unlockedCosmetics = ['earned-this-session']
    store.consecutiveCleanRuns = 2
    read.mockRejectedValue(new Error('relation "user_escape_room" does not exist'))
    await useEscapeRoomProgress().hydrate()
    expect(store.unlockedCosmetics).toEqual(['earned-this-session'])
    expect(store.consecutiveCleanRuns).toBe(2)
  })

  it('persists the current store progress when signed in', async () => {
    useAuthStore().user = { id: 'u1', email: 'sol@example.com' } as never
    const store = useEscapeRoomStore()
    store.unlockedCosmetics = ['cosmetic-bg-sunrise']
    store.consecutiveCleanRuns = 1
    store.equipped = { bg: 'cosmetic-bg-sunrise' }
    await useEscapeRoomProgress().persist()
    expect(write).toHaveBeenCalledWith(KEY, {
      unlockedCosmetics: ['cosmetic-bg-sunrise'],
      consecutiveCleanRuns: 1,
      equipped: { bg: 'cosmetic-bg-sunrise' },
    })
  })

  it('does not persist when signed out', async () => {
    useAuthStore().user = null as never
    await useEscapeRoomProgress().persist()
    expect(write).not.toHaveBeenCalled()
  })

  it('swallows a failing cloud write (never throws into the UI)', async () => {
    useAuthStore().user = { id: 'u1', email: 'sol@example.com' } as never
    write.mockRejectedValue(new Error('network'))
    await expect(useEscapeRoomProgress().persist()).resolves.toBeUndefined()
  })
})
