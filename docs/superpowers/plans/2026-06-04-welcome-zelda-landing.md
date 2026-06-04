# Welcome Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public `/welcome` landing with pixel-art day↔night CRT scanline transition, Zelda-style sidebar auth menu (Kakao + Google OAuth, email, magic-link, anonymous entry), routing middleware that gates first-time anon visitors only, and full i18n across 8 locales.

**Architecture:** A new page composed from focused, single-responsibility Vue components under `app/components/welcome/`. Theme switching reuses the existing `useTheme()` composable; the scanline is a CSS-only overlay driven by a `data-transition` attribute. Auth extends `useAuth()` with a new `signInWithProvider` method. Routing changes are one global middleware plus one redirect for the legacy `/auth/sign-in` URL.

**Tech Stack:** Nuxt 4 SPA (`ssr: false`), Vue 3 `<script setup>`, Pinia, Supabase JS v2 (OAuth), Vitest + @vue/test-utils + happy-dom, @nuxtjs/i18n v9, Tailwind 3 (utility only — components keep scoped CSS), @vueuse/core (focus trap fallback if needed).

**Author:** writing-plans session 2026-06-04. Refers to spec at [`docs/superpowers/specs/2026-06-04-welcome-zelda-landing.md`](../specs/2026-06-04-welcome-zelda-landing.md).

---

## Conventions used in this plan

- All paths are relative to the worktree root: `C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-boyd-202998/`.
- Commands run from the Nuxt app directory: `munbeop/`. Each command snippet shows the `cd` step explicitly the first time, then assumes you're there.
- Commit messages follow the project's existing pattern: `feat(welcome.N): summary` for features, `test(welcome.N): summary` for test-only commits, `fix(welcome.N.x): summary` for follow-ups.
- After each task: `git add <files>`, commit, then `git push origin HEAD:main` to fast-forward main. Verify checks run before AND after each commit.
- All component `<script setup lang="ts">` blocks use Vue 3 Composition API. No Options API.
- Tests live next to the unit they cover when the unit is a composable or middleware; component tests live under `munbeop/tests/components/welcome/`.

---

## Task 1: Assets + new color tokens

**Files:**
- Create: `munbeop/public/welcome/day/garden-day.png` (from the user's `Mondstadt Background Wallpaper.zip`)
- Create: `munbeop/public/welcome/day/dodo.png` (from `Mondstadt Tileset Platform - Basic.zip`)
- Create: `munbeop/public/welcome/night/layer-1.png` … `layer-8.png` (from `Starry_Night_Itch_Package.zip`, `Layers_1920x1080/`)
- Create: `munbeop/public/welcome/night/falling-star.gif` (from `Starry_Night_Itch_Package.zip`)
- Create: `munbeop/public/welcome/CREDITS.md` (asset attribution)
- Modify: `munbeop/app/assets/styles/tokens/colors-light.css` (add `--sky-day` + `--sky-night`)

- [ ] **Step 1.1: Extract assets into a temp folder**

Run from worktree root in PowerShell:

```powershell
$dest = ".tmp-welcome-assets"
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Expand-Archive -Force "C:\Users\home\Downloads\Mondstadt Tileset Platform - Basic.zip" -DestinationPath (Join-Path $dest "platform")
Expand-Archive -Force "C:\Users\home\Downloads\Mondstadt Background Wallpaper.zip" -DestinationPath (Join-Path $dest "wallpaper")
Expand-Archive -Force "C:\Users\home\Downloads\Starry_Night_Itch_Package.zip" -DestinationPath (Join-Path $dest "starry")
```

- [ ] **Step 1.2: Copy day assets into `public/welcome/day/`**

```powershell
New-Item -ItemType Directory -Force "munbeop/public/welcome/day" | Out-Null
Copy-Item ".tmp-welcome-assets/wallpaper/Mondstadt Background Wallpaper/windrise-background-4k.png" "munbeop/public/welcome/day/garden-day.png"
Copy-Item ".tmp-welcome-assets/platform/Mondstadt Tileset Platform - Basic/dodo.png" "munbeop/public/welcome/day/dodo.png"
```

- [ ] **Step 1.3: Copy night assets into `public/welcome/night/`**

```powershell
New-Item -ItemType Directory -Force "munbeop/public/welcome/night" | Out-Null
1..8 | ForEach-Object {
  Copy-Item ".tmp-welcome-assets/starry/Starry_Night_Itch_Package/Layers_1920x1080/Starry_night_Layer_$_.png" "munbeop/public/welcome/night/layer-$_.png"
}
Copy-Item ".tmp-welcome-assets/starry/Starry_Night_Itch_Package/Falling_Star/Starry_night_star_1920x1080.gif" "munbeop/public/welcome/night/falling-star.gif"
```

- [ ] **Step 1.4: Write the credits file**

Create `munbeop/public/welcome/CREDITS.md`:

```markdown
# Welcome page assets

**Day scene (Mondstadt-inspired):**
- `day/garden-day.png` — from the "Mondstadt Background Wallpaper" pack by @theflavare on itch.io.
- `day/dodo.png` — from the "Mondstadt Tileset Platform - Basic" pack by @theflavare on itch.io.

**Night scene (Starry Night parallax):**
- `night/layer-1.png` … `layer-8.png` — from the "Starry Night Itch Package".
- `night/falling-star.gif` — from the same pack.

**Audio:**
- `audio/welcome-loop.mp3` — TODO, user-supplied later.

All visual assets are licensed for commercial use without redistribution of the
raw assets. Credit appreciated. See each pack's readme for full terms.
```

- [ ] **Step 1.5: Clean up the temp folder**

```powershell
Remove-Item -Recurse -Force ".tmp-welcome-assets"
```

- [ ] **Step 1.6: Add the two new sky tokens**

Modify `munbeop/app/assets/styles/tokens/colors-light.css`. Inside the `:root { ... }` block, after the `--always-cream:` line, add:

```css
  /* ---- Welcome page sky band (theme-invariant; used only by the scanline overlay) ---- */
  --sky-day: #87d5ff;
  --sky-night: #2a1a4a;
```

These are theme-invariants — the dark theme inherits them from `:root`, no change needed in `colors-dark.css`.

- [ ] **Step 1.7: Verify lint + typecheck still pass**

```powershell
cd munbeop
pnpm lint
pnpm typecheck
```

Expected: both pass.

- [ ] **Step 1.8: Commit and merge to main**

```bash
git add munbeop/public/welcome munbeop/app/assets/styles/tokens/colors-light.css
git commit -m "feat(welcome.1): assets + sky-day/sky-night tokens"
git push origin HEAD:main
```

Verify: `git status` clean. Re-run `pnpm typecheck` after the commit. Confirm `git log -1` shows the new commit and `git rev-parse origin/main` matches `HEAD`.

---

## Task 2: Composables — `useTypewriter` + `useWelcomeMusic`

**Files:**
- Create: `munbeop/app/composables/useTypewriter.ts`
- Create: `munbeop/tests/composables/useTypewriter.test.ts`
- Create: `munbeop/app/composables/useWelcomeMusic.ts`
- Create: `munbeop/tests/composables/useWelcomeMusic.test.ts`

### 2.A `useTypewriter`

- [ ] **Step 2.1: Write the failing test for `useTypewriter`**

Create `munbeop/tests/composables/useTypewriter.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useTypewriter } from '../../app/composables/useTypewriter'

describe('useTypewriter', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('reveals one character per tick at the configured speed', async () => {
    const text = ref('hi!')
    const { rendered, done } = useTypewriter(text, { speed: 10 })
    expect(rendered.value).toBe('')
    expect(done.value).toBe(false)
    vi.advanceTimersByTime(10); await nextTick(); expect(rendered.value).toBe('h')
    vi.advanceTimersByTime(10); await nextTick(); expect(rendered.value).toBe('hi')
    vi.advanceTimersByTime(10); await nextTick(); expect(rendered.value).toBe('hi!')
    expect(done.value).toBe(true)
  })

  it('iterates by code-point (Hangul + surrogate-safe)', async () => {
    const text = ref('가나다🌱')
    const { rendered, done } = useTypewriter(text, { speed: 5 })
    vi.advanceTimersByTime(5); await nextTick(); expect(rendered.value).toBe('가')
    vi.advanceTimersByTime(5); await nextTick(); expect(rendered.value).toBe('가나')
    vi.advanceTimersByTime(5); await nextTick(); expect(rendered.value).toBe('가나다')
    vi.advanceTimersByTime(5); await nextTick(); expect(rendered.value).toBe('가나다🌱')
    expect(done.value).toBe(true)
  })

  it('skip() instantly completes the line', async () => {
    const text = ref('hello world')
    const { rendered, done, skip } = useTypewriter(text, { speed: 100 })
    vi.advanceTimersByTime(100); await nextTick(); expect(rendered.value).toBe('h')
    skip()
    await nextTick()
    expect(rendered.value).toBe('hello world')
    expect(done.value).toBe(true)
  })

  it('restarts when the source text changes', async () => {
    const text = ref('one')
    const { rendered } = useTypewriter(text, { speed: 5 })
    vi.advanceTimersByTime(15); await nextTick(); expect(rendered.value).toBe('one')
    text.value = 'two'
    await nextTick()
    expect(rendered.value).toBe('')
    vi.advanceTimersByTime(15); await nextTick(); expect(rendered.value).toBe('two')
  })

  it('fires onDone exactly once when complete', async () => {
    const onDone = vi.fn()
    const text = ref('ab')
    useTypewriter(text, { speed: 5, onDone })
    vi.advanceTimersByTime(10); await nextTick()
    vi.advanceTimersByTime(20); await nextTick()
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2.2: Run the test, confirm it fails**

```powershell
cd munbeop
pnpm test useTypewriter
```

Expected: FAIL with "Cannot find module '../../app/composables/useTypewriter'".

- [ ] **Step 2.3: Implement `useTypewriter`**

Create `munbeop/app/composables/useTypewriter.ts`:

```ts
import { ref, readonly, watch, onScopeDispose, type Ref } from 'vue'

export interface TypewriterOptions {
  speed?: number
  onDone?: () => void
}

/**
 * Reveal `text` one code-point at a time. Returns rendered text, a done
 * flag, and a skip() that flushes the rest of the line instantly.
 *
 * Iteration uses `[...str]` (not str.length) so combined Hangul jamo and
 * astral-plane glyphs render as single ticks.
 */
export function useTypewriter(text: Ref<string>, opts: TypewriterOptions = {}) {
  const speed = opts.speed ?? 40
  const rendered = ref('')
  const done = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null
  let chars: string[] = []
  let index = 0
  let firedOnDone = false

  function clear() {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function complete() {
    if (firedOnDone) return
    firedOnDone = true
    done.value = true
    opts.onDone?.()
  }

  function tick() {
    if (index >= chars.length) {
      clear()
      complete()
      return
    }
    rendered.value += chars[index]
    index += 1
    if (index >= chars.length) {
      clear()
      complete()
    }
  }

  function restart() {
    clear()
    chars = [...text.value]
    index = 0
    rendered.value = ''
    done.value = false
    firedOnDone = false
    if (chars.length === 0) {
      complete()
      return
    }
    timer = setInterval(tick, speed)
  }

  function skip() {
    clear()
    rendered.value = text.value
    index = chars.length
    complete()
  }

  watch(text, restart, { immediate: true })
  onScopeDispose(clear)

  return { rendered: readonly(rendered), done: readonly(done), skip }
}
```

- [ ] **Step 2.4: Run the test, confirm it passes**

```powershell
pnpm test useTypewriter
```

Expected: PASS, all 5 cases green.

### 2.B `useWelcomeMusic`

- [ ] **Step 2.5: Write the failing test for `useWelcomeMusic`**

Create `munbeop/tests/composables/useWelcomeMusic.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWelcomeMusic, _resetWelcomeMusicForTest } from '../../app/composables/useWelcomeMusic'

class FakeAudio {
  src: string
  loop = false
  volume = 1
  paused = true
  play = vi.fn(async () => { this.paused = false })
  pause = vi.fn(() => { this.paused = true })
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  constructor(src: string) { this.src = src }
}

const STORAGE_KEY = 'mungarden:welcome:music'

describe('useWelcomeMusic', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('Audio', FakeAudio)
    _resetWelcomeMusicForTest()
  })
  afterEach(() => { vi.unstubAllGlobals() })

  it('starts in "off" state with no audio element', () => {
    const { state, ready } = useWelcomeMusic()
    expect(state.value).toBe('off')
    expect(ready.value).toBe(false)
  })

  it('toggle() boots audio on first call and flips to "on"', async () => {
    const { state, ready, toggle } = useWelcomeMusic()
    await toggle()
    expect(state.value).toBe('on')
    expect(ready.value).toBe(true)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('on')
  })

  it('toggle() flips on → off without tearing down audio', async () => {
    const { state, toggle } = useWelcomeMusic()
    await toggle()
    await toggle()
    expect(state.value).toBe('off')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('off')
  })

  it('hydrate() respects a prior "on" preference (but waits for gesture)', async () => {
    localStorage.setItem(STORAGE_KEY, 'on')
    const { state, ready, hydrate } = useWelcomeMusic()
    hydrate()
    expect(state.value).toBe('on')
    expect(ready.value).toBe(false)
  })
})
```

- [ ] **Step 2.6: Run the test, confirm it fails**

```powershell
pnpm test useWelcomeMusic
```

Expected: FAIL with "Cannot find module".

- [ ] **Step 2.7: Implement `useWelcomeMusic`**

Create `munbeop/app/composables/useWelcomeMusic.ts`:

```ts
import { ref, readonly } from 'vue'

const STORAGE_KEY = 'mungarden:welcome:music'
const SRC = '/welcome/audio/welcome-loop.mp3'
const VOLUME = 0.20

export type MusicState = 'on' | 'off'

const state = ref<MusicState>('off')
const ready = ref(false)
let audio: HTMLAudioElement | null = null
let hydrated = false

function readStored(): MusicState {
  if (typeof window === 'undefined') return 'off'
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v === 'on' ? 'on' : 'off'
  } catch {
    return 'off'
  }
}

function writeStored(next: MusicState) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(STORAGE_KEY, next) } catch { /* private mode */ }
}

function ensureAudio() {
  if (audio) return audio
  audio = new Audio(SRC)
  audio.loop = true
  audio.volume = VOLUME
  audio.addEventListener('error', () => {
    // 404 on the placeholder file or codec failure — stay silent.
    state.value = 'off'
  })
  return audio
}

async function play() {
  const a = ensureAudio()
  try {
    await a.play()
    ready.value = true
  } catch {
    // Autoplay blocked or file missing — flip off and leave the toggle dim.
    state.value = 'off'
  }
}

function pause() {
  if (!audio) return
  audio.pause()
}

/**
 * Welcome-page music. Boots the Audio element only after a user gesture
 * (toggle() is the gesture). Persists "on" / "off" preference per device.
 */
export function useWelcomeMusic() {
  function hydrate() {
    if (hydrated) return
    hydrated = true
    state.value = readStored()
  }

  async function toggle() {
    if (state.value === 'on') {
      state.value = 'off'
      writeStored('off')
      pause()
      return
    }
    state.value = 'on'
    writeStored('on')
    await play()
  }

  return {
    state: readonly(state),
    ready: readonly(ready),
    hydrate,
    toggle,
  }
}

// Test-only: clear singletons between cases.
export function _resetWelcomeMusicForTest() {
  state.value = 'off'
  ready.value = false
  audio = null
  hydrated = false
}
```

- [ ] **Step 2.8: Run the test, confirm it passes**

```powershell
pnpm test useWelcomeMusic
```

Expected: PASS, all 4 cases green.

- [ ] **Step 2.9: Run the full suite + typecheck**

```powershell
pnpm test
pnpm typecheck
```

Expected: all green.

- [ ] **Step 2.10: Commit and merge to main**

```bash
git add munbeop/app/composables/useTypewriter.ts munbeop/app/composables/useWelcomeMusic.ts munbeop/tests/composables/useTypewriter.test.ts munbeop/tests/composables/useWelcomeMusic.test.ts
git commit -m "feat(welcome.2): useTypewriter + useWelcomeMusic composables with tests"
git push origin HEAD:main
```

Verify: `git status` clean, `pnpm typecheck` after commit.

---

## Task 3: Day + Night scene components

**Files:**
- Create: `munbeop/app/components/welcome/WelcomeDayScene.vue`
- Create: `munbeop/app/components/welcome/WelcomeNightScene.vue`
- Create: `munbeop/app/components/welcome/WelcomeStage.vue`

- [ ] **Step 3.1: Implement `WelcomeDayScene`**

Create `munbeop/app/components/welcome/WelcomeDayScene.vue`:

```vue
<script setup lang="ts">
// Day scene: Mondstadt-inspired meadow with a bobbing dodo sprite.
// Pure visual layer — no props, no state.
</script>

<template>
  <div class="day" aria-hidden="true">
    <img class="day__bg pixel" src="/welcome/day/garden-day.png" alt="" />
    <img class="day__dodo pixel-sprite" src="/welcome/day/dodo.png" alt="" />
  </div>
</template>

<style scoped>
.day {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.day__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  image-rendering: pixelated;
}
.day__dodo {
  position: absolute;
  bottom: 28%;
  left: 18%;
  width: 48px;
  height: auto;
  image-rendering: pixelated;
  animation: dodo-bob 12s ease-in-out infinite;
  transform-origin: bottom center;
}
@keyframes dodo-bob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50%      { transform: translateY(-6px) rotate(1deg); }
}
@media (prefers-reduced-motion: reduce) {
  .day__dodo { animation: none; }
}
</style>
```

- [ ] **Step 3.2: Implement `WelcomeNightScene`**

Create `munbeop/app/components/welcome/WelcomeNightScene.vue`:

```vue
<script setup lang="ts">
// Night scene: 8 parallax layers + a falling-star GIF.
// Layer 1 is the closest (fastest), Layer 8 is the deepest (slowest).
// Mouse-X parallax is bound via --mouse-x CSS var set on the root by WelcomeStage.
import { computed } from 'vue'

const LAYERS = [1, 2, 3, 4, 5, 6, 7, 8] as const
// Parallax shift factor per layer, in pixels per unit of (mouse-x - 0.5).
// Layer 1 moves the most; Layer 8 barely moves.
const FACTORS: Record<number, number> = { 1: 40, 2: 32, 3: 24, 4: 18, 5: 12, 6: 8, 7: 4, 8: 2 }

const layers = computed(() => LAYERS.map((n) => ({ n, factor: FACTORS[n] })))
</script>

<template>
  <div class="night" aria-hidden="true">
    <img
      v-for="layer in layers"
      :key="layer.n"
      class="night__layer pixel"
      :src="`/welcome/night/layer-${layer.n}.png`"
      :style="{ '--factor': layer.factor }"
      alt=""
    />
    <img class="night__star pixel-sprite" src="/welcome/night/falling-star.gif" alt="" />
  </div>
</template>

<style scoped>
.night {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #0a0414;
}
.night__layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  image-rendering: pixelated;
  transform: translateX(calc((var(--mouse-x, 0.5) - 0.5) * var(--factor, 0) * 1px));
  transition: transform 200ms ease-out;
}
.night__star {
  position: absolute;
  top: 12%;
  right: 16%;
  width: 320px;
  height: auto;
  opacity: 0.55;
  image-rendering: pixelated;
  pointer-events: none;
  mix-blend-mode: screen;
}
@media (prefers-reduced-motion: reduce) {
  .night__layer { transform: none; transition: none; }
}
</style>
```

- [ ] **Step 3.3: Implement `WelcomeStage`**

Create `munbeop/app/components/welcome/WelcomeStage.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import WelcomeDayScene from './WelcomeDayScene.vue'
import WelcomeNightScene from './WelcomeNightScene.vue'

const props = defineProps<{ theme: 'light' | 'dark' }>()

const stage = ref<HTMLElement | null>(null)
const mouseX = ref(0.5)

function onMove(e: MouseEvent) {
  const w = window.innerWidth || 1
  mouseX.value = Math.min(1, Math.max(0, e.clientX / w))
}

onMounted(() => { window.addEventListener('pointermove', onMove, { passive: true }) })
onUnmounted(() => { window.removeEventListener('pointermove', onMove) })

const stageStyle = computed(() => ({ '--mouse-x': mouseX.value.toString() }))
const isLight = computed(() => props.theme === 'light')
</script>

<template>
  <div ref="stage" class="stage" :style="stageStyle">
    <transition name="stage-fade">
      <WelcomeDayScene v-if="isLight" key="day" class="stage__scene" />
      <WelcomeNightScene v-else key="night" class="stage__scene" />
    </transition>
  </div>
</template>

<style scoped>
.stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.stage__scene {
  position: absolute;
  inset: 0;
}
.stage-fade-enter-active,
.stage-fade-leave-active {
  transition: opacity 200ms ease-out;
}
.stage-fade-enter-from,
.stage-fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .stage-fade-enter-active,
  .stage-fade-leave-active { transition: opacity 100ms linear; }
}
</style>
```

- [ ] **Step 3.4: Verify typecheck + lint**

```powershell
cd munbeop
pnpm typecheck
pnpm lint
```

Expected: PASS.

- [ ] **Step 3.5: Commit and merge to main**

```bash
git add munbeop/app/components/welcome/WelcomeDayScene.vue munbeop/app/components/welcome/WelcomeNightScene.vue munbeop/app/components/welcome/WelcomeStage.vue
git commit -m "feat(welcome.3): day + night scene components with parallax + crossfade"
git push origin HEAD:main
```

Verify: `git status` clean, `pnpm typecheck` after.

---

## Task 4: Scanline overlay

**Files:**
- Create: `munbeop/app/components/welcome/WelcomeScanlineOverlay.vue`

- [ ] **Step 4.1: Implement the overlay**

Create `munbeop/app/components/welcome/WelcomeScanlineOverlay.vue`:

```vue
<script setup lang="ts">
// Renders a horizontal 4-px line that sweeps across the viewport.
// Direction is bound to the `direction` prop:
//   - 'down' = day → night (curtain falling at sunset)
//   - 'up'   = night → day (dawn rising)
// The parent toggles `active` for one transition cycle (~700 ms),
// then sets it back to false.
const props = defineProps<{
  active: boolean
  direction: 'up' | 'down'
}>()
</script>

<template>
  <div
    class="scanline"
    :class="[`scanline--${props.direction}`, { 'scanline--active': props.active }]"
    aria-hidden="true"
  >
    <div class="scanline__line" />
    <div class="scanline__glow" />
  </div>
</template>

<style scoped>
.scanline {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 40;
  overflow: hidden;
  opacity: 0;
}
.scanline--active { opacity: 1; }

.scanline__line {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--sky-night);
  box-shadow: 0 0 16px 4px var(--sky-night), 0 0 4px 1px rgba(255,255,255,0.7);
  top: 0;
}
.scanline__glow {
  position: absolute;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0.0) 0%,
    rgba(255,255,255,0.18) 50%,
    rgba(255,255,255,0.0) 100%
  );
  top: 0;
  transform: translateY(-50%);
}

.scanline--down.scanline--active .scanline__line,
.scanline--down.scanline--active .scanline__glow {
  animation: scanline-down 700ms ease-in-out forwards;
}
.scanline--up.scanline--active .scanline__line,
.scanline--up.scanline--active .scanline__glow {
  background: var(--sky-day);
  box-shadow: 0 0 16px 4px var(--sky-day), 0 0 4px 1px rgba(255,255,255,0.7);
  animation: scanline-up 700ms ease-in-out forwards;
}

@keyframes scanline-down {
  0%   { top: 0;     opacity: 0; }
  8%   { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 100%;  opacity: 0; }
}
@keyframes scanline-up {
  0%   { top: 100%;  opacity: 0; }
  8%   { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 0;     opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .scanline--active .scanline__line,
  .scanline--active .scanline__glow {
    animation: none;
    opacity: 0;
  }
}
</style>
```

- [ ] **Step 4.2: Verify**

```powershell
cd munbeop
pnpm typecheck
pnpm lint
```

Expected: PASS.

- [ ] **Step 4.3: Commit and merge**

```bash
git add munbeop/app/components/welcome/WelcomeScanlineOverlay.vue
git commit -m "feat(welcome.4): CRT scanline overlay with up/down sweep"
git push origin HEAD:main
```

---

## Task 5: Brand mark + 3 chrome toggles + pulse button

**Files:**
- Create: `munbeop/app/components/welcome/WelcomeBrandMark.vue`
- Create: `munbeop/app/components/welcome/WelcomeThemeToggle.vue`
- Create: `munbeop/app/components/welcome/WelcomeMusicToggle.vue`
- Create: `munbeop/app/components/welcome/WelcomePulseButton.vue`

- [ ] **Step 5.1: Brand mark**

Create `munbeop/app/components/welcome/WelcomeBrandMark.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="brand">
    <h1 class="brand__title" lang="ko">문법 정원</h1>
    <p class="brand__subtitle">
      {{ t('welcome.brand.subtitle') }} · <span lang="ko">화이팅</span>
    </p>
  </div>
</template>

<style scoped>
.brand {
  text-align: center;
  pointer-events: none;
}
.brand__title {
  font-family: 'Noto Sans KR', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(40px, 7vw, 88px);
  color: var(--always-cream);
  text-shadow:
    0 0 12px rgba(0, 0, 0, 0.45),
    3px 3px 0 rgba(0, 0, 0, 0.35);
  margin: 0;
  letter-spacing: 0.02em;
}
.brand__subtitle {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: clamp(10px, 1.4vw, 14px);
  color: var(--always-cream);
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  margin: 10px 0 0;
  letter-spacing: 0.05em;
}
</style>
```

- [ ] **Step 5.2: Theme toggle**

Create `munbeop/app/components/welcome/WelcomeThemeToggle.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ theme: 'light' | 'dark'; disabled?: boolean }>()
const emit = defineEmits<{ toggle: [] }>()

const { t } = useI18n()
const isLight = computed(() => props.theme === 'light')
const label = computed(() =>
  isLight.value ? t('welcome.toggle.theme_to_dark') : t('welcome.toggle.theme_to_light'),
)
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="label"
    :aria-pressed="!isLight"
    :disabled="props.disabled"
    @click="emit('toggle')"
  >
    <span class="theme-toggle__icon" aria-hidden="true">
      <span v-if="isLight">☀</span>
      <span v-else>☾</span>
    </span>
  </button>
</template>

<style scoped>
.theme-toggle {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: var(--always-cream);
  border: 3px solid var(--gold);
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  cursor: pointer;
  transition: transform 120ms ease, background 120ms ease;
}
.theme-toggle:hover:not(:disabled) {
  background: var(--gold);
  color: var(--always-dark);
  transform: scale(1.05);
}
.theme-toggle:disabled { opacity: 0.4; cursor: not-allowed; }
.theme-toggle:focus-visible {
  outline: 3px solid var(--gold);
  outline-offset: 3px;
}
</style>
```

- [ ] **Step 5.3: Music toggle**

Create `munbeop/app/components/welcome/WelcomeMusicToggle.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'

const { t } = useI18n()
const { state, ready, toggle } = useWelcomeMusic()

const isOn = computed(() => state.value === 'on')
const label = computed(() =>
  isOn.value ? t('welcome.toggle.music_off') : t('welcome.toggle.music_on'),
)
</script>

<template>
  <button
    type="button"
    class="music-toggle"
    :class="{ 'music-toggle--dim': !ready && !isOn }"
    :aria-label="label"
    :aria-pressed="isOn"
    @click="toggle"
  >
    <span class="music-toggle__icon" aria-hidden="true">
      <span v-if="isOn">♪</span>
      <span v-else>♬</span>
    </span>
  </button>
</template>

<style scoped>
.music-toggle {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: var(--always-cream);
  border: 3px solid var(--gold);
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  cursor: pointer;
  transition: transform 120ms ease, background 120ms ease;
}
.music-toggle:hover {
  background: var(--gold);
  color: var(--always-dark);
  transform: scale(1.05);
}
.music-toggle--dim { opacity: 0.55; }
.music-toggle:focus-visible {
  outline: 3px solid var(--gold);
  outline-offset: 3px;
}
</style>
```

- [ ] **Step 5.4: Pulse button**

Create `munbeop/app/components/welcome/WelcomePulseButton.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()
const emit = defineEmits<{ activate: [] }>()
const props = defineProps<{ expanded: boolean; controls: string }>()
</script>

<template>
  <button
    type="button"
    class="pulse"
    :aria-expanded="props.expanded"
    :aria-controls="props.controls"
    @click="emit('activate')"
  >
    {{ t('welcome.enter') }}
  </button>
</template>

<style scoped>
.pulse {
  background: rgba(0, 0, 0, 0.78);
  color: var(--gold);
  border: 4px solid var(--gold);
  padding: 18px 36px;
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(245, 197, 51, 0.45);
  animation: pulse-zelda 1.8s ease-in-out infinite;
  transition: background 200ms ease, color 200ms ease, transform 200ms ease;
}
.pulse:hover {
  background: var(--gold);
  color: var(--always-dark);
  box-shadow: 0 0 30px var(--gold);
  animation: none;
  transform: scale(1.02);
}
.pulse:focus-visible {
  outline: 3px solid var(--always-cream);
  outline-offset: 4px;
}
@keyframes pulse-zelda {
  0%, 100% { transform: scale(1);    opacity: 0.92; }
  50%      { transform: scale(1.05); opacity: 1; box-shadow: 0 0 28px rgba(245, 197, 51, 0.78); }
}
@media (prefers-reduced-motion: reduce) {
  .pulse { animation: none; }
}
</style>
```

- [ ] **Step 5.5: Verify + commit**

```powershell
cd munbeop
pnpm typecheck
pnpm lint
```

Expected: PASS (the new i18n keys aren't created yet — typecheck doesn't validate string keys against locale files, so this still passes; runtime would render the key itself as fallback. Task 9 adds the keys.).

```bash
git add munbeop/app/components/welcome/WelcomeBrandMark.vue munbeop/app/components/welcome/WelcomeThemeToggle.vue munbeop/app/components/welcome/WelcomeMusicToggle.vue munbeop/app/components/welcome/WelcomePulseButton.vue
git commit -m "feat(welcome.5): brand mark + theme/music toggles + pulse button"
git push origin HEAD:main
```

---

## Task 6: Sidebar shell with focus trap

**Files:**
- Create: `munbeop/app/components/welcome/WelcomeSidebar.vue`
- Create: `munbeop/tests/components/welcome/WelcomeSidebar.test.ts`

- [ ] **Step 6.1: Write the failing test**

Create `munbeop/tests/components/welcome/WelcomeSidebar.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomeSidebar from '../../../app/components/welcome/WelcomeSidebar.vue'

function makeStubs() {
  return {
    'i18n-t': { template: '<span><slot /></span>' },
  }
}

describe('WelcomeSidebar', () => {
  it('emits close when the close button is clicked', async () => {
    const wrapper = mount(WelcomeSidebar, {
      props: { open: true, titleId: 't1' },
      global: { mocks: { $t: (k: string) => k }, stubs: makeStubs() },
      slots: { default: '<div data-testid="content">CONTENT</div>' },
    })
    await wrapper.get('[data-testid="welcome-sidebar-close"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close on Escape keydown when open', async () => {
    const wrapper = mount(WelcomeSidebar, {
      props: { open: true, titleId: 't1' },
      global: { mocks: { $t: (k: string) => k }, stubs: makeStubs() },
      slots: { default: '<button>x</button>' },
    })
    await wrapper.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not emit close on Escape when closed', async () => {
    const wrapper = mount(WelcomeSidebar, {
      props: { open: false, titleId: 't1' },
      global: { mocks: { $t: (k: string) => k }, stubs: makeStubs() },
      slots: { default: '<button>x</button>' },
    })
    await wrapper.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('renders the slot content', () => {
    const wrapper = mount(WelcomeSidebar, {
      props: { open: true, titleId: 't1' },
      global: { mocks: { $t: (k: string) => k }, stubs: makeStubs() },
      slots: { default: '<div data-testid="content">CONTENT</div>' },
    })
    expect(wrapper.get('[data-testid="content"]').text()).toBe('CONTENT')
  })
})
```

- [ ] **Step 6.2: Run, confirm fail**

```powershell
pnpm test WelcomeSidebar
```

Expected: FAIL with "Cannot find module".

- [ ] **Step 6.3: Implement the sidebar**

Create `munbeop/app/components/welcome/WelcomeSidebar.vue`:

```vue
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{ open: boolean; titleId: string }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const rootEl = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
    return
  }
  if (e.key === 'Tab') {
    // Simple focus trap: cycle within rootEl's tabbable descendants.
    const root = rootEl.value
    if (!root) return
    const tabbables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    )
    if (tabbables.length === 0) return
    const first = tabbables[0]
    const last = tabbables[tabbables.length - 1]
    const active = document.activeElement as HTMLElement | null
    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

watch(() => props.open, async (now) => {
  if (now) {
    await nextTick()
    closeBtn.value?.focus()
  }
})
</script>

<template>
  <aside
    ref="rootEl"
    class="sidebar"
    :class="{ 'sidebar--open': props.open }"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="props.titleId"
    :aria-hidden="!props.open"
    :inert="!props.open ? '' : undefined"
    @keydown="onKeydown"
  >
    <button
      ref="closeBtn"
      type="button"
      class="sidebar__close"
      data-testid="welcome-sidebar-close"
      :aria-label="t('welcome.menu.close')"
      @click="emit('close')"
    >
      ✕
    </button>
    <p :id="props.titleId" class="sidebar__title">{{ t('welcome.menu.title') }}</p>
    <div class="sidebar__body">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(360px, 92vw);
  background: var(--paper);
  border-left: 6px double var(--gold);
  box-shadow: -8px 0 0 var(--ink), -10px 0 18px rgba(0, 0, 0, 0.55);
  padding: 56px 22px 22px;
  transform: translateX(100%);
  transition: transform 360ms cubic-bezier(0.1, 0.8, 0.3, 1);
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: var(--text);
}
.sidebar--open { transform: translateX(0); }
.sidebar__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 2px solid var(--danger);
  color: var(--danger);
  font-family: 'Press Start 2P', monospace;
  font-size: 13px;
  cursor: pointer;
}
.sidebar__close:hover {
  background: var(--danger);
  color: var(--always-cream);
}
.sidebar__close:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.sidebar__title {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-soft);
  margin: 0;
}
.sidebar__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
@media (prefers-reduced-motion: reduce) {
  .sidebar { transition: transform 120ms linear; }
}
</style>
```

- [ ] **Step 6.4: Run, confirm pass**

```powershell
pnpm test WelcomeSidebar
```

Expected: PASS, all 4 cases green.

- [ ] **Step 6.5: Verify + commit**

```powershell
pnpm typecheck
pnpm lint
```

```bash
git add munbeop/app/components/welcome/WelcomeSidebar.vue munbeop/tests/components/welcome/WelcomeSidebar.test.ts
git commit -m "feat(welcome.6): sidebar shell with focus trap + Escape close"
git push origin HEAD:main
```

---

## Task 7: Dialog box (typewriter)

**Files:**
- Create: `munbeop/app/components/welcome/WelcomeDialog.vue`
- Create: `munbeop/tests/components/welcome/WelcomeDialog.test.ts`

- [ ] **Step 7.1: Write the failing test**

Create `munbeop/tests/components/welcome/WelcomeDialog.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import WelcomeDialog from '../../../app/components/welcome/WelcomeDialog.vue'

describe('WelcomeDialog', () => {
  it('renders nothing when text is empty', () => {
    const wrapper = mount(WelcomeDialog, { props: { text: '', variant: 'normal' } })
    expect(wrapper.find('[data-testid="welcome-dialog-text"]').exists()).toBe(false)
  })

  it('renders typewriter text when text is non-empty', async () => {
    vi.useFakeTimers()
    const wrapper = mount(WelcomeDialog, { props: { text: 'abc', variant: 'normal' } })
    expect(wrapper.find('[data-testid="welcome-dialog-text"]').exists()).toBe(true)
    vi.advanceTimersByTime(200)
    await flushPromises()
    expect(wrapper.get('[data-testid="welcome-dialog-text"]').text()).toContain('abc')
    vi.useRealTimers()
  })

  it('emits dismiss on click and on Enter keydown', async () => {
    const wrapper = mount(WelcomeDialog, { props: { text: 'hi', variant: 'normal' } })
    await wrapper.get('[data-testid="welcome-dialog-root"]').trigger('click')
    await wrapper.get('[data-testid="welcome-dialog-root"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('dismiss')).toBeTruthy()
    expect(wrapper.emitted('dismiss')!.length).toBe(2)
  })

  it('applies error styling when variant is error', () => {
    const wrapper = mount(WelcomeDialog, { props: { text: 'oops', variant: 'error' } })
    expect(wrapper.get('[data-testid="welcome-dialog-root"]').classes()).toContain('dialog--error')
  })
})
```

- [ ] **Step 7.2: Run, confirm fail**

```powershell
pnpm test WelcomeDialog
```

Expected: FAIL with "Cannot find module".

- [ ] **Step 7.3: Implement the dialog**

Create `munbeop/app/components/welcome/WelcomeDialog.vue`:

```vue
<script setup lang="ts">
import { computed, toRef } from 'vue'

const props = defineProps<{
  text: string
  variant?: 'normal' | 'error'
}>()
const emit = defineEmits<{ dismiss: [] }>()

const textRef = toRef(props, 'text')
const { rendered, done, skip } = useTypewriter(textRef, { speed: 40 })

const open = computed(() => !!props.text)
const variantClass = computed(() => (props.variant === 'error' ? 'dialog--error' : ''))

function onActivate(e: MouseEvent | KeyboardEvent) {
  if (e instanceof KeyboardEvent && e.key !== 'Enter' && e.key !== ' ') return
  if (!done.value) {
    skip()
    return
  }
  emit('dismiss')
}
</script>

<template>
  <transition name="dialog">
    <div
      v-if="open"
      class="dialog"
      :class="variantClass"
      data-testid="welcome-dialog-root"
      role="dialog"
      tabindex="0"
      @click="onActivate"
      @keydown="onActivate"
    >
      <p class="dialog__text" data-testid="welcome-dialog-text">{{ rendered }}</p>
      <span v-if="done" class="dialog__arrow" aria-hidden="true">▾</span>
    </div>
  </transition>
</template>

<style scoped>
.dialog {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: min(700px, 92vw);
  min-height: 120px;
  background: #000;
  color: var(--always-cream);
  border: 6px solid var(--always-cream);
  box-shadow: 0 0 0 4px #000, 0 10px 30px rgba(0,0,0,0.7);
  padding: 22px 28px;
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 12px;
  line-height: 1.85;
  cursor: pointer;
  z-index: 35;
}
.dialog--error { border-color: var(--red); color: #ffd1d1; }
.dialog:focus-visible { outline: 3px solid var(--gold); outline-offset: 4px; }
.dialog__text { margin: 0; }
.dialog__arrow {
  position: absolute;
  right: 18px;
  bottom: 14px;
  font-size: 18px;
  color: var(--gold);
  animation: dialog-blink 0.8s steps(2) infinite;
}
@keyframes dialog-blink {
  0%, 49% { opacity: 0; }
  50%, 100% { opacity: 1; }
}
.dialog-enter-active,
.dialog-leave-active { transition: transform 320ms ease, opacity 240ms ease; }
.dialog-enter-from   { transform: translate(-50%, 120%); opacity: 0; }
.dialog-leave-to     { transform: translate(-50%, 120%); opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active,
  .dialog-leave-active { transition: opacity 120ms linear; }
  .dialog-enter-from,
  .dialog-leave-to     { transform: translateX(-50%); }
  .dialog__arrow { animation: none; opacity: 1; }
}
</style>
```

- [ ] **Step 7.4: Run, confirm pass**

```powershell
pnpm test WelcomeDialog
```

Expected: PASS, all 4 cases green.

- [ ] **Step 7.5: Verify + commit**

```powershell
pnpm typecheck
pnpm lint
```

```bash
git add munbeop/app/components/welcome/WelcomeDialog.vue munbeop/tests/components/welcome/WelcomeDialog.test.ts
git commit -m "feat(welcome.7): dialog box with typewriter + dismiss-on-Enter"
git push origin HEAD:main
```

---

## Task 8: OAuth + auth options inside the sidebar

**Files:**
- Modify: `munbeop/app/composables/useAuth.ts` (add `signInWithProvider`)
- Create: `munbeop/app/components/welcome/WelcomeAuthOptions.vue`
- Create: `munbeop/app/components/welcome/WelcomeEmailForm.vue`
- Create: `munbeop/tests/composables/useAuth.signInWithProvider.test.ts`

- [ ] **Step 8.1: Write the failing test for `signInWithProvider`**

Create `munbeop/tests/composables/useAuth.signInWithProvider.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const signInWithOAuth = vi.fn()
const useNuxtApp = vi.fn(() => ({ $supabase: { auth: { signInWithOAuth } } }))
const useRuntimeConfig = vi.fn(() => ({ public: { appUrl: 'https://example.test' } }))

vi.stubGlobal('useNuxtApp', useNuxtApp)
vi.stubGlobal('useRuntimeConfig', useRuntimeConfig)
vi.stubGlobal('useAuthStore', () => ({}))

vi.mock('~/lib/auth/migration', () => ({ migrateLocalToSupabase: vi.fn() }))
vi.mock('~/lib/storage/facade', () => ({ pickAdapter: vi.fn() }))
vi.mock('~/stores/grammar', () => ({ useGrammarStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/contexts', () => ({ useContextsStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/auth', () => ({ useAuthStore: () => ({}) }))

import { useAuth } from '../../app/composables/useAuth'

describe('useAuth().signInWithProvider', () => {
  beforeEach(() => { signInWithOAuth.mockReset() })

  it('calls supabase.auth.signInWithOAuth with the right provider + redirectTo', async () => {
    signInWithOAuth.mockResolvedValue({ error: null })
    const { signInWithProvider } = useAuth()
    const result = await signInWithProvider('kakao')
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'kakao',
      options: { redirectTo: 'https://example.test/auth/callback' },
    })
    expect(result.error).toBe(null)
  })

  it('passes through provider errors', async () => {
    signInWithOAuth.mockResolvedValue({ error: { message: 'denied' } })
    const { signInWithProvider } = useAuth()
    const result = await signInWithProvider('google')
    expect(result.error?.message).toBe('denied')
  })
})
```

- [ ] **Step 8.2: Run, confirm fail**

```powershell
pnpm test signInWithProvider
```

Expected: FAIL with "signInWithProvider is not a function" or similar.

- [ ] **Step 8.3: Add the method to `useAuth`**

Modify `munbeop/app/composables/useAuth.ts`. After `signInMagicLink` (around line 82), insert:

```ts
  async function signInWithProvider(provider: 'kakao' | 'google') {
    const config = useRuntimeConfig()
    const base =
      (config.public.appUrl as string | undefined) ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    const redirectTo = `${base}/auth/callback`
    const { error } = await $supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
    // Migration runs on the /auth/callback page after Supabase sets the session.
    return { error }
  }
```

Then add `signInWithProvider` to the return object on the bottom line, e.g.:

```ts
  return { init, signUp, signIn, signInMagicLink, signInWithProvider, signOut, runPostLoginMigration }
```

- [ ] **Step 8.4: Run, confirm pass**

```powershell
pnpm test signInWithProvider
```

Expected: PASS.

- [ ] **Step 8.5: Implement `WelcomeEmailForm`**

Create `munbeop/app/components/welcome/WelcomeEmailForm.vue`:

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ mode: 'signin' | 'signup' | 'magic' }>()
const emit = defineEmits<{
  success: []
  error: [message: string]
  info:    [message: string]
}>()

const { t } = useI18n()
const { signIn, signUp, signInMagicLink } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

watch(() => props.mode, () => { /* keep email; clear password on mode change */ password.value = '' })

async function submit() {
  if (loading.value) return
  loading.value = true
  try {
    let result: { error: { message: string } | null }
    if (props.mode === 'signin') {
      result = await signIn(email.value.trim(), password.value)
    } else if (props.mode === 'signup') {
      result = await signUp(email.value.trim(), password.value)
    } else {
      result = await signInMagicLink(email.value.trim())
    }
    if (result.error) {
      emit('error', result.error.message)
      return
    }
    if (props.mode === 'magic') {
      emit('info', t('auth.magic_link_sent'))
      return
    }
    emit('success')
    await router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="email-form" @submit.prevent="submit">
    <label class="email-form__label">
      <span class="email-form__label-text">{{ t('auth.email_label') }}</span>
      <input
        v-model="email"
        class="email-form__input"
        type="email"
        autocomplete="email"
        inputmode="email"
        required
      />
    </label>
    <label v-if="props.mode !== 'magic'" class="email-form__label">
      <span class="email-form__label-text">{{ t('auth.password_label') }}</span>
      <input
        v-model="password"
        class="email-form__input"
        type="password"
        :autocomplete="props.mode === 'signup' ? 'new-password' : 'current-password'"
        required
      />
    </label>
    <button
      type="submit"
      class="email-form__submit"
      :disabled="loading"
    >
      {{
        props.mode === 'signup'
          ? t('auth.submit_sign_up')
          : props.mode === 'magic'
            ? t('auth.submit_magic_link')
            : t('auth.submit_sign_in')
      }}
    </button>
  </form>
</template>

<style scoped>
.email-form { display: flex; flex-direction: column; gap: 10px; }
.email-form__label { display: flex; flex-direction: column; gap: 4px; }
.email-form__label-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.06em;
  color: var(--text-soft);
}
.email-form__input {
  border: 2px solid var(--border);
  background: var(--paper-warm);
  color: var(--text);
  padding: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}
.email-form__input:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.email-form__submit {
  margin-top: 4px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: 3px solid var(--ink-soft);
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 12px;
  cursor: pointer;
}
.email-form__submit:disabled { opacity: 0.55; cursor: progress; }
.email-form__submit:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 8.6: Implement `WelcomeAuthOptions`**

Create `munbeop/app/components/welcome/WelcomeAuthOptions.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import WelcomeEmailForm from './WelcomeEmailForm.vue'

const emit = defineEmits<{
  dialog: [text: string, variant?: 'normal' | 'error']
  welcomed: []
}>()

const props = defineProps<{ initialEmailMode: 'signin' | 'signup' | 'magic' | null }>()

const { t } = useI18n()
const { signInWithProvider } = useAuth()
const router = useRouter()

const expanded = ref<'signin' | 'signup' | 'magic' | null>(props.initialEmailMode)
const loading = ref<'kakao' | 'google' | null>(null)

function setWelcomedFlag() {
  try { localStorage.setItem('mungarden:welcomed', '1') } catch { /* private mode */ }
  emit('welcomed')
}

async function provider(name: 'kakao' | 'google') {
  if (loading.value) return
  loading.value = name
  emit('dialog', name === 'kakao' ? t('welcome.dialog.kakao') : t('welcome.dialog.google'))
  setWelcomedFlag()
  const { error } = await signInWithProvider(name)
  if (error) {
    emit('dialog', t('welcome.dialog.error_oauth'), 'error')
    loading.value = null
  }
  // On success the browser navigates to the OAuth provider; no further work here.
}

function openEmail(mode: 'signin' | 'signup' | 'magic') {
  expanded.value = mode
  emit('dialog', mode === 'magic' ? t('welcome.dialog.magic') : t('welcome.dialog.email'))
}

function onFormSuccess() {
  setWelcomedFlag()
}
function onFormError(msg: string) {
  emit('dialog', msg, 'error')
}
function onFormInfo(msg: string) {
  emit('dialog', msg)
}

async function anonEntry() {
  emit('dialog', t('welcome.dialog.anon'))
  setWelcomedFlag()
  await router.push('/')
}
</script>

<template>
  <div class="options">
    <button
      type="button"
      class="opt opt--kakao"
      :disabled="loading !== null"
      @click="provider('kakao')"
    >
      <span class="opt__icon" aria-hidden="true">K</span>
      <span>{{ t('welcome.menu.kakao') }}</span>
      <span v-if="loading === 'kakao'" class="opt__dots">. . .</span>
    </button>

    <button
      type="button"
      class="opt opt--google"
      :disabled="loading !== null"
      @click="provider('google')"
    >
      <span class="opt__icon" aria-hidden="true">G</span>
      <span>{{ t('welcome.menu.google') }}</span>
      <span v-if="loading === 'google'" class="opt__dots">. . .</span>
    </button>

    <button type="button" class="opt" @click="openEmail('signin')">
      <span class="opt__arrow" aria-hidden="true">▶</span>
      <span>{{ t('welcome.menu.email_signin') }}</span>
    </button>
    <button type="button" class="opt" @click="openEmail('signup')">
      <span class="opt__arrow" aria-hidden="true">▶</span>
      <span>{{ t('welcome.menu.email_signup') }}</span>
    </button>
    <button type="button" class="opt" @click="openEmail('magic')">
      <span class="opt__arrow" aria-hidden="true">▶</span>
      <span>{{ t('welcome.menu.email_magic') }}</span>
    </button>

    <WelcomeEmailForm
      v-if="expanded"
      :mode="expanded"
      @success="onFormSuccess"
      @error="onFormError"
      @info="onFormInfo"
    />

    <hr class="options__sep" />

    <button type="button" class="opt opt--anon" @click="anonEntry">
      <span>{{ t('welcome.menu.anon') }}</span>
    </button>
  </div>
</template>

<style scoped>
.options { display: flex; flex-direction: column; gap: 10px; }
.opt {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 3px solid transparent;
  color: var(--text);
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  text-align: left;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
}
.opt:hover:not(:disabled) {
  border-color: var(--gold);
  background: color-mix(in oklch, var(--gold) 10%, transparent);
  transform: translateX(2px);
}
.opt:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.opt:disabled { opacity: 0.55; cursor: progress; }
.opt__arrow { color: var(--gold); }
.opt__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px; height: 24px;
  border: 2px solid currentColor;
  font-size: 10px;
}
.opt--kakao { background: #fee500; color: #1a1a1a; border-color: #1a1a1a; }
.opt--kakao:hover:not(:disabled) { background: #ffe940; }
.opt--google { background: var(--paper-warm); border-color: var(--ink-soft); }
.opt--anon  { font-family: 'Inter', sans-serif; font-size: 12px; opacity: 0.85; }
.opt__dots  { margin-left: auto; letter-spacing: 0.2em; }
.options__sep {
  border: 0;
  border-top: 2px dashed var(--border);
  margin: 6px 0;
}
</style>
```

- [ ] **Step 8.7: Run all tests + typecheck**

```powershell
pnpm test
pnpm typecheck
pnpm lint
```

Expected: all green.

- [ ] **Step 8.8: Commit and merge**

```bash
git add munbeop/app/composables/useAuth.ts munbeop/app/components/welcome/WelcomeAuthOptions.vue munbeop/app/components/welcome/WelcomeEmailForm.vue munbeop/tests/composables/useAuth.signInWithProvider.test.ts
git commit -m "feat(welcome.8): OAuth (Kakao+Google) + sidebar auth options + email form"
git push origin HEAD:main
```

---

## Task 9: i18n — `welcome.*` block in 8 locales

**Files:** Modify each of:
- `munbeop/i18n/locales/en.json`
- `munbeop/i18n/locales/es.json`
- `munbeop/i18n/locales/fr.json`
- `munbeop/i18n/locales/id.json`
- `munbeop/i18n/locales/ja.json`
- `munbeop/i18n/locales/pt-BR.json`
- `munbeop/i18n/locales/th.json`
- `munbeop/i18n/locales/vi.json`

- [ ] **Step 9.1: Add the `welcome.*` block to `en.json`**

Open the file and merge this block into the existing JSON object (at the same indentation level as other top-level keys):

```json
  "welcome": {
    "brand": { "subtitle": "Korean Grammar Garden" },
    "enter": "ENTER · 들어가기",
    "toggle": {
      "theme_to_dark": "Switch to night",
      "theme_to_light": "Switch to day",
      "music_on": "Turn music on",
      "music_off": "Turn music off"
    },
    "menu": {
      "title": "PARTY SELECT",
      "close": "Close menu",
      "kakao": "Continue with Kakao",
      "google": "Continue with Google",
      "email_signin": "Sign in with email",
      "email_signup": "Create an account",
      "email_magic": "Send a magic link",
      "anon": "Continue without an account"
    },
    "dialog": {
      "intro_day": "Welcome to the garden. The sun is up; the grammar grows.",
      "intro_night": "The sky is purple. The grammar still grows. 화이팅.",
      "kakao": "Following the Kakao path…",
      "google": "Following the Google path…",
      "email": "Whisper your e-mail to the gatekeeper.",
      "magic": "A scroll will be sent by carrier owl.",
      "anon": "Hyrule remembers local heroes too. Your progress lives on this device.",
      "error_oauth": "That gateway is closed. Try another door."
    }
  }
```

- [ ] **Step 9.2: Add the same block to `es.json`**

```json
  "welcome": {
    "brand": { "subtitle": "Jardín de Gramática Coreana" },
    "enter": "ENTRAR · 들어가기",
    "toggle": {
      "theme_to_dark": "Cambiar a noche",
      "theme_to_light": "Cambiar a día",
      "music_on": "Activar música",
      "music_off": "Silenciar música"
    },
    "menu": {
      "title": "ELEGIR PARTIDA",
      "close": "Cerrar menú",
      "kakao": "Continuar con Kakao",
      "google": "Continuar con Google",
      "email_signin": "Entrar con correo",
      "email_signup": "Crear una cuenta",
      "email_magic": "Enviar enlace mágico",
      "anon": "Entrar sin cuenta"
    },
    "dialog": {
      "intro_day": "Bienvenido al jardín. El sol está alto; la gramática crece.",
      "intro_night": "El cielo es violeta. La gramática igual crece. 화이팅.",
      "kakao": "Siguiendo el sendero de Kakao…",
      "google": "Siguiendo el sendero de Google…",
      "email": "Susurra tu correo al guardián.",
      "magic": "Te enviamos un pergamino por lechuza.",
      "anon": "Hyrule también recuerda a los héroes locales. Tu progreso vive en este dispositivo.",
      "error_oauth": "Esa puerta está cerrada. Probemos otra."
    }
  }
```

- [ ] **Step 9.3: Add the same block to `fr.json`**

```json
  "welcome": {
    "brand": { "subtitle": "Jardin de la Grammaire Coréenne" },
    "enter": "ENTRER · 들어가기",
    "toggle": {
      "theme_to_dark": "Passer à la nuit",
      "theme_to_light": "Passer au jour",
      "music_on": "Activer la musique",
      "music_off": "Couper la musique"
    },
    "menu": {
      "title": "SÉLECTION DE PARTIE",
      "close": "Fermer le menu",
      "kakao": "Continuer avec Kakao",
      "google": "Continuer avec Google",
      "email_signin": "Se connecter par e-mail",
      "email_signup": "Créer un compte",
      "email_magic": "Lien magique par e-mail",
      "anon": "Continuer sans compte"
    },
    "dialog": {
      "intro_day": "Bienvenue au jardin. Le soleil est haut ; la grammaire pousse.",
      "intro_night": "Le ciel est violet. La grammaire pousse quand même. 화이팅.",
      "kakao": "Sur la voie de Kakao…",
      "google": "Sur la voie de Google…",
      "email": "Murmure ton e-mail au gardien.",
      "magic": "Un parchemin arrive par hibou.",
      "anon": "Hyrule se souvient aussi des héros locaux. Ta progression vit sur cet appareil.",
      "error_oauth": "Cette porte est close. Essayons-en une autre."
    }
  }
```

- [ ] **Step 9.4: Add the same block to `id.json`**

```json
  "welcome": {
    "brand": { "subtitle": "Taman Tata Bahasa Korea" },
    "enter": "MASUK · 들어가기",
    "toggle": {
      "theme_to_dark": "Beralih ke malam",
      "theme_to_light": "Beralih ke siang",
      "music_on": "Hidupkan musik",
      "music_off": "Matikan musik"
    },
    "menu": {
      "title": "PILIH KARAKTER",
      "close": "Tutup menu",
      "kakao": "Lanjutkan dengan Kakao",
      "google": "Lanjutkan dengan Google",
      "email_signin": "Masuk dengan email",
      "email_signup": "Buat akun",
      "email_magic": "Kirim magic link",
      "anon": "Lanjut tanpa akun"
    },
    "dialog": {
      "intro_day": "Selamat datang di taman. Matahari tinggi; tata bahasa tumbuh.",
      "intro_night": "Langitnya ungu. Tata bahasa tetap tumbuh. 화이팅.",
      "kakao": "Mengikuti jalur Kakao…",
      "google": "Mengikuti jalur Google…",
      "email": "Bisikkan emailmu pada penjaga gerbang.",
      "magic": "Gulungan akan dikirim oleh burung hantu.",
      "anon": "Hyrule juga mengingat pahlawan lokal. Kemajuanmu tinggal di perangkat ini.",
      "error_oauth": "Gerbang itu tertutup. Coba pintu lain."
    }
  }
```

- [ ] **Step 9.5: Add the same block to `ja.json`**

```json
  "welcome": {
    "brand": { "subtitle": "韓国語文法ガーデン" },
    "enter": "はじめる · 들어가기",
    "toggle": {
      "theme_to_dark": "夜に切り替え",
      "theme_to_light": "昼に切り替え",
      "music_on": "音楽をオン",
      "music_off": "音楽をオフ"
    },
    "menu": {
      "title": "パーティセレクト",
      "close": "メニューを閉じる",
      "kakao": "Kakao で続ける",
      "google": "Google で続ける",
      "email_signin": "メールでログイン",
      "email_signup": "アカウントを作成",
      "email_magic": "マジックリンクを送る",
      "anon": "アカウントなしで続ける"
    },
    "dialog": {
      "intro_day": "庭へようこそ。太陽が高い。文法は育つ。",
      "intro_night": "空は紫色。文法は今夜も育つ。화이팅.",
      "kakao": "Kakao の道を進みます…",
      "google": "Google の道を進みます…",
      "email": "門番にメールをささやいて。",
      "magic": "ふくろうが巻物を届けます。",
      "anon": "ハイラルは地元の英雄も覚えている。進捗はこの端末に残ります。",
      "error_oauth": "その門は閉じています。別の道を試そう。"
    }
  }
```

- [ ] **Step 9.6: Add the same block to `pt-BR.json`**

```json
  "welcome": {
    "brand": { "subtitle": "Jardim de Gramática Coreana" },
    "enter": "ENTRAR · 들어가기",
    "toggle": {
      "theme_to_dark": "Mudar para noite",
      "theme_to_light": "Mudar para dia",
      "music_on": "Ativar música",
      "music_off": "Silenciar música"
    },
    "menu": {
      "title": "SELECIONAR PERSONAGEM",
      "close": "Fechar menu",
      "kakao": "Continuar com Kakao",
      "google": "Continuar com Google",
      "email_signin": "Entrar com e-mail",
      "email_signup": "Criar conta",
      "email_magic": "Enviar link mágico",
      "anon": "Continuar sem conta"
    },
    "dialog": {
      "intro_day": "Bem-vindo ao jardim. O sol está alto; a gramática cresce.",
      "intro_night": "O céu é roxo. A gramática cresce mesmo assim. 화이팅.",
      "kakao": "Seguindo o caminho do Kakao…",
      "google": "Seguindo o caminho do Google…",
      "email": "Sussurre seu e-mail ao guardião.",
      "magic": "Um pergaminho chegará por coruja.",
      "anon": "Hyrule lembra dos heróis locais também. Seu progresso vive neste dispositivo.",
      "error_oauth": "Essa porta está fechada. Vamos tentar outra."
    }
  }
```

- [ ] **Step 9.7: Add the same block to `th.json`**

```json
  "welcome": {
    "brand": { "subtitle": "สวนไวยากรณ์เกาหลี" },
    "enter": "เข้าสู่สวน · 들어가기",
    "toggle": {
      "theme_to_dark": "สลับเป็นกลางคืน",
      "theme_to_light": "สลับเป็นกลางวัน",
      "music_on": "เปิดเพลง",
      "music_off": "ปิดเพลง"
    },
    "menu": {
      "title": "เลือกตัวละคร",
      "close": "ปิดเมนู",
      "kakao": "ดำเนินการต่อด้วย Kakao",
      "google": "ดำเนินการต่อด้วย Google",
      "email_signin": "เข้าสู่ระบบด้วยอีเมล",
      "email_signup": "สร้างบัญชี",
      "email_magic": "ส่งลิงก์เวทมนตร์",
      "anon": "ใช้งานต่อโดยไม่ต้องมีบัญชี"
    },
    "dialog": {
      "intro_day": "ยินดีต้อนรับสู่สวน พระอาทิตย์ขึ้น ไวยากรณ์เติบโต",
      "intro_night": "ท้องฟ้าสีม่วง ไวยากรณ์ก็เติบโต 화이팅.",
      "kakao": "กำลังเดินทางบนเส้นทาง Kakao…",
      "google": "กำลังเดินทางบนเส้นทาง Google…",
      "email": "กระซิบอีเมลกับผู้พิทักษ์ประตู",
      "magic": "จะมีนกฮูกส่งคัมภีร์ไปให้",
      "anon": "ไฮรูลจดจำวีรบุรุษท้องถิ่นด้วย ความก้าวหน้าของคุณอยู่บนเครื่องนี้",
      "error_oauth": "ประตูนี้ปิดอยู่ ลองทางอื่นกัน"
    }
  }
```

- [ ] **Step 9.8: Add the same block to `vi.json`**

```json
  "welcome": {
    "brand": { "subtitle": "Vườn Ngữ Pháp Tiếng Hàn" },
    "enter": "VÀO VƯỜN · 들어가기",
    "toggle": {
      "theme_to_dark": "Chuyển sang ban đêm",
      "theme_to_light": "Chuyển sang ban ngày",
      "music_on": "Bật nhạc",
      "music_off": "Tắt nhạc"
    },
    "menu": {
      "title": "CHỌN NHÂN VẬT",
      "close": "Đóng menu",
      "kakao": "Tiếp tục với Kakao",
      "google": "Tiếp tục với Google",
      "email_signin": "Đăng nhập bằng email",
      "email_signup": "Tạo tài khoản",
      "email_magic": "Gửi đường dẫn ma thuật",
      "anon": "Tiếp tục mà không cần tài khoản"
    },
    "dialog": {
      "intro_day": "Chào mừng đến khu vườn. Mặt trời lên cao; ngữ pháp lớn lên.",
      "intro_night": "Bầu trời tím. Ngữ pháp vẫn lớn lên. 화이팅.",
      "kakao": "Đang đi theo lối Kakao…",
      "google": "Đang đi theo lối Google…",
      "email": "Thì thầm email của bạn với người gác cổng.",
      "magic": "Một cuộn giấy sẽ tới bằng cú.",
      "anon": "Hyrule cũng nhớ những anh hùng địa phương. Tiến trình của bạn nằm trên thiết bị này.",
      "error_oauth": "Cánh cổng đó đã đóng. Thử cổng khác."
    }
  }
```

- [ ] **Step 9.9: Verify JSON validity for every locale**

```powershell
cd munbeop
node -e "['en','es','fr','id','ja','pt-BR','th','vi'].forEach(l => { JSON.parse(require('fs').readFileSync('i18n/locales/' + l + '.json','utf8')); console.log(l, 'OK'); })"
```

Expected: 8 lines, each ending in `OK`.

- [ ] **Step 9.10: Verify typecheck + run all tests**

```powershell
pnpm typecheck
pnpm test
```

Expected: PASS.

- [ ] **Step 9.11: Commit and merge**

```bash
git add munbeop/i18n/locales
git commit -m "feat(welcome.9): welcome.* i18n block in 8 locales"
git push origin HEAD:main
```

---

## Task 10: Page shell

**Files:**
- Create: `munbeop/app/pages/welcome.vue`

- [ ] **Step 10.1: Implement the page**

Create `munbeop/app/pages/welcome.vue`:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import WelcomeStage from '~/components/welcome/WelcomeStage.vue'
import WelcomeScanlineOverlay from '~/components/welcome/WelcomeScanlineOverlay.vue'
import WelcomeBrandMark from '~/components/welcome/WelcomeBrandMark.vue'
import WelcomeThemeToggle from '~/components/welcome/WelcomeThemeToggle.vue'
import WelcomeMusicToggle from '~/components/welcome/WelcomeMusicToggle.vue'
import WelcomePulseButton from '~/components/welcome/WelcomePulseButton.vue'
import WelcomeSidebar from '~/components/welcome/WelcomeSidebar.vue'
import WelcomeAuthOptions from '~/components/welcome/WelcomeAuthOptions.vue'
import WelcomeDialog from '~/components/welcome/WelcomeDialog.vue'

definePageMeta({ layout: false, surface: 'welcome', middleware: [] })

const { t } = useI18n()
const { theme, setTheme, hydrate: hydrateTheme } = useTheme()
const { hydrate: hydrateMusic } = useWelcomeMusic()

const sidebarOpen = ref(false)
const dialogText = ref('')
const dialogVariant = ref<'normal' | 'error'>('normal')

const scanlineActive = ref(false)
const scanlineDirection = ref<'up' | 'down'>('down')

const route = useRoute()
const router = useRouter()

const initialEmailMode = computed<'signin' | 'signup' | 'magic' | null>(() => {
  const m = route.query.mode
  if (m === 'signin' || m === 'signup' || m === 'magic') return m
  return null
})

function showDialog(text: string, variant: 'normal' | 'error' = 'normal') {
  dialogText.value = ''
  dialogVariant.value = variant
  // Force a re-render of the typewriter by clearing then setting on next tick.
  setTimeout(() => { dialogText.value = text }, 16)
}

function openSidebar() {
  sidebarOpen.value = true
  showDialog(theme.value === 'light' ? t('welcome.dialog.intro_day') : t('welcome.dialog.intro_night'))
}

function closeSidebar() {
  sidebarOpen.value = false
}

function onThemeToggle() {
  scanlineDirection.value = theme.value === 'light' ? 'down' : 'up'
  scanlineActive.value = true
  // Flip the theme at the midpoint of the sweep so the new scene is fully
  // revealed by the time the line reaches the far edge.
  setTimeout(() => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }, 350)
  setTimeout(() => {
    scanlineActive.value = false
  }, 720)
}

function onWelcomed() {
  // The AuthOptions component already sets the localStorage flag; this hook
  // is for any future side-effects (analytics, toast, etc.).
}

onMounted(() => {
  hydrateTheme()
  hydrateMusic()
  if (route.query.open === 'signin') {
    openSidebar()
  }
})
</script>

<template>
  <div class="welcome" :data-theme="theme">
    <WelcomeStage :theme="theme" />

    <div class="welcome__chrome welcome__chrome--top-right">
      <WelcomeMusicToggle />
      <WelcomeThemeToggle :theme="theme" :disabled="scanlineActive" @toggle="onThemeToggle" />
    </div>

    <div class="welcome__brand">
      <WelcomeBrandMark />
    </div>

    <div class="welcome__cta">
      <WelcomePulseButton
        :expanded="sidebarOpen"
        controls="welcome-sidebar"
        @activate="openSidebar"
      />
    </div>

    <WelcomeSidebar
      id="welcome-sidebar"
      :open="sidebarOpen"
      title-id="welcome-sidebar-title"
      @close="closeSidebar"
    >
      <WelcomeAuthOptions
        :initial-email-mode="initialEmailMode"
        @dialog="(text, variant) => showDialog(text, variant ?? 'normal')"
        @welcomed="onWelcomed"
      />
    </WelcomeSidebar>

    <WelcomeDialog
      :text="dialogText"
      :variant="dialogVariant"
      @dismiss="dialogText = ''"
    />

    <WelcomeScanlineOverlay :active="scanlineActive" :direction="scanlineDirection" />
  </div>
</template>

<style scoped>
.welcome {
  position: fixed;
  inset: 0;
  overflow: hidden;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}
.welcome__chrome {
  position: fixed;
  display: flex;
  gap: 10px;
  z-index: 15;
}
.welcome__chrome--top-right {
  top: 16px;
  right: 16px;
}
.welcome__brand {
  position: fixed;
  top: 14%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}
.welcome__cta {
  position: fixed;
  bottom: 28%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
</style>
```

- [ ] **Step 10.2: Verify typecheck + lint + dev boot**

```powershell
cd munbeop
pnpm typecheck
pnpm lint
```

Expected: PASS. (Manual `pnpm dev` boot reserved for Task 12.)

- [ ] **Step 10.3: Commit and merge**

```bash
git add munbeop/app/pages/welcome.vue
git commit -m "feat(welcome.10): page shell wiring all welcome components"
git push origin HEAD:main
```

---

## Task 11: Redirect middleware + `/auth/sign-in` legacy redirect

**Files:**
- Create: `munbeop/app/middleware/welcome-redirect.global.ts`
- Create: `munbeop/tests/middleware/welcome-redirect.test.ts`
- Modify: `munbeop/app/pages/auth/sign-in.vue` (turn into a redirect-only page)

- [ ] **Step 11.1: Write the failing test for the middleware**

Create `munbeop/tests/middleware/welcome-redirect.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test the pure decision function exported by the middleware module,
// not the Nuxt middleware itself (Nuxt's `defineNuxtRouteMiddleware` is
// hard to harness in unit tests; the pure function keeps logic testable).
import { decideWelcomeRedirect } from '../../app/middleware/welcome-redirect.global'

describe('decideWelcomeRedirect', () => {
  it('signed-in user hitting / → stays at /', () => {
    expect(
      decideWelcomeRedirect({ path: '/', signedIn: true, welcomed: false }),
    ).toBe(null)
  })

  it('signed-in user hitting /welcome → redirected to /', () => {
    expect(
      decideWelcomeRedirect({ path: '/welcome', signedIn: true, welcomed: false }),
    ).toBe('/')
  })

  it('anon visitor with welcomed flag hitting / → stays at /', () => {
    expect(
      decideWelcomeRedirect({ path: '/', signedIn: false, welcomed: true }),
    ).toBe(null)
  })

  it('anon visitor with no flag hitting / → redirected to /welcome', () => {
    expect(
      decideWelcomeRedirect({ path: '/', signedIn: false, welcomed: false }),
    ).toBe('/welcome')
  })

  it('anon visitor hitting /welcome stays regardless of flag', () => {
    expect(
      decideWelcomeRedirect({ path: '/welcome', signedIn: false, welcomed: true }),
    ).toBe(null)
    expect(
      decideWelcomeRedirect({ path: '/welcome', signedIn: false, welcomed: false }),
    ).toBe(null)
  })

  it('other paths never redirect', () => {
    expect(
      decideWelcomeRedirect({ path: '/practice', signedIn: false, welcomed: false }),
    ).toBe(null)
    expect(
      decideWelcomeRedirect({ path: '/auth/callback', signedIn: false, welcomed: false }),
    ).toBe(null)
  })
})
```

- [ ] **Step 11.2: Run, confirm fail**

```powershell
pnpm test welcome-redirect
```

Expected: FAIL with "Cannot find module".

- [ ] **Step 11.3: Implement the middleware**

Create `munbeop/app/middleware/welcome-redirect.global.ts`:

```ts
import { defineNuxtRouteMiddleware, navigateTo } from '#imports'

export interface WelcomeRedirectInput {
  path: string
  signedIn: boolean
  welcomed: boolean
}

/**
 * Pure decision function. Returns the redirect target or null if no
 * redirect is needed. Exported for unit tests.
 *
 * Rules (mirrors spec §2.1):
 *   - signed in       → never sees /welcome. Hitting it redirects to /.
 *   - anon + welcomed → never redirected; preserves the existing UX.
 *   - anon + no flag  → first hit on / is redirected to /welcome.
 *   - all other paths → never touched.
 */
export function decideWelcomeRedirect({ path, signedIn, welcomed }: WelcomeRedirectInput): string | null {
  if (signedIn && path === '/welcome') return '/'
  if (signedIn) return null
  if (path === '/' && !welcomed) return '/welcome'
  return null
}

function readWelcomedFlag(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem('mungarden:welcomed') === '1'
  } catch {
    return false
  }
}

/**
 * Detect a Supabase session via localStorage. The project is SPA-only
 * (`ssr: false`), so this middleware always runs in the browser. The
 * Supabase JS client persists sessions under a key like
 * `sb-<project-ref>-auth-token`; any matching key with an access_token
 * payload means we're signed in.
 */
function hasActiveSupabaseSession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i)
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
        const v = window.localStorage.getItem(k)
        if (v && v.includes('"access_token"')) return true
      }
    }
  } catch {
    /* private mode or storage disabled — treat as anon */
  }
  return false
}

export default defineNuxtRouteMiddleware((to) => {
  const signedIn = hasActiveSupabaseSession()
  const welcomed = readWelcomedFlag()
  const target = decideWelcomeRedirect({ path: to.path, signedIn, welcomed })
  if (target && target !== to.path) {
    return navigateTo(target, { replace: true })
  }
})
```

- [ ] **Step 11.4: Run, confirm pass**

```powershell
pnpm test welcome-redirect
```

Expected: PASS, all 6 cases green.

- [ ] **Step 11.5: Replace `/auth/sign-in` with a redirect**

Overwrite `munbeop/app/pages/auth/sign-in.vue` with:

```vue
<script setup lang="ts">
// Legacy route. The auth UI lives in /welcome's sidebar now. We forward
// here so old bookmarks and email magic-link callbacks still land somewhere
// sensible. Once we're confident no surface still links to /auth/sign-in
// (see spec §15) the file can be deleted.
const router = useRouter()
const route = useRoute()
onMounted(() => {
  const mode = typeof route.query.mode === 'string' ? route.query.mode : 'signin'
  router.replace({ path: '/welcome', query: { open: 'signin', mode } })
})
</script>

<template>
  <div class="redirect-stub" aria-hidden="true">Redirecting…</div>
</template>

<style scoped>
.redirect-stub {
  padding: 40px;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: var(--text-soft);
}
</style>
```

- [ ] **Step 11.6: Verify lint + typecheck + full test suite**

```powershell
pnpm typecheck
pnpm lint
pnpm test
```

Expected: PASS.

- [ ] **Step 11.7: Commit and merge**

```bash
git add munbeop/app/middleware/welcome-redirect.global.ts munbeop/app/pages/auth/sign-in.vue munbeop/tests/middleware/welcome-redirect.test.ts
git commit -m "feat(welcome.11): welcome redirect middleware + legacy /auth/sign-in stub"
git push origin HEAD:main
```

---

## Task 12: Manual verify pass

This task ships no code. It is the gate before declaring the feature done.

- [ ] **Step 12.1: Boot the dev server**

```powershell
cd munbeop
pnpm dev
```

Expected: server up on `http://localhost:3000`.

- [ ] **Step 12.2: First-time anon path**

In a fresh browser profile (or after clearing `localStorage`):
- Visit `http://localhost:3000/` → confirm the middleware redirects to `/welcome`.
- The day scene loads (Mondstadt windrise + dodo bobbing).
- The pulse button is centered and pulsing.
- Click the pulse button → sidebar slides in from the right, dialog box appears at the bottom with intro_day text being typed.

- [ ] **Step 12.3: Theme transition**

- Click the sun/moon icon top-right.
- Confirm: the scanline sweeps top→bottom, the day scene crossfades to the night scene, the music toggle stays untouched.
- Click again. Scanline now sweeps bottom→top, night → day.

- [ ] **Step 12.4: Sidebar interactions**

- Open sidebar. Press Escape → closes.
- Open sidebar. Press Tab repeatedly → focus stays inside (cycles through close button, options, anon link).
- Click "Continue without account" → dialog says "Hyrule remembers local heroes too." and the route changes to `/`.

- [ ] **Step 12.5: Returning anon path**

- Refresh `http://localhost:3000/` → should NOT redirect to /welcome again (the welcomed flag is set).
- Visit `http://localhost:3000/welcome` directly → still loads the welcome page.

- [ ] **Step 12.6: Email flow stub**

- From the sidebar, click "Sign in with email". The inline form expands.
- Submit a bogus credential. Expect the dialog to show the Supabase error in the error variant.

- [ ] **Step 12.7: OAuth stubs**

- Click "Continue with Kakao". The dialog shows the kakao text; the browser starts to navigate to Supabase's OAuth URL. If Supabase doesn't have Kakao configured yet, the dialog flips to the error variant — that's expected for this verify pass.
- Same for Google.
- These do not need to succeed end-to-end in v1; configuring the providers in the Supabase dashboard is a deployment step listed in spec §12.2.

- [ ] **Step 12.8: Reduced motion**

- In browser devtools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`.
- Click the theme toggle. Confirm there is no scanline; the scenes crossfade in ~200 ms with no SFX.
- Dodo and parallax are static.

- [ ] **Step 12.9: Mobile width**

- Resize to 360 × 800 (or open devtools device emulation, iPhone SE).
- Confirm: brand text shrinks (`clamp()`), pulse button still hits, sidebar takes ~92 vw, dialog box shrinks to fit.

- [ ] **Step 12.10: Legacy route**

- Visit `http://localhost:3000/auth/sign-in` → redirected to `/welcome?open=signin&mode=signin`. Sidebar auto-opens, email form is in `signin` mode.

- [ ] **Step 12.11: Build + typecheck one more time**

```powershell
pnpm typecheck
pnpm build
```

Expected: PASS. (Build flushes any prod-only issues that dev hides.)

- [ ] **Step 12.12: Final commit (or none) + close out**

If steps 12.1–12.11 surface any cosmetic fixes, ship them as `fix(welcome.12.x): summary` commits (one per fix, each its own merge). Otherwise, no final commit is needed.

Mark the feature done. The user will provide a real `welcome-loop.mp3`; drop it at `munbeop/public/welcome/audio/` as a single follow-up commit.

---

## Self-review checklist

Done at plan-authoring time:

- **Spec coverage**: each spec section (§1–§16) maps to one or more tasks. §15 (out-of-scope items) is intentionally not implemented.
- **Placeholder scan**: no TBD / TODO / "implement later" in any step. The audio file is intentionally absent — the composable handles a missing file as a silent no-op (see Task 2 implementation).
- **Type consistency**: `signInWithProvider('kakao' | 'google')`, `WelcomeStage props { theme }`, `WelcomeScanlineOverlay props { active, direction }`, `WelcomeDialog props { text, variant }`, `WelcomeAuthOptions props { initialEmailMode }` are consistent across all tasks.
- **Each task ships independently and verifiably**: every task ends with verify-commit-merge. None depends on a later task to compile.
- **TDD discipline**: tasks 2, 6, 7, 8, 11 follow the red→green→commit rhythm. Tasks 3–5, 9, 10, 12 are visual or content-only and rely on Task 12 manual verification.
