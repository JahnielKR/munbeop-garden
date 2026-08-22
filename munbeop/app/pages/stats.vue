<script setup lang="ts">
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Icon from '~/components/ui/Icon.vue'
import StrugglingPlants from '~/components/stats/StrugglingPlants.vue'
import ActivityHeatmap from '~/components/stats/ActivityHeatmap.vue'
import MasteryBar from '~/components/stats/MasteryBar.vue'
import { NuxtLink } from '#components'
import { useStats } from '~/composables/useStats'
import { useLeeches } from '~/composables/useLeeches'
import { useGlobalAchievements } from '~/composables/useGlobalAchievements'
import { useLocalized } from '~/composables/useLocalized'
import { STATS_PERIODS, type StatsPeriod } from '~/lib/stats/period'

const { t } = useI18n()
const { tl } = useLocalized()
const {
  sentences,
  streak,
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
  insightPeriod,
  periodInsights,
} = useStats()
const { leeches } = useLeeches()
const { achievements } = useGlobalAchievements()

const focusLink = (ko: string) => `/practice/ruleta?focus=${encodeURIComponent(ko)}`
const maxWeek = computed(() => Math.max(1, ...weekly.value))
const weekHeight = (count: number) => Math.round((count / maxWeek.value) * 100)
const rhythmTotal = computed(() => weekly.value.reduce((sum, count) => sum + count, 0))
const rhythmLabel = computed(
  () =>
    `${t('stats.rhythm.aria', { total: rhythmTotal.value, weeks: weekly.value.length })} ${weekly.value.join(', ')}`,
)
const maxContext = computed(() => Math.max(1, ...topContexts.value.map((context) => context.count)))
const contextWidth = (count: number) => Math.max(6, Math.round((count / maxContext.value) * 100))
const earnedAchievements = computed(
  () => achievements.value.filter((achievement) => achievement.earned).length,
)
const periodLabelKey = (period: StatsPeriod) =>
  period === 'all' ? 'stats.period.range_all' : `stats.period.range_${period}`
const averageLabel = computed(() => {
  const value = periodInsights.value.averagePerActiveDay
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
})
const changeLabel = computed(() => {
  const value = periodInsights.value.changeFromPrevious
  if (value === null) return '\u2014'
  return value > 0 ? `+${value}` : String(value)
})
const changeTone = computed(() => {
  const value = periodInsights.value.changeFromPrevious
  if (value === null || value === 0) return 'period-stat__value--neutral'
  return value > 0 ? 'period-stat__value--up' : 'period-stat__value--down'
})
</script>

<template>
  <div class="page">
    <BilingualTitle ko="통계" :latin="t('title.stats')" />

    <section v-if="!hasData" class="empty" data-test="stats-empty">
      <img
        class="empty__sprout pixel"
        src="/img/achievements/first_sprout.png"
        alt=""
        aria-hidden="true"
        width="64"
        height="64"
      >
      <div class="empty__copy">
        <p>{{ t('stats.empty') }}</p>
        <NuxtLink class="pixel-link" to="/practice">
          <Icon name="practice" :size="16" />
          {{ t('nav.practice') }}
        </NuxtLink>
      </div>
    </section>

    <template v-else>
      <ActivityHeatmap :counts="activityCounts" />

      <div class="hero">
        <article class="metric metric--sky" data-test="hero-card">
          <span class="metric__icon" aria-hidden="true"><Icon name="log" :size="32" /></span>
          <div>
            <div class="metric__label">{{ t('stats.hero.sentences') }}</div>
            <div class="metric__value">{{ sentences }}</div>
          </div>
        </article>
        <article class="metric metric--red" data-test="hero-card">
          <span class="metric__icon" aria-hidden="true"><Icon name="deck-flame" :size="32" /></span>
          <div>
            <div class="metric__label">{{ t('stats.hero.streak') }}</div>
            <div class="metric__value">{{ streak }}</div>
          </div>
        </article>
        <article class="metric metric--jade" data-test="hero-card">
          <span class="metric__icon" aria-hidden="true"
            ><Icon name="mastery-tree" :size="32"
          /></span>
          <div>
            <div class="metric__label">{{ t('stats.hero.mastered') }}</div>
            <div class="metric__value">
              {{ masteredCount }} <span class="metric__total">/ {{ catalogTotal }}</span>
            </div>
          </div>
        </article>
        <article class="metric metric--gold" data-test="hero-card">
          <span class="metric__icon" aria-hidden="true"><Icon name="deck-book" :size="32" /></span>
          <div>
            <div class="metric__label">{{ t('stats.hero.pending') }}</div>
            <div class="metric__value">{{ pendingReviews }}</div>
          </div>
        </article>
      </div>

      <section class="panel panel--sky period" data-test="period-pulse">
        <div class="period__top">
          <div class="panel__head">
            <span class="panel__icon" aria-hidden="true"><Icon name="stats" :size="24" /></span>
            <div>
              <h2 class="panel__title">{{ t('stats.period.title') }}</h2>
              <p class="panel__sub">{{ t('stats.period.sub') }}</p>
            </div>
          </div>
          <div class="period__ranges" role="group" :aria-label="t('stats.period.filter_label')">
            <button
              v-for="range in STATS_PERIODS"
              :key="range"
              type="button"
              class="period__range"
              :class="{ 'period__range--active': insightPeriod === range }"
              :aria-pressed="insightPeriod === range"
              :data-period="range"
              data-test="period-option"
              @click="insightPeriod = range"
            >
              {{ t(periodLabelKey(range)) }}
            </button>
          </div>
        </div>

        <div class="period__metrics" aria-live="polite">
          <div class="period-stat" data-test="period-metric">
            <strong class="period-stat__value">{{ periodInsights.actions }}</strong>
            <span class="period-stat__label">{{ t('stats.period.actions') }}</span>
          </div>
          <div class="period-stat" data-test="period-metric">
            <strong class="period-stat__value">{{ periodInsights.activeDays }}</strong>
            <span class="period-stat__label">{{ t('stats.period.active_days') }}</span>
          </div>
          <div class="period-stat" data-test="period-metric">
            <strong class="period-stat__value">{{ periodInsights.goalDays }}</strong>
            <span class="period-stat__label">{{ t('stats.period.goal_days') }}</span>
          </div>
          <div class="period-stat" data-test="period-metric">
            <strong class="period-stat__value">{{ averageLabel }}</strong>
            <span class="period-stat__label">{{ t('stats.period.average') }}</span>
          </div>
          <div class="period-stat" data-test="period-metric">
            <strong class="period-stat__value" :class="changeTone">{{ changeLabel }}</strong>
            <span class="period-stat__label">{{ t('stats.period.change') }}</span>
            <span v-if="periodInsights.changeFromPrevious === null" class="period-stat__note">
              {{ t('stats.period.comparison_none') }}
            </span>
          </div>
        </div>

        <div
          v-if="periodInsights.goalTarget !== null && periodInsights.goalProgressPct !== null"
          class="period-goal"
          data-test="period-goal"
        >
          <div class="period-goal__line">
            <span>{{ t('stats.period.goal') }}</span>
            <strong>
              {{
                t('stats.period.goal_progress', {
                  current: periodInsights.actions,
                  target: periodInsights.goalTarget,
                })
              }}
            </strong>
          </div>
          <div
            class="period-goal__track"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="periodInsights.goalProgressPct"
            :aria-label="
              t('stats.period.goal_aria', {
                current: periodInsights.actions,
                target: periodInsights.goalTarget,
                percent: periodInsights.goalProgressPct,
              })
            "
          >
            <i :style="{ width: periodInsights.goalProgressPct + '%' }" />
          </div>
        </div>

        <p class="period__scope">
          <Icon name="deck-book" :size="16" aria-hidden="true" />
          {{ t('stats.period.scope') }}
        </p>
      </section>

      <section class="panel panel--jade">
        <div class="panel__head">
          <span class="panel__icon" aria-hidden="true"
            ><Icon name="mastery-tree" :size="24"
          /></span>
          <div>
            <h2 class="panel__title">{{ t('stats.mastery.title') }}</h2>
            <p class="panel__sub">{{ t('stats.mastery.sub') }}</p>
          </div>
        </div>
        <div class="mastery">
          <MasteryBar
            v-for="level in masteryLevels"
            :key="level.level"
            :label="`TOPIK ${level.level}`"
            :seedling="level.seedling"
            :plant="level.plant"
            :tree="level.tree"
            :total="level.total"
            :pct="level.pct"
          />
        </div>
        <div class="legend">
          <span class="legend__item"
            ><i class="dot dot--seedling" />{{ t('mastery.seedling') }}</span
          >
          <span class="legend__item"><i class="dot dot--plant" />{{ t('mastery.plant') }}</span>
          <span class="legend__item"><i class="dot dot--tree" />{{ t('mastery.tree') }}</span>
        </div>
      </section>

      <div class="split-grid">
        <section class="panel panel--sky" data-test="rhythm">
          <div class="panel__head">
            <span class="panel__icon" aria-hidden="true"><Icon name="stats" :size="24" /></span>
            <div>
              <h2 class="panel__title">{{ t('stats.rhythm.title') }}</h2>
              <p class="panel__sub">{{ t('stats.rhythm.sub') }}</p>
            </div>
          </div>
          <div class="rhythm" role="img" :aria-label="rhythmLabel">
            <div
              v-for="(count, index) in weekly"
              :key="index"
              class="rhythm__column"
              aria-hidden="true"
            >
              <span class="rhythm__count">{{ count }}</span>
              <span class="rhythm__track">
                <i
                  class="rhythm__bar"
                  :class="{ 'rhythm__bar--active': count > 0 }"
                  :style="{ height: weekHeight(count) + '%' }"
                />
              </span>
            </div>
          </div>
          <div class="rhythm__axis" aria-hidden="true">
            <span>{{ t('stats.rhythm.axis_oldest') }}</span>
            <span>{{ t('stats.rhythm.axis_newest') }}</span>
          </div>
          <div v-if="split.easy + split.hard > 0" class="ratio">
            <div class="ratio__item ratio__item--easy">
              <i aria-hidden="true" />
              <div>
                <div class="ratio__num">{{ split.easyPct }}%</div>
                <div class="ratio__label">{{ t('stats.rhythm.easy') }}</div>
              </div>
            </div>
            <div class="ratio__item ratio__item--hard">
              <i aria-hidden="true" />
              <div>
                <div class="ratio__num">{{ 100 - split.easyPct }}%</div>
                <div class="ratio__label">{{ t('stats.rhythm.hard') }}</div>
              </div>
            </div>
          </div>
        </section>

        <section v-if="topContexts.length" class="panel panel--gold">
          <div class="panel__head">
            <span class="panel__icon" aria-hidden="true"><Icon name="deck-star" :size="24" /></span>
            <div>
              <h2 class="panel__title">{{ t('stats.contexts.title') }}</h2>
              <p class="panel__sub">{{ t('stats.contexts.sub') }}</p>
            </div>
          </div>
          <div class="contexts">
            <div
              v-for="context in topContexts"
              :key="context.name"
              class="contexts__row"
              data-test="context-row"
            >
              <div class="contexts__line">
                <span lang="ko">{{ context.name }}</span>
                <strong>{{ context.count }}</strong>
              </div>
              <span class="contexts__track" aria-hidden="true">
                <i :style="{ width: contextWidth(context.count) + '%' }" />
              </span>
            </div>
          </div>
        </section>
      </div>

      <section v-if="toughest.length" class="panel panel--red">
        <div class="panel__head">
          <span class="panel__icon" aria-hidden="true"><Icon name="deck-bolt" :size="24" /></span>
          <div>
            <h2 class="panel__title">{{ t('stats.toughest.title') }}</h2>
            <p class="panel__sub">{{ t('stats.toughest.sub') }}</p>
          </div>
        </div>
        <div class="tough">
          <div v-for="item in toughest" :key="item.ko" class="tough__row" data-test="tough-row">
            <div class="tough__grammar">
              <span class="tough__ko" lang="ko">{{ item.ko }}</span>
              <span v-if="item.meaning" class="tough__meaning">{{ tl(item.meaning) }}</span>
            </div>
            <div class="tough__right">
              <span class="tough__count">{{
                t('stats.toughest.hard_count', { n: item.hardCount })
              }}</span>
              <NuxtLink class="pixel-link" data-test="tough-practice" :to="focusLink(item.ko)">
                {{ t('stats.toughest.practice') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section class="panel panel--gold" data-test="achievements">
        <div class="panel__head panel__head--between">
          <div class="panel__head-copy">
            <span class="panel__icon" aria-hidden="true"><Icon name="deck-star" :size="24" /></span>
            <div>
              <h2 class="panel__title">{{ t('stats.achievements.title') }}</h2>
              <p class="panel__sub">{{ t('stats.achievements.sub') }}</p>
            </div>
          </div>
          <span class="panel__counter">{{ earnedAchievements }}/{{ achievements.length }}</span>
        </div>
        <ul class="trophies">
          <li
            v-for="achievement in achievements"
            :key="achievement.id"
            class="trophy"
            :class="{ 'trophy--earned': achievement.earned, 'trophy--locked': !achievement.earned }"
            :aria-label="`${t(`stats.achievements.${achievement.id}.name`)} — ${t(`stats.achievements.${achievement.id}.desc`)}`"
            data-test="trophy"
          >
            <span class="trophy__art">
              <img
                class="trophy__icon pixel"
                :src="`/img/achievements/${achievement.id}.png`"
                alt=""
                aria-hidden="true"
                width="48"
                height="48"
                draggable="false"
              >
              <img
                v-if="!achievement.earned"
                class="trophy__lock pixel"
                src="/img/tree/ui/lock_8.png"
                alt=""
                aria-hidden="true"
                width="16"
                height="16"
                draggable="false"
              >
            </span>
            <span class="trophy__name">{{ t(`stats.achievements.${achievement.id}.name`) }}</span>
            <span v-if="!achievement.earned" class="trophy__desc">
              {{ t(`stats.achievements.${achievement.id}.desc`) }}
            </span>
          </li>
        </ul>
      </section>

      <StrugglingPlants :leeches="leeches" />
    </template>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.empty {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-6);
  background: var(--surface-elevated);
  border: 2px solid var(--border);
  border-left: 6px solid var(--jade);
  box-shadow: var(--bevel), var(--shadow-card);
}
.empty__sprout {
  flex: 0 0 64px;
  image-rendering: pixelated;
}
.empty__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
}
.empty__copy p {
  margin: 0;
  color: var(--text-soft);
  font-family: var(--font-ui);
}

.hero {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
}
.metric {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-4);
  background: var(--surface-elevated);
  border: 2px solid var(--border);
  border-top-width: 5px;
  box-shadow: var(--bevel), var(--shadow-card);
}
.metric--sky {
  border-top-color: var(--sky);
}
.metric--red {
  border-top-color: var(--red);
}
.metric--jade {
  border-top-color: var(--jade);
}
.metric--gold {
  border-top-color: var(--gold);
}
.metric__icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  color: var(--text);
  background: var(--surface-muted);
  border: 2px solid var(--border-strong);
  box-shadow: var(--shadow-pixel-sm);
}
.metric__label {
  color: var(--text-soft);
  font-family: var(--font-pixel-small);
  font-size: 8px;
  line-height: 1.6;
}
.metric__value {
  margin-top: var(--space-1);
  color: var(--text);
  font-family: var(--font-pixel-display);
  font-size: var(--text-xl);
  line-height: 1.35;
  font-variant-numeric: tabular-nums;
}
.metric__total {
  color: var(--text-soft);
  font-size: var(--text-sm);
}

.period {
  gap: var(--space-4);
}
.period__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}
.period__top .panel__head {
  min-width: 0;
}
.period__ranges {
  display: grid;
  grid-template-columns: repeat(4, minmax(48px, 1fr));
  flex: 0 0 auto;
  gap: 4px;
  padding: 3px;
  background: var(--surface-muted);
  border: 2px solid var(--border);
}
.period__range {
  min-height: 36px;
  padding: 6px 8px;
  color: var(--text-soft);
  background: var(--surface);
  border: 2px solid transparent;
  font-family: var(--font-pixel-small);
  font-size: 8px;
  line-height: 1.5;
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.period__range:hover {
  color: var(--text);
  border-color: var(--border);
}
.period__range:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.period__range--active {
  color: var(--text-on-accent);
  background: var(--accent);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-pixel-sm);
  transform: translate(-1px, -1px);
}
.period__metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-2);
}
.period-stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  min-height: 88px;
  padding: var(--space-3);
  background: var(--surface);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-pixel-sm);
}
.period-stat__value {
  color: var(--text);
  font-family: var(--font-pixel-display);
  font-size: var(--text-lg);
  font-variant-numeric: tabular-nums;
  line-height: 1.35;
}
.period-stat__value--up {
  color: var(--jade-deep);
}
.period-stat__value--down {
  color: var(--red);
}
.period-stat__value--neutral {
  color: var(--text-soft);
}
.period-stat__label {
  margin-top: 5px;
  color: var(--text-soft);
  font-family: var(--font-pixel-small);
  font-size: 7px;
  line-height: 1.6;
}
.period-stat__note {
  margin-top: 3px;
  color: var(--text-soft);
  font-family: var(--font-ui);
  font-size: 10px;
  line-height: 1.35;
}
.period-goal {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--surface-muted);
  border: 2px solid var(--border);
}
.period-goal__line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--text-soft);
  font-family: var(--font-pixel-small);
  font-size: 8px;
  line-height: 1.5;
}
.period-goal__line strong {
  color: var(--text);
  font-weight: 400;
  text-align: right;
}
.period-goal__track {
  display: block;
  height: 18px;
  padding: 2px;
  background: var(--surface);
  border: 2px solid var(--border-strong);
}
.period-goal__track i {
  display: block;
  height: 100%;
  background: var(--jade);
  border-right: 2px solid var(--jade-deep);
  transition: width var(--motion-base) var(--ease-out);
}
.period__scope {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin: 0;
  padding-top: var(--space-3);
  color: var(--text-soft);
  border-top: 2px solid var(--border);
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  line-height: 1.5;
}
.period__scope .icon {
  flex: 0 0 16px;
  margin-top: 1px;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
  padding: var(--space-5);
  background: var(--surface-elevated);
  border: 2px solid var(--border);
  border-left-width: 6px;
  box-shadow: var(--bevel), var(--shadow-card);
}
.panel--jade {
  border-left-color: var(--jade);
}
.panel--sky {
  border-left-color: var(--sky);
}
.panel--gold {
  border-left-color: var(--gold);
}
.panel--red {
  border-left-color: var(--red);
}
.panel__head,
.panel__head-copy {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}
.panel__head--between {
  justify-content: space-between;
}
.panel__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  color: var(--text);
  background: var(--surface-muted);
  border: 2px solid var(--border);
}
.panel__title {
  margin: 0;
  color: var(--text);
  font-family: var(--font-pixel-display);
  font-size: var(--text-md);
  line-height: 1.6;
}
.panel__sub {
  margin: var(--space-1) 0 0;
  color: var(--text-soft);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
}
.panel__counter {
  padding: 7px 9px;
  color: var(--text);
  background: var(--surface-muted);
  border: 2px solid var(--border-strong);
  font-family: var(--font-pixel-small);
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.mastery {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-5);
}
.legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-soft);
  font-family: var(--font-pixel-small);
  font-size: 8px;
  line-height: 1.6;
}
.dot {
  width: 12px;
  height: 12px;
  display: inline-block;
  border: 1px solid var(--border-strong);
}
.dot--seedling {
  background: var(--mastery-seedling);
}
.dot--plant {
  background: var(--mastery-plant);
}
.dot--tree {
  background: var(--mastery-tree);
}

.split-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 1fr);
  gap: var(--space-5);
}
.split-grid > :only-child {
  grid-column: 1 / -1;
}
.rhythm {
  display: grid;
  grid-template-columns: repeat(8, minmax(20px, 1fr));
  gap: var(--space-2);
  min-height: 128px;
}
.rhythm__column {
  display: grid;
  grid-template-rows: 20px 108px;
  gap: 4px;
  min-width: 0;
}
.rhythm__count {
  align-self: end;
  text-align: center;
  color: var(--text-soft);
  font-family: var(--font-pixel-small);
  font-size: 8px;
  font-variant-numeric: tabular-nums;
}
.rhythm__track {
  display: flex;
  align-items: flex-end;
  padding: 2px;
  background: var(--surface-muted);
  border: 2px solid var(--border);
}
.rhythm__bar {
  display: block;
  width: 100%;
  background: var(--sky);
  border-top: 2px solid color-mix(in srgb, var(--sky) 55%, var(--border-strong));
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--surface) 35%, transparent);
}
.rhythm__bar--active {
  min-height: 4px;
}
.rhythm__axis {
  display: flex;
  justify-content: space-between;
  color: var(--text-soft);
  font-family: var(--font-pixel-small);
  font-size: 8px;
}
.ratio {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.ratio__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--surface-muted);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-pixel-sm);
}
.ratio__item > i {
  width: 12px;
  height: 32px;
  border: 1px solid var(--border-strong);
}
.ratio__item--easy > i {
  background: var(--jade);
}
.ratio__item--hard > i {
  background: var(--gold);
}
.ratio__num {
  color: var(--text);
  font-family: var(--font-pixel-display);
  font-size: var(--text-md);
  font-variant-numeric: tabular-nums;
}
.ratio__label {
  margin-top: 3px;
  color: var(--text-soft);
  font-family: var(--font-ui);
  font-size: var(--text-xs);
}

.contexts {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.contexts__row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.contexts__line {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--text);
  font-family: var(--font-ko);
  font-size: var(--text-base);
}
.contexts__line strong {
  color: var(--text-soft);
  font-family: var(--font-pixel-small);
  font-size: 9px;
  font-weight: 400;
}
.contexts__track {
  display: block;
  height: 10px;
  padding: 1px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
}
.contexts__track i {
  display: block;
  height: 100%;
  background: var(--gold);
}

.tough {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.tough__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--surface);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-pixel-sm);
}
.tough__grammar {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.tough__ko {
  color: var(--text);
  font-family: var(--font-ko);
  font-weight: 700;
  font-size: var(--text-base);
}
.tough__meaning {
  color: var(--text-soft);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  overflow-wrap: anywhere;
}
.tough__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}
.tough__count {
  padding: 6px 8px;
  color: var(--always-dark);
  background: var(--gold);
  border: 2px solid var(--border-strong);
  font-family: var(--font-pixel-small);
  font-size: 8px;
  line-height: 1.5;
}

.pixel-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 40px;
  padding: 8px 12px;
  color: var(--text-on-accent);
  background: var(--accent);
  border: 2px solid var(--border-strong);
  box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small);
  font-size: 9px;
  line-height: 1.5;
  text-decoration: none;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.pixel-link:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.pixel-link:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-button-pressed);
}
.pixel-link:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.trophies {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.trophy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: var(--space-3);
  background: var(--surface);
  border: 2px solid var(--border-strong);
  box-shadow: var(--shadow-pixel-sm);
  text-align: center;
}
.trophy__art {
  position: relative;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
}
.trophy__icon {
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
}
.trophy__lock {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  padding: 2px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  image-rendering: pixelated;
}
.trophy__name {
  color: var(--text);
  font-family: var(--font-pixel-small);
  font-size: 8px;
  line-height: 1.6;
}
.trophy__desc {
  color: var(--text-soft);
  font-family: var(--font-ui);
  font-size: 11px;
  line-height: 1.35;
}
.trophy--locked .trophy__icon {
  opacity: 0.38;
  filter: grayscale(1);
}
.trophy--earned {
  border-color: var(--border-strong);
  box-shadow:
    inset 0 0 0 2px var(--gold),
    var(--shadow-pixel-sm);
}

@media (max-width: 980px) {
  .hero {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .period__metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .split-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .page {
    gap: var(--space-5);
  }
  .panel {
    padding: var(--space-4);
  }
  .empty {
    align-items: flex-start;
    padding: var(--space-5);
  }
  .metric {
    padding: var(--space-3);
  }
  .metric__icon {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
  }
  .period__top {
    flex-direction: column;
  }
  .period__ranges {
    align-self: stretch;
  }
  .period__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tough__row {
    align-items: stretch;
    flex-direction: column;
  }
  .tough__right {
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .tough__right .pixel-link {
    flex: 1;
  }
  .panel__head--between {
    align-items: flex-start;
  }
}

@media (max-width: 380px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .ratio {
    grid-template-columns: 1fr;
  }
  .empty {
    flex-direction: column;
  }
  .trophies {
    grid-template-columns: 1fr 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pixel-link,
  .period__range,
  .period-goal__track i {
    transition: none;
  }
}
</style>
