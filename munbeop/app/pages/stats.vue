<script setup lang="ts">
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import StrugglingPlants from '~/components/stats/StrugglingPlants.vue'
import { NuxtLink } from '#components'
import { useStats } from '~/composables/useStats'
import { useLeeches } from '~/composables/useLeeches'
import { useGlobalAchievements } from '~/composables/useGlobalAchievements'
import { useLocalized } from '~/composables/useLocalized'

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
} = useStats()
const { leeches } = useLeeches()
const { achievements } = useGlobalAchievements()

const focusLink = (ko: string) => `/practice/ruleta?focus=${encodeURIComponent(ko)}`
const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0)
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
      <div class="hero">
        <div class="hero__card" data-test="hero-card">
          <div class="hero__label">{{ t('stats.hero.sentences') }}</div>
          <div class="hero__value">{{ sentences }}</div>
        </div>
        <div class="hero__card" data-test="hero-card">
          <div class="hero__label">{{ t('stats.hero.streak') }}</div>
          <div class="hero__value">{{ streak }}</div>
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
          <div v-for="lvl in masteryLevels" :key="lvl.level" class="mastery__row" data-test="mastery-row">
            <span class="mastery__label">TOPIK {{ lvl.level }}</span>
            <div class="bar">
              <div class="bar__seg bar__seg--seedling" :style="{ width: pct(lvl.seedling, lvl.total) + '%' }"/>
              <div class="bar__seg bar__seg--plant" :style="{ width: pct(lvl.plant, lvl.total) + '%' }"/>
              <div class="bar__seg bar__seg--tree" :style="{ width: pct(lvl.tree, lvl.total) + '%' }"/>
            </div>
            <span class="mastery__pct">{{ lvl.pct }}%</span>
          </div>
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

      <section class="block" data-test="achievements">
        <h2 class="block__title">{{ t('stats.achievements.title') }}</h2>
        <p class="block__sub">{{ t('stats.achievements.sub') }}</p>
        <ul class="trophies">
          <li
            v-for="a in achievements"
            :key="a.id"
            class="trophy"
            :class="{ 'trophy--earned': a.earned, 'trophy--locked': !a.earned }"
            :aria-label="a.earned
              ? t(`stats.achievements.${a.id}.name`)
              : `${t(`stats.achievements.${a.id}.name`)} — ${t(`stats.achievements.${a.id}.desc`)}`"
            :title="a.earned
              ? t(`stats.achievements.${a.id}.name`)
              : t(`stats.achievements.${a.id}.desc`)"
            data-test="trophy"
          >
            <img
              class="trophy__icon pixel"
              :src="`/img/achievements/${a.id}.png`"
              alt=""
              aria-hidden="true"
              width="48"
              height="48"
              draggable="false"
            >
            <span class="trophy__name">{{ t(`stats.achievements.${a.id}.name`) }}</span>
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
  gap: 24px;
}
.empty {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  padding: 32px;
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
}
.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
.hero__card {
  background: var(--paper-warm);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
}
.hero__label {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
}
.hero__value {
  font-family: 'Inter', sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: var(--ink);
  margin-top: 4px;
}
.hero__total {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-soft);
}
.block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.block__title {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}
.block__sub {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
  margin: 0 0 8px;
}
.mastery {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.mastery__row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mastery__label {
  width: 62px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
}
.bar {
  flex: 1;
  height: 14px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  background: var(--paper-deep);
}
.bar__seg--seedling {
  background: #c0dd97;
}
.bar__seg--plant {
  background: #97c459;
}
.bar__seg--tree {
  background: var(--jade, #3f9d6b);
}
.mastery__pct {
  width: 40px;
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--ink-soft);
}
.legend {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: var(--ink-soft);
}
.legend__item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}
.dot--seedling {
  background: #c0dd97;
}
.dot--plant {
  background: #97c459;
}
.dot--tree {
  background: var(--jade, #3f9d6b);
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
  border-radius: 3px 3px 0 0;
}
.rhythm__axis {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: var(--ink-soft);
}
.ratio {
  display: flex;
  gap: 20px;
  margin-top: 14px;
}
.ratio__num {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 700;
}
.ratio__num--easy {
  color: var(--jade, #3f9d6b);
}
.ratio__num--hard {
  color: var(--gold, #b8860b);
}
.ratio__label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
}
.contexts {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.contexts__row {
  display: flex;
  justify-content: space-between;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: var(--ink);
}
.contexts__count {
  font-family: 'JetBrains Mono', monospace;
  color: var(--ink-soft);
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
  background: var(--paper-warm);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 9px 12px;
}
.tough__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: var(--ink);
}
.tough__meaning {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
  margin-left: 4px;
}
.tough__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.tough__count {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--gold, #b8860b);
}
.tough__cta {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  background: var(--paper);
  border: 1.5px solid var(--jade, #3f9d6b);
  border-radius: 999px;
  padding: 4px 12px;
  transition: background var(--motion-quick, 120ms) ease;
}
.tough__cta:hover {
  background: var(--paper-deep);
}
.tough__cta:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
.trophies {
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 10px;
}
.trophy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  background: var(--paper-warm);
  border: 2px solid var(--border);
  border-radius: 8px;
  text-align: center;
  transition: opacity var(--motion-quick, 120ms) ease;
}
.trophy__icon {
  width: 48px;
  height: 48px;
}
.trophy__name {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  line-height: 1.2;
  color: var(--ink);
}
/* Earned = full colour + gold frame; locked = greyed so the wall reads as a goal. */
.trophy--locked {
  opacity: 0.45;
  filter: grayscale(1);
}
.trophy--earned {
  border-color: var(--gold, var(--ink));
}
@media (max-width: 640px) {
  .split-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
