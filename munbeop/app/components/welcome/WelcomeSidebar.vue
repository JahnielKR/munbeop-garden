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
