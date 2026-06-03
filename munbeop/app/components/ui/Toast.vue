<script setup lang="ts">
/**
 * Toast (v2 — variant-aware stacking notifier).
 *
 * Reads the queue from useToast(). Renders each entry with its
 * variant-specific tint and icon, announces via role + aria-live, and
 * shrinks a progress bar over the entry's lifetime so the user can see
 * how long they have to act.
 *
 * Layout: bottom-right anchored stack on desktop, bottom-centre on
 * mobile. TransitionGroup handles enter/leave per entry (slide-in from
 * the right, fade-out). Reduced motion collapses to instant.
 *
 * A11y:
 *   - error → role="alert", aria-live="assertive" (interrupts)
 *   - everything else → role="status", aria-live="polite" (queues)
 *   - dismiss button is keyboard-reachable; Esc inside a focused toast
 *     could close it, but for now we rely on the explicit close button
 */
import type { ToastEntry } from '~/composables/useToast'

const { toasts, dismiss } = useToast()

function iconFor(variant: ToastEntry['variant']): string {
  if (variant === 'success') return '✓'
  if (variant === 'error') return '✕'
  if (variant === 'warning') return '!'
  return 'i'
}
</script>

<template>
  <div class="toast-stack" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :data-variant="t.variant"
        :role="t.variant === 'error' ? 'alert' : 'status'"
        :aria-live="t.variant === 'error' ? 'assertive' : 'polite'"
      >
        <span class="toast__icon" aria-hidden="true">{{ iconFor(t.variant) }}</span>
        <span class="toast__text">{{ t.text }}</span>
        <button
          type="button"
          class="toast__close"
          aria-label="Dismiss"
          @click="dismiss(t.id)"
        >
          ×
        </button>
        <div
          class="toast__progress"
          :style="{ animationDuration: `${t.duration}ms` }"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
  max-width: 360px;
  pointer-events: none;
}
@media (max-width: 768px) {
  .toast-stack {
    bottom: 76px; /* clear of mobile-nav 64 + 12 gap */
    left: 16px;
    right: 16px;
    max-width: none;
  }
}

.toast {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border-strong);
  box-shadow: var(--shadow-pixel-md);
  padding: 12px 14px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  line-height: 1.4;
  border-left-width: 6px;
  pointer-events: auto;
  overflow: hidden;
}

/* Variant tints — left stripe + matching icon colour. The body bg
   stays --surface so the body text contrast is unchanged across
   variants; the variant signal lives in the stripe + icon. */
.toast[data-variant='success'] { border-left-color: var(--jade); }
.toast[data-variant='success'] .toast__icon { color: var(--jade-deep); }

.toast[data-variant='error'] { border-left-color: var(--red); }
.toast[data-variant='error'] .toast__icon { color: var(--danger); }

.toast[data-variant='info'] { border-left-color: var(--sky); }
.toast[data-variant='info'] .toast__icon { color: var(--sky); }

.toast[data-variant='warning'] { border-left-color: var(--gold); }
.toast[data-variant='warning'] .toast__icon { color: var(--gold); }

.toast__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 14px;
  font-weight: 700;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
.toast__text {
  min-width: 0;
  word-break: break-word;
}
.toast__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: var(--text-soft);
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}
.toast__close:hover {
  color: var(--text);
}
.toast__close:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: currentColor;
  color: var(--accent);
  transform-origin: left;
  animation-name: toast-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
.toast[data-variant='success'] .toast__progress { color: var(--jade); }
.toast[data-variant='error'] .toast__progress { color: var(--red); }
.toast[data-variant='info'] .toast__progress { color: var(--sky); }
.toast[data-variant='warning'] .toast__progress { color: var(--gold); }

@keyframes toast-progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity var(--motion-base) var(--ease-out),
    transform var(--motion-base) var(--ease-out);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active { transition-duration: 0.01ms; }
  .toast__progress { animation: none; }
}
</style>
