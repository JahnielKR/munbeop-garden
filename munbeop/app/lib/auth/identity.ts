/**
 * Does this account have an email/password identity?
 *
 * Only email-identity users can set or change a password / change their email
 * in-app — for a Kakao/Google-only account those controls are nonsensical
 * (auth.updateUser({ password }) on an OAuth-only user has no meaning), so the
 * settings UI hides them. Supabase exposes the providers two ways depending on
 * how the user object was loaded; we check `identities` first (most precise),
 * then fall back to `app_metadata`.
 */
interface IdentityLike {
  provider?: string
}
interface UserLike {
  identities?: IdentityLike[] | null
  app_metadata?: { provider?: string; providers?: string[] } | null
}

export function isEmailIdentity(user: UserLike | null | undefined): boolean {
  if (!user) return false
  const identities = user.identities
  if (Array.isArray(identities) && identities.length > 0) {
    return identities.some((i) => i?.provider === 'email')
  }
  const meta = user.app_metadata
  if (meta?.provider === 'email') return true
  if (Array.isArray(meta?.providers) && meta.providers.includes('email')) return true
  return false
}
