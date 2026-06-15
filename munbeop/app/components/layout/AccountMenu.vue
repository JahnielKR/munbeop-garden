<script setup lang="ts">
import { useElementBounding, useWindowSize } from '@vueuse/core'
import LocaleSwitcher from '~/components/layout/LocaleSwitcher.vue'
import Premios from '~/components/layout/Premios.vue'
import Field from '~/components/ui/Field.vue'
import Toggle from '~/components/ui/Toggle.vue'
import { NuxtLink } from '#components'
import { usePremios } from '~/composables/usePremios'
import { useAuthStore } from '~/stores/auth'
import { useSettingsStore } from '~/stores/settings'

/**
 * AccountMenu — "Placa de Unidad": a wooden plaque in the sidebar footer
 * holding a square framed pixel portrait + a premios (trophy) strip, with a
 * quick-settings popover.
 *
 * The portrait is two nested boxes — a 96px OUTER frame (this very trigger
 * button) and a centred 64px INNER (initials by default, swapped for an
 * unlocked avatar cosmetic). Unlocked frame / bg / set cosmetics compose as
 * fixed-geometry sibling layers (see usePremios().portrait). Collapsed to the
 * 64px rail the plaque dissolves to a 48px tile + a count pip.
 *
 * The popover is Teleported to <body> and position:fixed, anchored off the
 * avatar's live rect — escaping .shell__rail's overflow clip so it renders
 * fully in BOTH the expanded and collapsed rail (the old absolute popover was
 * half-cut expanded and invisible collapsed). It opens to the RIGHT of the
 * left-docked rail, clamps into the viewport, and points a pixel caret back
 * at the avatar.
 */

const props = defineProps<{ collapsed?: boolean }>()

const { t } = useI18n()
const { theme } = useTheme()
const authStore = useAuthStore()
const settings = useSettingsStore()
const { signOutAndExit } = useAuth()
const { unlockedCount, portrait } = usePremios()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const avatarRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const email = computed(() => authStore.user?.email ?? '')
const localPart = computed(() => email.value.split('@')[0] ?? '')
const initial = computed(() => (email.value.trim()[0] ?? '?').toUpperCase())
const isDark = computed<boolean>({
  get: () => theme.value === 'dark',
  set: (v) => {
    void settings.setTheme(v ? 'dark' : 'light')
  },
})

// ─── Popover positioning (Teleport + fixed, anchored to the avatar) ─────────
const MENU_W = 248
const GAP = 12
const EDGE = 8

const avatar = useElementBounding(avatarRef)
const menu = useElementBounding(menuRef)
const { width: vw, height: vh } = useWindowSize()

function clampN(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

// Prefer right (the rail hugs the left edge, so right is on-screen in both the
// 220px and 64px states); fall back above only if the right has no room.
const placement = computed<'right' | 'top'>(() =>
  avatar.right.value + GAP + MENU_W > vw.value - EDGE ? 'top' : 'right',
)
const placementClass = computed(() =>
  placement.value === 'top' ? 'acct__menu--top' : 'acct__menu--right',
)

const menuStyle = computed<Record<string, string>>(() => {
  const menuH = menu.height.value || 320
  const aCx = avatar.left.value + avatar.width.value / 2
  const aCy = avatar.top.value + avatar.height.value / 2
  let x: number
  let y: number
  if (placement.value === 'right') {
    x = avatar.right.value + GAP
    y = aCy - menuH / 2
  } else {
    x = avatar.left.value
    y = avatar.top.value - menuH - GAP
  }
  x = clampN(EDGE, x, vw.value - MENU_W - EDGE)
  y = clampN(EDGE, y, vh.value - menuH - EDGE)
  return {
    position: 'fixed',
    left: `${Math.round(x)}px`,
    top: `${Math.round(y)}px`,
    width: `${MENU_W}px`,
    '--caret-y': `${Math.round(clampN(14, aCy - y - 6, menuH - 26))}px`,
    '--caret-x': `${Math.round(clampN(14, aCx - x - 6, MENU_W - 26))}px`,
  }
})

// ─── Open / close / a11y ────────────────────────────────────────────────────
function close() {
  open.value = false
}
async function onSignOut() {
  await signOutAndExit()
}
// Dual-ref: close only when the click is outside BOTH the plaque AND the
// teleported menu (the menu lives in <body>, so rootRef alone can't see it).
function onDocClick(e: MouseEvent) {
  if (!open.value) return
  const target = e.target as Node
  if (rootRef.value?.contains(target)) return
  if (menuRef.value?.contains(target)) return
  close()
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

// Move focus into the menu on open; restore it to the avatar on close.
watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    menuRef.value
      ?.querySelector<HTMLElement>(
        'button, [href], select, input, [tabindex]:not([tabindex="-1"])',
      )
      ?.focus()
  } else {
    avatarRef.value?.focus()
  }
})

// The 240ms rail collapse moves the avatar without firing scroll/resize, so
// useElementBounding wouldn't re-measure — close to avoid a stale caret.
watch(
  () => props.collapsed,
  () => {
    open.value = false
  },
)

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="rootRef" class="acct">
    <button
      ref="avatarRef"
      type="button"
      class="acct__avatar"
      :class="{ 'acct__avatar--framed': !!portrait.frameUrl, 'acct__avatar--set': !!portrait.setUrl }"
      aria-haspopup="true"
      :aria-expanded="open"
      :aria-label="email || t('settings.menu.account')"
      @click.stop="open = !open"
    >
      <span v-if="portrait.bgUrl" class="acct__avatar-bgclip" aria-hidden="true">
        <span class="acct__avatar-bg" :style="{ backgroundImage: `url(${portrait.bgUrl})` }" />
      </span>
      <span class="acct__inner">
        <img v-if="portrait.avatarUrl" class="acct__inner-img" :src="portrait.avatarUrl" alt="" >
        <template v-else>{{ initial }}</template>
      </span>
      <img
        v-if="portrait.frameUrl"
        class="acct__avatar-frame"
        :src="portrait.frameUrl"
        alt=""
        aria-hidden="true"
      >
      <img
        v-if="portrait.setUrl"
        class="acct__avatar-set"
        :src="portrait.setUrl"
        alt=""
        aria-hidden="true"
      >
      <span
        v-if="collapsed"
        class="acct__pip"
        :class="{ 'acct__pip--has': unlockedCount > 0 }"
        aria-hidden="true"
      >
        {{ unlockedCount }}
      </span>
    </button>

    <p v-if="!collapsed" class="acct__identity">{{ localPart }}</p>

    <Premios v-if="!collapsed" variant="strip" />

    <Teleport to="body">
      <Transition name="acct-pop">
        <div
          v-if="open"
          ref="menuRef"
          class="acct__menu"
          :class="placementClass"
          role="menu"
          :style="menuStyle"
        >
          <p class="acct__email">{{ email }}</p>
          <Premios variant="detail" />
          <div class="acct__row">
            <Field :label="t('settings.dark_mode')" html-for="acct-dark" orientation="horizontal">
              <Toggle id="acct-dark" v-model="isDark" :label="t('settings.dark_mode')" />
            </Field>
          </div>
          <div class="acct__row">
            <LocaleSwitcher />
          </div>
          <NuxtLink to="/settings" class="acct__item" role="menuitem" @click="close">
            {{ t('nav.settings') }}
          </NuxtLink>
          <button type="button" class="acct__item acct__signout" role="menuitem" @click="onSignOut">
            {{ t('auth.sign_out') }}
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* The teleported popover lands in <body>, outside this component's tree, so
 * its --tier-epic (used by Premios detail) can't inherit through the teleport
 * boundary — declare it on .acct__menu too. */
.acct__menu {
  --tier-epic: #8a5cd0;
}
[data-theme='dark'] .acct__menu {
  --tier-epic: #a982f0;
}

/* ---- PLAQUE (expanded 220px rail): a carved wooden shelf ---- */
.acct {
  position: relative; /* outside-click root + bounding-ref context */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--paper-warm);
  border: 2px solid var(--ink-line);
  border-bottom-width: 3px; /* thicker front lip of a board */
  box-shadow: var(--bevel), var(--shadow-pixel-sm);
}

/* ---- SQUARE FRAMED PORTRAIT (the trigger button) ---- */
.acct__avatar {
  position: relative;
  width: 96px;
  height: 96px;
  padding: 0;
  border: 3px solid var(--ink-line);
  border-radius: 0; /* sharp pixel corners — never a circle */
  background: var(--paper);
  box-shadow: var(--bevel), var(--shadow-pixel-md);
  display: grid;
  place-items: center;
  cursor: pointer;
  overflow: visible; /* frame/set overhang are siblings, never clipped here */
  image-rendering: pixelated;
}
.acct__avatar:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.acct__inner {
  position: relative;
  z-index: 1;
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: var(--text-on-accent);
  box-shadow: inset 0 0 0 1px var(--ink-line);
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 22px;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
.acct__inner-img {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
}

/* bg cosmetic (320×240) — clipped to the inner square, behind the initials */
.acct__avatar-bgclip {
  position: absolute;
  inset: 16px;
  overflow: hidden;
  z-index: 0;
}
.acct__avatar-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  image-rendering: pixelated;
}

/* frame cosmetic (96×96) — sibling outside any overflow box, never clipped */
.acct__avatar-frame {
  position: absolute;
  inset: -8px;
  width: 96px;
  height: 96px;
  image-rendering: pixelated;
  pointer-events: none;
  z-index: 2;
}
.acct__avatar--framed {
  border-color: transparent;
  background: transparent;
}

/* set cosmetic (legendary, 128×128) — composites over the whole portrait */
.acct__avatar-set {
  position: absolute;
  inset: -16px;
  width: 128px;
  height: 128px;
  image-rendering: pixelated;
  pointer-events: none;
  z-index: 3;
}
.acct__avatar--set {
  border-color: transparent;
  background: transparent;
}

/* ---- IDENTITY LINE (expanded only) ---- */
.acct__identity {
  max-width: 100%;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.02em;
  color: var(--ink-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- COLLAPSED 64px RAIL: chrome dissolves to a framed tile + pip ---- */
.sidebar--collapsed .acct {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 6px;
}
.sidebar--collapsed .acct__avatar {
  width: 48px;
  height: 48px;
}
.sidebar--collapsed .acct__inner {
  width: 36px;
  height: 36px;
  font-size: 13px;
}
.sidebar--collapsed .acct__inner-img {
  width: 36px;
  height: 36px;
}
/* downscaling 96/128px PNGs to 48px is muddy — hide cosmetics, restore wood */
.sidebar--collapsed .acct__avatar-frame,
.sidebar--collapsed .acct__avatar-set,
.sidebar--collapsed .acct__avatar-bgclip {
  display: none;
}
.sidebar--collapsed .acct__avatar--framed,
.sidebar--collapsed .acct__avatar--set {
  border-color: var(--ink-line);
  background: var(--paper);
}
.acct__pip {
  position: absolute;
  bottom: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 3px;
  display: grid;
  place-items: center;
  border: 2px solid var(--ink-line);
  background: var(--paper-deep);
  box-shadow: var(--shadow-pixel-sm);
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: var(--ink-soft);
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
.acct__pip--has {
  color: var(--gold);
}

/* ---- TELEPORTED FIXED POPOVER (escapes .shell__rail overflow clip) ---- */
.acct__menu {
  /* left / top / width / --caret-* are set inline by menuStyle */
  position: fixed;
  z-index: 200; /* above content + VictoryScreen(60); below Modal(999) */
  max-height: min(70vh, 560px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: var(--paper-deep);
  border: 3px solid var(--ink-line);
  box-shadow: var(--bevel), var(--shadow-pixel-lg);
}
/* pixel caret — RIGHT placement: points left at the avatar */
.acct__menu--right::before,
.acct__menu--right::after {
  content: '';
  position: absolute;
  top: var(--caret-y, 16px);
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}
.acct__menu--right::before {
  left: -10px;
  border-right: 10px solid var(--ink-line);
}
.acct__menu--right::after {
  left: -7px;
  border-right: 10px solid var(--paper-deep);
}
/* pixel caret — TOP fallback: points down at the avatar */
.acct__menu--top::before,
.acct__menu--top::after {
  content: '';
  position: absolute;
  left: var(--caret-x, 16px);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
}
.acct__menu--top::before {
  bottom: -10px;
  border-top: 10px solid var(--ink-line);
}
.acct__menu--top::after {
  bottom: -7px;
  border-top: 10px solid var(--paper-deep);
}

.acct__email {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-soft);
  word-break: break-all;
}
.acct__row {
  display: flex;
  flex-direction: column;
}
.acct__item {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  text-align: left;
  background: var(--surface);
  border: 2px solid var(--border);
  color: var(--text);
  padding: 10px;
  cursor: pointer;
  text-decoration: none;
}
.acct__item:hover {
  background: var(--surface-hover);
  border-color: var(--border-strong);
}
.acct__item:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.acct__signout {
  color: var(--danger);
}
:lang(th) .acct__item,
:lang(vi) .acct__item,
:lang(ja) .acct__item {
  font-size: 11px;
}

/* ---- MOTION (Modal.vue pixel-pop; reduced-motion safe) ---- */
.acct__menu {
  transform-origin: left center;
}
.acct__menu--top {
  transform-origin: center bottom;
}
.acct-pop-enter-active,
.acct-pop-leave-active {
  transition: opacity var(--motion-quick, 120ms) var(--ease-out, ease);
}
.acct-pop-enter-active.acct__menu,
.acct-pop-leave-active.acct__menu {
  transition:
    opacity var(--motion-quick, 120ms) var(--ease-out, ease),
    transform var(--motion-quick, 120ms) steps(4);
}
.acct-pop-enter-from,
.acct-pop-leave-to {
  opacity: 0;
}
.acct-pop-enter-from.acct__menu,
.acct-pop-leave-to.acct__menu {
  transform: scale(0.85);
}
@media (prefers-reduced-motion: reduce) {
  .acct-pop-enter-active,
  .acct-pop-leave-active,
  .acct-pop-enter-active.acct__menu,
  .acct-pop-leave-active.acct__menu {
    transition: none;
  }
  .acct-pop-enter-from.acct__menu,
  .acct-pop-leave-to.acct__menu {
    transform: none;
  }
}
</style>
