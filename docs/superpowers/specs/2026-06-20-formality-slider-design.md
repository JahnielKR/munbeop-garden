# Formality slider — design

**2026-06-20 · Subproject 6 of the Particle Lab follow-up program**
**Status: SPEC — approved in brainstorming, ready for writing-plans.**

## Goal

Add a **formality control** to Explore mode that rewrites each sentence's predicate
ending (and 저→나 in 반말) across three speech levels:

| level | id | example (s01) |
|---|---|---|
| 합니다체 (formal) | `formal` | 저는 학생입니다. |
| 해요체 (polite, current base) | `polite` | 저는 학생이에요. |
| 반말 (casual) | `casual` | 나는 학생이야. |

The particle toggle mechanic and the translations are unchanged — only the Korean
surface changes (meaning is identical across levels). The level is a sticky global
preference (it persists as you navigate between sentences).

## Current state (what exists)

- `app/lib/domain/particles.ts` — `LabToken = { kind:'word'; text; gloss? } | { kind:'particle'; text; particleId; toggleable }`. `LabSentence { id, eojeols: Eojeol[], trans, nuance, readings }`.
- `app/seed/particle-sentences.ts` — 14 `LabSentence`s; predicates are word tokens in 해요체 (e.g. `학생이에요`, `마셔요`, `가요`).
- `app/lib/particle-lab/explore.ts` — `readingFor`, `toggleableIds`, `particleIds`, `indexOfParticle` (all formality-agnostic; no change needed beyond a new helper).
- `app/composables/useParticleExplore.ts` — `index`, `off` (resets per sentence via `go()`), `sentence`, `trans`, `nuance`, `legendIds`, `toggle`, `go`, `focusParticle`.
- `app/components/particle-lab/ExploreMode.vue` → `ParticleSentence.vue` → `TokenChip.vue`. `TokenChip` renders `token.text` for words. `TokenChip` is Explore-only (the drill uses `DrillOption`), so adding a `level` prop is safe.

## Design

### A. Model (`domain/particles.ts`)

- `export type SpeechLevel = 'formal' | 'polite' | 'casual'`.
- The word variant of `LabToken` gains `byLevel?: Partial<Record<SpeechLevel, string>>`:

```ts
export type LabToken =
  | { kind: 'word'; text: string; gloss?: LocalizedString; byLevel?: Partial<Record<SpeechLevel, string>> }
  | { kind: 'particle'; text: string; particleId: ParticleId; toggleable: boolean }
```

`text` IS the 해요체 (polite) form; `byLevel` only carries the forms that differ (typically `formal` + `casual`). Particles are level-invariant and get no `byLevel`.

### B. Engine (`explore.ts`)

```ts
import type { LabToken, SpeechLevel } from '../domain/particles'

/** Surface form of a token at a speech level (polite = the base `text`). */
export function tokenText(token: LabToken, level: SpeechLevel): string {
  if (token.kind === 'word' && token.byLevel && token.byLevel[level]) return token.byLevel[level]!
  return token.text
}
```

### C. Composable (`useParticleExplore.ts`)

Add a sticky `level` ref + setter:

```ts
const level = ref<SpeechLevel>('polite')
function setLevel(l: SpeechLevel) { level.value = l }
```

`level` is NOT reset in `go()` (unlike `off`) — it's a global preference. Return `level` and `setLevel`.

### D. UI

- `ExploreMode.vue`: a segmented control (3 buttons: 합니다체 / 해요체 / 반말) above `ParticleSentence`. Korean style names stay Korean (brand mannerism, like 화이팅); each button gets an `aria-label` with the register word (formal/polite/casual) via i18n. Binds to `explore.level`/`explore.setLevel`. Pass `:level="explore.level.value"` to `ParticleSentence`.
- `ParticleSentence.vue`: accept a `level: SpeechLevel` prop (default `'polite'`); pass it to `TokenChip`.
- `TokenChip.vue`: accept an optional `level?: SpeechLevel` prop; the rendered word text becomes `tokenText(props.token, props.level ?? 'polite')`. The gloss (meaning) is unchanged.
- i18n: `particles.explore.formality_label` (control group label) + `formality_formal`/`formality_polite`/`formality_casual` (aria-labels), ×8 locales.

### E. Content (`particle-sentences.ts`)

For each of the 14 sentences, add `byLevel` to the tokens that change:
- the **predicate** word token → `{ formal: '<합니다체>', casual: '<반말>' }` (e.g. 학생이에요 → formal 학생입니다, casual 학생이야; 마셔요 → 마십니다 / 마셔; 가요 → 갑니다 / 가; 공부해요 → 공부합니다 / 공부해; 와요 → 옵니다 / 와; 좋아해요 → 좋아합니다 / 좋아해; 써요 → 씁니다 / 써; 사요 → 삽니다 / 사; 먹어요 → 먹습니다 / 먹어; 일해요 → 일합니다 / 일해; 산책해요 → 산책합니다 / 산책해; 앉아요 → 앉습니다 / 앉아; 다녀요 → 다닙니다 / 다녀; etc.).
- the first-person pronoun token 저 → `{ casual: '나' }` (저 stays 저 in formal & polite; becomes 나 in 반말). Sentences without 저 need no pronoun variant.

This is **Korean-only** — no `trans`/`nuance`/`reading` changes (meaning + the particle lesson are orthogonal to verb formality). Each predicate's 합니다체/반말 conjugation is adversarially verified.

### F. Readings / nuances

Unchanged. They describe particle omission (an axis orthogonal to verb formality). The existing "(casual)" register tags in readings refer to particle dropping, not 반말, and coexist with the slider without conflict (out of scope to reconcile).

## Files

| Action | Path |
|---|---|
| Edit | `app/lib/domain/particles.ts` (`SpeechLevel`, `LabToken.byLevel`) |
| Edit | `app/lib/particle-lab/explore.ts` (`tokenText`) |
| Edit | `app/composables/useParticleExplore.ts` (`level` + `setLevel`) |
| Edit | `app/components/particle-lab/ExploreMode.vue` (segmented control) |
| Edit | `app/components/particle-lab/ParticleSentence.vue` (`level` prop) |
| Edit | `app/components/particle-lab/TokenChip.vue` (`level` prop → `tokenText`) |
| Edit | `app/seed/particle-sentences.ts` (+`byLevel` per sentence) |
| Edit | `i18n/locales/*.json` (4 keys ×8) |
| Edit | `tests/unit/particle-lab/explore.test.ts` (`tokenText` + level-render integrity) |
| Edit | `tests/components/particle-lab/TokenChip.test.ts` (renders the level form) |

No engine rework, no SQL, no SRS/diary change.

## Testing

- `tokenText`: a word with `byLevel.formal` returns the formal form at `formal`; returns `text` at `polite` and when no variant; a particle always returns `text`.
- Integrity (`explore.test.ts`): for every sentence, the assembled Korean at `formal` differs from `polite`, and `casual` differs from `polite` (proves each sentence actually carries formal + casual variants); no token renders empty at any level.
- Component: `TokenChip` with `level='formal'` renders the formal form; `ParticleSentence` propagates the level. `ExploreMode` switching the control updates the rendered sentence.
- Adversarial Korean verification of every predicate's 합니다체 + 반말 conjugation (and 저→나).
- Full suite + typecheck + lint green. Manual (logged in): the control switches all 14 sentences between the 3 levels; the level persists across ◄ ► navigation; particle toggling still works at every level; 저-sentences show 나… in 반말.

## Out of scope (YAGNI)

- Persisting the level to URL/localStorage — in-memory sticky state is enough for one session.
- Formality in the Choque drill — this is an Explore feature.
- Reconciling reading "(casual)" tags with 반말 — separate axes.
- Honorific subject forms (께서) or 하십시오체 — the three taught levels suffice.
