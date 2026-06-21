# 조사 마스터 (Particle Master) achievement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single Particle Lab mastery badge — 조사 마스터 — earned when all 11 lab particles reach SRS `tree`, with a calm progress strip and a one-shot celebration, fully derived from existing SRS data.

**Architecture:** A pure `lib/particle-lab/master.ts` projects the SRS map onto the 11 tracked grammarKo at a mastery threshold. A thin `useParticleMaster` composable reads `useSrsStore().map`, computes progress, and mirrors `useGardenCelebration`'s one-shot + sticky-earned localStorage pattern. Two components (progress strip + celebration card) render it on the lab page. No DB, no migration, no synced state, no pixel-art asset.

**Tech Stack:** Nuxt 4 (SPA), Vue 3 `<script setup>`, TypeScript, Pinia, Vitest + @vue/test-utils, pnpm, @nuxtjs/i18n (8 locales).

**Conventions:**
- Spec: `docs/superpowers/specs/2026-06-21-particle-master-achievement-design.md`.
- Paths below are relative to the repo root; app code lives under `munbeop/`.
- Run commands from `munbeop/`. Single test: `pnpm exec vitest run <path>`. Suite: `pnpm test`. Types: `pnpm typecheck`. Lint: `pnpm lint`.
- Tests globally stub `useI18n` (echoes the key; appends interpolation values, space-joined) and `useLocalized` (`tl` → English) — see `munbeop/tests/setup.ts`.
- `~/lib/domain` re-exports `MasteryLevel`, `SrsState`, `ParticleDef`. `~/lib/particle-lab` is the barrel.

---

### Task 1: `master.ts` — pure mastery projection

**Files:**
- Create: `munbeop/app/lib/particle-lab/master.ts`
- Modify: `munbeop/app/lib/particle-lab/index.ts`
- Test: `munbeop/tests/unit/particle-lab/master.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/particle-lab/master.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { particleGrammarKos, particleMastery } from '~/lib/particle-lab'
import { PARTICLES } from '~/seed/particles'
import type { SrsState } from '~/lib/domain'

const srs = (mastery: SrsState['mastery']): SrsState => ({
  lastSeen: null, easyCount: 0, hardCount: 0, mastery,
})

describe('particleGrammarKos', () => {
  it('returns the 11 distinct lab particle grammarKo, de-duplicated, in order', () => {
    const kos = particleGrammarKos(PARTICLES)
    expect(kos).toEqual([
      '은/는', '이/가', '을/를', '에', '에서', '도', '만',
      '에게 / 한테 / 께', '(으)로', '와/과 · 하고 · (이)랑', '부터 / 까지',
    ])
    expect(new Set(kos).size).toBe(kos.length) // 부터 / 까지 appears twice, collapses to one
  })
})

describe('particleMastery', () => {
  const kos = ['은/는', '이/가', '에']

  it('earns when every tracked particle is at tree', () => {
    const map = { '은/는': srs('tree'), '이/가': srs('tree'), '에': srs('tree') }
    const v = particleMastery(kos, map, 'tree')
    expect(v.earned).toBe(true)
    expect(v.doneCount).toBe(3)
    expect(v.total).toBe(3)
  })

  it('is not earned when one particle is below threshold', () => {
    const map = { '은/는': srs('tree'), '이/가': srs('plant'), '에': srs('tree') }
    const v = particleMastery(kos, map, 'tree')
    expect(v.earned).toBe(false)
    expect(v.doneCount).toBe(2)
    expect(v.perParticle.find((p) => p.ko === '이/가')!.done).toBe(false)
  })

  it('treats a missing srs row as seedling', () => {
    const v = particleMastery(kos, {}, 'tree')
    expect(v.doneCount).toBe(0)
    expect(v.perParticle.every((p) => p.mastery === 'seedling' && !p.done)).toBe(true)
  })

  it('threshold plant counts plant and tree as done', () => {
    const map = { '은/는': srs('plant'), '이/가': srs('tree'), '에': srs('seedling') }
    const v = particleMastery(kos, map, 'plant')
    expect(v.doneCount).toBe(2)
    expect(v.earned).toBe(false)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run tests/unit/particle-lab/master.test.ts`
Expected: FAIL — `particleGrammarKos`/`particleMastery` not exported.

- [ ] **Step 3: Write the implementation**

Create `munbeop/app/lib/particle-lab/master.ts`:

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

Append to `munbeop/app/lib/particle-lab/index.ts`:

```ts
export * from './master'
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run tests/unit/particle-lab/master.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/lib/particle-lab/master.ts munbeop/app/lib/particle-lab/index.ts munbeop/tests/unit/particle-lab/master.test.ts
git commit -m "$(cat <<'EOF'
feat(particles): master.ts — project SRS onto the 11 lab particles

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `useParticleMaster` composable

**Files:**
- Create: `munbeop/app/composables/useParticleMaster.ts`

Verified by `typecheck` + downstream page task (mirrors `useGardenCelebration`, which has no direct unit test).

- [ ] **Step 1: Write the composable**

Create `munbeop/app/composables/useParticleMaster.ts`:

```ts
import { computed, onMounted, ref, watch } from 'vue'
import { particleGrammarKos, particleMastery } from '~/lib/particle-lab'
import { PARTICLES } from '~/seed/particles'
import { useSrsStore } from '~/stores/srs'

/** UI-side memory (never via the storage adapter), like garden.milestonesSeen. */
const EARNED_KEY = 'particle-lab.masterEarned'

function readEarned(): boolean {
  try {
    return window.localStorage.getItem(EARNED_KEY) === '1'
  } catch {
    return false
  }
}
function writeEarned() {
  try {
    window.localStorage.setItem(EARNED_KEY, '1')
  } catch {
    /* ignore quota / SSR */
  }
}

/**
 * 조사 마스터 — derived achievement over the 11 lab particles. Earned-ness is
 * read from SRS (mastery === 'tree' for all); sticky once reached, with a
 * one-shot celebration the first time it flips, like useGardenCelebration.
 */
export function useParticleMaster() {
  const srs = useSrsStore()
  const grammarKos = particleGrammarKos(PARTICLES)
  const view = computed(() => particleMastery(grammarKos, srs.map, 'tree'))

  const acknowledged = ref(false) // persisted once earned
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
      celebrate.value = true // surface exactly once
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

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS. (`srs.map` is the Pinia-unwrapped reactive `Record<string, SrsState>`; reading it inside `computed` is reactive.)

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/composables/useParticleMaster.ts
git commit -m "$(cat <<'EOF'
feat(particles): useParticleMaster — sticky earned + one-shot celebration

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `ParticleMasterStrip.vue` + component test

**Files:**
- Create: `munbeop/app/components/particle-lab/ParticleMasterStrip.vue`
- Test: `munbeop/tests/components/particle-lab/ParticleMasterStrip.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/particle-lab/ParticleMasterStrip.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ParticleMasterStrip from '~/components/particle-lab/ParticleMasterStrip.vue'
import type { ParticleProgress } from '~/lib/particle-lab'

const per = (ko: string, done: boolean): ParticleProgress => ({
  ko, mastery: done ? 'tree' : 'seedling', done,
})

function mountStrip(overrides: Record<string, unknown> = {}) {
  return mount(ParticleMasterStrip, {
    props: {
      perParticle: [per('은/는', true), per('이/가', false), per('에', false)],
      doneCount: 1,
      total: 3,
      earned: false,
      ...overrides,
    },
  })
}

describe('ParticleMasterStrip', () => {
  it('renders a pip per particle and the progress caption', () => {
    const w = mountStrip()
    expect(w.findAll('.master__pip')).toHaveLength(3)
    expect(w.text()).toContain('particles.master.progress 1 3') // t() echo with params
  })

  it('marks done vs todo particles distinctly', () => {
    const w = mountStrip()
    expect(w.findAll('.master__pip--done')).toHaveLength(1)
    expect(w.findAll('.master__pip--todo')).toHaveLength(2)
  })

  it('shows the earned state', () => {
    const w = mountStrip({
      earned: true,
      doneCount: 3,
      perParticle: [per('은/는', true), per('이/가', true), per('에', true)],
    })
    expect(w.get('[data-testid="particle-master"]').classes()).toContain('master--earned')
    expect(w.text()).toContain('particles.master.earned')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run tests/components/particle-lab/ParticleMasterStrip.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Write the component**

Create `munbeop/app/components/particle-lab/ParticleMasterStrip.vue`:

```vue
<script setup lang="ts">
import type { ParticleProgress } from '~/lib/particle-lab'

/** Calm progress strip for the 조사 마스터 achievement (mode-independent). */
interface Props {
  perParticle: ParticleProgress[]
  doneCount: number
  total: number
  earned: boolean
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <section class="master" :class="{ 'master--earned': earned }" data-testid="particle-master">
    <div class="master__head">
      <span class="master__badge" aria-hidden="true">{{ earned ? '🏅' : '🌱' }}</span>
      <span class="master__label" lang="ko">조사 마스터</span>
      <span class="master__caption">
        {{ earned ? t('particles.master.earned') : t('particles.master.progress', { done: doneCount, total }) }}
      </span>
    </div>
    <ul class="master__pips" :aria-label="t('particles.master.progress', { done: doneCount, total })">
      <li
        v-for="p in perParticle"
        :key="p.ko"
        class="master__pip"
        :class="p.done ? 'master__pip--done' : 'master__pip--todo'"
        :aria-label="t(p.done ? 'particles.master.pip_done' : 'particles.master.pip_todo', { ko: p.ko })"
      >
        <span lang="ko" aria-hidden="true">{{ p.ko }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.master {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  background: var(--surface);
  border: 2px solid var(--border);
}
.master--earned {
  border-color: var(--gold);
  box-shadow: inset 0 0 0 1px var(--gold);
}
.master__head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.master__badge {
  font-size: var(--text-md);
}
.master__label {
  font-family: var(--font-ko);
  font-weight: 700;
  font-size: var(--text-sm);
  color: var(--text);
}
.master__caption {
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  color: var(--text-soft);
}
.master--earned .master__caption {
  color: var(--gold);
}
.master__pips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.master__pip {
  padding: 3px 8px;
  border: 2px solid var(--border);
  font-family: var(--font-ko);
  font-size: var(--text-xs);
  color: var(--text-soft);
  background: var(--paper);
  transition:
    background var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.master__pip--done {
  background: var(--jade);
  border-color: var(--ink-line);
  color: var(--always-dark);
}
.master--earned .master__pip--done {
  background: var(--gold);
}
</style>
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run tests/components/particle-lab/ParticleMasterStrip.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/particle-lab/ParticleMasterStrip.vue munbeop/tests/components/particle-lab/ParticleMasterStrip.test.ts
git commit -m "$(cat <<'EOF'
feat(particles): ParticleMasterStrip — N/11 pips + earned badge

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `ParticleMasterCelebration.vue`

**Files:**
- Create: `munbeop/app/components/particle-lab/ParticleMasterCelebration.vue`

Presentational; verified by typecheck + the page task's manual smoke.

- [ ] **Step 1: Write the component**

Create `munbeop/app/components/particle-lab/ParticleMasterCelebration.vue`:

```vue
<script setup lang="ts">
/** One-shot reward card when 조사 마스터 is earned. No pixel-art asset. */
interface Props {
  total: number
}
defineProps<Props>()
const emit = defineEmits<{ dismiss: [] }>()
const { t } = useI18n()
</script>

<template>
  <div
    class="cel"
    data-testid="particle-master-celebration"
    @click.self="emit('dismiss')"
  >
    <section class="cel__card" role="dialog" aria-modal="true" aria-labelledby="cel-title">
      <span class="cel__badge" aria-hidden="true">🏅</span>
      <h2 id="cel-title" class="cel__title" lang="ko">조사 마스터!</h2>
      <p class="cel__label">{{ t('particles.master.label') }}</p>
      <p class="cel__body" aria-live="polite">
        {{ t('particles.master.celebrate_body', { total }) }}
      </p>
      <button type="button" class="cel__btn" autofocus @click="emit('dismiss')">
        {{ t('particles.master.dismiss') }}
      </button>
    </section>
  </div>
</template>

<style scoped>
.cel {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 20px;
  background: color-mix(in srgb, var(--always-dark) 55%, transparent);
  animation: cel-fade var(--motion-quick) var(--ease-out);
}
.cel__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 360px;
  width: 100%;
  padding: 24px 20px;
  text-align: center;
  background: var(--surface);
  border: 3px solid var(--gold);
  box-shadow: var(--shadow-card);
  animation: cel-pop var(--motion-base) var(--ease-out);
}
.cel__badge {
  font-size: 44px;
  line-height: 1;
}
.cel__title {
  margin: 0;
  font-family: var(--font-ko);
  font-weight: 900;
  font-size: var(--text-xl);
  color: var(--heading-accent);
}
.cel__label {
  margin: 0;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gold);
}
.cel__body {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--text);
}
.cel__btn {
  margin-top: 6px;
  padding: 10px 20px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: 3px solid var(--ink-line);
  box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  cursor: pointer;
}
.cel__btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.cel__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
@keyframes cel-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes cel-pop {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .cel,
  .cel__card {
    animation: none;
  }
}
</style>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/components/particle-lab/ParticleMasterCelebration.vue
git commit -m "$(cat <<'EOF'
feat(particles): ParticleMasterCelebration — one-shot reward card

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: i18n keys (×8 locales)

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`

Add a `master` object under each `particles`. Korean fragments (조사 마스터 in UI; 화이팅 in the body) stay verbatim; `{done}`/`{total}`/`{ko}` placeholders intact.

- [ ] **Step 1: Author the keys with an idempotent insertion script**

Create `munbeop/_tmp_master_i18n.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs'

const M = {
  en: {
    label: 'Particle Master',
    progress: '{done}/{total} particles mastered',
    earned: 'Mastered! 🏅',
    celebrate_body: "You've mastered all {total} particles the lab teaches. 화이팅!",
    dismiss: 'Nice!',
    pip_done: '{ko} — mastered',
    pip_todo: '{ko} — not yet',
  },
  es: {
    label: 'Maestría de partículas',
    progress: '{done}/{total} partículas dominadas',
    earned: '¡Dominadas! 🏅',
    celebrate_body: 'Dominaste las {total} partículas que enseña el lab. 화이팅!',
    dismiss: '¡Genial!',
    pip_done: '{ko} — dominada',
    pip_todo: '{ko} — aún no',
  },
  fr: {
    label: 'Maîtrise des particules',
    progress: '{done}/{total} particules maîtrisées',
    earned: 'Maîtrisées ! 🏅',
    celebrate_body: 'Tu as maîtrisé les {total} particules enseignées par le labo. 화이팅 !',
    dismiss: 'Super !',
    pip_done: '{ko} — maîtrisée',
    pip_todo: '{ko} — pas encore',
  },
  'pt-BR': {
    label: 'Mestria das partículas',
    progress: '{done}/{total} partículas dominadas',
    earned: 'Dominadas! 🏅',
    celebrate_body: 'Você dominou as {total} partículas que o lab ensina. 화이팅!',
    dismiss: 'Boa!',
    pip_done: '{ko} — dominada',
    pip_todo: '{ko} — ainda não',
  },
  id: {
    label: 'Penguasaan partikel',
    progress: '{done}/{total} partikel dikuasai',
    earned: 'Dikuasai! 🏅',
    celebrate_body: 'Kamu menguasai seluruh {total} partikel yang diajarkan lab. 화이팅!',
    dismiss: 'Mantap!',
    pip_done: '{ko} — dikuasai',
    pip_todo: '{ko} — belum',
  },
  vi: {
    label: 'Bậc thầy tiểu từ',
    progress: 'Đã thành thạo {done}/{total} tiểu từ',
    earned: 'Đã thành thạo! 🏅',
    celebrate_body: 'Bạn đã thành thạo cả {total} tiểu từ mà lab dạy. 화이팅!',
    dismiss: 'Tuyệt!',
    pip_done: '{ko} — đã thành thạo',
    pip_todo: '{ko} — chưa',
  },
  th: {
    label: 'เซียนคำชี้',
    progress: 'เชี่ยวชาญ {done}/{total} คำชี้',
    earned: 'เชี่ยวชาญแล้ว! 🏅',
    celebrate_body: 'คุณเชี่ยวชาญคำชี้ทั้ง {total} ตัวที่แล็บสอนแล้ว 화이팅!',
    dismiss: 'เยี่ยม!',
    pip_done: '{ko} — เชี่ยวชาญแล้ว',
    pip_todo: '{ko} — ยังไม่',
  },
  ja: {
    label: '助詞マスター',
    progress: '{done}/{total} 助詞をマスター',
    earned: 'マスター！🏅',
    celebrate_body: 'ラボが教える {total} 個の助詞をすべてマスター。화이팅！',
    dismiss: 'やった！',
    pip_done: '{ko} — マスター済み',
    pip_todo: '{ko} — まだ',
  },
}

const ORDER = ['label', 'progress', 'earned', 'celebrate_body', 'dismiss', 'pip_done', 'pip_todo']
const SHEET = '    "sheet_section_title": "Particle Lab",'

for (const loc of Object.keys(M)) {
  const path = `i18n/locales/${loc}.json`
  let txt = readFileSync(path, 'utf8')
  if (!txt.includes('"pip_done"')) {
    const obj = M[loc]
    const body = ORDER.map((k) => `      ${JSON.stringify(k)}: ${JSON.stringify(obj[k])}`).join(',\n')
    const block = `    "master": {\n${body}\n    },\n`
    txt = txt.replace(SHEET, block + SHEET)
  }
  JSON.parse(txt) // validate
  writeFileSync(path, txt)
  console.log(`ok ${loc}`)
}
console.log('done')
```

- [ ] **Step 2: Run it, then delete it**

Run (from `munbeop/`): `node _tmp_master_i18n.mjs && rm _tmp_master_i18n.mjs`
Expected: `ok en … ok ja` then `done`.

- [ ] **Step 3: Verify keys present + JSON valid in all 8**

Run:
```bash
node -e "const fs=require('fs'); for (const l of ['en','es','fr','pt-BR','th','id','vi','ja']) { const m=JSON.parse(fs.readFileSync('./i18n/locales/'+l+'.json','utf8')).particles.master; if(!m||Object.keys(m).length!==7||!m.pip_done||!m.celebrate_body) throw new Error('bad '+l); } console.log('all 8 master blocks OK');"
```
Expected: `all 8 master blocks OK`.

- [ ] **Step 4: Commit**

```bash
git add munbeop/i18n/locales/*.json
git commit -m "$(cat <<'EOF'
feat(particles): i18n for the 조사 마스터 achievement (×8 locales)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Page wiring — strip + celebration in `particles.vue`

**Files:**
- Modify: `munbeop/app/pages/practice/particles.vue`

- [ ] **Step 1: Add imports + the composable**

Add to the imports block (next to the other particle-lab imports):

```ts
import ParticleMasterStrip from '~/components/particle-lab/ParticleMasterStrip.vue'
import ParticleMasterCelebration from '~/components/particle-lab/ParticleMasterCelebration.vue'
import { useParticleMaster } from '~/composables/useParticleMaster'
```

After `const spacing = useParticleSpacing()`, add:

```ts
const master = useParticleMaster()
```

- [ ] **Step 2: Render the strip and the celebration in the template**

In `munbeop/app/pages/practice/particles.vue`, insert the strip between the lead paragraph and the tabs. Replace:

```vue
    <p class="lab__lead">{{ t('particles.lead') }}</p>

    <div class="lab__tabs" role="group" :aria-label="t('particles.mode_label')">
```

with:

```vue
    <p class="lab__lead">{{ t('particles.lead') }}</p>

    <ParticleMasterStrip
      :per-particle="master.perParticle.value"
      :done-count="master.doneCount.value"
      :total="master.total.value"
      :earned="master.earned.value"
    />

    <div class="lab__tabs" role="group" :aria-label="t('particles.mode_label')">
```

Then add the celebration overlay just before the final `</div>` that closes `.lab`. Replace:

```vue
    </template>
  </div>
</template>
```

with:

```vue
    </template>

    <ParticleMasterCelebration
      v-if="master.celebrate.value"
      :total="master.total.value"
      @dismiss="master.dismiss"
    />
  </div>
</template>
```

(The `</template>` anchored above is the one closing the `mode === 'spacing'` block — the last block before `.lab`'s closing `</div>`.)

- [ ] **Step 3: Typecheck + full suite**

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm test`
Expected: PASS — all prior tests plus the new `master` unit (5) and `ParticleMasterStrip` (3) tests; zero failures.

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/pages/practice/particles.vue
git commit -m "$(cat <<'EOF'
feat(particles): wire the 조사 마스터 strip + celebration into the lab page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Verification — gates + adversarial Workflow + finish

**Files:** none.

- [ ] **Step 1: Run the gates**

```bash
pnpm test
pnpm typecheck
pnpm lint
```
Expected: suite green, no type errors, 0 lint errors. Fix and re-run on any issue.

- [ ] **Step 2: Adversarial Workflow (mirrors prior subprojects)**

Launch a Workflow with two parallel checks:
- **Tracked-set audit** — confirm `particleGrammarKos(PARTICLES)` (the 11 grammarKo in Task 1's expected array) is the correct and complete set of particles the lab actually teaches (cross-check against `app/seed/particles.ts` and `app/seed/clash-sets.ts`); flag any particle taught but not tracked, or tracked but not taught.
- **8-locale i18n audit** — for each locale, read `particles.master` (7 keys); check naturalness + tone consistency with neighboring `particles.*` keys, Korean fragments (화이팅) verbatim, and `{done}`/`{total}`/`{ko}` placeholders intact.

Apply any fixes the Workflow surfaces, then re-run Step 1's gates. Target: 0 blockers.

- [ ] **Step 3: Manual smoke checklist (logged-in, route auth-gated)**

Document for the user (`/practice/particles`):
- Before mastery: the strip shows `조사 마스터 · N/11` with done particles lit; no celebration.
- After all 11 reach `tree`: the celebration card fires **once**; dismiss → it stays gone on reload; the strip shows the 🏅 earned badge.
- Earning the last particle mid-session (finish a drill that pushes it to `tree`) fires the celebration live.
- The badge does not un-earn if a particle later regresses below `tree`.
- Looks right in light/dark + narrow viewport; the celebration is dismissible by button and backdrop click; reduced-motion disables the animations.

- [ ] **Step 4: Finish the branch**

Use superpowers:finishing-a-development-branch. On the user's choice (merge / PR), land it; per repo workflow pushing to main triggers the Vercel production deploy.

---

## Self-Review (completed during planning)

- **Spec coverage:** pure projection + grammarKo list (Task 1), composable with sticky-earned + one-shot (Task 2), strip (Task 3), celebration (Task 4), i18n ×8 (Task 5), page wiring strip+celebration (Task 6), gates + adversarial Workflow + manual smoke + finish (Task 7). Every spec section maps to a task.
- **Placeholder scan:** all code steps are complete; the i18n task ships concrete strings for all 8 locales via the script (no "translate later").
- **Type consistency:** `ParticleProgress`/`ParticleMasteryView` defined in Task 1, consumed unchanged in Tasks 2/3; `particleGrammarKos`/`particleMastery` signatures match across tasks; composable returns (`perParticle`, `doneCount`, `total`, `earned`, `celebrate`, `dismiss`) match the page bindings (`.value` in template) and the strip/celebration props; i18n keys used in components (`particles.master.{label,progress,earned,celebrate_body,dismiss,pip_done,pip_todo}`) all exist in Task 5.
