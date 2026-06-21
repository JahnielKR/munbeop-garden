# Formality slider — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 3-level formality control (합니다체 / 해요체 / 반말) to Explore mode that rewrites each sentence's predicate (and 저→나 in 반말), Korean-only.

**Architecture:** A per-word-token `byLevel` override + a pure `tokenText(token, level)` resolver. `useParticleExplore` holds a sticky `level` ref; `ExploreMode` renders a segmented control and threads `level` → `ParticleSentence` → `TokenChip`, which renders `tokenText(token, level)`. Translations/readings are untouched (meaning is level-invariant). Content adds `byLevel` to the 14 sentences' predicates + the 저 pronoun.

**Tech Stack:** Nuxt 4 SPA, Vue 3, TypeScript, Pinia, @nuxtjs/i18n (8 locales), vitest + happy-dom + @vue/test-utils, pnpm. Commands from `munbeop/`.

**Source spec:** `docs/superpowers/specs/2026-06-20-formality-slider-design.md`.

---

## File structure

| Action | File | Responsibility |
|---|---|---|
| Edit | `app/lib/domain/particles.ts` | `SpeechLevel`, `LabToken.byLevel` |
| Edit | `app/lib/particle-lab/explore.ts` | `tokenText(token, level)` |
| Edit | `app/composables/useParticleExplore.ts` | sticky `level` + `setLevel` |
| Edit | `app/components/particle-lab/TokenChip.vue` | `level` prop → `tokenText` |
| Edit | `app/components/particle-lab/ParticleSentence.vue` | `level` prop pass-through |
| Edit | `app/components/particle-lab/ExploreMode.vue` | segmented formality control |
| Edit | `app/seed/particle-sentences.ts` | `byLevel` per sentence |
| Edit | `i18n/locales/*.json` | 4 explore keys ×8 |
| Edit | `tests/unit/particle-lab/explore.test.ts` | `tokenText` + level-render integrity |
| Edit | `tests/components/particle-lab/TokenChip.test.ts` | renders the level form |

No engine rework, no SQL, no SRS/diary change.

---

## Verified facts (resolved during planning)

- `TokenChip.vue` renders `{{ token.text }}` in TWO places (particle button + word `word__ko` span). Both become `{{ displayText }}` where `displayText = tokenText(token, level ?? 'polite')`. `tokenText` returns `token.text` for particles, so particle rendering is unchanged.
- `TokenChip` is Explore-only (drill uses `DrillOption`), so a new `level` prop is safe.
- The 14 sentence predicates (해요체 base → 합니다체 / 반말): 학생이에요→학생입니다/학생이야, 마셔요→마십니다/마셔, 가요→갑니다/가, 공부해요→공부합니다/공부해, 좋아해요→좋아합니다/좋아해, 먹어요→먹습니다/먹어, 와요→옵니다/와, 써요→씁니다/써, 사요→삽니다/사, 일해요→일합니다/일해, 산책해요→산책합니다/산책해, 앉아요→앉습니다/앉아, 다녀요→다닙니다/다녀. The pronoun 저 → 나 only in `casual` (저 stays in formal & polite). 저 appears in s01, s05, s14.
- `useParticleExplore.go()` resets `off` but must NOT reset `level` (sticky preference).
- `i18n` explore keys live under `particles.explore` (e.g. `tap_hint`, `prev`, `next`, `legend_title`).

---

## PHASE 1 — Model + engine + composable

### Task 1: `SpeechLevel`, `LabToken.byLevel`, `tokenText`, sticky `level`

**Files:** edit `app/lib/domain/particles.ts`, `app/lib/particle-lab/explore.ts`, `app/composables/useParticleExplore.ts`, `tests/unit/particle-lab/explore.test.ts`.

- [ ] **Step 1: Extend the domain** — `app/lib/domain/particles.ts`. Add the type and the token field. Find the `LabToken` union and replace it:

```ts
export type SpeechLevel = 'formal' | 'polite' | 'casual'

export type LabToken =
  | { kind: 'word'; text: string; gloss?: LocalizedString; byLevel?: Partial<Record<SpeechLevel, string>> }
  | { kind: 'particle'; text: string; particleId: ParticleId; toggleable: boolean }
```

- [ ] **Step 2: Write the failing `tokenText` test** — append to `tests/unit/particle-lab/explore.test.ts` inside the `describe`:

```ts
  it('tokenText returns the level form for words, the base text otherwise', () => {
    const word = { kind: 'word' as const, text: '학생이에요', byLevel: { formal: '학생입니다', casual: '학생이야' } }
    expect(tokenText(word, 'formal')).toBe('학생입니다')
    expect(tokenText(word, 'casual')).toBe('학생이야')
    expect(tokenText(word, 'polite')).toBe('학생이에요')
    const plain = { kind: 'word' as const, text: '가요' }
    expect(tokenText(plain, 'formal')).toBe('가요')
    const particle = { kind: 'particle' as const, text: '는', particleId: 'topic' as const, toggleable: true }
    expect(tokenText(particle, 'casual')).toBe('는')
  })
```

Add `tokenText` to the import line:

```ts
import { indexOfParticle, particleIds, readingFor, toggleableIds, tokenText } from '~/lib/particle-lab'
```

(`toggleableIds` may already be imported — keep the existing imports and add `tokenText`.)

- [ ] **Step 3: Run it — expect FAIL** (`tokenText` not exported).

Run: `pnpm test tests/unit/particle-lab/explore.test.ts`
Expected: FAIL — `tokenText is not a function`.

- [ ] **Step 4: Implement `tokenText`** — `app/lib/particle-lab/explore.ts`. Update the import and add the function:

```ts
import type { LabReading, LabSentence, LabToken, ParticleId, SpeechLevel } from '../domain/particles'
```

```ts
/** Surface form of a token at a speech level (polite = the base `text`). */
export function tokenText(token: LabToken, level: SpeechLevel): string {
  if (token.kind === 'word' && token.byLevel && token.byLevel[level]) return token.byLevel[level]!
  return token.text
}
```

- [ ] **Step 5: Add sticky `level` to the composable** — `app/composables/useParticleExplore.ts`. Add the import, the ref, the setter, and return them. Update the type import:

```ts
import type { LabSentence, ParticleId, SpeechLevel } from '~/lib/domain'
```

After `const off = ref<Set<ParticleId>>(new Set())` add:

```ts
  const level = ref<SpeechLevel>('polite')
  function setLevel(l: SpeechLevel) {
    level.value = l
  }
```

(Do NOT touch `go()` — `level` stays across navigation.) Add `level` and `setLevel` to the returned object.

- [ ] **Step 6: Run test + typecheck**

Run: `pnpm test tests/unit/particle-lab/explore.test.ts` → PASS.
Run: `pnpm typecheck` → clean.

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/lib/domain/particles.ts munbeop/app/lib/particle-lab/explore.ts munbeop/app/composables/useParticleExplore.ts munbeop/tests/unit/particle-lab/explore.test.ts
git commit -m "feat(particles): speech-level model + tokenText resolver + sticky level"
```

---

## PHASE 2 — UI + i18n

### Task 2: TokenChip / ParticleSentence / ExploreMode + i18n + component test

**Files:** edit `app/components/particle-lab/TokenChip.vue`, `ParticleSentence.vue`, `ExploreMode.vue`; all `i18n/locales/*.json`; `tests/components/particle-lab/TokenChip.test.ts`.

- [ ] **Step 1: Add the 4 i18n keys to every locale** — under `particles.explore`, after `tap_hint`. Use this CRLF-safe script. Create `munbeop/_tmp_formality_keys.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs'
const data = {
  en: { l: 'Formality', f: 'formal', p: 'polite', c: 'casual' },
  es: { l: 'Formalidad', f: 'formal', p: 'educado', c: 'informal' },
  fr: { l: 'Registre', f: 'formel', p: 'poli', c: 'familier' },
  'pt-BR': { l: 'Formalidade', f: 'formal', p: 'polido', c: 'informal' },
  th: { l: 'ระดับความสุภาพ', f: 'ทางการ', p: 'สุภาพ', c: 'กันเอง' },
  id: { l: 'Tingkat formalitas', f: 'formal', p: 'sopan', c: 'santai' },
  vi: { l: 'Mức trang trọng', f: 'trang trọng', p: 'lịch sự', c: 'thân mật' },
  ja: { l: '丁寧さ', f: 'フォーマル', p: '丁寧', c: 'タメ口' },
}
const re = /^([ \t]*)"tap_hint":\s*"[^"]*"/m
for (const [loc, v] of Object.entries(data)) {
  const path = `i18n/locales/${loc}.json`
  const txt = readFileSync(path, 'utf8')
  const eol = txt.includes('\r\n') ? '\r\n' : '\n'
  const m = txt.match(re)
  if (!m) throw new Error('tap_hint not found in ' + loc)
  const ind = m[1]
  const ins =
    m[0] + ',' + eol +
    ind + JSON.stringify('formality_label') + ': ' + JSON.stringify(v.l) + ',' + eol +
    ind + JSON.stringify('formality_formal') + ': ' + JSON.stringify(v.f) + ',' + eol +
    ind + JSON.stringify('formality_polite') + ': ' + JSON.stringify(v.p) + ',' + eol +
    ind + JSON.stringify('formality_casual') + ': ' + JSON.stringify(v.c)
  const out = txt.replace(re, () => ins)
  JSON.parse(out)
  writeFileSync(path, out)
  console.log(loc, 'ok')
}
```

Run: `node _tmp_formality_keys.mjs && rm _tmp_formality_keys.mjs`
Verify: `node -e "for(const l of ['en','es','fr','pt-BR','th','id','vi','ja']){const e=require('./i18n/locales/'+l+'.json').particles.explore;console.log(l,!!e.formality_label,!!e.formality_casual)}"` → all `true true`.

- [ ] **Step 2: `TokenChip.vue` — `level` prop + `tokenText`.**

Update the import:

```ts
import type { LabToken, SpeechLevel } from '~/lib/domain'
import { tokenText } from '~/lib/particle-lab'
```

Add `level` to Props and a `displayText` computed. Replace the `Props` interface + `withDefaults` block:

```ts
interface Props {
  token: LabToken
  /** Particle currently toggled OFF (ghost look). */
  off?: boolean
  showGloss?: boolean
  level?: SpeechLevel
}
const props = withDefaults(defineProps<Props>(), { off: false, showGloss: true, level: 'polite' })
const emit = defineEmits<{ toggle: [] }>()
const { tl } = useLocalized()

const displayText = computed(() => tokenText(props.token, props.level))
```

(Keep the existing `role`/`ariaLabel` computeds; `computed` is already imported.) In the template, change BOTH `{{ token.text }}` occurrences (the particle `<button>` body and the word `.word__ko` span) to `{{ displayText }}`.

- [ ] **Step 3: `ParticleSentence.vue` — `level` prop pass-through.**

Update the import and Props:

```ts
import type { LabSentence, ParticleId, SpeechLevel } from '~/lib/domain'
```

```ts
interface Props {
  sentence: LabSentence
  off: ReadonlySet<ParticleId>
  showGloss?: boolean
  level?: SpeechLevel
}
withDefaults(defineProps<Props>(), { showGloss: true, level: 'polite' })
```

In the template, pass `:level="level"` to `<TokenChip>`:

```vue
      <TokenChip
        v-for="(tok, j) in eojeol"
        :key="j"
        :token="tok"
        :off="tok.kind === 'particle' && off.has(tok.particleId)"
        :show-gloss="showGloss"
        :level="level"
        @toggle="tok.kind === 'particle' ? emit('toggle', tok.particleId) : undefined"
      />
```

- [ ] **Step 4: `ExploreMode.vue` — the segmented control.**

In `<script setup>`, add the level list:

```ts
import type { ParticleId, SpeechLevel } from '~/lib/domain'
```

```ts
const LEVELS: { id: SpeechLevel; ko: string; aria: string }[] = [
  { id: 'formal', ko: '합니다체', aria: 'particles.explore.formality_formal' },
  { id: 'polite', ko: '해요체', aria: 'particles.explore.formality_polite' },
  { id: 'casual', ko: '반말', aria: 'particles.explore.formality_casual' },
]
```

In the template, add the control between `.explore__nav` and `<ParticleSentence>`:

```vue
    <div class="explore__formality" role="group" :aria-label="t('particles.explore.formality_label')">
      <button
        v-for="lv in LEVELS"
        :key="lv.id"
        type="button"
        class="explore__level"
        :class="{ 'explore__level--active': explore.level.value === lv.id }"
        :aria-pressed="explore.level.value === lv.id"
        :aria-label="t(lv.aria)"
        :data-testid="`level-${lv.id}`"
        lang="ko"
        @click="explore.setLevel(lv.id)"
      >
        {{ lv.ko }}
      </button>
    </div>
```

Pass the level to the sentence:

```vue
    <ParticleSentence
      :sentence="explore.sentence.value"
      :off="explore.off.value"
      :level="explore.level.value"
      @toggle="explore.toggle"
    />
```

Add styles in `<style scoped>` (mirroring the existing `.lab__tabs`/chip look):

```css
.explore__formality {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 4px;
  background: var(--surface);
  border: 2px solid var(--border);
  align-self: center;
}
.explore__level {
  padding: 6px 12px;
  background: transparent;
  border: none;
  font-family: var(--font-ko);
  font-size: var(--text-sm);
  color: var(--text-soft);
  cursor: pointer;
  transition:
    background var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.explore__level:hover {
  color: var(--text);
}
.explore__level--active {
  background: var(--accent);
  color: var(--text-on-accent);
}
.explore__level:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

- [ ] **Step 5: Extend `TokenChip.test.ts`** — add a level-render test. Append inside the `describe('TokenChip', …)`:

```ts
  it('renders the level form for a word with byLevel', () => {
    const tok: LabToken = { kind: 'word', text: '학생이에요', byLevel: { formal: '학생입니다', casual: '학생이야' } }
    expect(mount(TokenChip, { props: { token: tok, level: 'formal' } }).text()).toContain('학생입니다')
    expect(mount(TokenChip, { props: { token: tok, level: 'casual' } }).text()).toContain('학생이야')
    expect(mount(TokenChip, { props: { token: tok } }).text()).toContain('학생이에요')
  })
```

- [ ] **Step 6: Run typecheck + tests + lint, then commit**

Run: `pnpm typecheck` → clean.
Run: `pnpm test tests/unit/particle-lab tests/components/particle-lab tests/unit/i18n` → all pass (content integrity for `byLevel` lands in Task 3; nothing here asserts real-sentence variants).
Run: `npx eslint app/lib/particle-lab/explore.ts app/composables/useParticleExplore.ts app/components/particle-lab tests/components/particle-lab tests/unit/particle-lab` → exit 0.

```bash
git add munbeop/app/components/particle-lab/TokenChip.vue munbeop/app/components/particle-lab/ParticleSentence.vue munbeop/app/components/particle-lab/ExploreMode.vue munbeop/i18n/locales munbeop/tests/components/particle-lab/TokenChip.test.ts
git commit -m "feat(particles): Explore formality segmented control (합니다체/해요체/반말)"
```

---

## PHASE 3 — Content

### Task 3: `byLevel` on the 14 sentences + adversarial verify + integrity test

**Files:** edit `app/seed/particle-sentences.ts`, `tests/unit/particle-lab/explore.test.ts`.

- [ ] **Step 1: Add `byLevel` to each sentence's predicate (and 저).** For every sentence, add `byLevel: { formal, casual }` to the predicate word token; for s01/s05/s14 add `byLevel: { casual: '나' }` to the 저 token. Korean-only — do not touch `gloss`/`trans`/`nuance`/`readings`.

| sentence | predicate token | formal | casual | 저→나? |
|---|---|---|---|---|
| s01-jeoneun | 학생이에요 | 학생입니다 | 학생이야 | yes |
| s02-goyangi | 마셔요 | 마십니다 | 마셔 | — |
| s03-hakgyo | 가요 | 갑니다 | 가 | — |
| s04-doseogwan | 공부해요 | 공부합니다 | 공부해 | — |
| s05-jeodo | 좋아해요 | 좋아합니다 | 좋아해 | yes |
| s06-achime | 먹어요 | 먹습니다 | 먹어 | — |
| s07-biga | 와요 | 옵니다 | 와 | — |
| s08-chinguhante | 써요 | 씁니다 | 써 | — |
| s09-beoseuro | 가요 | 갑니다 | 가 | — |
| s10-ppangman | 먹어요 | 먹습니다 | 먹어 | — |
| s11-sagwawa | 사요 | 삽니다 | 사 | — |
| s12-ahopsibuteo | 일해요 | 일합니다 | 일해 | — |
| s13-yeonpillo | 써요 | 씁니다 | 써 | — |
| s14-jeodo | 마셔요 | 마십니다 | 마셔 | yes |

Example (s01 tokens):

```ts
        { kind: 'word', text: '저', gloss: L('I (humble)', 'yo', 'je', 'eu', 'ฉัน', 'saya', 'tôi', '私'), byLevel: { casual: '나' } },
        { kind: 'particle', text: '는', particleId: 'topic', toggleable: true },
      ],
      [
        {
          kind: 'word',
          text: '학생이에요',
          gloss: L('am a student', 'soy estudiante', 'suis étudiant·e', 'sou estudante', 'เป็นนักเรียน', 'adalah pelajar', 'là học sinh', '学生です'),
          byLevel: { formal: '학생입니다', casual: '학생이야' },
        },
```

- [ ] **Step 2: Run the verification Workflow** — adversarially verify every predicate's 합니다체 + 반말 conjugation and the 저→나 swap (per sentence: assemble the Korean at all 3 levels via `tokenText`; confirm each is natural and grammatical; flag any wrong conjugation). Reuse the subproject-3/4/5 harness. Fix flagged forms.

- [ ] **Step 3: Format + typecheck**

Run: `npx prettier --write app/seed/particle-sentences.ts`
Run: `pnpm typecheck` → clean.

- [ ] **Step 4: Add the level-integrity test** — `tests/unit/particle-lab/explore.test.ts`. Add a helper + test:

```ts
  it('every sentence renders differently at formal and casual vs polite', () => {
    const assemble = (s: typeof PARTICLE_SENTENCES[number], level: 'formal' | 'polite' | 'casual') =>
      s.eojeols.flatMap((e) => e.map((t) => tokenText(t, level))).join('')
    for (const s of PARTICLE_SENTENCES) {
      const polite = assemble(s, 'polite')
      expect(assemble(s, 'formal'), `${s.id} formal`).not.toBe(polite)
      expect(assemble(s, 'casual'), `${s.id} casual`).not.toBe(polite)
      for (const level of ['formal', 'polite', 'casual'] as const)
        for (const e of s.eojeols) for (const t of e) expect(tokenText(t, level).length, `${s.id} empty`).toBeGreaterThan(0)
    }
  })
```

- [ ] **Step 5: Verify + commit**

Run: `pnpm test tests/unit/particle-lab tests/components/particle-lab` → pass. `npx eslint app/seed/particle-sentences.ts tests/unit/particle-lab/explore.test.ts` → exit 0.

```bash
git add munbeop/app/seed/particle-sentences.ts munbeop/tests/unit/particle-lab/explore.test.ts
git commit -m "feat(particles): formality variants for the 14 Explore sentences (합니다체/반말), verified"
```

---

## PHASE 4 — Final verification + finish

### Task 4: Full gates

- [ ] Run: `pnpm test && pnpm typecheck && pnpm lint`. All green, 0 lint errors.
- [ ] Manual (logged in, `/practice/particles`, 🧩 Explore): the 합니다체/해요체/반말 control switches all 14 sentences; the level persists across ◄ ► navigation; particle toggling works at every level; 저-sentences show 나… in 반말 (e.g. 나는 학생이야); the translation panel is unchanged across levels.

### Task 5: Finish the branch

- [ ] Update memory `project_particle_lab.md`: mark subproject #6 shipped with PR number/commit.
- [ ] `superpowers:finishing-a-development-branch`: push → `gh pr create` → `gh pr merge --merge`. Merge `origin/main` first if it diverged; retry the async mergeability check once.

---

## Self-review

**Spec coverage:** model (`SpeechLevel`+`byLevel`) → Task 1; engine (`tokenText`) → Task 1; sticky `level` → Task 1; UI (control + prop chain) + i18n → Task 2; content (byLevel ×14, verified) → Task 3; tests (tokenText, component, integrity) → Tasks 1/2/3; readings untouched → confirmed (no task changes them); gates + finish → Phase 4. All spec sections (A–G) covered.

**Placeholder scan:** Predicate conjugations are concretely tabled in Task 3; the only deferred step is the adversarial conjugation check (a defined verification process, not a TODO). All code (types, resolver, composable, components, i18n keys, tests) is concrete.

**Type consistency:** `SpeechLevel` + `LabToken.byLevel` (Task 1) are used by `tokenText` (Task 1), `TokenChip`/`ParticleSentence` props (Task 2), and the content (Task 3). `tokenText(token, level)` signature is identical across the engine test, component, and integrity test. `level`/`setLevel` (Task 1 composable) are consumed by `ExploreMode` (Task 2: `explore.level.value`, `explore.setLevel`). i18n keys `formality_label`/`formality_formal`/`formality_polite`/`formality_casual` (Task 2) match the `t(...)` calls in `ExploreMode`.
```
