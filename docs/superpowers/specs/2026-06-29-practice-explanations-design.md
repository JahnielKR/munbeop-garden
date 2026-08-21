# Practice-mode explanation modals — design

**Date:** 2026-06-29
**Status:** Approved design, pending implementation plan
**Scope (this spec):** A reusable "Explanation" button + modal on each practice mode that
teaches the underlying concept (e.g. what honorifics are, their types) and how the game
works. Content expansion of each mode (more drill items) is a **separate** follow-up effort,
explicitly out of scope here.

## Goal

Every practice lab should be able to teach before it drills. A learner who opens a lab they
have never seen (honorifics, counters, particles…) should be one click away from a clear,
localized mini-lesson: what the concept is, its types with real Korean examples, and how to
play this specific mode.

Decided in brainstorming:
- **Phase focus:** the explanation modal first; content expansion is a later, separate spec.
- **Modal depth:** mini-lesson (concept + types + real Korean examples) **plus** how-to-play.
- **Rollout:** build the full pattern on one pilot mode (`register` / 높임법), then template
  the rest.

## Existing building blocks (reused, not rebuilt)

- `app/components/ui/Modal.vue` — focus trap, ESC, overlay-click, scroll-lock, body slot,
  `title`/`labelledby` for the dialog aria. The explanation modal mounts on top of this.
- `app/seed/locale.ts` — `L(en, es, fr, pt-BR, th, id, vi, ja)` positional constructor for a
  `LocalizedString`. The compiler forces all 8 locales — no partials possible.
- `app/lib/domain/i18n.ts` — `LocalizedString`, `LOCALE_CODES`, `localized()` resolver
  (locale → `en` fallback → first non-empty).
- `app/composables/useLocalized.ts` — `tl(value)` renders a `LocalizedString` in the active
  locale; this is the template helper.
- Precedent for structured, translatable pedagogical content with inline Korean examples:
  `app/seed/usage-notes/*.ts` (`Record<string, LocalizedString>` via `L()`).

## Architecture

```
app/lib/domain/practice-help.ts          type PracticeHelpContent / PracticeHelpType
app/seed/practice-help/
  ├─ register.ts                          pilot content, 8 locales via L()
  ├─ particles.ts | conjugation.ts | …    one file per mode (Phase 2)
  └─ index.ts                             PRACTICE_HELP: Record<ModeId, PracticeHelpContent>
app/components/practice/PracticeHelp.vue  button + modal, resolves content + locale
i18n/locales/*.json → practiceHelp.*      UI chrome only (button, section titles, close aria)
```

Data flow: each practice page mounts `<PracticeHelp mode="register" />`. The component looks
up `PRACTICE_HELP[mode]`. If an entry exists it renders the trigger button; clicking opens the
`Modal` and renders the content resolved with `tl()`. **If no entry exists, nothing renders**
(no broken button) — so all pages can be wired now and content filled in incrementally.

## Content model

```ts
// app/lib/domain/practice-help.ts
import type { LocalizedString } from './i18n'

export interface PracticeHelpType {
  ko: string                 // '주체 높임'  — language-neutral, not translated
  label: LocalizedString     // 'del sujeto'
  desc: LocalizedString      // the explanatory paragraph
  example: string            // '할아버지께서 신문을 읽으세요.' — neutral
  gloss: LocalizedString     // 'El abuelo lee el periódico.'
}

export interface PracticeHelpContent {
  ko: string                  // '높임법' — modal headline
  romanization?: string       // 'nopimbeop'
  subtitle: LocalizedString   // 'el sistema de honoríficos'
  concept: LocalizedString    // "what is it?"
  types?: PracticeHelpType[]  // optional (cloze/placement may omit)
  howToPlay: LocalizedString[]// short numbered steps
  tip?: LocalizedString       // optional
}

export type PracticeHelpMode =
  | 'ruleta' | 'particles' | 'conjugation' | 'register' | 'cloze'
  | 'counters' | 'placement' | 'number-market' | 'rescue'
```

Resolved open questions:
- **Audio on examples:** deferred to a later phase. The model already stores the Korean
  string, so wiring `useExampleAudio` later is additive — but each new example would need a
  TTS clip in the audio manifest, which would bloat the pilot. Text first.
- **Romanization:** only on the concept headline (높임법 → *nopimbeop*); examples stay
  Korean + gloss, consistent with the rest of the app (which teaches Hangul, not romaji).
- **How-to-play:** array of ≤4 short steps; the last step may mention mastery / plant growth.
- **Button placement:** beside the `BilingualTitle`.

## Component — `app/components/practice/PracticeHelp.vue`

- Props: `mode: PracticeHelpMode`.
- Open state: a local `ref` (does NOT touch the URL or the `mode`/`set` query routing, so it
  never interferes with `GameLeaveGuard`).
- Renders a trigger button only when `PRACTICE_HELP[mode]` exists.
- On open, renders `ui/Modal.vue` with `:title="content.ko"` for the dialog aria-label.
- Sections (conditional): `concept` always; `types` only if present; `howToPlay`; `tip` only
  if present. All localized text via `useLocalized().tl()`.
- Chrome strings from i18n: `practiceHelp.button`, `practiceHelp.close`,
  `practiceHelp.section.concept`, `practiceHelp.section.types`,
  `practiceHelp.section.howToPlay`, `practiceHelp.section.tip`.

## Integration — wire into all practice pages

Add `<PracticeHelp mode="…" />` beside the title in:
`ruleta`, `particles`, `conjugation`, `register`, `cloze`, `counters`, `placement`,
`number-market`, `rescue`. **Escape room is excluded** — it already has its own narrative
framing (the level notebook).

Per-mode concept outline (content authored against this):
- `register` (pilot): 높임법 — concept + 3 types (주체/객체/상대 높임) + how-to-play (mentions
  both the level and honor modes) + tip (계시다 vs 있으시다).
- `particles`: 조사 — what particles are; types ≈ explore vs clash framing / particle roles.
- `conjugation`: verb conjugation basics; types ≈ verb groups / stem+ending.
- `counters`: 수 분류사 — classifiers; types ≈ native vs Sino number systems.
- `number-market`: Korean numbers; types ≈ native vs Sino-Korean; how-to-play covers the 3
  sub-modes (learn / speed / dictation).
- `cloze`, `placement`: lighter — mostly "what this is / how it works", `types` likely omitted.
- `ruleta`: the SRS card loop + the garden mastery metaphor.
- `rescue`: what a "struggling plant" (leech) is and why to review it.

## i18n and tests

- **Content** (concept/types/howToPlay/tip): TS via `L()` → 8 locales compiler-guaranteed,
  no JSON edits.
- **Chrome** (`practiceHelp.*`): new keys in all 8 `i18n/locales/*.json`.
- New tests:
  1. `tests/unit/i18n/practice-help-keys.test.ts` — `practiceHelp.*` key parity across the 8
     locales (mirrors `register-transform/i18n-keys.test.ts`).
  2. `tests/unit/practice-help/seed-invariants.test.ts` — for each entry: `ko`/`example`
     non-empty; `concept`/`label`/`desc`/`gloss`/`howToPlay`/`tip` present in all 8 locales;
     `mode` is a known `PracticeHelpMode` (mirrors `counters/seed-invariants.test.ts`).
  3. `tests/components/practice/PracticeHelp.test.ts` — renders the button when an entry
     exists; opens/closes the modal; omits the `types` section when absent. Uses the project's
     i18n key-echo stub; SUT import kept at top of file (eslint `import/first` + vi.mock
     hoisting convention).

## Delivery sequence (for the implementation plan)

- **Phase 1 (one PR):** domain type + `PRACTICE_HELP` registry + `PracticeHelp.vue` + full
  `register` content (8 locales) + wire the component into all 9 pages + chrome keys + the 3
  tests. Result: honorifics has a real modal; the other pages already host the component and
  light up as their content lands.
- **Phase 2:** the other 8 modes, one seed file per mode (the button auto-appears). May be
  batched or one-by-one, each with native review (owner's wife) of the Korean examples and
  the 8 translations.

## Out of scope (named so it isn't assumed)

- Content expansion (more drill items per mode) — separate spec.
- Audio playback on modal examples — additive later phase.
- Explanation modal on the escape room — it has its own narrative intro.
- Deep-linking the modal via URL query — local state is sufficient.

## Testing strategy summary

Gates that must stay green: `vitest` (the 3 new suites + existing), `vue-tsc` typecheck
(catches missing `L()` locales and type drift), `eslint`. Manual: owner logged-in smoke of
the register modal in 2-3 locales; native review of Korean examples + the 8 translations.
