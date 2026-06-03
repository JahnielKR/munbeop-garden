<script setup lang="ts">
/**
 * Toggle primitive — two-state square switch.
 *
 * Pixel-art convention: square shape (no pill/rounded edges). Used by
 * Settings for theme switching, future cosmetics on/off, context toggles.
 *
 * Per spec 02-primitives.md §4. Surface awareness via motion easing only
 * (visuals identical in study/game chromes). For now the motion easing
 * is smooth (--ease-out); the spec's step-3 game-mode variant lands when
 * the chrome-aware motion alias system fills in.
 */

interface Props {
  modelValue: boolean
  size?: 'sm' | 'md'
  disabled?: boolean
  label?: string  // for aria-label when used without an external <label>
}

withDefaults(defineProps<Props>(), { size: 'md', disabled: false, label: '' })
defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label || undefined"
    :disabled="disabled"
    class="toggle"
    :class="[`toggle--${size}`, { 'toggle--on': modelValue, 'toggle--off': !modelValue }]"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="toggle__indicator" aria-hidden="true" />
  </button>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 2px solid var(--border-strong);
  background: var(--surface);
  cursor: pointer;
  position: relative;
  box-shadow: var(--shadow-inset);
  transition: background-color var(--motion-quick) var(--ease-out);
}
.toggle--sm {
  width: 32px;
  height: 16px;
}
.toggle--md {
  width: 40px;
  height: 20px;
}
.toggle--on {
  background: var(--accent);
}
.toggle__indicator {
  position: absolute;
  background: var(--ink-soft);
  transition:
    left var(--motion-quick) var(--ease-out),
    background-color var(--motion-quick) var(--ease-out);
}
.toggle--sm .toggle__indicator {
  width: 10px;
  height: 10px;
  top: 1px;
  left: 1px;
}
.toggle--md .toggle__indicator {
  width: 12px;
  height: 12px;
  top: 2px;
  left: 2px;
}
.toggle--sm.toggle--on .toggle__indicator {
  left: 17px;
  background: var(--paper);
}
.toggle--md.toggle--on .toggle__indicator {
  left: 22px;
  background: var(--paper);
}
.toggle:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
