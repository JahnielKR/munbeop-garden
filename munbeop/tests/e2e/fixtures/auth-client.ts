import type { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'
import {
  ensureAccount,
  readBackend,
  readSession,
  sessionFor,
  userIdForEmail,
  writeBackend,
  writeSession,
} from './backend'

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void

const listeners = new Set<AuthListener>()

function emit(event: AuthChangeEvent, session: Session | null): void {
  for (const listener of listeners) listener(event, session)
}

function signIn(email: string) {
  const session = sessionFor(email)
  const state = readBackend()
  ensureAccount(state, userIdForEmail(email), email.trim().toLowerCase())
  writeBackend(state)
  writeSession(session)
  emit('SIGNED_IN', session)
  return session
}

const client = {
  auth: {
    async getSession() {
      return { data: { session: readSession() }, error: null }
    },
    onAuthStateChange(listener: AuthListener) {
      listeners.add(listener)
      const initial = readSession()
      queueMicrotask(() => {
        if (listeners.has(listener)) listener('INITIAL_SESSION', initial)
      })
      return {
        data: {
          subscription: {
            id: 'e2e-auth-listener',
            callback: listener,
            unsubscribe: () => listeners.delete(listener),
          },
        },
      }
    },
    async signInWithPassword(credentials: { email: string; password: string }) {
      const session = signIn(credentials.email)
      return { data: { user: session.user, session }, error: null }
    },
    async signUp(credentials: { email: string; password: string }) {
      const session = signIn(credentials.email)
      return { data: { user: session.user, session }, error: null }
    },
    async signOut() {
      writeSession(null)
      emit('SIGNED_OUT', null)
      return { error: null }
    },
    async signInWithOtp() {
      return { data: {}, error: null }
    },
    async signInWithOAuth() {
      return { data: { provider: 'google', url: null }, error: null }
    },
    async resetPasswordForEmail() {
      return { data: {}, error: null }
    },
    async updateUser(attributes: { email?: string; password?: string }) {
      const current = readSession()
      if (!current) return { data: { user: null }, error: { message: 'no-session' } }
      if (attributes.email) current.user.email = attributes.email
      writeSession(current)
      emit('USER_UPDATED', current)
      return { data: { user: current.user }, error: null }
    },
  },
  functions: {
    async invoke() {
      return { data: {}, error: null }
    },
  },
}

/** Test-only alias target; production keeps using the real Supabase singleton. */
export function getSupabaseClient(): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}
