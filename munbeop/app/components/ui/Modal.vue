<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

interface Props {
  open: boolean
  closeLabel: string
  title?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const modalRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function focusableElements(): HTMLElement[] {
  if (!modalRef.value) return []
  return Array.from(
    modalRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute('disabled'))
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
    return
  }
  if (e.key === 'Tab') {
    const focusables = focusableElements()
    if (focusables.length === 0) return
    const first = focusables[0]!
    const last = focusables[focusables.length - 1]!
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

function lockBodyScroll(lock: boolean) {
  document.body.style.overflow = lock ? 'hidden' : ''
}

watch(
  () => props.open,
  async (nowOpen) => {
    if (nowOpen) {
      previouslyFocused = document.activeElement as HTMLElement | null
      lockBodyScroll(true)
      window.addEventListener('keydown', onKeydown)
      document.addEventListener('keydown', onKeydown)
      await Promise.resolve()
      const first = focusableElements()[0]
      first?.focus()
    } else {
      lockBodyScroll(false)
      window.removeEventListener('keydown', onKeydown)
      document.removeEventListener('keydown', onKeydown)
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  lockBodyScroll(false)
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('keydown', onKeydown)
})

function onOverlayClick() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal-overlay"
        role="presentation"
        @click.self="onOverlayClick"
      >
        <div
          ref="modalRef"
          class="modal"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <button
            type="button"
            class="modal-close"
            :aria-label="closeLabel"
            @click="emit('close')"
          >
            [X]
          </button>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 999;
}

@media (min-width: 640px) {
  .modal-overlay {
    padding: 24px;
  }
}

.modal {
  position: relative;
  width: min(560px, 100%);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: var(--paper-deep, var(--paper));
  color: var(--ink);
  border: 4px solid var(--ink-line);
  box-shadow: 8px 8px 0 var(--shadow-cream);
  padding: 24px;
  font-family: 'Inter', sans-serif;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  color: var(--ink);
  cursor: pointer;
  padding: 4px 6px;
}
.modal-close:hover {
  color: var(--red);
}
.modal-close:focus-visible {
  outline: 2px solid var(--focus-ring, var(--gold));
  outline-offset: 2px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--motion-quick, 120ms) var(--ease-out, ease);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform var(--motion-quick, 120ms) steps(4);
}
.modal-enter-from .modal {
  transform: scale(0.8);
}
.modal-leave-to .modal {
  transform: scale(0.8);
}
</style>
