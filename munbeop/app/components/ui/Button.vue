<script setup lang="ts">
/**
 * Button primitive (v2 polish).
 *
 * Tokens consumed via semantic aliases — `--accent` / `--text-on-accent`
 * (primary), `--danger` / `--text-on-danger`. All combinations pass WCAG
 * AA (primary 6.16:1 light, 5.2:1 dark; danger 6.6:1 light, 5.2:1 dark)
 * vs. v1 which hardcoded `--jade`/`--paper` at 2.65:1 (FAIL).
 *
 * Shadow uses `--shadow-color` (warm brown ink-soft, light; near-black,
 * dark) for the LADX chunky-pixel silhouette in both themes.
 *
 * `:focus-visible` always renders the focus ring (spec hard rule — never
 * suppress). Motion via tokens so theme can re-tune timing.
 */
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
})

defineEmits<{ click: [MouseEvent] }>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :data-variant="variant"
    :data-size="size"
    class="button"
    :class="{ 'button--full': fullWidth, 'button--loading': loading }"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="button__spinner" aria-hidden="true" />
    <span class="button__label" :class="{ 'button__label--dim': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  letter-spacing: 0.05em;
  border: 2px solid var(--border-strong);
  cursor: pointer;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  background: var(--accent);
  color: var(--text-on-accent);
  box-shadow: var(--shadow-button);
  transform: translate(0, 0);
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out),
    background-color var(--motion-quick) var(--ease-out);
  position: relative;
}
.button[data-size='sm'] { font-size: 9px; padding: 8px 14px; }
.button[data-size='md'] { font-size: 11px; padding: 12px 20px; }
.button[data-size='lg'] { font-size: 13px; padding: 16px 28px; }
.button--full { width: 100%; }

/* Thai / Vietnamese script: tone marks and diacritics at 9-13 px lose
 * their detail. Bump every size one step so button labels read. */
:lang(th) .button[data-size='sm'],
:lang(vi) .button[data-size='sm'] { font-size: 11px; }
:lang(th) .button[data-size='md'],
:lang(vi) .button[data-size='md'] { font-size: 13px; }
:lang(th) .button[data-size='lg'],
:lang(vi) .button[data-size='lg'] { font-size: 15px; }

.button[data-variant='secondary'] {
  background: var(--surface);
  color: var(--text);
}
.button[data-variant='danger'] {
  background: var(--danger);
  color: var(--text-on-danger);
}

.button:hover:not(:disabled) {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.button:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-button-pressed);
}
.button:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.button--loading {
  pointer-events: none;
}

.button__spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: button-spin 600ms linear infinite;
}
.button__label--dim {
  opacity: 0.6;
}

@keyframes button-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .button__spinner { animation-duration: 3s; }
}
</style>
