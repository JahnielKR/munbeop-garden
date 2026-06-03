<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  multiline?: boolean
  rows?: number
}

withDefaults(defineProps<Props>(), { placeholder: '', multiline: false, rows: 3 })
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <textarea
    v-if="multiline"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    class="input"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
  <input
    v-else
    :value="modelValue"
    :placeholder="placeholder"
    class="input"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>

<style scoped>
.input {
  width: 100%;
  background: var(--paper);
  color: var(--ink);
  border: 2px solid var(--border);
  padding: 10px 12px;
  font-family: 'Noto Sans KR', 'Inter', sans-serif;
  font-size: 15px;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s ease;
}
.input:focus {
  border-color: var(--jade);
}
</style>
