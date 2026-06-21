# 조사 마스터 (Particle Master) achievement — design

**2026-06-21 · Subproject 8 of the Particle Lab follow-up program**
**Status: SPEC — approved in brainstorming, ready for writing-plans.**

## Goal

Give the Particle Lab a single mastery badge — **조사 마스터 (Particle Master)** —
earned when the learner has mastered **all 11 particle grammars the lab teaches**.
It is **fully derived from existing SRS data** (no DB, no migration, no new synced
state): a particle counts as mastered when its `SrsState.mastery` reaches the top
tier (`tree`). The lab page shows a calm progress strip (N/11 with a pip per
particle) that becomes the 🏅 badge on completion, plus a one-shot celebration the
first time it flips to earned.

Decisions locked in brainstorming: **threshold = `tree`** (the real "master"),
**tracked set = all 11** lab particles, **single badge + progress** (no tier ladder).

## Current state (what exists)

- `app/seed/particles.ts` — `export const PARTICLES: ParticleDef[]` (the Explore particle defs). Each `ParticleDef` has a `grammarKo` (the SRS / catalog key). The 11 **distinct** `grammarKo` are: `은/는`, `이/가`, `을/를`, `에`, `에서`, `도`, `만`, `에게 / 한테 / 께`, `(으)로`, `와/과 · 하고 · (이)랑`, `부터 / 까지` (the last appears twice — from/until — same grammarKo).
- `app/stores/srs.ts` — `useSrsStore` exposes `map: Ref<Record<string, SrsState>>` (keyed by grammarKo). `SrsState.mastery: 'seedling' | 'plant' | 'tree'`. The Choque drill already drives SRS on its ~9 clash-set particles; `(으)로` and `와/과` are mastered through normal writing practice (no drill) — both are honest paths to the badge.
- `app/lib/srs/mastery.ts` — `recalculateMastery`, `MasteryLevel`. `app/lib/stats/mastery.ts` reads an `srsMap` the same way we will.
- `app/composables/useGardenCelebration.ts` — the exact one-shot pattern to mirror: diff a reached set against a localStorage **seen-set**, surface once, never via the storage adapter. `app/components/garden/UnlockCelebration.vue` is the existing celebration card.
- `app/pages/practice/particles.vue` — the lab page: `BilingualTitle`, a `.lab__lead` paragraph, the 3-mode tabs, then mode content. The strip slots in **between the lead and the tabs** (always visible, mode-independent).
- `app/lib/particle-lab/index.ts` — barrel; add `export * from './master'`.

## Design

### A. Pure logic (`app/lib/particle-lab/master.ts`) — new

```ts
import type { MasteryLevel, ParticleDef, SrsState } from '../domain'

const RANK: Record<MasteryLevel, number> = { seedling: 0, plant: 1, tree: 2 }

/** Unique grammarKo taught by the lab, in particle-id order (de-duplicated). */
export function particleGrammarKos(defs: ParticleDef[]): string[] {
  const out: string[] = []
  for (const d of defs) if (!out.includes(d.grammarKo)) out.push(d.grammarKo)
  return out
}

export interface ParticleProgress {
  ko: string
  mastery: MasteryLevel
  /** mastery tier ≥ threshold. */
  done: boolean
}

export interface ParticleMasteryView {
  perParticle: ParticleProgress[]
  doneCount: number
  total: number
  /** Every tracked particle is done. */
  earned: boolean
}

/** Project the SRS map onto the tracked particle set at a mastery threshold. */
export function particleMastery(
  grammarKos: string[],
  srsMap: Record<string, SrsState>,
  threshold: MasteryLevel = 'tree',
): ParticleMasteryView {
  const need = RANK[threshold]
  const perParticle: ParticleProgress[] = grammarKos.map((ko) => {
    const mastery = srsMap[ko]?.mastery ?? 'seedling'
    return { ko, mastery, done: RANK[mastery] >= need }
  })
  const doneCount = perParticle.filter((p) => p.done).length
  return { perParticle, doneCount, total: grammarKos.length, earned: doneCount === grammarKos.length }
}
```

Pure and seed-free (takes `defs`/`grammarKos` as params) → trivially unit-testable.

### B. Composable (`app/composables/useParticleMaster.ts`) — new

Reads the SRS store, derives the tracked list from `PARTICLES`, and mirrors
`useGardenCelebration`'s one-shot + **sticky-earned** logic:

```ts
import { computed, onMounted, ref, watch } from 'vue'
import { particleGrammarKos, particleMastery } from '~/lib/particle-lab'
import { PARTICLES } from '~/seed/particles'
import { useSrsStore } from '~/stores/srs'

/** UI-side memory (never via the storage adapter), like garden.milestonesSeen. */
const EARNED_KEY = 'particle-lab.masterEarned'

export function useParticleMaster() {
  const srs = useSrsStore()
  const grammarKos = particleGrammarKos(PARTICLES)
  const view = computed(() => particleMastery(grammarKos, srs.map, 'tree'))

  const acknowledged = ref(false) // sticky: persisted once earned
  const celebrate = ref(false)
  const ready = ref(false)
  onMounted(() => {
    acknowledged.value = readEarned()
    ready.value = true
  })

  watch(
    [() => view.value.earned, ready],
    () => {
      if (!ready.value || import.meta.server) return
      if (!view.value.earned) return
      if (acknowledged.value) return // already earned in a past session
      writeEarned()
      acknowledged.value = true
      celebrate.value = true // surface once
    },
    { immediate: true },
  )

  /** Badge shows when currently earned OR ever earned (never un-earns). */
  const earned = computed(() => view.value.earned || acknowledged.value)
  function dismiss() {
    celebrate.value = false
  }

  return {
    perParticle: computed(() => view.value.perParticle),
    doneCount: computed(() => view.value.doneCount),
    total: computed(() => view.value.total),
    earned,
    celebrate,
    dismiss,
  }
}
```

`readEarned`/`writeEarned` wrap `localStorage` in try/catch (SSR/quota safe), same shape as `useGardenCelebration`'s `readSeen`.

### C. Components (`app/components/particle-lab/`) — new

- `ParticleMasterStrip.vue` — a calm one-line strip. Props: `perParticle`, `doneCount`, `total`, `earned`.
  - Not earned: `조사 마스터` label + a localized `{done}/{total}` caption + a row of **11 pips**; each pip renders its `grammarKo` (Korean, language-neutral) and is `--done`/`--todo` styled, with an `aria-label` (`pip_done`/`pip_todo`, interpolating the grammarKo).
  - Earned: the strip becomes the badge — `🏅 조사 마스터` + the `earned` caption; pips all lit (or collapse to a filled bar). No nagging, garden-calm.
- `ParticleMasterCelebration.vue` — the one-shot reveal card (CSS/emoji, **no pixel-art asset** → no art-pipeline dependency). Shows `🏅`, a Korean `조사 마스터!` title + localized body (`celebrate_body`, interpolating `total`), and a dismiss button. `role="dialog"`, `aria-live`, focusable dismiss; respects `prefers-reduced-motion`. Emits `dismiss`.

### D. Page wiring (`app/pages/practice/particles.vue`)

- `const master = useParticleMaster()`.
- Render `<ParticleMasterStrip>` between `.lab__lead` and `.lab__tabs` (always visible).
- Render `<ParticleMasterCelebration v-if="master.celebrate.value" @dismiss="master.dismiss" />` (overlay within the lab).
- No change to the existing modes / leave-guard.

### E. i18n (`munbeop/i18n/locales/*.json`, ×8) — new keys under `particles.master`

`label` (e.g. "Particle Master" — `조사 마스터` Korean stays in the UI verbatim), `progress` (`"{done}/{total} particles mastered"`), `earned` (`"Mastered! 🏅"`), `celebrate_body` (`"You've mastered all {total} particles the lab teaches. 화이팅!"`), `dismiss` (`"Nice!"`), `pip_done` (`"{ko} — mastered"`), `pip_todo` (`"{ko} — not yet"`). Korean fragments (`조사 마스터`, `화이팅`) stay verbatim across locales.

### F. Tests

- `tests/unit/particle-lab/master.test.ts`:
  - `particleGrammarKos(PARTICLES)` returns the 11 distinct grammarKo, in order, no dupes (the `부터 / 까지` double collapses to one).
  - `particleMastery`: an all-`tree` map → `earned: true`, `doneCount === total`; a map with one `plant` (rest `tree`) at threshold `tree` → `earned: false`, that particle `done: false`; an empty map → all `seedling`, `doneCount 0`; threshold `plant` counts `plant` and `tree` as done.
- `tests/components/particle-lab/ParticleMasterStrip.test.ts`:
  - Renders `{done}/{total}` and a pip per particle; earned state shows the badge label and no "not yet" pips.

## Files

| Action | Path |
|---|---|
| Add | `app/lib/particle-lab/master.ts` |
| Edit | `app/lib/particle-lab/index.ts` (`export * from './master'`) |
| Add | `app/composables/useParticleMaster.ts` |
| Add | `app/components/particle-lab/ParticleMasterStrip.vue` |
| Add | `app/components/particle-lab/ParticleMasterCelebration.vue` |
| Edit | `app/pages/practice/particles.vue` (strip + celebration wiring) |
| Edit | `i18n/locales/*.json` (`particles.master.*`, ×8) |
| Add | `tests/unit/particle-lab/master.test.ts` |
| Add | `tests/components/particle-lab/ParticleMasterStrip.test.ts` |

No SQL, no migration, no synced state, no new pixel-art asset.

## Testing / verification

- Full suite + typecheck + lint green.
- Manual (logged in): with all 11 particles at `tree`, the strip shows the 🏅 badge and the celebration fires once (and never again after dismiss / reload); before that the strip shows live N/11; earning the last particle mid-session fires the celebration; the badge never un-earns if a particle later regresses.
- Adversarial Workflow (mirrors prior subprojects): confirm the 11-grammarKo tracked set is correct/complete vs the lab's taught particles, and audit the new i18n strings across 8 locales (Korean fragments + `{done}`/`{total}`/`{ko}` placeholders intact).

## Out of scope (YAGNI)

- A general achievements system or a home on the (escape-room-only) trophies page — this is one lab-local badge.
- A tier ladder (bronze/silver/gold) — single badge + progress.
- Pixel-art badge asset / art pipeline — CSS/emoji only.
- Persisting anything through the storage adapter — earned-ness is derived from SRS; only the one-shot "earned & acknowledged" flag lives in localStorage.
- Counting non-lab grammars or making the threshold user-configurable.
