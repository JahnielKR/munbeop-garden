<script setup lang="ts">
interface Props {
  modelValue: 'learn' | 'speed'
}
defineProps<Props>()
defineEmits<{ 'update:modelValue': [mode: 'learn' | 'speed'] }>()
const { t } = useI18n()
const MODES = [
  { id: 'learn' as const, key: 'numberMarket.mode.learn' },
  { id: 'speed' as const, key: 'numberMarket.mode.speed' },
]
</script>

<template>
  <div class="toggle" role="group" :aria-label="t('numberMarket.mode.label')">
    <button
      v-for="mode in MODES"
      :key="mode.id"
      type="button"
      class="toggle__btn"
      :class="{ 'toggle__btn--active': modelValue === mode.id }"
      :aria-pressed="modelValue === mode.id ? 'true' : 'false'"
      data-testid="mode-option"
      @click="$emit('update:modelValue', mode.id)"
    >{{ t(mode.key) }}</button>
  </div>
</template>

<style scoped>
.toggle { display: inline-flex; border: 2px solid var(--ink-line); }
.toggle__btn { font-family: 'Inter', sans-serif; font-size: 13px; padding: 8px 16px; background: var(--paper, var(--surface)); border: none; color: var(--ink-soft); cursor: pointer; }
.toggle__btn + .toggle__btn { border-left: 2px solid var(--ink-line); }
.toggle__btn--active { background: var(--accent, #2e7d32); color: var(--paper, #fff); }
.toggle__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: -2px; }
</style>
