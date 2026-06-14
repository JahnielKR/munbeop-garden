# Game Exit Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable `← Práctica` control to the ruleta and escape-room notebook that returns to the `/practice` hub, guarded by a confirmation modal only when a round is live.

**Architecture:** One self-contained SFC (`GameExitButton.vue`) renders the back button and — when its `confirm` prop is set — a confirmation modal built from the existing `ui/Modal` + `ui/Button` primitives. It owns navigation (`router.push(to)`, default `/practice`). Each game page mounts it and decides whether to confirm (ruleta: `phase !== 'pick'`; escape notebook: never). No global chrome; the escape-room gameplay HUD is untouched.

**Tech Stack:** Nuxt 4 (SPA) + Vue 3 `<script setup>`, Pinia, `@nuxtjs/i18n` (8 locales), Vitest + happy-dom + `@vue/test-utils`.

**Spec:** `docs/superpowers/specs/2026-06-14-game-exit-button-design.md`

---

## File Structure

```
app/components/games/GameExitButton.vue   NEW — button + confirm modal (the whole feature's UI).
app/pages/practice/ruleta.vue             EDIT — mount <GameExitButton :confirm="phase !== 'pick'" />.
app/pages/escape-room/index.vue           EDIT — mount <GameExitButton /> (no confirm).
i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json   EDIT — add 5 games.exit* keys each.
tests/unit/games/i18n-exit-keys.test.ts   NEW — parity guard for the 5 keys ×8 locales.
tests/components/games/GameExitButton.test.ts   NEW — confirm/no-confirm flows, navigation, a11y.
```

Conventions to follow (verified in this repo):
- Tests: `tests/setup.ts` already exposes a key-echo `useI18n` stub and Vue reactivity globals. `useRouter` is **not** global — stub it per-file with `vi.stubGlobal`. Component tests use `mount(..., { attachTo: document.body, global: { stubs: { Teleport: false } } })` so the teleported `Modal` renders into `document.body` (see `tests/components/Modal.test.ts`).
- i18n parity tests import the 8 JSON files directly (see `tests/unit/library/i18n-search-keys.test.ts`).
- `~` resolves to `app/`. SFCs in `app/components/**` are Nuxt auto-imported, but pages in this repo import their components explicitly — match that style in the page edits.

---

## Task 1: i18n keys for the exit control (×8 locales)

**Files:**
- Create: `munbeop/tests/unit/games/i18n-exit-keys.test.ts`
- Modify: `munbeop/i18n/locales/en.json`, `es.json`, `fr.json`, `pt-BR.json`, `th.json`, `id.json`, `vi.json`, `ja.json` (each: add 5 keys inside the existing `games` object, after `coming_soon`)

- [ ] **Step 1: Write the failing parity test**

Create `munbeop/tests/unit/games/i18n-exit-keys.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import id from '../../../i18n/locales/id.json'
import vi from '../../../i18n/locales/vi.json'
import ja from '../../../i18n/locales/ja.json'

const locales: Record<string, unknown> = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }

const EXIT_KEYS = [
  'exit',
  'exit_confirm_title',
  'exit_confirm_body',
  'exit_confirm_leave',
  'exit_confirm_cancel',
] as const

describe('games.exit* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines every games.exit* key as a non-empty string`, () => {
      const games = (msgs as { games?: Record<string, unknown> }).games ?? {}
      for (const k of EXIT_KEYS) {
        expect(typeof games[k], `${code} games.${k}`).toBe('string')
        expect((games[k] as string).length, `${code} games.${k}`).toBeGreaterThan(0)
      }
    })
  }
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd munbeop && npx vitest run tests/unit/games/i18n-exit-keys.test.ts`
Expected: FAIL — `games.exit` is `undefined` (not a string) in every locale.

- [ ] **Step 3: Add the 5 keys to each locale's `games` object**

In each file, the `games` object currently ends with `"coming_soon": "<value>"`. Add a trailing comma after it and insert the 5 keys. The exact additions per file:

`en.json`:
```jsonc
    "coming_soon": "COMING SOON",
    "exit": "Back to Practice",
    "exit_confirm_title": "Leave the game?",
    "exit_confirm_body": "You'll lose your progress in this round.",
    "exit_confirm_leave": "Leave",
    "exit_confirm_cancel": "Cancel"
```

`es.json`:
```jsonc
    "coming_soon": "PRÓXIMAMENTE",
    "exit": "Volver a Práctica",
    "exit_confirm_title": "¿Salir del juego?",
    "exit_confirm_body": "Perderás el progreso de esta ronda.",
    "exit_confirm_leave": "Salir",
    "exit_confirm_cancel": "Cancelar"
```

`fr.json`:
```jsonc
    "coming_soon": "<existing value>",
    "exit": "Retour à la pratique",
    "exit_confirm_title": "Quitter le jeu ?",
    "exit_confirm_body": "Vous perdrez votre progression dans cette manche.",
    "exit_confirm_leave": "Quitter",
    "exit_confirm_cancel": "Annuler"
```

`pt-BR.json`:
```jsonc
    "coming_soon": "<existing value>",
    "exit": "Voltar à Prática",
    "exit_confirm_title": "Sair do jogo?",
    "exit_confirm_body": "Você perderá o progresso desta rodada.",
    "exit_confirm_leave": "Sair",
    "exit_confirm_cancel": "Cancelar"
```

`th.json`:
```jsonc
    "coming_soon": "<existing value>",
    "exit": "กลับไปฝึก",
    "exit_confirm_title": "ออกจากเกมไหม?",
    "exit_confirm_body": "คุณจะเสียความคืบหน้าของรอบนี้",
    "exit_confirm_leave": "ออก",
    "exit_confirm_cancel": "ยกเลิก"
```

`id.json`:
```jsonc
    "coming_soon": "<existing value>",
    "exit": "Kembali ke Latihan",
    "exit_confirm_title": "Keluar dari permainan?",
    "exit_confirm_body": "Kamu akan kehilangan progres ronde ini.",
    "exit_confirm_leave": "Keluar",
    "exit_confirm_cancel": "Batal"
```

`vi.json`:
```jsonc
    "coming_soon": "<existing value>",
    "exit": "Quay lại Luyện tập",
    "exit_confirm_title": "Thoát trò chơi?",
    "exit_confirm_body": "Bạn sẽ mất tiến trình của vòng này.",
    "exit_confirm_leave": "Thoát",
    "exit_confirm_cancel": "Hủy"
```

`ja.json`:
```jsonc
    "coming_soon": "<existing value>",
    "exit": "練習に戻る",
    "exit_confirm_title": "ゲームを終了しますか？",
    "exit_confirm_body": "このラウンドの進行状況が失われます。",
    "exit_confirm_leave": "終了",
    "exit_confirm_cancel": "キャンセル"
```

> For `fr`/`pt-BR`/`th`/`id`/`vi`/`ja`, keep that file's existing `coming_soon` value — only add the trailing comma and the 5 new lines below it. Do not retype `coming_soon`'s value from this plan.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd munbeop && npx vitest run tests/unit/games/i18n-exit-keys.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Verify JSON is still valid (no trailing-comma slips)**

Run: `cd munbeop && npx vue-tsc --noEmit -p tsconfig.json` is overkill here; instead just rerun the full unit suite which imports every locale: `cd munbeop && npx vitest run tests/unit`
Expected: PASS — a malformed JSON would throw an import error.

- [ ] **Step 6: Commit**

```bash
git add munbeop/i18n/locales/*.json munbeop/tests/unit/games/i18n-exit-keys.test.ts
git commit -m "i18n(games): add exit-to-practice + confirm-modal strings (×8)" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: `GameExitButton.vue` component (TDD)

**Files:**
- Create: `munbeop/app/components/games/GameExitButton.vue`
- Test: `munbeop/tests/components/games/GameExitButton.test.ts`

- [ ] **Step 1: Write the failing component test**

Create `munbeop/tests/components/games/GameExitButton.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import GameExitButton from '~/components/games/GameExitButton.vue'

const pushSpy = vi.fn(async () => {})
vi.stubGlobal('useRouter', () => ({ push: pushSpy }))

async function flush() {
  await nextTick()
  await nextTick()
}

function mountButton(props: Record<string, unknown> = {}) {
  return mount(GameExitButton, {
    attachTo: document.body,
    props,
    global: { stubs: { Teleport: false } },
  })
}

describe('GameExitButton', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    pushSpy.mockClear()
  })
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('renders the back button with the games.exit aria-label and nav.practice label', () => {
    const wrapper = mountButton()
    const btn = wrapper.get('.game-exit')
    expect(btn.attributes('aria-label')).toBe('games.exit')
    expect(btn.text()).toContain('nav.practice')
  })

  it('navigates straight to /practice when confirm is false', async () => {
    const wrapper = mountButton()
    await wrapper.get('.game-exit').trigger('click')
    await flush()
    expect(pushSpy).toHaveBeenCalledWith('/practice')
    expect(document.body.querySelector('.modal-overlay')).toBeNull()
  })

  it('opens the confirm modal and does NOT navigate yet when confirm is true', async () => {
    const wrapper = mountButton({ confirm: true })
    await wrapper.get('.game-exit').trigger('click')
    await flush()
    expect(document.body.querySelector('.modal-overlay')).not.toBeNull()
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('navigates when the danger "leave" button is clicked', async () => {
    const wrapper = mountButton({ confirm: true })
    await wrapper.get('.game-exit').trigger('click')
    await flush()
    const leaveBtn = document.body.querySelector('.button[data-variant="danger"]') as HTMLElement
    leaveBtn.click()
    await flush()
    expect(pushSpy).toHaveBeenCalledWith('/practice')
  })

  it('cancels without navigating when the secondary button is clicked', async () => {
    const wrapper = mountButton({ confirm: true })
    await wrapper.get('.game-exit').trigger('click')
    await flush()
    const cancelBtn = document.body.querySelector('.button[data-variant="secondary"]') as HTMLElement
    cancelBtn.click()
    await flush()
    expect(pushSpy).not.toHaveBeenCalled()
    expect(document.body.querySelector('.modal-overlay')).toBeNull()
  })

  it('routes to a custom destination via the to prop', async () => {
    const wrapper = mountButton({ to: '/escape-room' })
    await wrapper.get('.game-exit').trigger('click')
    await flush()
    expect(pushSpy).toHaveBeenCalledWith('/escape-room')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd munbeop && npx vitest run tests/components/games/GameExitButton.test.ts`
Expected: FAIL — cannot resolve `~/components/games/GameExitButton.vue` (does not exist yet).

- [ ] **Step 3: Implement the component**

Create `munbeop/app/components/games/GameExitButton.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'

/**
 * Game exit control: a "← Práctica" button that returns to the practice hub.
 *
 * When `confirm` is set (the page passes a reactive flag — e.g. a live ruleta
 * round) clicking opens a confirmation modal so a misclick can't discard the
 * round. With `confirm` false it navigates immediately. The component owns the
 * navigation so a page only needs the single tag.
 */
interface Props {
  /** Ask before leaving. Pass a reactive flag tied to in-progress state. */
  confirm?: boolean
  /** Destination route. Defaults to the practice hub. */
  to?: string
}
const props = withDefaults(defineProps<Props>(), { confirm: false, to: '/practice' })

const { t } = useI18n()
const router = useRouter()
const showConfirm = ref(false)

function onClick() {
  if (props.confirm) showConfirm.value = true
  else leave()
}

function leave() {
  showConfirm.value = false
  void router.push(props.to)
}
</script>

<template>
  <button type="button" class="game-exit" :aria-label="t('games.exit')" @click="onClick">
    <span class="game-exit__arrow" aria-hidden="true">←</span>
    <span class="game-exit__label">{{ t('nav.practice') }}</span>
  </button>

  <Modal
    :open="showConfirm"
    :title="t('games.exit_confirm_title')"
    :close-label="t('games.exit_confirm_cancel')"
    @close="showConfirm = false"
  >
    <p class="game-exit__confirm-body">{{ t('games.exit_confirm_body') }}</p>
    <div class="game-exit__confirm-actions">
      <Button variant="secondary" @click="showConfirm = false">
        {{ t('games.exit_confirm_cancel') }}
      </Button>
      <Button variant="danger" @click="leave">
        {{ t('games.exit_confirm_leave') }}
      </Button>
    </div>
  </Modal>
</template>

<style scoped>
/* Pixel chrome consistent with the escape-room HUD back control and the
 * sidebar nav: bordered button on --surface, arrow + label inline. */
.game-exit {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border-strong);
  cursor: pointer;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  transition:
    background var(--motion-quick) var(--ease-out),
    transform var(--motion-quick) var(--ease-out);
}
.game-exit:hover {
  background: var(--surface-hover);
  transform: translate(-1px, 0);
}
.game-exit:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.game-exit__arrow {
  font-size: 12px;
  line-height: 1;
}
/* Thai / Vietnamese tone marks + Japanese kanji lose detail at 10px — bump
 * one step, same rule the sidebar nav uses. */
:lang(th) .game-exit__label,
:lang(vi) .game-exit__label,
:lang(ja) .game-exit__label {
  font-size: 13px;
}
.game-exit__confirm-body {
  margin: 0 0 20px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  line-height: 1.6;
  color: var(--ink, var(--text));
}
.game-exit__confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd munbeop && npx vitest run tests/components/games/GameExitButton.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/games/GameExitButton.vue munbeop/tests/components/games/GameExitButton.test.ts
git commit -m "feat(games): add GameExitButton (back-to-practice + confirm modal)" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Wire the button into the two game pages

**Files:**
- Modify: `munbeop/app/pages/practice/ruleta.vue`
- Modify: `munbeop/app/pages/escape-room/index.vue`

No new unit test (page wiring is verified by the manual smoke + typecheck/build below; the component's own behavior is already covered in Task 2).

- [ ] **Step 1: Mount the button in the ruleta**

In `munbeop/app/pages/practice/ruleta.vue`:

Add the import alongside the existing component imports (after the `CardDraw` import at the top of `<script setup>`):

```ts
import GameExitButton from '~/components/games/GameExitButton.vue'
```

Then insert the button as the first child of `.page`, immediately before `<BilingualTitle>`. Change:

```vue
  <div class="page">
    <BilingualTitle ko="연습" :latin="t('title.practice')" />
```

to:

```vue
  <div class="page">
    <GameExitButton :confirm="phase !== 'pick'" />
    <BilingualTitle ko="연습" :latin="t('title.practice')" />
```

(`phase` is the existing `ref<'pick' | 'draw' | 'play'>`; it auto-unwraps in the template. `.page` is already `display:flex; flex-direction:column`, so the button's `align-self: flex-start` keeps it compact at the top-left.)

- [ ] **Step 2: Mount the button in the escape-room notebook**

In `munbeop/app/pages/escape-room/index.vue`:

Add the import after the existing `LevelBook` import:

```ts
import GameExitButton from '~/components/games/GameExitButton.vue'
```

Then insert it as the first child of `.er-index`, before `<BilingualTitle>`. Change:

```vue
  <div class="er-index">
    <BilingualTitle ko="탈출" latin="Escape Room" />
```

to:

```vue
  <div class="er-index">
    <GameExitButton />
    <BilingualTitle ko="탈출" latin="Escape Room" />
```

(No `confirm`: browsing the notebook has nothing to lose. `.er-index` is also a flex column, so the same `align-self` applies.)

- [ ] **Step 3: Typecheck + full test suite + lint**

Run: `cd munbeop && npm run typecheck && npm run test && npm run lint`
Expected: all PASS. (Project rule: `typecheck` is load-bearing and has caught real prod bugs.)

- [ ] **Step 4: Manual smoke in the preview**

Start the dev server (`cd munbeop && npm run dev`) and verify, using the preview tools:
1. `/practice` → open **La Baraja**. The `← Práctica` button shows top-left.
2. On the deck shelf (`pick` phase) click it → returns to `/practice`, **no modal**.
3. Pick a deck → reach `draw`/`play`, click `← Práctica` → **confirm modal** appears.
4. Click **Cancelar** (and separately `Esc` / click outside) → stays in the game.
5. Click **Salir** → returns to `/practice`.
6. `/escape-room` notebook → `← Práctica` returns to the hub with **no modal**.
7. Toggle dark mode → button + modal honor `--surface` / `--border-strong` / `--ink`.

Take a screenshot of the confirm modal (step 3) as proof.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/pages/practice/ruleta.vue munbeop/app/pages/escape-room/index.vue
git commit -m "feat(games): wire GameExitButton into ruleta and escape-room notebook" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 6: Pre-push verification (do not push unless the user asks)**

Run: `cd munbeop && npm run typecheck && npm run test && npm run lint && npm run build`
Expected: all PASS (Nuxt 4 SPA — some errors only surface in `build`). Report results; leave pushing to the user.

---

## Self-Review

**Spec coverage:**
- Reusable `← Práctica` control → Task 2 (`GameExitButton.vue`). ✅
- Placed on ruleta + escape notebook → Task 3. ✅
- Confirm only with a live round (`phase !== 'pick'`; notebook never) → Task 3 wiring. ✅
- Reuse `ui/Modal` + `ui/Button` (danger) → Task 2 implementation. ✅
- Label reuses `nav.practice`; 5 new `games.exit*` keys ×8 → Task 1. ✅
- Escape gameplay HUD untouched → no task modifies `EscapeRoom.vue` / `escape-room/play.vue`. ✅
- Component owns navigation via `to` (default `/practice`) → Task 2 + custom-`to` test. ✅
- a11y (aria-label, focus trap via Modal) → Task 2 test asserts aria-label; focus trap is `ui/Modal`'s tested behavior. ✅

**Placeholder scan:** No TBD/TODO. The only `<existing value>` placeholders are deliberate instructions NOT to retype a per-locale string from the plan; the new keys are spelled out in full for every locale. ✅

**Type consistency:** `confirm?: boolean`, `to?: string`, `showConfirm` ref, `onClick`/`leave` — names match between the component, its test, and the page wiring. Modal props used (`open`, `title`, `close-label`, `@close`) match `ui/Modal.vue`'s real API. Button props used (`variant`) match `ui/Button.vue`. Selectors in the test (`.button[data-variant="danger|secondary"]`, `.modal-overlay`) match the real rendered markup. ✅

---

## Notes for the implementer

- The four confirm strings are sensible defaults matching the app's existing tone (cf. `escape.back_to_book` = "Volver a la libreta"). The user lives in Korea and is multilingual — flag the JA/TH/VI/ID wording for a quick review at PR time, but they are correct enough to ship.
- If `npm run typecheck`/`test`/`lint`/`build` scripts differ, check `munbeop/package.json` and substitute the real script names; the repo uses npm on Vercel but pnpm locally on the other machine — use whatever the working tree expects (`npm` here).
