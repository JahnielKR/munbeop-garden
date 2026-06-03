import type { User, Session } from '@supabase/supabase-js'

// Re-export Supabase types under app-local names so call sites don't depend
// on '@supabase/supabase-js' directly. Lets future Plan 11+ swap auth
// providers (or stub the user object in tests) without a wide refactor.
export type AuthUser = User
export type AuthSession = Session
