import { describe, it, expect } from 'vitest'
import { pickAdapter } from '~/lib/storage/facade'
import { NoopStorageAdapter } from '~/lib/storage/noop'
import { SupabaseAdapter } from '~/lib/storage/supabase'

describe('pickAdapter', () => {
  it('returns SupabaseAdapter when user + client both present', () => {
    const fakeUser = { id: 'u1' } as never
    const fakeClient = { from: () => ({}) } as never
    const a = pickAdapter({ user: fakeUser, client: fakeClient })
    expect(a).toBeInstanceOf(SupabaseAdapter)
  })

  // Accounts are mandatory — there is no local fallback for signed-out
  // sessions, only the noop adapter for the transient anonymous windows.
  it('returns NoopStorageAdapter when no user', () => {
    const a = pickAdapter({ user: null, client: null })
    expect(a).toBeInstanceOf(NoopStorageAdapter)
  })

  it('returns NoopStorageAdapter when user is null even if client exists', () => {
    const fakeClient = { from: () => ({}) } as never
    const a = pickAdapter({ user: null, client: fakeClient })
    expect(a).toBeInstanceOf(NoopStorageAdapter)
  })

  it('returns NoopStorageAdapter when client is null even if user exists', () => {
    const fakeUser = { id: 'u1' } as never
    const a = pickAdapter({ user: fakeUser, client: null })
    expect(a).toBeInstanceOf(NoopStorageAdapter)
  })
})
