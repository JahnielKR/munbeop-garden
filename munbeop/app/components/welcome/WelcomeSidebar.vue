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
    const first = tabbables[0]
    const last = tabbables[tabbables.length - 1]
    if (!first || !last) return
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
    :inert="!props.open"
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
/* v7: the sidebar drops from above the viewport like a heavy gate,
 * lands on the left side, overshoots a hair, and settles. The whole
 * motion is on `top` + `scaleY`, not `transform: translateX`, so the
 * scene behind it never has to shift sideways to make room — which
 * is what was triggering the v2.18 rebote in earlier attempts. The
 * scene stays perfectly still; the menu just falls in front of it.
 *
 * Open path:  `.sidebar--open` plays caidaCompuerta (0.45s,
 *   cubic-bezier(0.6,-0.28,0.735,0.045) — a sharp gravity curve).
 *   forwards keeps the panel pinned at top:0 after the slam.
 * Close path: removing `.sidebar--open` cancels the animation;
 *   `top` reverts to -100% via the base `transition: top 0.3s`,
 *   pulling the panel back up off-screen quickly.
 */
.sidebar {
  position: fixed;
  left: 0;
  top: -100%;
  width: min(300px, 92vw);
  height: 100vh;
  background: var(--paper);
  border-right: 6px double var(--gold);
  box-shadow: 8px 0 0 var(--ink), 10px 0 18px rgba(0, 0, 0, 0.55);
  padding: 56px 22px 22px;
  transition: top 0.3s ease-in;
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: var(--text);
}
.sidebar--open {
  top: 0;
  animation: caidaCompuerta 0.45s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards;
}
@keyframes caidaCompuerta {
  0%   { top: -100%; transform: scaleY(1); }
  85%  { top: 5px;   transform: scaleY(0.98); }
  93%  { top: -2px;  transform: scaleY(1.01); }
  100% { top: 0;     transform: scaleY(1); }
}
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
  .sidebar { transition: top 120ms linear; }
  .sidebar--open { animation: none; }
}
</style>
