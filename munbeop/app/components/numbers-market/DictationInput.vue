<script setup lang="ts">
import type { NumberDomain } from '~/lib/domain'

interface Props {
  domain: NumberDomain
  phase: 'input' | 'right' | 'wrong' | 'done'
  modelValue: string
}
defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [v: string]; submit: []; replay: [] }>()
const { t } = useI18n()

const FMT: Partial<Record<NumberDomain, string>> = {
  time: 'numberMarket.dictation.fmt_time',
  dates: 'numberMarket.dictation.fmt_date',
}
function fmtKey(domain: NumberDomain): string {
  return FMT[domain] ?? 'numberMarket.dictation.fmt_number'
}
</script>

<template>
  <form class="dict" @submit.prevent="emit('submit')">
    <button
      type="button"
      class="dict__play"
      data-testid="dictation-replay"
      :aria-label="t('numberMarket.dictation.replay')"
      @click="emit('replay')"
    ><span aria-hidden="true">🔊</span></button>
    <input
      :value="modelValue"
      type="text"
      class="dict__input"
      data-testid="dictation-input"
      :placeholder="t(fmtKey(domain))"
      :aria-label="t('numberMarket.dictation.listen')"
      :disabled="phase !== 'input'"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button
      type="submit"
      class="dict__submit"
      data-testid="dictation-submit"
      :disabled="phase !== 'input' || !modelValue"
    >{{ t('numberMarket.submit') }}</button>
  </form>
</template>

<style scoped>
.dict { display: flex; gap: 8px; align-items: center; }
.dict__play { flex: none; width: 44px; height: 44px; font-size: 18px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer; }
.dict__play:hover { border-color: var(--ink); }
.dict__input { flex: 1; font-family: 'Inter', sans-serif; font-size: 20px; padding: 10px 12px; background: var(--paper, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); }
.dict__input:disabled { opacity: 0.55; }
.dict__submit { flex: none; font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 16px; background: var(--accent, #2e7d32); color: var(--paper, #fff); border: 2px solid var(--accent, #2e7d32); cursor: pointer; }
.dict__submit:disabled { opacity: 0.5; cursor: default; }
.dict__play:focus-visible, .dict__input:focus-visible, .dict__submit:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
