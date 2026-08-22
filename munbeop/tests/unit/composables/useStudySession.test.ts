import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useStudySession } from '~/composables/useStudySession'
import { useAuthStore } from '~/stores/auth'

describe('useStudySession', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('invalidates a run immediately when account identity changes', () => {
    const auth = useAuthStore()
    auth.setSession({ user: { id: 'account-a' } } as never)
    const run = useStudySession()

    auth.setSession({ user: { id: 'account-b' } } as never)
    expect(run.isCurrent()).toBe(false)
  })

  it('also invalidates A -> signed out -> A because the epoch changed', () => {
    const auth = useAuthStore()
    auth.setSession({ user: { id: 'account-a' } } as never)
    const run = useStudySession()

    auth.setSession(null)
    auth.setSession({ user: { id: 'account-a' } } as never)
    expect(run.isCurrent()).toBe(false)

    run.begin()
    expect(run.isCurrent()).toBe(true)
  })
})
