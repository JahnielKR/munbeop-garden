<script setup lang="ts">
/** One answer button (a particle form: 은/는/이/가/에/에서/도/만/…). */
interface Props {
  choice: string
  state: 'idle' | 'blocked' | 'correct' | 'wrong'
  disabled?: boolean
}
withDefaults(defineProps<Props>(), { disabled: false })
const emit = defineEmits<{ pick: [] }>()
</script>

<template>
  <button
    type="button"
    class="option"
    :class="`option--${state}`"
    :disabled="disabled || state === 'blocked'"
    :aria-disabled="state === 'blocked' || undefined"
    lang="ko"
    :data-testid="`drill-option-${choice}`"
    @click="emit('pick')"
  >
    {{ choice }}
  </button>
</template>

<style scoped>
.option {
  min-width: 56px;
  min-height: 48px;
  padding: 8px 12px;
  background: var(--surface);
  border: 3px solid var(--border-strong);
  box-shadow: var(--shadow-button);
  font-family: var(--font-ko);
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.option:hover:not(:disabled) {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.option:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-button-pressed);
}
.option:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.option--blocked {
  background: var(--paper);
  color: var(--text-soft);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
.option--correct {
  background: var(--jade);
  color: var(--always-dark);
  border-color: var(--always-dark);
}
.option--wrong {
  background: var(--danger);
  color: var(--text-on-danger);
  border-color: var(--always-dark);
}
.option:disabled:not(.option--blocked) {
  cursor: default;
}
</style>
