<script setup lang="ts">
import type { ClashSet, DrillItem } from '~/lib/domain'
import type { DrillScore } from '~/lib/particle-lab'
import { correctForm } from '~/lib/particle-lab'
import { useLocalized } from '~/composables/useLocalized'

/** End-of-session screen: score, batchim slips, review list, CTAs. */
interface Props {
  score: DrillScore
  failedItems: DrillItem[]
  set: ClashSet
  gardenGrew: boolean
}
defineProps<Props>()
const emit = defineEmits<{ restart: []; explore: []; 'replay-failed': [] }>()
const { t } = useI18n()
const { tl } = useLocalized()
</script>

<template>
  <section class="summary" data-testid="drill-summary">
    <h2 class="summary__ko" lang="ko">수고했어요! 🎉</h2>
    <p class="summary__score">
      {{ t('particles.drill.summary_score', { n: score.correct, total: score.total }) }}
    </p>
    <p v-if="score.batchimSlips > 0" class="summary__slips">
      🧱 {{ t('particles.drill.summary_slips', { n: score.batchimSlips }) }}
    </p>

    <div v-if="failedItems.length > 0" class="summary__review">
      <h3 class="summary__review-title">{{ t('particles.drill.summary_review_title') }}</h3>
      <ul class="summary__list">
        <li v-for="item in failedItems" :key="item.id" class="summary__item">
          <span lang="ko" class="summary__item-ko">
            {{ item.lead ?? '' }}{{ item.noun }}<strong>{{ correctForm(item, set) }}</strong>{{ item.rest }}
          </span>
          <span class="summary__item-reason">{{ tl(item.reason) }}</span>
        </li>
      </ul>
    </div>
    <p v-else class="summary__perfect">{{ t('particles.drill.summary_perfect') }}</p>

    <p v-if="gardenGrew" class="summary__garden">
      🌱 {{ t('particles.drill.summary_garden_note') }}
    </p>

    <div class="summary__actions">
      <button
        v-if="failedItems.length > 0"
        type="button"
        class="summary__btn summary__btn--primary"
        data-testid="drill-replay-failed"
        @click="emit('replay-failed')"
      >
        🔁 {{ t('particles.drill.summary_replay_failed', { n: failedItems.length }) }}
      </button>
      <button
        type="button"
        class="summary__btn"
        :class="{ 'summary__btn--primary': failedItems.length === 0 }"
        data-testid="drill-restart"
        @click="emit('restart')"
      >
        🔁 {{ t('particles.drill.summary_repeat') }}
      </button>
      <button type="button" class="summary__btn" @click="emit('explore')">
        🧩 {{ t('particles.drill.summary_explore') }}
      </button>
      <NuxtLink to="/log" class="summary__btn summary__link">
        📓 {{ t('nav.log') }}
      </NuxtLink>
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
.summary__slips {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
}
.summary__review {
  text-align: left;
  background: var(--paper);
  border-left: 4px solid var(--danger);
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
.summary__garden {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
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
  text-decoration: none;
  display: inline-flex;
  align-items: center;
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
