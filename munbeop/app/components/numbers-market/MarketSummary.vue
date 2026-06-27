<script setup lang="ts">
import type { MarketItem } from '~/lib/domain'
import type { DrillScore } from '~/lib/numbers-market'

interface Props {
  score: DrillScore
  failedItems: MarketItem[]
}
defineProps<Props>()
const emit = defineEmits<{ restart: []; replayFailed: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="summary" role="status">
    <p class="summary__score">{{ t('numberMarket.score') }}: {{ score.correct }} / {{ score.total }}</p>
    <ul v-if="failedItems.length" class="summary__failed" lang="ko">
      <li v-for="f in failedItems" :key="f.id">{{ f.display }} → {{ f.answer }}</li>
    </ul>
    <div class="summary__actions">
      <button
        v-if="failedItems.length"
        type="button"
        class="summary__btn"
        @click="emit('replayFailed')"
      >
        {{ t('numberMarket.replay_failed') }}
      </button>
      <button type="button" class="summary__btn summary__btn--primary" @click="emit('restart')">
        {{ t('numberMarket.restart') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.summary { display: flex; flex-direction: column; gap: 16px; align-items: center; }
.summary__score { font-family: 'Press Start 2P', monospace; font-size: 14px; color: var(--ink); }
.summary__failed { margin: 0; padding: 12px 16px; list-style: none; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); font-family: 'Noto Sans KR', sans-serif; font-size: 15px; display: flex; flex-direction: column; gap: 6px; }
.summary__actions { display: flex; gap: 10px; }
.summary__btn { font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 16px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer; }
.summary__btn--primary { background: var(--accent, #2e7d32); color: var(--paper, #fff); border-color: var(--accent, #2e7d32); }
.summary__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
