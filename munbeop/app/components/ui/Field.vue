<script setup lang="ts">
/**
 * Field primitive (spec 02-primitives.md §2).
 *
 * Wraps an Input / Toggle (or any single control) with a label, optional
 * required marker, hint text, and error text. Eliminates the per-page
 * re-implementation of <label> + <span class="hint"> + .error div blocks.
 *
 * Two layouts:
 *   - vertical (default): label sits above the control (form-style).
 *   - horizontal: label on the left, control on the right (toggle-style).
 *
 * Accessibility:
 *   - <label for="...">control's id</label> is the canonical wiring; the
 *     consumer passes the same id to the slotted control and to htmlFor.
 *   - When `hint` or `error` is set, the field renders the message and
 *     announces its id through provide('fieldDescribedBy', ...). A
 *     control that injects this can wire aria-describedby itself; the
 *     current Input primitive doesn't yet inject, so for now we surface
 *     the id explicitly (consumers can wire it manually if they need
 *     screen-reader linkage — see sign-in.vue for the pattern).
 *   - The error span gets role="alert" so screen readers announce it
 *     on appearance.
 *   - Required indicator (`*`) is aria-hidden because the `required`
 *     attribute on the control is the canonical source for SR.
 *
 * The component intentionally does not own the input itself — passing the
 * control as a slot keeps Field neutral about which primitive lives inside.
 */
import { computed } from 'vue'

interface Props {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  error?: string
  orientation?: 'vertical' | 'horizontal'
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  hint: '',
  error: '',
  orientation: 'vertical',
})

const messageId = computed(() => `${props.htmlFor}-msg`)
const hasMessage = computed(() => Boolean(props.error || props.hint))
</script>

<template>
  <div class="field" :class="`field--${orientation}`">
    <label class="field__label" :for="htmlFor">
      {{ label }}<span v-if="required" class="field__required" aria-hidden="true"> *</span>
    </label>
    <div class="field__control">
      <slot />
    </div>
    <span
      v-if="hasMessage"
      :id="messageId"
      class="field__message"
      :class="{ 'field__message--error': error }"
      :role="error ? 'alert' : undefined"
    >
      {{ error || hint }}
    </span>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: 4px;
}
.field--vertical {
  grid-template-columns: 1fr;
}
.field--vertical .field__label {
  display: block;
}
.field--horizontal {
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
}
.field--horizontal .field__label {
  grid-column: 1;
}
.field--horizontal .field__control {
  grid-column: 2;
}
.field--horizontal .field__message {
  grid-column: 1 / -1;
}

.field__label {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  color: var(--text-soft);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
.field--horizontal .field__label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--text);
  letter-spacing: 0;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: auto;
}
.field__required {
  color: var(--danger);
}
.field__control {
  display: flex;
  flex-direction: column;
}
.field__message {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--text-soft);
  line-height: 1.5;
}
.field__message--error {
  color: var(--danger);
}
</style>
