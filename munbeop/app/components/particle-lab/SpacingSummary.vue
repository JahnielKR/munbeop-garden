<script setup lang="ts">
import type { LabSentence } from '~/lib/domain'
import { correctSpacing, type DrillScore } from '~/lib/particle-lab'
import { useLocalized } from '~/composables/useLocalized'

/** End-of-round screen: score, review list (correctly spaced), CTAs. */
interface Props {
  score: DrillScore
  failedItems: LabSentence[]
}
defineProps<Props>()
const emit = defineEmits<{ restart: []; explore: []; 'replay-failed': [] }>()
const { t } = useI18n()
const { tl } = useLocalized()
</script>

<template>
  <section class="summary" data-testid="spacing-summary">
    <h2 class="summary__ko" lang="ko">수고했어요! <span aria-hidden="true">🎉</span></h2>
    <p class="summary__score">
      {{ t('particles.spacing.summary_score', { n: score.correct, total: score.total }) }}
    </p>

    <div v-if="failedItems.length > 0" class="summary__review">
      <h3 class="summary__review-title">{{ t('particles.spacing.summary_review_title') }}</h3>
      <ul class="summary__list">
        <li v-for="item in failedItems" :key="item.id" class="summary__item">
          <span lang="ko" class="summary__item-ko">{{ correctSpacing(item) }}</span>
          <span class="summary__item-reason">{{ tl(item.trans) }}</span>
        </li>
      </ul>
    </div>
    <p v-else class="summary__perfect">{{ t('particles.spacing.summary_perfect') }}</p>

    <div class="summary__actions">
      <button
        v-if="failedItems.length > 0"
        type="button"
        class="summary__btn summary__btn--primary"
        data-testid="spacing-replay-failed"
        @click="emit('replay-failed')"
      >
        <span aria-hidden="true">🔁</span> {{ t('particles.spacing.replay_failed', { n: failedItems.length }) }}
      </button>
      <button
        type="button"
        class="summary__btn"
        :class="{ 'summary__btn--primary': failedItems.length === 0 }"
        data-testid="spacing-restart"
        @click="emit('restart')"
      >
        <span aria-hidden="true">🔁</span> {{ t('particles.spacing.summary_repeat') }}
      </button>
      <button type="button" class="summary__btn" @click="emit('explore')">
        <span aria-hidden="true">🧩</span> {{ t('particles.spacing.summary_explore') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}
.summary__ko {
  margin: 0;
  font-family: var(--font-ko);
  font-size: var(--text-xl);
  font-weight: 900;
  color: var(--heading-accent);
}
.summary__score {
  margin: 0;
  font-family: var(--font-pixel-display);
  font-size: var(--text-lg);
  color: var(--text);
}
.summary__review {
  text-align: left;
  background: var(--paper);
  border-left: 4px solid var(--accent);
  padding: 12px 14px;
}
.summary__review-title {
  margin: 0 0 8px;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
}
.summary__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.summary__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.summary__item-ko {
  font-family: var(--font-ko);
  font-size: var(--text-md);
  color: var(--text);
}
.summary__item-reason {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
}
.summary__perfect {
  margin: 0;
  font-family: var(--font-ui);
  color: var(--success);
}
.summary__actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}
.summary__btn {
  padding: 10px 16px;
  background: var(--surface);
  color: var(--text);
  border: 3px solid var(--border-strong);
  box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.summary__btn--primary {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--ink-line);
}
.summary__btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.summary__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
