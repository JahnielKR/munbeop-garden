# Usage notes: detailed multi-locale notes for every grammar

**Date:** 2026-06-26
**Status:** In progress (per-level rollout)
**Workstream:** 3 of 3 in the library-polish epic (pronunciation → achievements → **usage notes**)

## Problem

The study sheet's `UsageNotesSection` renders `Grammar.usageNotes` when present, else
a "Coming soon" placeholder. Only TOPIK 1 (53/53) and part of TOPIK 2 (13/46) were
authored; TOPIK 3–6 (201 points) were deliberately left empty and a test forced them
to stay `undefined` ("out of v1 scope"). The owner wants **every** remaining grammar
(~234) to carry a **detailed** usage note in all 8 locales.

## Depth (owner: "detailed")

Two paragraphs (blank line between), matching the existing TOPIK 1 voice:
1. Meaning + the exact form/allomorph attachment rule with concrete 받침 examples
   (vowel/ㄹ stem vs consonant stem) and what it attaches to / how it conjugates.
2. Contrast with one genuinely confusable neighbour grammar (named, with a minimal
   pair), plus register/politeness notes and the most common learner mistake.

`es` uses the app's established Rioplatense-informal voseo voice; Korean examples are
kept verbatim across all locales.

## Authoring pipeline (`tools`-free, in-session Workflow)

`author-usage-notes` Workflow, run once per TOPIK level over its missing entries:
1. **Author** — a Korean-teacher agent writes the EN canonical note (grounded by the
   entry's `meaning`).
2. **Verify** — an adversarial Korean-linguistics reviewer checks form rules, 받침
   examples, the contrast, grammaticality and register; it rewrites on any error.
3. **Translate** — faithful translation to es/fr/pt-BR/th/id/vi/ja, Hangul preserved.

The result is integrated into `app/seed/grammars-n{N}.ts` by inserting
`usageNotes: L(...)` before each entry's `deckId` (CRLF-safe codemod). The `L()` helper
makes a missing locale a compile error.

## Rollout (1 PR per level)

- **TOPIK 2** (this PR) — author the 33 missing; flip the completeness test's
  `describe.skip('TOPIK 1 + 2')` → `describe` (it now asserts all 99 TOPIK 1+2 points
  have notes ≥20 chars in 8 locales).
- **TOPIK 3, 4, 5, 6** (later PRs) — author each level; move it from the
  "must stay empty" block of `grammars-seed-completeness.test.ts` into an active
  completeness block.

## Verification

Per level: the completeness test (active for shipped levels), `nuxt typecheck`
(catches any malformed `L()`), eslint, and the full vitest suite. The adversarial
verify pass is the Korean-accuracy gate; the owner's wife does the final native review
(the same content gate the examples/pronunciation work carries).

## Out of scope

No UI/test changes beyond the completeness test — the rendering already exists.
