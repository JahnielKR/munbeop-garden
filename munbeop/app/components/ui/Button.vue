<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  type?: 'button' | 'submit'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
  type: 'button',
})

defineEmits<{ click: [MouseEvent] }>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="button"
    :class="[`button--${variant}`, { 'button--disabled': disabled }]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.button {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  letter-spacing: 0.05em;
  padding: 12px 20px;
  border: 2px solid var(--ink);
  background: var(--jade);
  color: var(--paper);
  cursor: pointer;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  transition:
    transform 0.08s ease,
    background 0.15s ease;
  box-shadow: 4px 4px 0 var(--ink);
}
.button:hover:not(:disabled) {
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0 var(--ink);
}
.button:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 var(--ink);
}
.button--secondary {
  background: var(--paper-warm);
  color: var(--ink);
}
.button--danger {
  background: var(--red);
  color: var(--paper);
}
.button--disabled,
.button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
