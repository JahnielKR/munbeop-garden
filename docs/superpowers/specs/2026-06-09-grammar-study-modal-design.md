# Grammar Study Modal — Design Spec

**Status:** approved, ready to plan
**Date:** 2026-06-09
**Branch:** `claude/elastic-leavitt-5898c9`

## Motivation

Library cards today are static — `ko`, `meaning`, `example`, `trans`, mastery
badge. Good for skimming, weak for studying. Clicking a card should open a
"study sheet": full explanation, usage notes, personal SRS progress, a CTA
to practice the pattern right now, plus reserved sections for audio, extra
examples, and earnable achievements (future).

The user's source idea (`idea de flip de carta.md`) sketched a Vue 3 modal
overlay with pixel-art styling. Title said "flip" but the code was a modal;
we picked the modal path (overlay, centered, scale-in animation), not a 3D
card rotation. See Section "Decisions" for the rationale.

## Scope

### In (this PR)

- New primitive `Modal.vue` in `components/ui/` (teleport, overlay, focus
  trap, Esc, click-outside, scroll-lock, pixel-pop transition).
- New `GrammarStudySheet.vue` in `components/library/` plus six section
  sub-components in `components/library/GrammarStudySheet/`.
- New composable `composables/useGrammarModal.ts` that syncs the modal
  state with `?grammar=<ko>` query param.
- Edits to `pages/library.vue`: cards become clickable, mount one shared
  Modal + GrammarStudySheet driven by the composable.
- Domain extension: add optional `usageNotes?: LocalizedString` to
  `Grammar` interface.
- Seed `usageNotes` for TOPIK 1 and TOPIK 2 grammars (99 entries: 53 in
  `n1.ts` + 46 in `n2.ts`) in all 8 locales.
- i18n keys for modal chrome (section titles, CTAs, "coming soon"
  placeholders) added to all 8 locales.
- Unit tests for Modal primitive, GrammarStudySheet, `useGrammarModal`,
  and a seed-completeness canary.

### Out (future PRs)

- Pronunciation audio (no `audioUrl` field added yet).
- Extra example sentences (no `extraExamples` field added yet).
- Earnable achievements/icons (no `achievementIds` field added yet).
- `usageNotes` for TOPIK 3–6 (left `undefined`, sheet shows "Coming soon").
- Opening the modal from inside Practice (v1 = Library only).
- True 3D CSS card flip animation — rejected, see Decisions.
- Prev/next navigation between grammars inside the modal (← →).

## Decisions

- **Modal overlay, not 3D flip.** User confirmed: title of the source idea
  said "flip" but the pasted code was a modal. Modal gives more room for the
  study-sheet content, is easier to make accessible, and matches the pasted
  code. We keep the `pixelPop` scale-step transition for the open animation.
- **Always centered, never full-screen — even on mobile.** Overlay keeps a
  visible padding around the modal (16px mobile, 24px desktop). Content
  scrolls internally when it overflows; the header (`ko` + close button)
  stays sticky so the user always knows what they are reading.
- **Single Modal instance, teleported to `<body>`, mounted in
  `pages/library.vue`.** Driven by `?grammar=<ko>` in the URL. No per-card
  modals.
- **URL is the source of truth.** Opening = `router.push({query: ..., grammar})`,
  closing = `router.replace({query: ...})` (replace, to not spam history).
  Back button closes the modal without leaving Library.
- **Domain extension is minimal (one new field).** Only `usageNotes` lands
  this PR. `audioUrl`, `extraExamples`, `achievementIds` land in their own
  feature PRs to keep this one focused.
- **Modal does not write to SRS.** Open ≠ practice. Only Practice writes SRS.
- **CTA "Practice this now" navigates to `/practice?focus=<ko>`.** Requires
  a small change in `usePractice` to honor `?focus=` and filter the pool to
  the single grammar. If that change exceeds ~30 LOC it is split into a
  sub-PR, surfaced when writing the implementation plan.
- **Split into many small components.** One `Modal.vue` primitive,
  one `GrammarStudySheet.vue` orchestrator, six section sub-components.
  No file exceeds ~120 LOC. Respects the project's "no god files" rule.

## File Layout

```
app/
  components/
    ui/
      Modal.vue                       NEW. Primitive.
    library/
      GrammarStudySheet.vue           NEW. Orchestrator.
      GrammarStudySheet/
        HeaderRow.vue                 NEW. Sticky: ko + mastery badge + close.
        MeaningSection.vue            NEW. meaning + example + trans.
        UsageNotesSection.vue         NEW. usageNotes or coming-soon.
        SrsProgressSection.vue        NEW. Mastery + lastSeen + count.
        PracticeCtaSection.vue        NEW. "Practice this now" button.
        ComingSoonSection.vue         NEW. Generic placeholder block.
  lib/
    domain/
      grammar.ts                      EDIT. Add usageNotes?: LocalizedString.
  seed/
    grammars-n1.ts                    EDIT. Add usageNotes for every entry.
    grammars-n2.ts                    EDIT. Same.
    grammars-n3.ts ... n6.ts          unchanged.
  pages/
    library.vue                       EDIT. Clickable cards + mount Modal.
  composables/
    useGrammarModal.ts                NEW. ?grammar= ↔ state sync.

i18n/locales/
  en.json, es.json, fr.json, id.json,
  ja.json, pt-BR.json, th.json, vi.json   EDIT. Add library.modal.* keys.

tests/
  components/
    Modal.spec.ts                     NEW.
    GrammarStudySheet.spec.ts         NEW.
  composables/
    useGrammarModal.spec.ts           NEW.
  unit/
    grammars-seed-completeness.spec.ts NEW. Canary on TOPIK 1-2 usageNotes
                                            and on TOPIK 3-6 staying empty.
```

Total expected new code: ~600 LOC across 12 files. Largest single file
(`Modal.vue`) ~120 LOC. Largest test file ~150 LOC. No file is a god file.

## Responsibilities — One Thing Per Unit

| Unit | Knows | Does not know |
|---|---|---|
| `Modal.vue` | teleport, overlay, focus trap, Esc, click-outside, scroll-lock, transition | grammar, SRS, content i18n |
| `useGrammarModal.ts` | `?grammar=` ↔ open/closed state, resolve `ko` → `Grammar` | layout, animation, accessibility |
| `GrammarStudySheet.vue` | which sections render, props pass-through | each section's internal markup |
| `*Section.vue` (six of them) | its own block | the modal, the URL, other sections |
| `pages/library.vue` | mounts `<Modal>` with `<GrammarStudySheet>`, makes cards clickable | modal internals |

## Domain Change

```ts
// app/lib/domain/grammar.ts
export interface Grammar {
  ko: string
  meaning: LocalizedString
  example?: string
  trans?: LocalizedString
  deckId: string
  /**
   * Usage notes per locale — when to use the pattern, common pitfalls,
   * register (formal/informal), confusion with similar patterns.
   * Multi-paragraph free text. Optional: entries without notes render
   * the "Coming soon" placeholder in the study sheet.
   */
  usageNotes?: LocalizedString
}
```

One new optional field, reuses `LocalizedString`. No new types.

## Seed: `usageNotes` for TOPIK 1–2

Every entry in `seed/grammars-n1.ts` and `seed/grammars-n2.ts` gets a
`usageNotes` field with all 8 locales filled. `seed/grammars-n3.ts` through
`grammars-n6.ts` are NOT touched in this PR — those entries keep
`usageNotes === undefined` and the sheet shows "Coming soon" for that
section.

Volume: 53 (n1) + 46 (n2) = 99 entries × 8 locales = **792 strings** of
usage-note content. Mechanical but slow — budget a separate writing pass.

Writing convention to keep consistency across all 50 entries (2–4
sentences each):

1. **When and why** — when the pattern is used, what effect it gives.
2. **Grammar rule** — verb/adjective compatibility, preceding particle,
   irregular conjugation notes.
3. **Confusion warning** (optional) — which similar pattern it gets mixed
   up with and how to tell them apart.
4. **Register / context** (optional) — formality level, typical setting.

## i18n: Modal Chrome Keys

Added under existing `library` namespace in all 8 locales:

```jsonc
"library": {
  "lead": "...",
  "modal": {
    "close": "Close",
    "section": {
      "meaning": "Meaning",
      "usage_notes": "Usage notes",
      "your_progress": "Your progress",
      "examples": "Examples",
      "audio": "Pronunciation",
      "achievements": "Achievements",
      "practice_cta": "Practice this now"
    },
    "srs": {
      "mastery_label": "Mastery",
      "last_seen": "Last seen",
      "last_seen_never": "Never practiced yet",
      "times_practiced": "Times practiced"
    },
    "coming_soon": {
      "audio": "Pronunciation audio is coming soon. 화이팅!",
      "examples": "More example sentences are coming soon.",
      "achievements": "Achievements you can earn with this grammar are coming soon.",
      "usage_notes": "Detailed usage notes for this grammar are coming soon."
    }
  }
}
```

Rules respected:
- "화이팅" stays Korean in every locale (project rule).
- Only UI chrome strings get i18n keys — grammar content stays in
  `Grammar.usageNotes` which is per-locale at the data layer.

## Data Flow

State is derived from the URL — the modal has no independent open/closed
boolean. Single source of truth: `route.query.grammar`.

```ts
// composables/useGrammarModal.ts, sketch
export function useGrammarModal() {
  const route = useRoute()
  const router = useRouter()
  const grammarStore = useGrammarStore()

  const selected = computed<Grammar | null>(() => {
    const ko = route.query.grammar
    if (typeof ko !== 'string' || !ko) return null
    return grammarStore.grammarByKo(ko) ?? null
  })

  const isOpen = computed(() => selected.value !== null)

  async function open(ko: string) {
    await router.push({ query: { ...route.query, grammar: ko } })
  }

  async function close() {
    const { grammar: _omit, ...rest } = route.query
    await router.replace({ query: rest })
  }

  return { selected, isOpen, open, close }
}
```

**Why `push` to open, `replace` to close:** push enters history → back
button closes the modal without leaving Library; replace on close avoids
polluting history when the user toggles the same modal many times.

### Flow

```
[click on Card "-(으)니까"]
   → library.vue handler → useGrammarModal.open('-(으)니까')
   → router.push → URL = /library?grammar=-(으)니까
   → useRoute reactive → selected.value resolves to Grammar
   → isOpen.value === true
   → <Modal :open="isOpen"> teleports to <body>, focus moves to close button,
     scroll-lock on
   → <GrammarStudySheet :grammar="selected"> renders sections
```

```
[Esc | click outside | X button | browser back]
   → Modal emits 'close' → useGrammarModal.close() (or, for back button,
     router already moved and selected becomes null automatically)
   → router.replace → URL loses query
   → selected.value = null → isOpen = false
   → Modal plays exit transition → unmounts → focus returns to source Card
```

### Edge Cases

| Situation | Behavior |
|---|---|
| Refresh on `/library?grammar=-게-되다` | Modal opens after store hydrates. `selected` is `null` for one tick then resolves; entry transition hides the flicker. |
| `?grammar=nonexistent-pattern` | `grammarByKo` returns undefined → `selected = null` → modal does NOT open. Query is cleaned with `router.replace`. No toast (low value, noise). |
| User opens modal A, then clicks Card B without closing | `open(B)` replaces the query → `selected` updates → sheet re-renders new content without unmounting the Modal. `<GrammarStudySheet :key="grammar.ko">` forces clean section state and resets scroll-top. |
| `?grammar=` with empty value | Treated as closed; same path as nonexistent. |
| Modal open and that grammar's deck is collapsed in Library | No interference. Modal lives above overlay; deck state restored on close. |
| Modal open and user navigates to `/practice` | `useGrammarModal` only mounts in library.vue → modal disappears with the page. No extra code. |
| Same `?grammar=` already present when `open(ko)` is called | `router.push` to same URL is a no-op — no duplicate history entry. |

### CTA "Practice this now"

```ts
// PracticeCtaSection.vue
async function onPracticeNow() {
  await router.push({
    path: '/practice',
    query: { focus: props.grammar.ko },
  })
}
```

`usePractice` gains: if `route.query.focus` exists, filter the active pool
to that single grammar and start the round. If that change exceeds ~30 LOC
it is split into its own sub-PR; we decide when writing the implementation
plan.

## Out-of-Scope Behaviors (v1)

- Opening the modal does NOT mark the grammar as "seen" in SRS. Practice is
  the only writer.
- No "last viewed grammar" persistence — the URL is the share/return
  mechanism.
- No prev/next navigation between grammars inside the modal — possible v2.
- No audio precache — there is no audio yet.

## Testing

### Unit tests (new)

`tests/components/Modal.spec.ts`
- Renders slot when `open=true`, hidden when `false`.
- Esc emits `close`.
- Click on overlay emits `close`.
- Click on content does NOT emit `close`.
- X button emits `close`.
- Focus moves to first focusable on open.
- Tab cycles inside the modal (focus trap).
- Body gets scroll-lock class on open, loses it on close.
- Teleports to `<body>`.

`tests/components/GrammarStudySheet.spec.ts`
- Renders `ko`, `meaning`, `example`, `trans` when present.
- Hides `example` / `trans` when undefined.
- Renders `usageNotes` when present; renders `ComingSoonSection` when
  `undefined`.
- Always renders `ComingSoonSection` for audio / examples / achievements
  in v1.
- `SrsProgressSection` shows current mastery from a mocked SRS store.
- `SrsProgressSection` shows "Never practiced yet" when `lastSeen === null`.
- Practice CTA emits the event with the correct `ko`.

`tests/composables/useGrammarModal.spec.ts`
- `selected` resolves a valid grammar from `?grammar=ko`.
- `selected` is `null` when query is empty.
- `selected` is `null` for unknown `ko`; query gets cleaned via
  `router.replace`.
- `open(ko)` calls `router.push` with the query.
- `close()` calls `router.replace` preserving other query params
  (e.g. `?theme=dark&grammar=X` → `?theme=dark`).
- `isOpen === (selected !== null)`.

`tests/unit/grammars-seed-completeness.spec.ts`
- Every TOPIK 1-2 grammar has `usageNotes` defined.
- For each TOPIK 1-2 grammar, all 8 locales of `usageNotes` are present and
  >20 chars.
- Every TOPIK 3-6 grammar still has `usageNotes === undefined` (canary
  against accidental partial seeding).

### Test fixtures and mocks

`useRoute` and `useRouter` mocked via the existing test stub
(`tests/nuxt-imports-stub.ts`). `useGrammarStore` stubbed to return a
single fixed `Grammar`. No Supabase, no real SRS.

### Manual verification (golden path + edge cases)

Run dev server (`pnpm dev` from `/munbeop`) and verify in browser. The
feature is NOT complete without these checks.

Golden path:
1. Open `/library` — decks render with cards.
2. Click a card — modal opens, URL becomes `?grammar=...`, focus on close
   button.
3. Tab repeatedly — focus stays inside the modal.
4. Esc — modal closes, URL is `/library`, focus returns to the source card.
5. Click another card — modal content swaps cleanly.
6. Click "Practice this now" — navigates to `/practice?focus=<ko>`, modal
   gone, Practice starts with that grammar.

Edge cases:

7. Reload with `?grammar=-게-되다` in URL — modal opens after hydration.
8. Reload with `?grammar=fake-pattern` — modal does NOT open, URL cleaned.
9. Open `?grammar=...` URL in fresh incognito window — deep link works.
10. Browser back button with modal open — modal closes (does NOT leave
    Library).
11. Switch locale to Japanese with modal open — sheet content updates
    reactively.
12. TOPIK 1 grammar (seeded) — "Usage notes" section shows text.
13. TOPIK 4 grammar (not seeded) — "Usage notes" shows "Coming soon".
14. Mobile viewport (360px) — modal still centered with visible margin,
    not full-screen. Internal scroll works when content overflows.
15. Dark mode — modal respects `--paper`, `--ink`, `--ink-line` tokens.

### Pre/post-commit verification

Project rule: `verify → commit → verify → push`.

Before each commit:
- `pnpm typecheck` (has caught real bugs before — load-bearing).
- `pnpm test`.
- `pnpm lint`.

After commit, before push:
- All three again.
- `pnpm build` (Nuxt 4 SPA — some errors only surface in build).
- Smoke 3–4 critical flows manually.

## Risks

- **Seeding 792 strings.** Mostly content work, not code. Slow but
  mechanical. The seed-completeness test catches missing locales. Consider
  splitting into two PRs (`n1` then `n2`) if the writing pass drags — the
  modal architecture works fine with partial seed; TOPIK 2 entries just
  show "Coming soon" until the second PR lands.
- **`usePractice` change for `?focus=`.** Touches code outside the modal.
  If diff exceeds ~30 LOC, split into a sub-PR.
- **Focus-trap edge cases.** Esc inside a select dropdown inside the
  modal, screen reader virtualization. Covered by tests for the common
  cases; flag in PR for reviewer eyeballs.
- **Refresh flicker on deep link.** `selected = null` for one tick while
  the store hydrates. Mitigated by the entry transition; if visible in
  manual testing, add a one-tick `v-if="grammarStore.hydrated"` guard.
- **Scroll-lock on iOS.** Known iOS quirk where `body { overflow: hidden }`
  does not always stop touch scroll. If reproduced in manual testing,
  switch to `position: fixed; top: -scrollY` pattern.

## Open Questions

None blocking — every major decision is pinned above. Implementation plan
will surface tactical questions (test file location conventions, exact
transition timing values, whether `PracticeCtaSection` lives or gets
inlined).

## Source Document

The original idea (`idea de flip de carta.md` — a Vue 3 modal sketch by
the user) is in the user's Desktop folder. It informed the pixel-pop
animation, the close-button shape, and the centered-overlay decision.
