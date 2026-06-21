<script setup lang="ts">
interface Props {
  label: string
  state: 'idle' | 'correct' | 'wrong' | 'muted'
  disabled?: boolean
}
defineProps<Props>()
defineEmits<{ pick: [] }>()
</script>

<template>
  <button
    type="button"
    class="opt"
    :class="`opt--${state}`"
    :disabled="disabled"
    lang="ko"
    @click="$emit('pick')"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.opt {
  padding: 12px 14px;
  background: var(--paper-deep);
  border: 2px solid var(--border);
  color: var(--text);
  font-family: var(--font-ko);
  font-size: var(--text-lg);
  cursor: pointer;
  transition:
    background var(--motion-quick) var(--ease-out),
    border-color var(--motion-quick) var(--ease-out);
}
.opt:hover:not(:disabled) { border-color: var(--accent); }
.opt:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.opt--correct { border-color: var(--success); background: var(--surface); }
.opt--wrong { border-color: var(--danger); background: var(--surface); }
.opt--muted { opacity: 0.55; }
.opt:disabled { cursor: default; }
</style>
