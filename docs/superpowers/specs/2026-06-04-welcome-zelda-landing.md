# Welcome Landing — Zelda-inspired Day/Night Entry

**Status:** approved, ready for implementation planning
**Author:** brainstorming session 2026-06-04
**Scope:** New public landing at `/welcome` with a pixel-art day↔night theme toggle (scanline CRT transition), Zelda-style sidebar menu, typewriter dialog box, and auth options (Kakao + Google OAuth, email/magic-link, anonymous entry). The current `/auth/sign-in` page collapses into the sidebar.

---

## 1. Concept

The app today is "desnuda" — anyone who hits the root walks straight into the in-app garden. There is no marketing landing, no welcome story, and no obvious sign-in path beyond a buried `/auth/sign-in` link. We add a single page, `/welcome`, that serves three audiences:

1. **First-time visitors** — see a calm pixel-art world (day or night), understand this is a Korean grammar garden, and decide how to enter.
2. **Returning anonymous users** — already have `localStorage` data; they keep the no-account path obvious.
3. **Returning logged-in users** — never see this page; routing forwards them to the in-app garden.

The landing borrows two beats from *The Legend of Zelda*: the pulsing "It's dangerous to go alone!" entry prompt, and the typewriter dialog box. It borrows its world from Genshin-inspired pixel art (Mondstadt-style windrise meadow for day) and a parallax starfield (8 layers + a falling-star GIF) for night. The light↔dark toggle plays a CRT scanline sweep, which is the page's signature interaction.

### Goals

- A public entry point that frames the product before the user is "inside" the app.
- Make the sign-in/sign-up choice visible without forcing it.
- Add Kakao and Google OAuth so Korean users in particular have a one-tap path.
- Ship a memorable retro transition that becomes part of the brand's personality.

### Non-goals

- Pricing, Terms, About — out of scope. Footer-links only, no pages yet.
- Marketing copy beyond two short sentences. Long-form copy is a separate spec.
- Re-skinning the in-app garden. The scanline transition is `/welcome`-only.
- Changing how the existing `useTheme()` composable works on other routes.

---

## 2. Routing & entry behavior

### 2.1 The redirect rule

A new global middleware decides what happens when an anonymous visitor hits `/`:

| Visitor state | Hit `/` | Hit `/welcome` |
|---|---|---|
| Signed in (Supabase session) | Stay on `/` (garden home) | Redirect to `/` |
| Anon, has `mungarden:welcomed` flag in `localStorage` | Stay on `/` (existing UX preserved) | Show `/welcome` |
| Anon, no flag (first visit) | Redirect to `/welcome` | Show `/welcome` |

The flag `mungarden:welcomed` is set when the user clicks any action on `/welcome` (sign in, sign up, anonymous entry, even just opening the sidebar). After that, `/` is always direct entry — we never gate them again.

Rationale: respects existing users (their habit stays the same), greets newcomers, never traps anyone.

### 2.2 What happens to `/auth/sign-in`

It moves into the welcome sidebar. The `/auth/sign-in` route stays as a redirect to `/welcome?open=signin&mode=signin` so that old bookmarks and email magic-link callbacks still land somewhere sensible. The welcome page reads `?open=signin` to auto-open the sidebar on mount, and `?mode=signin|signup|magic` to pre-select the email-form mode. Once we're confident no surface still links to `/auth/sign-in` (a follow-up cleanup once welcome.11 ships and bakes for a release), the redirect can be deleted.

### 2.3 What happens to `/auth/callback`

Unchanged. Supabase OAuth and magic-link callbacks continue to hit `/auth/callback`, which runs `useAuth().init()` and routes the user to `/`. The new OAuth providers reuse this exact flow.

---

## 3. Visual layers

The page is a stack of fixed-position layers, bottom to top:

```
z 1   DayScene        (Mondstadt windrise PNG, opacity bound to theme)
z 1   NightScene      (8 parallax layers + falling-star GIF, opacity bound to theme)
z 5   Vignette        (subtle radial darken, theme-aware)
z 10  PulseButton     ("► IT'S DANGEROUS TO GO ALONE! ENTER" — Zelda font)
z 10  Brand mark      ("문법 정원" + 화이팅 chip, never translated per memory)
z 15  ThemeToggle     (sun/moon pixel icon, top-right)
z 15  MusicToggle     (speaker pixel icon, next to ThemeToggle)
z 15  LocaleSwitcher  (existing component, restyled to the welcome surface)
z 20  Sidebar         (slides in from the right)
z 30  Dialog box      (slides up from the bottom)
z 40  ScanlineOverlay (the CRT line during transition)
```

Only the two scenes (`z 1`) crossfade on theme change. Everything else is layout-stable.

### 3.1 The day scene (light mode)

- Background: `windrise-background-4k.png` (~95 KB, ~4096×1536 px pixel art).
- Position: fixed, cover, centered. `image-rendering: pixelated`.
- One sprite overlay: a small dodo (the `dodo.png` from the asset pack), bobbing left↔right in a 12 s loop, positioned ~30 % from the bottom-left. CSS animation only, no JS.
- Tint: none. The asset's own palette carries.

### 3.2 The night scene (dark mode)

- 8 parallax layers (`Starry_night_Layer_1.png` … `Layer_8.png`).
- Each layer moves at a different parallax speed bound to mouse-X position (`translateX(calc(var(--mouse-x) * <factor>))`), so the scene gets depth on hover. On touch devices and `prefers-reduced-motion`, layers are static.
- Layer 8 is the deepest (moon + planet). Layer 1 is the closest (foreground stars).
- A falling-star GIF (`Starry_night_star_1920x1080.gif`) overlays at ~20 % opacity, positioned center-right, looped.

### 3.3 Brand mark

```
문법 정원
Korean Grammar Garden · 화이팅
```

- `문법 정원` in `Noto Sans KR`, large.
- Subtitle smaller, in the current UI language (i18n key), except 화이팅 — that always stays Korean per the project's brand mannerism.

---

## 4. The scanline transition

When the user clicks the ThemeToggle, the following happens over ~700 ms:

```
t=0       Toggle icon flips (sun⇄moon) via crisp pixel swap, plays a soft "click" SFX.
t=0..60   ScanlineOverlay paints a 4 px-tall horizontal line at y=0 (or y=100% on reverse).
          The line color: --sky-day for day→night, --sky-night for night→day.
          A faint horizontal blur band (~32 px) follows the line.
t=60..640 The line translates from top to bottom (or bottom to top). Behind it,
          a clip-path inset() reveals the NEW scene; ahead of it, the OLD scene is
          still visible. Two scene layers, two opposing inset clips.
t=640..700 Line fades to 0 opacity. Scenes complete crossfade. data-theme attribute
          flips on documentElement so child surfaces (toggle icon, etc.) re-pick the
          right vars. Music engine stays unaffected.
```

### 4.1 Direction rule

- **Day → Night** sweeps **top to bottom** (a curtain falling at sunset).
- **Night → Day** sweeps **bottom to top** (dawn rising).

### 4.2 Reduced motion fallback

If `(prefers-reduced-motion: reduce)`, replace the whole sequence with a 200 ms `opacity` crossfade on the two scenes — no scanline, no SFX.

### 4.3 Implementation hook

The animation is a single CSS keyframe pair (`@keyframes scanline-down` and `scanline-up`), driven by a `data-transition="entering-dark|entering-light"` attribute on a top-level `<div class="welcome">`. Vue toggles the attribute; CSS does the work.

---

## 5. The pulse button

A single, large, glowing button centered horizontally about 60 % down the viewport:

```
► ENTER · 들어가기
```

- Font: `'Press Start 2P'`, 14 px label.
- Border: 4 px solid `--gold` (re-used from current LADX palette).
- Pulse: 1.8 s ease-in-out infinite, scale `1 → 1.06 → 1`, opacity `0.9 → 1 → 0.9`, shadow glow synced.
- On click: open the sidebar (see §6).
- Hover: stop the pulse, swap to inverse (`--gold` bg, `--always-dark` text).

This is the only mandatory call-to-action above the fold. The locale switcher, music toggle, and theme toggle are subtle utility chrome.

---

## 6. The sidebar menu

Slides in from the right when the pulse button is clicked, when the user presses `Escape` to dismiss it returns. Width: `min(360px, 92vw)`. The skin matches the existing LADX `AppSidebar` (cream surface, jade border, chunky pixel shadow), so we don't fork a new aesthetic just for one page.

### 6.1 Content (in this order)

```
[CLOSE  ✕]                                  ← top-right, --danger pixel button

PARTY SELECT                                ← tiny --ink-soft label, Press Start 2P

▶ Continue with Kakao                       ← highlighted, yellow bg, dialog: "Hyrule's
                                              Korean gateway... continuing with Kakao."
▶ Continue with Google                      ← outline, dialog: "Adventurer recognized
                                              via Google..."
▶ Sign in with email                        ← outline, opens the inline email form
                                              (existing fields, just re-skinned)
▶ Create account with email                 ← same form, mode toggle
▶ Magic link by email                       ← same form, mode toggle

────                                         ← separator, --border

▶ Continue without account                  ← link-style, dialog: "Hyrule remembers
                                              local heroes too. Your progress lives on
                                              this device until you sign in."
```

### 6.2 Behavior

- Each item triggers a dialog box (§7) with one line of typewriter copy, then either runs the action (OAuth, anon entry) or expands an inline form (email modes).
- The email form is a tiny `WelcomeEmailForm` component — it owns its own email/password state. It reuses `useAuth().signIn / signUp / signInMagicLink`.
- Loading state on each item: a flicker dots indicator after the label (` . .  . . `).
- Errors: show in the dialog box with `role="alert"` and a red-tinted border.

### 6.3 Accessibility

- The sidebar is a `<dialog>` or focus-trap container (preferred: a `<dialog>` element with `open` toggled, since modern browsers handle focus and `Escape` automatically). Fallback for Safari < 16: `vue-focus-trap` from `@vueuse/core` (already a project dep).
- The pulse button has `aria-expanded`, `aria-controls`, and announces "Menu opened" via the sidebar's `aria-label`.
- Items are real `<button>` elements with full keyboard support (arrow keys move focus, Enter activates).

---

## 7. The dialog box

A horizontal black rectangle that slides up from the bottom of the screen, full-width with `max-width: 700px`, centered. Border 6 px solid `--ink` (light mode) / `--ink-soft` (dark mode). Anchored at `bottom: 24px`.

### 7.1 Typewriter effect

Text appears one character at a time, every 40 ms by default. Korean characters count as one tick each (we iterate `[...str]`, not `str.length`, to handle surrogate pairs and combined Hangul correctly).

When the full line is rendered, a blinking down-arrow appears bottom-right. Click or press `Enter` / `Space` to dismiss.

### 7.2 Composable

`useTypewriter(text: Ref<string>, opts: { speed?: number; onDone?: () => void })` returns `{ rendered, done, skip }`. Calling `skip()` flushes the rest of the line instantly (for users who press a key during animation).

### 7.3 Reduced motion

If `(prefers-reduced-motion: reduce)`, render the full string immediately and show the arrow at `t=0`.

### 7.4 Locale

Dialog copy lives in `i18n/locales/<locale>.json` under a new `welcome.dialog.*` block. Eight locales must be filled; the Korean chip 화이팅 stays untranslated everywhere.

---

## 8. Music

### 8.1 Behavior

- Off by default. There is **no autoplay**.
- The music engine boots on the first **user gesture** (clicking the pulse button, the toggle, or any sidebar item), per the WebAudio autoplay policy.
- A persistent `MusicToggle` button in the top-right corner shows the current state (speaker on / muted) and lets the user toggle at any time.
- State persists in `localStorage` under `mungarden:welcome:music = 'on' | 'off' | 'never'`.
  - `'on'` (default after first gesture): plays on every visit to `/welcome`.
  - `'off'`: muted, but the engine is still primed (toggling re-enables instantly).
  - `'never'`: user clicked the toggle while muted and held it for 1 s; the engine never boots on this device again. (Stretch — not required for v1.)
- Volume: 0.20 (~20 %).

### 8.2 File

`/public/welcome/audio/welcome-loop.mp3` — **placeholder** (silent 1 s file) in this spec. The user will provide the real loop later, after we verify everything else works. Spec is unblocked on this.

### 8.3 Composable

`useWelcomeMusic()` exposes `{ state, toggle, ready }`. `ready` is a `Ref<boolean>` that the toggle uses to gray itself out before the first gesture. The composable lazy-loads the Audio element on first use.

---

## 9. Palette additions

The LADX tokens stay the canonical UI palette. We add only **two new tokens** specifically for the scanline tint:

```css
/* tokens/colors-light.css :root */
--sky-day: #87d5ff;     /* the bright daytime sky band */
--sky-night: #2a1a4a;   /* the deep starlit sky band */

/* tokens/colors-dark.css [data-theme="dark"] */
/* same values — these are theme-invariants, just like --always-dark */
```

No other surface uses these tokens. They live in the scanline overlay and nowhere else. The Mondstadt and Starry Night PNGs carry their own world palettes — the LADX surface chrome floats above them.

---

## 10. File layout

Following the project's "no god files" rule, the welcome page is split by responsibility:

```
munbeop/
├── app/
│   ├── pages/
│   │   └── welcome.vue                       # ~140 LOC shell
│   ├── components/welcome/
│   │   ├── WelcomeStage.vue                  # day+night scene container + scanline overlay
│   │   ├── WelcomeDayScene.vue               # Mondstadt windrise + dodo
│   │   ├── WelcomeNightScene.vue             # 8 parallax layers + falling star
│   │   ├── WelcomeBrandMark.vue              # 문법 정원 + 화이팅
│   │   ├── WelcomeThemeToggle.vue            # sun/moon pixel icon
│   │   ├── WelcomeMusicToggle.vue            # speaker pixel icon
│   │   ├── WelcomePulseButton.vue            # ENTER · 들어가기
│   │   ├── WelcomeSidebar.vue                # the menu container + focus trap
│   │   ├── WelcomeAuthOptions.vue            # the 5 buttons + dispatcher
│   │   ├── WelcomeEmailForm.vue              # the inline email/password/magic-link form
│   │   ├── WelcomeDialog.vue                 # typewriter dialog box
│   │   └── WelcomeScanlineOverlay.vue        # the 4 px line + CSS keyframes
│   ├── composables/
│   │   ├── useTypewriter.ts                  # generic, reusable
│   │   └── useWelcomeMusic.ts                # welcome-specific
│   ├── lib/
│   │   └── auth/oauth.ts                     # `signInWithOAuth('kakao' | 'google')`
│   ├── middleware/
│   │   └── welcome-redirect.global.ts        # decides /, /welcome routing
│   └── assets/styles/tokens/
│       └── colors-light.css                  # +2 tokens (sky-day, sky-night)
│       └── colors-dark.css                   # (no changes — sky tokens inherit)
└── public/welcome/
    ├── day/
    │   ├── garden-day.png                    # renamed from windrise-background-4k.png
    │   └── dodo.png
    ├── night/
    │   ├── layer-1.png … layer-8.png
    │   └── falling-star.gif
    └── audio/
        └── welcome-loop.mp3                  # placeholder (silent 1 s)
```

Asset filenames are renamed to neutral names so we don't ship strings that name miHoYo IP ("Mondstadt", "Windrise"). The credit goes into a footer chip and `/credits` (out of scope for this spec; tracked as a follow-up).

---

## 11. i18n keys

A new `welcome.*` block in each of the 8 locale files (`en`, `es`, `fr`, `id`, `ja`, `pt-BR`, `th`, `vi`):

```json
{
  "welcome": {
    "brand": {
      "subtitle": "Korean Grammar Garden"
    },
    "enter": "Enter · 들어가기",
    "menu": {
      "title": "Party Select",
      "kakao": "Continue with Kakao",
      "google": "Continue with Google",
      "email_signin": "Sign in with email",
      "email_signup": "Create account with email",
      "email_magic": "Magic link by email",
      "anon": "Continue without account",
      "close": "Close"
    },
    "dialog": {
      "intro_day": "Welcome to the garden. The sun is up; the grammar grows.",
      "intro_night": "The sky is purple. The grammar still grows. 화이팅.",
      "kakao": "Continuing with Kakao…",
      "google": "Continuing with Google…",
      "anon": "No account needed. Your progress lives on this device until you sign in.",
      "error_oauth": "Something went wrong with that sign-in. Try another method?"
    }
  }
}
```

화이팅 stays Korean in every locale (per project memory).

---

## 12. Auth wiring

### 12.1 New composable surface

`useAuth()` (existing) gains one method:

```ts
async function signInWithProvider(provider: 'kakao' | 'google') {
  const config = useRuntimeConfig()
  const base = (config.public.appUrl as string) || window.location.origin
  const { error } = await $supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${base}/auth/callback` },
  })
  // No post-login work here — the callback page runs runPostLoginMigration().
  return { error }
}
```

### 12.2 Supabase config (out of code)

These steps live in the deployment runbook, not in the codebase:

1. In the Supabase dashboard (project ref `mungarden`, region `ap-southeast-1`): enable Google and Kakao providers.
2. Add the OAuth client IDs and secrets for both.
3. Add `https://mungarden.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` to the redirect allow-list.

Tracked as a checklist item in the implementation plan, not as code in this PR.

### 12.3 Anonymous entry

Clicking "Continue without account" calls `setWelcomed()` (writes the `mungarden:welcomed` flag) and routes the user to `/`. No Supabase call. The existing in-app stores fall back to `localStorage` automatically — same path that exists today.

---

## 13. Error handling

| Failure mode | Where caught | What the user sees |
|---|---|---|
| OAuth provider returns an error (user denied, popup blocked) | `signInWithProvider` returns `{ error }` | Dialog box flips to error variant with the message; sidebar stays open. |
| Email sign-in returns an invalid-credentials error | `signIn` returns `{ error }` | Dialog box shows the message; form fields stay populated. |
| Network failure on OAuth redirect | `/auth/callback` page (existing) | Existing toast + redirect to `/` (no change). |
| Audio element fails to load (404 on placeholder) | `useWelcomeMusic` catches and sets `state.error = true` | Music toggle dims out; no toast (silent failure is OK for music). |
| Day or night image fails to load | `<img onerror>` in the scene component | Fallback to a solid `--sky-day` / `--sky-night` color. No toast. |

No new toast surfaces are introduced; the existing `useToast` is enough.

---

## 14. Testing

Vitest is the existing test runner. Coverage targets:

- **Unit**: `useTypewriter` (chars-per-tick, skip behavior, reduced-motion bypass).
- **Unit**: `useWelcomeMusic` (state persistence, gesture-gated init).
- **Unit**: `welcome-redirect.global` middleware (the truth table in §2.1, four scenarios).
- **Component**: `WelcomeSidebar` (focus trap, Escape closes, arrow keys move focus).
- **Component**: `WelcomeScanlineOverlay` snapshot-on-attribute-change (the data-transition flip).
- **Component**: `WelcomeAuthOptions` (each button dispatches the right intent, error state renders).
- **No e2e in this spec.** Browser verification is manual via `pnpm dev` + Playwright preview during the verify pass.

---

## 15. Out of scope (tracked as follow-ups)

- A real music loop file (user provides after verification).
- `/credits` page with theflavare attribution.
- Pricing page.
- Terms of Service page.
- A "Skip the welcome" preference in `/settings` for users who want to disable the redirect logic entirely.
- A `LocaleSwitcher` skin variant for the welcome surface (we'll use the existing one as-is in v1).
- Real OAuth client IDs in Supabase (a checklist step in the implementation plan, not a code change here).

---

## 16. Phasing

The implementation is broken into small, independently verifiable and mergeable pieces:

1. **welcome.1 — Assets + tokens**: copy renamed assets into `public/welcome/`, add `--sky-day` / `--sky-night` tokens.
2. **welcome.2 — Composables**: `useTypewriter` + tests, `useWelcomeMusic` + tests.
3. **welcome.3 — Scene layers**: `WelcomeStage`, `WelcomeDayScene`, `WelcomeNightScene`.
4. **welcome.4 — Scanline overlay**: `WelcomeScanlineOverlay` + day↔night animation.
5. **welcome.5 — Brand + chrome**: `WelcomeBrandMark`, `WelcomeThemeToggle`, `WelcomeMusicToggle`, `WelcomePulseButton`.
6. **welcome.6 — Sidebar shell**: `WelcomeSidebar` with focus trap, close button, Escape handling.
7. **welcome.7 — Dialog box**: `WelcomeDialog` driven by `useTypewriter`.
8. **welcome.8 — Auth options**: `WelcomeAuthOptions`, `WelcomeEmailForm`, `signInWithProvider`.
9. **welcome.9 — i18n**: `welcome.*` block in all 8 locales.
10. **welcome.10 — Page shell + route**: `pages/welcome.vue` wiring it all together.
11. **welcome.11 — Redirect middleware**: `welcome-redirect.global.ts` + tests + `/auth/sign-in` → `/welcome?open=signin&mode=signin` redirect + welcome.vue reads the query params to auto-open the sidebar and pre-select the email-form mode.
12. **welcome.12 — Verify pass**: full dev-server walk-through (light, dark, sidebar, dialog, OAuth stubs, reduced-motion).

Each phase ships as one commit on this branch, then fast-forwards `main`. Tests + typecheck must pass before each commit.
