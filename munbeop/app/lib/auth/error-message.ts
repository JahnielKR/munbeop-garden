/**
 * Map a Supabase auth error to a localized i18n key.
 *
 * GoTrue error messages are English-only server strings ("Invalid login
 * credentials"), so surfacing error.message verbatim showed English inside an
 * otherwise fully localized welcome screen — the most common failure (wrong
 * password) on the app's very first surface. supabase-js v2 exposes a stable
 * machine-readable `code` on AuthError; map the handful we can say something
 * useful about and fall back to a generic localized message for the rest
 * (keep the raw message in console for debugging).
 */
const CODE_TO_KEY: Record<string, string> = {
  invalid_credentials: 'auth.error_invalid_credentials',
  email_not_confirmed: 'auth.error_email_not_confirmed',
  user_already_exists: 'auth.error_user_exists',
  email_exists: 'auth.error_user_exists',
  over_request_rate_limit: 'auth.error_rate_limited',
  over_email_send_rate_limit: 'auth.error_rate_limited',
  weak_password: 'auth.error_weak_password',
}

export const AUTH_ERROR_KEYS = [...new Set(Object.values(CODE_TO_KEY)), 'auth.error_generic']

export function authErrorKey(error: { code?: string } | null | undefined): string {
  const code = error?.code
  return (code && CODE_TO_KEY[code]) || 'auth.error_generic'
}
