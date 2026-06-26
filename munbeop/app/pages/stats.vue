<script setup lang="ts">
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import StrugglingPlants from '~/components/stats/StrugglingPlants.vue'
import ActivityHeatmap from '~/components/stats/ActivityHeatmap.vue'
import MasteryBar from '~/components/stats/MasteryBar.vue'
import { NuxtLink } from '#components'
import { useStats } from '~/composables/useStats'
import { useLeeches } from '~/composables/useLeeches'
import { useLocalized } from '~/composables/useLocalized'

const { t } = useI18n()
const { tl } = useLocalized()
const {
  sentences,
  streak,
  longestStreak,
  masteredCount,
  catalogTotal,
  pendingReviews,
  masteryLevels,
  weekly,
  split,
  topContexts,
  toughest,
  hasData,
  activityCounts,
} = useStats()
const { leeches } = useLeeches()

const focusLink = (ko: string) => `/practice/ruleta?focus=${encodeURIComponent(ko)}`
const weekHeight = (count: number) => {
  const max = Math.max(1, ...weekly.value)
  return Math.round((count / max) * 100)
}
const rhythmTotal = computed(() => weekly.value.reduce((a, b) => a + b, 0))
</script>

<template>
  <div class="page">
    <BilingualTitle ko="통계" :latin="t('title.stats')" />

    <div v-if="!hasData" class="empty" data-test="stats-empty">{{ t('stats.empty') }}</div>

    <template v-else>
      <ActivityHeatmap :counts="activityCounts" />

      <div class="hero">
        <div class="hero__card" data-test="hero-card">
          <div class="hero__label">{{ t('stats.hero.sentences') }}</div>
          <div class="hero__value">{{ sentences }}</div>
        </div>
        <div class="hero__card" data-test="hero-card">
          <div class="hero__label">{{ t('stats.hero.streak') }}</div>
          <div class="hero__value">{{ streak }} <span class="hero__total">/ {{ longestStreak }}</span></div>
        </div>
        <div class="hero__card" data-test="hero-card">
          <div class="hero__label">{{ t('stats.hero.mastered') }}</div>
          <div class="hero__value">{{ masteredCount }} <span class="hero__total">/ {{ catalogTotal }}</span></div>
        </div>
        <div class="hero__card" data-test="hero-card">
          <div class="hero__label">{{ t('stats.hero.pending') }}</div>
          <div class="hero__value">{{ pendingReviews }}</div>
        </div>
      </div>

      <section class="block">
        <h2 class="block__title">{{ t('stats.mastery.title') }}</h2>
        <p class="block__sub">{{ t('stats.mastery.sub') }}</p>
        <div class="mastery">
          <MasteryBar
            v-for="lvl in masteryLevels"
            :key="lvl.level"
            :label="`TOPIK ${lvl.level}`"
            :seedling="lvl.seedling"
            :plant="lvl.plant"
            :tree="lvl.tree"
            :total="lvl.total"
            :pct="lvl.pct"
          />
        </div>
        <div class="legend">
          <span class="legend__item"><i class="dot dot--seedling"/>{{ t('mastery.seedling') }}</span>
          <span class="legend__item"><i class="dot dot--plant"/>{{ t('mastery.plant') }}</span>
          <span class="legend__item"><i class="dot dot--tree"/>{{ t('mastery.tree') }}</span>
        </div>
      </section>

      <section class="block split-grid">
        <div data-test="rhythm">
          <h2 class="block__title">{{ t('stats.rhythm.title') }}</h2>
          <p class="block__sub">{{ t('stats.rhythm.sub') }}</p>
          <div
            class="rhythm"
            role="img"
            :aria-label="t('stats.rhythm.aria', { total: rhythmTotal, weeks: weekly.length })"
          >
            <div v-for="(count, i) in weekly" :key="i" class="rhythm__bar-wrap">
              <div class="rhythm__bar" :style="{ height: weekHeight(count) + '%' }" :title="String(count)"/>
            </div>
          </div>
          <div class="rhythm__axis" aria-hidden="true">
            <span>{{ t('stats.rhythm.axis_oldest') }}</span>
            <span>{{ t('stats.rhythm.axis_newest') }}</span>
          </div>
          <div v-if="split.easy + split.hard > 0" class="ratio">
            <div class="ratio__item">
              <div class="ratio__num ratio__num--easy">{{ split.easyPct }}%</div>
              <div class="ratio__label">{{ t('stats.rhythm.easy') }}</div>
            </div>
            <div class="ratio__item">
              <div class="ratio__num ratio__num--hard">{{ 100 - split.easyPct }}%</div>
              <div class="ratio__label">{{ t('stats.rhythm.hard') }}</div>
            </div>
          </div>
        </div>
        <div v-if="topContexts.length">
          <h2 class="block__title">{{ t('stats.contexts.title') }}</h2>
          <p class="block__sub">{{ t('stats.contexts.sub') }}</p>
          <div class="contexts">
            <div v-for="c in topContexts" :key="c.name" class="contexts__row" data-test="context-row">
              <span>{{ c.name }}</span>
              <span class="contexts__count">{{ c.count }}</span>
            </div>
          </div>
        </div>
      </section>

      <section v-if="toughest.length" class="block">
        <h2 class="block__title">{{ t('stats.toughest.title') }}</h2>
        <p class="block__sub">{{ t('stats.toughest.sub') }}</p>
        <div class="tough">
          <div v-for="item in toughest" :key="item.ko" class="tough__row" data-test="tough-row">
            <div class="tough__grammar">
              <span class="tough__ko">{{ item.ko }}</span>
              <span v-if="item.meaning" class="tough__meaning">· {{ tl(item.meaning) }}</span>
            </div>
            <div class="tough__right">
              <span class="tough__count">{{ t('stats.toughest.hard_count', { n: item.hardCount }) }}</span>
              <NuxtLink class="tough__cta" data-test="tough-practice" :to="focusLink(item.ko)">
                {{ t('stats.toughest.practice') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <StrugglingPlants :leeches="leeches" />
    </template>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.empty {
  background: var(--surface);
  border: 2px solid var(--border);
  padding: 32px;
  font-family: var(--font-ui);
  color: var(--text-soft);
}
.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
.hero__card {
  background: var(--surface);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-card);
  padding: 14px 16px;
}
.hero__label {
  font-family: var(--font-ui);
  font-size: var(--text-base);
  color: var(--text-soft);
}
.hero__value {
  font-family: var(--font-ui);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text);
  margin-top: 4px;
}
.hero__total {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-soft);
}
.block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.block__title {
  font-family: var(--font-ui);
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--text);
  margin: 0;
}
.block__sub {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
  margin: 0 0 8px;
}
.mastery {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.legend {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-soft);
}
.legend__item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-sm);
  display: inline-block;
}
.dot--seedling {
  background: var(--heat-1);
}
.dot--plant {
  background: var(--heat-2);
}
.dot--tree {
  background: var(--heat-4);
}
.split-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 28px;
}
.rhythm {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 90px;
}
.rhythm__bar-wrap {
  flex: 1;
  display: flex;
  align-items: flex-end;
  height: 100%;
}
.rhythm__bar {
  width: 100%;
  min-height: 3px;
  background: var(--sky);
}
.rhythm__axis {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-soft);
}
.ratio {
  display: flex;
  gap: 20px;
  margin-top: 14px;
}
.ratio__num {
  font-family: var(--font-ui);
  font-size: var(--text-lg);
  font-weight: 700;
}
.ratio__num--easy {
  color: var(--jade, #3f9d6b);
}
.ratio__num--hard {
  color: var(--gold, #b8860b);
}
.ratio__label {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
}
.contexts {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.contexts__row {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-ko);
  font-size: var(--text-base);
  color: var(--text);
}
.contexts__count {
  font-family: var(--font-mono);
  color: var(--text-soft);
}
.tough {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tough__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--surface);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-card);
  padding: 9px 12px;
}
.tough__ko {
  font-family: var(--font-ko);
  font-weight: 700;
  font-size: var(--text-base);
  color: var(--text);
}
.tough__meaning {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
  margin-left: 4px;
}
.tough__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.tough__count {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--gold, #b8860b);
}
.tough__cta {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
  background: var(--paper);
  border: 2px solid var(--jade, #3f9d6b);
  border-radius: var(--radius-sm);
  padding: 4px 12px;
  transition: background var(--motion-quick, 120ms) ease;
}
.tough__cta:hover {
  background: var(--surface-hover);
}
.tough__cta:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
@media (max-width: 640px) {
  .split-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
