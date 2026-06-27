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
import { useToast } from '~/composables/useToast'

/**
 * AccountMenu — "Placa de Unidad": a wooden plaque in the sidebar footer
 * holding a square framed pixel portrait + a premios (trophy) strip, with a
 * quick-settings popover.
 *
 * The portrait is two nested boxes — a 96px OUTER frame (this very trigger
 * button) and a centred 64px INNER (initials by default, swapped for an
 * unlocked avatar cosmetic). Unlocked frame / bg / set cosmetics compose as
 * fixed-geometry sibling layers (see usePremios().portrait). Collapsed to the
 * 64px rail the plaque dissolves to just the 48px framed tile.
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
const { resolved } = useTheme()
const authStore = useAuthStore()
const settings = useSettingsStore()
const { signOutAndExit } = useAuth()
const toast = useToast()
const { unlockedCount, totalCount, portrait } = usePremios()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const avatarRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const email = computed(() => authStore.user?.email ?? '')
const localPart = computed(() => email.value.split('@')[0] ?? '')
const initial = computed(() => (email.value.trim()[0] ?? '?').toUpperCase())
// Quick light/dark toggle. Reflects the *resolved* theme (so it shows the
// right state even when the preference is 'system'); flipping it sets an
// explicit light/dark preference. The 3-way Auto control lives in settings.
const isDark = computed<boolean>({
  get: () => resolved.value === 'dark',
  set: (v) => {
    void settings.setTheme(v ? 'dark' : 'light')
  },
})

// ─── Popover positioning (Teleport + fixed, anchored to the avatar) ─────────
const MENU_W = 248
const GAP = 12
const EDGE = 8

const avatar = useElementBounding(avatarRef)
const { width: vw, height: vh } = useWindowSize()

function clampN(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

// The menu opens to the RIGHT of the left-docked rail and is BOTTOM-anchored to
// the avatar (which lives at the rail's foot), growing upward. Anchoring by the
// avatar's bottom edge means the position never depends on the menu's own
// (initially-unknown) height — so it lands in place on the first frame instead
// of popping near centre and then snapping to the corner.
const menuStyle = computed<Record<string, string>>(() => {
  const left = clampN(EDGE, avatar.right.value + GAP, vw.value - MENU_W - EDGE)
  const bottom = clampN(EDGE, vh.value - avatar.bottom.value, vh.value - EDGE)
  return {
    position: 'fixed',
    left: `${Math.round(left)}px`,
    bottom: `${Math.round(bottom)}px`,
    top: 'auto',
    width: `${MENU_W}px`,
    maxHeight: `${Math.max(160, Math.round(avatar.bottom.value - EDGE))}px`,
    // caret sits aH/2 up from the menu's bottom edge → points at the avatar.
    '--caret-b': `${Math.round(clampN(14, avatar.height.value / 2, 240))}px`,
  }
})

// Re-measure the avatar before opening: the 240ms collapse changes its rect
// without firing scroll/resize, so a cached rect would land the menu far from a
// just-collapsed rail. A fresh rect makes it correct on the first frame.
function toggle() {
  if (!open.value) avatar.update()
  open.value = !open.value
}

// ─── Open / close / a11y ────────────────────────────────────────────────────
function close() {
  open.value = false
}
async function onSignOut() {
  const { error } = await signOutAndExit()
  if (error) toast.error(t('auth.sign_out_error'))
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
      :class="{
        'acct__avatar--framed': !!portrait.frameUrl,
        'acct__avatar--set': !!portrait.setUrl,
        'acct__avatar--epic': portrait.avatarTier === 'epic',
        'acct__avatar--legendary': portrait.avatarTier === 'legendary',
      }"
      aria-haspopup="true"
      :aria-expanded="open"
      :aria-label="email || t('settings.menu.account')"
      @click.stop="toggle"
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
    </button>

    <p v-if="!collapsed" class="acct__identity">{{ localPart }}</p>

    <Premios v-if="!collapsed" variant="strip" />

    <Teleport to="body">
      <Transition name="acct-pop">
        <div v-if="open" ref="menuRef" class="acct__menu" role="menu" :style="menuStyle">
          <p class="acct__email">{{ email }}</p>
          <div class="acct__row">
            <Field :label="t('settings.dark_mode')" html-for="acct-dark" orientation="horizontal">
              <Toggle id="acct-dark" v-model="isDark" :label="t('settings.dark_mode')" />
            </Field>
          </div>
          <div class="acct__row">
            <LocaleSwitcher />
          </div>
          <NuxtLink
            to="/trophies"
            class="acct__item acct__item--row"
            role="menuitem"
            @click="close"
          >
            <span>{{ t('escape.premios_title') }}</span>
            <span class="acct__item-meta" :class="{ 'acct__item-meta--has': unlockedCount > 0 }">
              {{ unlockedCount }}/{{ totalCount }} ▸
            </span>
          </NuxtLink>
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

/* ---- RARITY EFFECTS for the chosen garden avatar ---- */
.acct__avatar--epic {
  --epic-glow: #8a5cd0;
  box-shadow: var(--bevel), var(--shadow-pixel-md), 0 0 8px 1px var(--epic-glow);
}
[data-theme='dark'] .acct__avatar--epic {
  --epic-glow: #a982f0;
}
.acct__avatar--legendary {
  animation: acct-aura 2.4s ease-in-out infinite;
}
@keyframes acct-aura {
  0%, 100% { box-shadow: var(--bevel), var(--shadow-pixel-md), 0 0 6px 1px var(--gold); }
  50% { box-shadow: var(--bevel), var(--shadow-pixel-md), 0 0 13px 3px var(--gold); }
}
@media (prefers-reduced-motion: reduce) {
  .acct__avatar--legendary {
    animation: none;
    box-shadow: var(--bevel), var(--shadow-pixel-md), 0 0 10px 2px var(--gold);
  }
}
/* collapsed 64px rail: keep the tile clean (cosmetics are already hidden) */
.sidebar--collapsed .acct__avatar--legendary {
  animation: none;
}
.sidebar--collapsed .acct__avatar--epic,
.sidebar--collapsed .acct__avatar--legendary {
  box-shadow: var(--bevel), var(--shadow-pixel-md);
}

/* ---- IDENTITY LINE (expanded only) ---- */
/* Same chunky pixel weight as the "Trophies" strip label so the account name
 * reads as a peer heading, not a faint caption. */
.acct__identity {
  max-width: 100%;
  margin: 0;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- COLLAPSED 64px RAIL: chrome dissolves to just the framed tile ---- */
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

/* ---- TELEPORTED FIXED POPOVER (escapes .shell__rail overflow clip) ---- */
.acct__menu {
  /* left / bottom / width / max-height / --caret-b are set inline by menuStyle */
  position: fixed;
  z-index: 200; /* above content + VictoryScreen(60); below Modal(999) */
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  overflow-y: auto; /* safety: scroll instead of clip on a very short viewport */
  background: var(--paper-deep);
  border: 3px solid var(--ink-line);
  box-shadow: var(--bevel), var(--shadow-pixel-lg);
}
/* pixel caret — points left at the avatar, offset up from the menu's bottom
 * edge by --caret-b (= half the avatar's height) so it tracks the avatar. */
.acct__menu::before,
.acct__menu::after {
  content: '';
  position: absolute;
  bottom: var(--caret-b, 24px);
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}
.acct__menu::before {
  left: -10px;
  border-right: 10px solid var(--ink-line);
}
.acct__menu::after {
  left: -7px;
  border-right: 10px solid var(--paper-deep);
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
/* the Trophies entry: label left, "n/total ▸" counter right */
.acct__item--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.acct__item-meta {
  color: var(--ink-soft);
  white-space: nowrap;
}
.acct__item-meta--has {
  color: var(--gold);
}
:lang(th) .acct__item,
:lang(vi) .acct__item,
:lang(ja) .acct__item {
  font-size: 11px;
}

/* ---- MOTION (Modal.vue pixel-pop; reduced-motion safe) ---- */
.acct__menu {
  transform-origin: left bottom;
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
