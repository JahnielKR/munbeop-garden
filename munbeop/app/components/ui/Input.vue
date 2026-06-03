<script setup lang="ts">
/**
 * Input primitive (v2 polish).
 *
 * Single-line `<input>` or `<textarea>` when `multiline`. Adds `type` so
 * password fields actually mask (was P0 security bug), `autocomplete` so
 * managers can fill, `error` to paint danger + set aria-invalid, and an
 * inset pixel shadow per spec 02-primitives §3.
 *
 * Tokens via semantic aliases — never raw brand swatches. `:focus-visible`
 * renders --focus-ring; never suppressed.
 */
interface Props {
  modelValue: string
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  multiline?: boolean
  rows?: number
  disabled?: boolean
  error?: boolean
  id?: string
  name?: string
  autocomplete?: string
  required?: boolean
  inputmode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search'
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  multiline: false,
  rows: 3,
  disabled: false,
  error: false,
  id: undefined,
  name: undefined,
  autocomplete: undefined,
  required: false,
  inputmode: undefined,
})
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <textarea
    v-if="multiline"
    :id="id"
    :name="name"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :required="required"
    :aria-invalid="error || undefined"
    class="input"
    :class="{ 'input--error': error }"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
  <input
    v-else
    :id="id"
    :name="name"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :autocomplete="autocomplete"
    :inputmode="inputmode"
    :aria-invalid="error || undefined"
    class="input"
    :class="{ 'input--error': error }"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>

<style scoped>
.input {
  width: 100%;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border);
  padding: 10px 12px;
  font-family: 'Noto Sans KR', 'Inter', sans-serif;
  font-size: var(--text-base);
  line-height: 1.5;
  outline: none;
  resize: vertical;
  box-shadow: var(--shadow-input);
  transition:
    border-color var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.input::placeholder {
  color: var(--text-soft);
  opacity: 1;
}
.input:focus-visible {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-input-focus);
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.input--error {
  border-color: var(--danger-bright);
}
.input--error:focus-visible {
  border-color: var(--danger-bright);
  outline-color: var(--danger-bright);
}
.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
