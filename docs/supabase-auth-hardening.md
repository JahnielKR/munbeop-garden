# Supabase Auth hardening (owner dashboard actions)

The app enforces a client-side password policy (`app/lib/auth/password.ts`,
`MIN_PASSWORD_LENGTH = 8`) on every surface that sets a password: sign-up,
password reset, and the in-settings change-password form. That is **UX only** —
fail fast with a branded message. Supabase Auth is the authoritative enforcer,
and two settings must be turned on in the dashboard. Neither can be set from
code/migrations; they live in the Auth config.

Project: **Mungander** (`zbohswpyydwvzowvjaiw`, region ap-northeast-2).

## 1. Enable leaked-password protection (flagged by the security advisor)

Supabase Auth can reject passwords found in the HaveIBeenPwned breach corpus.
It is currently **OFF** (`auth_leaked_password_protection`, WARN).

- Dashboard → **Authentication → Policies / Password** (Auth settings).
- Turn **"Prevent use of leaked passwords"** ON.
- Docs: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## 2. Set the minimum password length to 8

So the server matches the client policy above.

- Dashboard → **Authentication → Sign In / Providers → (Auth) Password** settings.
- Set **"Minimum password length"** to **8** (default is 6).
- Optional: require a character-class mix if you want a stronger policy — if you
  raise the minimum or add requirements, update `MIN_PASSWORD_LENGTH` and the
  `auth.password_min` i18n string ("At least 8 characters.") to match.

## Verify

After toggling, re-run the security advisor — the
`auth_leaked_password_protection` warning should clear:

```
# via the Supabase MCP get_advisors(project_id, type: "security")
```

Or Dashboard → **Advisors → Security**.
