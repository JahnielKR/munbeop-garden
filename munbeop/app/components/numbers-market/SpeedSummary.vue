<script setup lang="ts">
interface Props {
  score: number
  best: number
  bestStreak: number
  isRecord: boolean
}
defineProps<Props>()
const emit = defineEmits<{ again: []; restart: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="summary" role="status">
    <p class="summary__time-up">{{ t('numberMarket.speed.time_up') }}</p>
    <p class="summary__score">{{ t('numberMarket.score') }}: {{ score }}</p>
    <p v-if="isRecord" class="summary__record">🏆 {{ t('numberMarket.speed.new_record') }}</p>
    <p class="summary__meta">{{ t('numberMarket.speed.best') }} {{ best }} · {{ t('numberMarket.speed.streak') }} {{ bestStreak }}</p>
    <div class="summary__actions">
      <button type="button" class="summary__btn summary__btn--primary" @click="emit('again')">{{ t('numberMarket.speed.again') }}</button>
      <button type="button" class="summary__btn" @click="emit('restart')">{{ t('numberMarket.restart') }}</button>
    </div>
  </div>
</template>

<style scoped>
.summary { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.summary__time-up { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 13px; color: var(--ink); }
.summary__score { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 16px; color: var(--accent-bright, #2e7d32); }
.summary__record { margin: 0; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--accent-bright, #2e7d32); }
.summary__meta { margin: 0; font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
.summary__actions { display: flex; gap: 10px; margin-top: 6px; }
.summary__btn { font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 16px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer; }
.summary__btn--primary { background: var(--accent, #2e7d32); color: var(--paper, #fff); border-color: var(--accent, #2e7d32); }
.summary__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
