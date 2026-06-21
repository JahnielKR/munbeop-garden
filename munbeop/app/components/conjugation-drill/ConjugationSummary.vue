<script setup lang="ts">
import type { ConjItem } from '~/lib/conjugation-drill'

interface Props {
  score: { correct: number; total: number; accuracy: number }
  failedItems: ConjItem[]
}
defineProps<Props>()
defineEmits<{ restart: []; 'replay-failed': []; explore: [] }>()
</script>

<template>
  <section class="summary">
    <p class="summary__score">{{ $t('conjugation.summary_score', { correct: score.correct, total: score.total }) }}</p>

    <div v-if="failedItems.length" class="summary__review">
      <h3 class="summary__review-title">{{ $t('conjugation.replay_failed', { n: failedItems.length }) }}</h3>
      <ul class="summary__list">
        <li v-for="f in failedItems" :key="f.id" lang="ko">{{ f.dict }} {{ f.ending }} → {{ f.correct }}</li>
      </ul>
    </div>

    <div class="summary__actions">
      <button
        v-if="failedItems.length"
        type="button"
        class="summary__btn summary__btn--primary"
        data-testid="conj-replay"
        @click="$emit('replay-failed')"
      >
        <span aria-hidden="true">🔁</span> {{ $t('conjugation.replay_failed', { n: failedItems.length }) }}
      </button>
      <button type="button" class="summary__btn" data-testid="conj-restart" @click="$emit('restart')">
        {{ $t('conjugation.restart') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.summary { display: flex; flex-direction: column; gap: 16px; align-items: center; text-align: center; }
.summary__score { margin: 0; font-family: var(--font-pixel-display); font-size: var(--text-lg); color: var(--text); }
.summary__review {
  text-align: left; width: 100%; background: var(--paper);
  border-left: 4px solid var(--danger); padding: 12px 14px;
}
.summary__review-title {
  margin: 0 0 8px; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--text-soft); text-transform: uppercase;
}
.summary__list { margin: 0; padding-left: 18px; font-family: var(--font-ko); font-size: var(--text-md); color: var(--text); line-height: 1.7; }
.summary__actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.summary__btn {
  min-width: 0; padding: 10px 16px; background: var(--surface); color: var(--text);
  border: 3px solid var(--ink-line); box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; cursor: pointer;
}
.summary__btn--primary { background: var(--accent); color: var(--text-on-accent); }
.summary__btn:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.summary__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
