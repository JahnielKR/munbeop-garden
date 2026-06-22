<script setup lang="ts">
import type { DrillScore } from '~/lib/counters'
import type { CountItem } from '~/lib/domain'

interface Props { score: DrillScore; failedItems: CountItem[] }
defineProps<Props>()
defineEmits<{ restart: []; replayFailed: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="counter-summary" role="status">
    <p class="counter-summary__score">{{ t('counters.score', { correct: score.correct, total: score.total }) }}</p>
    <div class="counter-summary__actions">
      <button v-if="failedItems.length" type="button" data-testid="counter-replay" @click="$emit('replayFailed')">
        {{ t('counters.replay_failed') }}
      </button>
      <button type="button" data-testid="counter-restart" @click="$emit('restart')">{{ t('counters.restart') }}</button>
    </div>
  </div>
</template>

<style scoped>
.counter-summary { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
.counter-summary__score { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 12px; color: var(--ink); }
.counter-summary__actions { display: flex; gap: 10px; }
.counter-summary__actions button { padding: 7px 14px; border: 2px solid var(--ink-line); background: var(--paper-deep); font-family: 'Press Start 2P', monospace; font-size: 9px; cursor: pointer; }
</style>
