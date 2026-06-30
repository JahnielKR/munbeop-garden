<!-- app/components/sentence-garden/SentenceSummary.vue -->
<script setup lang="ts">
defineProps<{ score: { correct: number; total: number }; failedCount: number }>()
defineEmits<{ restart: []; replayFailed: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="sg-summary">
    <p class="sg-summary__score">{{ score.correct }} / {{ score.total }}</p>
    <div class="sg-summary__actions">
      <button type="button" @click="$emit('restart')">{{ t('sentenceGarden.summary_again') }}</button>
      <button v-if="failedCount > 0" type="button" @click="$emit('replayFailed')">
        {{ t('sentenceGarden.summary_replay') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.sg-summary { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
.sg-summary__score { margin: 0; font-family: var(--font-pixel); font-size: var(--text-xl); color: var(--ink); }
.sg-summary__actions { display: flex; gap: 12px; }
</style>
