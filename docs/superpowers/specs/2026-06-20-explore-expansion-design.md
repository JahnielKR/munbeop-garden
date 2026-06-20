# Explore-mode expansion — design + handoff

**2026-06-20 · Subproject 4 of the Particle Lab follow-up program**
**Status: SPEC ONLY — not yet implemented. Pick up here in a fresh session.**

## Goal

Expand Particle Lab's **Explore** mode (the toggle-particles-on/off reader) from
6 particles / 7 sentences to **~11 particles / ~14 sentences** — adding the new
particles the Choque drill already teaches plus more example sentences. User
chose the "sentences + new particles" scope.

## Current state (what exists)

- `app/seed/particles.ts` — 6 `ParticleDef`: 은/는(topic), 이/가(subject),
  을/를(object), 에(place-static), 에서(place-action), 도(also/addition).
- `app/seed/particle-sentences.ts` — 7 `LabSentence` (s01–s07).
- Engine `app/lib/particle-lab/explore.ts` is **generic** — `readingFor`,
  `toggleableIds`, `particleIds`, `indexOfParticle` work for ANY particle/
  sentence. **No engine change needed.**
- `ParticleRole = 'topic' | 'subject' | 'object' | 'place' | 'addition'` drives
  chip color (TokenChip.vue) + legend swatch (ParticleLegend.vue). Colors:
  topic=gold, subject=jade, object=sky, place=red, addition=paper-deep/neutral.
- `ParticleDef` shape: `{ id, ko, grammarKo, role, afterConsonant, afterVowel, label: L(...), hint: L(...) }`. In Explore the chip text comes from the
  sentence token (explicit), so `afterConsonant/afterVowel` is only used for the
  popover "forms" display — the ㄹ-exception of (으)로 can be noted in the hint.

## Design

Pure content addition: new `ParticleDef`s + new `LabSentence`s. To honour the
original "zero new colors" rule, **map new particles to existing roles** (place
or addition). The next session MAY instead add new roles (recipient/connective/
range) with new chip colors — that's a small TokenChip.vue + ParticleLegend.vue
touch; decide at plan time. Default: reuse existing roles.

### New ParticleDefs (add to `app/seed/particles.ts`)

`grammarKo` must match an EXISTING catalog key (so the popover's "ver ficha"
link resolves). Verify each key in `app/seed/grammars-n*.ts` at impl time —
known-present: `만`, `(으)로`, `부터 / 까지`, `에게 / 한테 / 께`. **Verify `와/과`**
(grep returned 0 for the bare key; there may be a grouped `와/과/하고` — use
whatever exists, or skip 와/과 if none).

| id | ko | grammarKo | role | afterConsonant / afterVowel | note |
|---|---|---|---|---|---|
| `only` | 만 | 만 | addition | 만 / 만 (invariant) | "only" |
| `recipient` | 한테 | 에게 / 한테 / 께 | place | 한테 / 한테 (invariant) | to a person; 한테 casual, 에게 written |
| `by-means` | (으)로 | (으)로 | place | 으로 / 로 | means/direction; ㄹ-batchim → 로 (note in hint) |
| `and` | 와/과 | (verify) | addition | 과 / 와 | "and / with" (companionship) |
| `from` | 부터 | 부터 / 까지 | addition | 부터 / 부터 (invariant) | starting point |
| `until` | 까지 | 부터 / 까지 | addition | 까지 / 까지 (invariant) | end point |

Each needs `label` + `hint` in all 8 locales (L order: en, es, fr, pt-BR, th, id, vi, ja). Follow the existing particles.ts hints as the tone/length template.

### New LabSentences (add to `app/seed/particle-sentences.ts`)

Curated Korean below (verify naturalness + author the 8-locale trans/nuance/
readings at impl time via the same adversarial content workflow used for the
Choque expansion). Each sentence: tokenized into `eojeols` (word + attached
particle chips), `trans` (all-ON), `nuance`, and `readings` for specific OFF
states. TOPIK-1/2 vocab.

1. **s08** `친구한테 편지를 써요.` — "I write a letter to a friend." Toggles: 한테(recipient), 를(object). OFF 한테 → casual; OFF 를 → casual.
2. **s09** `버스로 학교에 가요.` — "I go to school by bus." Toggles: 로(by-means), 에(place-static). Shows means (로) + destination (에).
3. **s10** `빵만 먹어요.` — "I eat only bread." Toggle: 만(only). OFF 만 → 빵 먹어요 (no "only").
4. **s11** `사과와 바나나를 사요.` — "I buy apples and bananas." Toggles: 와(and), 를(object). (only if 와/과 catalog key exists; else swap to a 만 or 부터 sentence.)
5. **s12** `아홉 시부터 다섯 시까지 일해요.` — "I work from 9 to 5." Toggles: 부터(from), 까지(until). The classic range pair.
6. **s13** `연필로 편지를 써요.` — "I write a letter with a pencil." Toggle: 로(by-means, instrument), 를(object).
7. **s14** `저도 커피를 마셔요.` — "I drink coffee too." Toggles: 도(also), 를(object). (more 도 variety.)
8. Optional 1–2 more with existing particles for variety.

Note: 도/만/와/부터/까지 all map to the neutral "addition" chip color; 한테/(으)로
to the red "place" color. If that feels visually flat, that's the cue to add
roles+colors at plan time.

## Files

| Action | Path |
|---|---|
| Edit | `app/seed/particles.ts` (+~6 ParticleDef) |
| Edit | `app/seed/particle-sentences.ts` (+~6–8 LabSentence) |
| Maybe edit | `app/lib/domain/particles.ts` (only if new ParticleRole values are added) |
| Maybe edit | `app/components/particle-lab/TokenChip.vue` + `ParticleLegend.vue` (only if new role colors) |
| Edit | `tests/unit/particle-lab/explore.test.ts` (extend the integrity loop: every reading.off references a present particle; indexOfParticle for a new particle) |

No engine change, no i18n JSON keys (content is in seeds), no SQL.

## Testing

- Extend `explore.test.ts`: the existing "every explicit reading references
  particles that exist in its sentence" loop already covers new sentences;
  add `indexOfParticle(PARTICLE_SENTENCES, 'only')` etc. for the new particles.
- Adversarial Korean verification of every new sentence (same workflow pattern
  as the Choque expansion: assemble lead+tokens, verify naturalness + that each
  OFF reading is accurate).
- Full suite + typecheck + lint green. Manual: toggle each new particle in the
  browser, popover shows forms + "ver ficha completa" resolves.

---

## PROGRAM HANDOFF (read this first in a new session)

**Project:** Particle Lab (조사 연구소) follow-up program. See memory
`project_particle_lab.md` (the canonical tracker) and the original game memory.

**Shipped to production this session (branch `claude/stoic-kilby-8eed59`, a
harness worktree, reused per subproject; all merged to main via PR):**
- ✅ **#1 Game leave-guard** — PR #40 (commit c4d960e). `useGameLeaveGuard` +
  `GameLeaveConfirm` across all 3 games. Spec/plan: `docs/superpowers/*game-leave-guard*`.
- ✅ **#2 Choque expansion** — PR #41 (commit 2c46fb0). Engine→N clash sets,
  5 new pairs, set picker. Spec/plan: `docs/superpowers/*clash-expansion*`.

**Next up: #4 Explore expansion** — THIS spec. The user picked it; go straight
to `superpowers:writing-plans` → `executing-plans` → `finishing-a-development-branch` (merge via PR, like the others).

**Remaining backlog (1→11, user wants all, one at a time):**
3. Drill replay — shuffle items + "repasar solo fallos" + more items per pair.
4. **Explore expansion — THIS SPEC (do next).**
5. Contractions judge — 나+가→내가, 저+가→제가, 누구+가→누가 (a 3rd verdict kind).
6. Formality slider (Explore variants per speech level).
7. 띄어쓰기 exercise (Eojeol[] already models segmentation).
8. Achievement 조사 마스터 (all particles reach mastery).
9. Audio TTS per Explore sentence.
10. a11y nits (e.g. ParticlePopover aria-labelledby).
11. Final visual QA (dark / mobile 360 / ja-th).

**Established workflow per subproject:** brainstorming → spec
(`docs/superpowers/specs/`) → writing-plans (`docs/superpowers/plans/`) →
executing-plans (inline TDD, `pnpm test`/`typecheck`/`lint` gates from
`munbeop/`, pnpm not npm) → finishing-a-development-branch (push → `gh pr create`
→ `gh pr merge --merge`; GitHub mergeability check is async — retry once if it
reports a stale conflict; merge `origin/main` into the branch first if it
diverged). Content (8-locale L() + Korean correctness) is generated and
adversarially verified via a background Workflow, then spliced into the seeds
(beware: agents emit inconsistent indentation/commas — wrap in a temp `.ts`,
`prettier --write` it in isolation, then splice into the real file before the
final `]`; the locale JSONs are CRLF). The user reviews Korean content (they're
a fluent speaker in Korea). Replies in Spanish; code/commits/docs in English.
