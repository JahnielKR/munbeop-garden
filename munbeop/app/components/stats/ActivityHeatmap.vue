<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  yearGrid,
  intensityBucket,
  daysActive,
  dailyAverage,
  localDayKey,
} from '~/lib/stats/activity'
import { currentStreak, longestStreak, STREAK_GRACE_DAYS } from '~/lib/stats/streak'

const props = defineProps<{ counts: Record<string, number>; now?: number }>()
const { t, locale } = useI18n()

const nowMs = computed(() => props.now ?? Date.now())
const todayKey = computed(() => localDayKey(nowMs.value))
const countsMap = computed(() => new Map(Object.entries(props.counts)))
const dayKeys = computed(() => new Set(Object.keys(props.counts)))

const year = ref(Number(todayKey.value.slice(0, 4)))
const minYear = computed(() => {
  const keys = Object.keys(props.counts)
  // Allow browsing one empty year before the earliest activity, so the
  // "previous year" arrow stays usable when all data is in the current year.
  if (!keys.length) return year.value - 1
  return Number(keys.reduce((a, b) => (a < b ? a : b)).slice(0, 4)) - 1
})
const maxYear = computed(() => Number(todayKey.value.slice(0, 4)))
function prevYear() { if (year.value > minYear.value) year.value-- }
function nextYear() { if (year.value < maxYear.value) year.value++ }

const grid = computed(() => yearGrid(countsMap.value, year.value, todayKey.value))

const streakCurrent = computed(() => currentStreak(dayKeys.value, todayKey.value, STREAK_GRACE_DAYS))
const streakLongest = computed(() => longestStreak(dayKeys.value))
const active = computed(() => daysActive(countsMap.value))
const avg = computed(() => dailyAverage(countsMap.value))

const fmtMonth = (col: number) => {
  const label = grid.value.months.find((m) => m.col === col)
  if (!label) return ''
  const monIdx = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(label.label)
  return new Date(Date.UTC(year.value, monIdx, 1)).toLocaleDateString(locale.value, { month: 'short', timeZone: 'UTC' })
}

const tip = ref<{ day: string; count: number; x: number; y: number } | null>(null)
function showTip(e: MouseEvent | FocusEvent, day: string, count: number, inYear: boolean, future: boolean) {
  if (!inYear || future) return
  const host = (e.currentTarget as HTMLElement).closest('.heat')!.getBoundingClientRect()
  const cell = (e.currentTarget as HTMLElement).getBoundingClientRect()
  tip.value = { day, count, x: cell.left - host.left + 30, y: cell.top - host.top - 4 }
}
function hideTip() { tip.value = null }

const weekdayLabels = computed(() => {
  // Mon, '', Wed, '', Fri, '', '' — using locale short names for rows 0,2,4
  const lab = (offset: number) =>
    new Date(Date.UTC(2026, 5, 1 + offset)).toLocaleDateString(locale.value, { weekday: 'short', timeZone: 'UTC' })
  return [lab(0), '', lab(2), '', lab(4), '', '']
})
</script>

<template>
  <section class="heat-block">
    <div class="heat-head">
      <div>
        <h2 class="heat-title">{{ t('stats.activity.title') }}</h2>
        <p class="heat-sub">{{ t('stats.activity.sub') }}</p>
      </div>
      <div class="heat-nav">
        <button type="button" data-test="heat-year-prev" :aria-label="t('stats.activity.year_prev')" :disabled="year <= minYear" @click="prevYear">‹</button>
        <span class="heat-year" data-test="heat-year">{{ year }}</span>
        <button type="button" data-test="heat-year-next" :aria-label="t('stats.activity.year_next')" :disabled="year >= maxYear" @click="nextYear">›</button>
      </div>
    </div>

    <div class="heat">
      <div class="heat-months">
        <span v-for="(w, col) in grid.weeks" :key="'m' + col" class="heat-month">{{ fmtMonth(col) }}</span>
      </div>
      <div class="heat-body">
        <div class="heat-weekdays">
          <span v-for="(wd, r) in weekdayLabels" :key="'wd' + r">{{ wd }}</span>
        </div>
        <div class="heat-grid">
          <div v-for="(w, col) in grid.weeks" :key="col" class="heat-col">
            <div
              v-for="cell in w"
              :key="cell.dayKey"
              class="heat-cell"
              data-test="heat-cell"
              :data-day="cell.dayKey"
              :style="{
                background: cell.inYear && !cell.future ? `var(--heat-${intensityBucket(cell.count)})` : 'transparent',
                visibility: cell.inYear ? 'visible' : 'hidden',
              }"
              tabindex="0"
              @mouseenter="showTip($event, cell.dayKey, cell.count, cell.inYear, cell.future)"
              @focus="showTip($event, cell.dayKey, cell.count, cell.inYear, cell.future)"
              @mouseleave="hideTip"
              @blur="hideTip"
            />
          </div>
        </div>
      </div>
      <div v-if="tip" class="heat-tip" data-test="heat-tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">
        {{ tip.day }} · {{ t('stats.activity.tooltip', { count: tip.count }) }}
      </div>
    </div>

    <div class="heat-foot">
      <span>{{ t('stats.activity.avg') }} <b>{{ avg }}</b></span>
      <span>{{ t('stats.activity.days_active') }} <b>{{ active }}</b></span>
      <span data-test="heat-streak-longest">{{ t('stats.activity.streak_longest') }} <b>{{ streakLongest }}</b></span>
      <span data-test="heat-streak-current">{{ t('stats.activity.streak_current') }} <b>{{ streakCurrent }}</b></span>
    </div>
  </section>
</template>

<style scoped>
.heat-block { display: flex; flex-direction: column; gap: var(--space-2, 8px); }
.heat-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.heat-title { margin: 0; color: var(--text); }
.heat-sub { margin: 0; color: var(--text-soft); }
.heat-nav { display: flex; align-items: center; gap: 8px; }
.heat-nav button { background: var(--surface); border: 2px solid var(--border); color: var(--text); width: 28px; height: 28px; cursor: pointer; box-shadow: var(--shadow-button, 2px 2px 0 var(--border)); }
.heat-nav button:disabled { opacity: 0.4; cursor: default; }
.heat-year { font-family: var(--font-mono, monospace); color: var(--text); min-width: 48px; text-align: center; }
.heat { position: relative; overflow-x: auto; }
.heat-months { display: flex; margin-left: 30px; height: 14px; }
.heat-month { width: 13px; flex: 0 0 13px; font-size: 10px; color: var(--text-soft); font-family: var(--font-mono, monospace); }
.heat-body { display: flex; }
.heat-weekdays { display: flex; flex-direction: column; width: 30px; }
.heat-weekdays span { height: 13px; font-size: 9px; color: var(--text-soft); font-family: var(--font-mono, monospace); }
.heat-grid { display: flex; gap: 3px; }
.heat-col { display: flex; flex-direction: column; gap: 3px; }
.heat-cell { width: 10px; height: 10px; outline: 1px solid color-mix(in srgb, var(--border) 30%, transparent); }
.heat-cell:hover, .heat-cell:focus-visible { outline: 1px solid var(--text); }
.heat-tip { position: absolute; background: var(--text); color: var(--surface); font-size: 11px; font-family: var(--font-mono, monospace); padding: 4px 7px; white-space: nowrap; pointer-events: none; z-index: 5; }
.heat-foot { display: flex; flex-wrap: wrap; gap: 6px 18px; font-family: var(--font-mono, monospace); font-size: 12px; color: var(--text-soft); }
.heat-foot b { color: var(--heading-accent, var(--text)); }
@media (prefers-reduced-motion: reduce) { .heat-cell { transition: none; } }
</style>
