# Supabase Auth hardening (owner dashboard actions)

The app enforces a client-side password policy (`app/lib/auth/password.ts`,
`MIN_PASSWORD_LENGTH = 8`) on every surface that sets a password: sign-up,
password reset, and the in-settings change-password form. That is **UX only** —
fail fast with a branded message. Supabase Auth is the authoritative enforcer.
Neither setting below can be changed from code/migrations or the MCP — they live
in the GoTrue Auth config, set only via the dashboard (or the Management API).

Project: **Mungander** (`zbohswpyydwvzowvjaiw`, region ap-northeast-2),
org **JahnielKR's Org** — currently on the **Free plan** (matters for #2 below).

## Where these live (this tripped us up once)

Both settings are **inside the Email provider panel**, not on a separate page.
Open the Email provider directly:

👉 `https://supabase.com/dashboard/project/zbohswpyydwvzowvjaiw/auth/providers?provider=Email`

(Authentication → **Sign In / Providers** → click **Email** to expand → scroll
down to the password settings.) Docs:
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## 1. Minimum password length = 8  ✅ available on all plans (incl. Free)

So the server matches the client policy above (default is 6).

- In the Email provider panel, set **"Minimum password length"** to **8**.
- Optional: enable **Password Requirements** (character-class mix) for a stronger
  policy — if you raise the minimum or add requirements, update
  `MIN_PASSWORD_LENGTH` and the `auth.password_min` i18n string
  ("At least 8 characters.") to match.

## 2. Leaked-password protection  ⚠️ Pro plan and above only

Supabase Auth can reject passwords found in the HaveIBeenPwned breach corpus.
It is currently **OFF** (`auth_leaked_password_protection`, WARN from the
security advisor).

- **The toggle does not appear on the Free plan** — the docs state leaked-password
  protection is "available on the Pro Plan and above." That is why it can't be
  found in the dashboard today.
- **Recommendation (pre-launch):** leave it for now. It's a low-severity external
  warning, and the practical protection (8-char minimum, client + server) is in
  place via #1. Enable it when the org moves to Pro (likely needed for launch
  anyway). The advisor will keep flagging it on Free — that's expected, not a bug.
- When on Pro: the toggle appears in the same Email provider panel — turn
  **"Prevent the use of leaked passwords"** ON.

## Verify

`#1` (min length) isn't reported by the advisor and can't be read via the MCP —
confirm it visually in the dashboard. For `#2`, after enabling it on Pro, re-run
the security advisor and the `auth_leaked_password_protection` warning should
clear:

```
# via the Supabase MCP get_advisors(project_id, type: "security")
```

Or Dashboard → **Advisors → Security**.
