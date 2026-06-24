/**
 * Client-side password policy, shared across every auth surface that sets a
 * password: sign-up (WelcomeEmailForm), password reset (auth/reset-password),
 * and the in-settings change-password form (AccountCredentials).
 *
 * This MIN must mirror the Supabase project's "Minimum password length" auth
 * setting — the client gate is UX (fail fast, branded message); Supabase Auth
 * is the authoritative enforcer. The `auth.password_min` i18n string surfaces
 * this number to the user, so update both if it ever changes.
 */
export const MIN_PASSWORD_LENGTH = 8

/** True when the password satisfies the minimum-length policy. */
export function isPasswordLongEnough(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH
}
