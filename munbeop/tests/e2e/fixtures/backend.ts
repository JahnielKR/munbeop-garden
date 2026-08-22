import type { Session } from '@supabase/supabase-js'

export const E2E_BACKEND_KEY = 'munbeop.e2e.backend.v1'
export const E2E_SESSION_KEY = 'munbeop.e2e.session.v1'
export const E2E_SUPABASE_TOKEN_KEY = 'sb-e2e-auth-token'

export interface FakeAccountState {
  email: string
  data: Record<string, unknown>
  failReadsRemaining: number
  activityReceipts: Record<string, unknown>
  journalDeletes: Record<string, { ko: string; revision: number }>
  lastError?: string
}

export interface FakeBackendState {
  version: 1
  accounts: Record<string, FakeAccountState>
}

export function userIdForEmail(email: string): string {
  return `e2e-${email.trim().toLowerCase()}`
}

function emptyState(): FakeBackendState {
  return { version: 1, accounts: {} }
}

export function readBackend(): FakeBackendState {
  const raw = localStorage.getItem(E2E_BACKEND_KEY)
  if (!raw) return emptyState()
  return JSON.parse(raw) as FakeBackendState
}

export function writeBackend(state: FakeBackendState): void {
  localStorage.setItem(E2E_BACKEND_KEY, JSON.stringify(state))
}

/** Match the JSON boundary of the real backend and accept Vue reactive proxies. */
export function cloneBackendValue<T>(value: T): T {
  if (value === undefined || value === null) return value
  return JSON.parse(JSON.stringify(value)) as T
}

export function ensureAccount(
  state: FakeBackendState,
  userId: string,
  email = userId,
): FakeAccountState {
  return (state.accounts[userId] ??= {
    email,
    data: {},
    failReadsRemaining: 0,
    activityReceipts: {},
    journalDeletes: {},
  })
}

export function mutateAccount<T>(userId: string, mutation: (account: FakeAccountState) => T): T {
  const state = readBackend()
  const account = ensureAccount(state, userId)
  const result = mutation(account)
  writeBackend(state)
  return cloneBackendValue(result)
}

export function sessionFor(email: string): Session {
  const normalizedEmail = email.trim().toLowerCase()
  const now = new Date().toISOString()
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60
  return {
    access_token: `e2e-access-${normalizedEmail}`,
    token_type: 'bearer',
    expires_in: 60 * 60,
    expires_at: expiresAt,
    refresh_token: `e2e-refresh-${normalizedEmail}`,
    user: {
      id: userIdForEmail(normalizedEmail),
      aud: 'authenticated',
      role: 'authenticated',
      email: normalizedEmail,
      email_confirmed_at: now,
      phone: '',
      confirmed_at: now,
      last_sign_in_at: now,
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {},
      identities: [],
      created_at: now,
      updated_at: now,
      is_anonymous: false,
    },
  } as Session
}

export function readSession(): Session | null {
  const raw = localStorage.getItem(E2E_SESSION_KEY)
  return raw ? (JSON.parse(raw) as Session) : null
}

export function writeSession(session: Session | null): void {
  if (!session) {
    localStorage.removeItem(E2E_SESSION_KEY)
    localStorage.removeItem(E2E_SUPABASE_TOKEN_KEY)
    return
  }
  localStorage.setItem(E2E_SESSION_KEY, JSON.stringify(session))
  // The production route middleware intentionally checks Supabase's persisted
  // token before the Pinia auth store exists. Keep that boundary realistic.
  localStorage.setItem(E2E_SUPABASE_TOKEN_KEY, JSON.stringify(session))
}

declare global {
  interface Window {
    __MUNBEOP_E2E_BACKEND__?: {
      snapshot: () => FakeBackendState
      failNextReads: (email: string, count?: number) => void
    }
  }
}

if (typeof window !== 'undefined') {
  window.__MUNBEOP_E2E_BACKEND__ = {
    snapshot: () => cloneBackendValue(readBackend()),
    failNextReads: (email, count = 1) => {
      mutateAccount(userIdForEmail(email), (account) => {
        account.failReadsRemaining += count
      })
    },
  }
}
