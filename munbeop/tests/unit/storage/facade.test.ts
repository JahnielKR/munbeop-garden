import { describe, it, expect } from 'vitest'
import { pickAdapter } from '~/lib/storage/facade'
import { LocalStorageAdapter } from '~/lib/storage/localStorage'
import { SupabaseAdapter } from '~/lib/storage/supabase'

describe('pickAdapter', () => {
  it('returns LocalStorageAdapter when no user', () => {
    const a = pickAdapter({ user: null, client: null })
    expect(a).toBeInstanceOf(LocalStorageAdapter)
  })

  it('returns SupabaseAdapter when user + client both present', () => {
    const fakeUser = { id: 'u1' } as never
    const fakeClient = { from: () => ({}) } as never
    const a = pickAdapter({ user: fakeUser, client: fakeClient })
    expect(a).toBeInstanceOf(SupabaseAdapter)
  })

  it('returns LocalStorageAdapter when user is null even if client exists', () => {
    const fakeClient = { from: () => ({}) } as never
    const a = pickAdapter({ user: null, client: fakeClient })
    expect(a).toBeInstanceOf(LocalStorageAdapter)
  })

  it('returns LocalStorageAdapter when client is null even if user exists', () => {
    const fakeUser = { id: 'u1' } as never
    const a = pickAdapter({ user: fakeUser, client: null })
    expect(a).toBeInstanceOf(LocalStorageAdapter)
  })
})
