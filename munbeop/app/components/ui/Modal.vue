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
            X
          </button>
          <div class="modal__body">
            <slot />
          </div>
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

/* The frame doesn't scroll (and doesn't clip) — scrolling lives on
 * .modal__body. That lets the close button hang on the frame corner,
 * outside the content flow: always visible, never buried under sticky
 * slot headers, never covering slot content. */
.modal {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(560px, 100%);
  max-height: calc(100vh - 32px);
  background: var(--paper-deep, var(--paper));
  color: var(--ink);
  border: 4px solid var(--ink-line);
  box-shadow: 8px 8px 0 var(--shadow-cream);
  font-family: 'Inter', sans-serif;
}

.modal__body {
  overflow-y: auto;
  padding: 24px;
}

.modal-close {
  position: absolute;
  top: -14px;
  right: -14px;
  z-index: 2;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--paper-deep, var(--paper));
  color: var(--ink);
  border: 2px solid var(--ink-line);
  box-shadow: 2px 2px 0 var(--shadow-cream);
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  cursor: pointer;
  padding: 0;
}
.modal-close:hover {
  background: var(--red);
  color: var(--always-cream, #fdf6e3);
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
