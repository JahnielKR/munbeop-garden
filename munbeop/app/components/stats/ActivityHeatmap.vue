<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useNow } from '@vueuse/core'
import {
  boundedActivityCounts,
  yearGrid,
  intensityBucket,
  daysActive,
  dailyAverage,
  localDayKey,
} from '~/lib/stats/activity'
import { currentStreak, longestStreak, STREAK_GRACE_DAYS } from '~/lib/stats/streak'

const props = defineProps<{ counts: Record<string, number>; now?: number }>()
const { t, locale } = useI18n()

const liveNow = useNow({ interval: 60_000 })
const nowMs = computed(() => props.now ?? liveNow.value.getTime())
const todayKey = computed(() => localDayKey(nowMs.value))
const countsMap = computed(() =>
  boundedActivityCounts(new Map(Object.entries(props.counts)), todayKey.value),
)
const dayKeys = computed(() => new Set(countsMap.value.keys()))

const maxYear = computed(() => Number(todayKey.value.slice(0, 4)))
const minYear = computed(() => {
  const keys = [...countsMap.value.keys()]
  if (!keys.length) return maxYear.value
  const earliest = keys.reduce((a, b) => (a < b ? a : b))
  return Number(earliest.slice(0, 4))
})
const year = ref(maxYear.value)

watch(maxYear, (next, previous) => {
  // Follow the calendar into a new year unless the learner intentionally
  // browsed an older one.
  if (year.value === previous) year.value = next
})
watch([minYear, maxYear], ([min, max]) => {
  year.value = Math.max(min, Math.min(max, year.value))
})

function prevYear() { if (year.value > minYear.value) year.value-- }
function nextYear() { if (year.value < maxYear.value) year.value++ }

const grid = computed(() => yearGrid(countsMap.value, year.value, todayKey.value))
const streakCurrent = computed(() =>
  currentStreak(dayKeys.value, todayKey.value, STREAK_GRACE_DAYS),
)
const streakLongest = computed(() => longestStreak(dayKeys.value, STREAK_GRACE_DAYS))
const selectedYearCounts = computed(() => new Map(
  [...countsMap.value].filter(([dayKey]) => Number(dayKey.slice(0, 4)) === year.value),
))
const active = computed(() => daysActive(selectedYearCounts.value))
const avg = computed(() => dailyAverage(selectedYearCounts.value))

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fmtMonth = (col: number) => {
  const label = grid.value.months.find((m) => m.col === col)
  if (!label) return ''
  const monIdx = monthNames.indexOf(label.label)
  return new Date(Date.UTC(year.value, monIdx, 1)).toLocaleDateString(locale.value, {
    month: 'short',
    timeZone: 'UTC',
  })
}

const tip = ref<{ day: string; count: number; x: number; y: number } | null>(null)
function showTip(
  event: MouseEvent | FocusEvent,
  day: string,
  count: number,
  inYear: boolean,
  future: boolean,
) {
  if (!inYear || future) return
  const hostElement = (event.currentTarget as HTMLElement).closest('.heat-visual') as HTMLElement | null
  if (!hostElement) return
  const host = hostElement.getBoundingClientRect()
  const cell = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const desiredX = cell.left - host.left + cell.width / 2
  const edge = Math.min(90, host.width / 2)
  tip.value = {
    day,
    count,
    x: Math.max(edge, Math.min(host.width - edge, desiredX)),
    y: cell.top - host.top - 6,
  }
}
function hideTip() { tip.value = null }

const weekdayLabels = computed(() => {
  const label = (offset: number) =>
    new Date(Date.UTC(2026, 5, 1 + offset)).toLocaleDateString(locale.value, {
      weekday: 'short',
      timeZone: 'UTC',
    })
  return [label(0), '', label(2), '', label(4), '', '']
})

const yearCells = computed(() => grid.value.weeks.flat().filter((c) => c.inYear && !c.future))
const yearActiveDays = computed(() => yearCells.value.filter((c) => c.count > 0).length)
const yearTotal = computed(() => yearCells.value.reduce((sum, cell) => sum + cell.count, 0))
const focusedDay = ref(todayKey.value)
const scrollElement = ref<HTMLElement | null>(null)

async function revealFocusedDay() {
  await nextTick()
  const element = scrollElement.value?.querySelector<HTMLElement>(`[data-day="${focusedDay.value}"]`)
  if (!element || !scrollElement.value) return
  scrollElement.value.scrollLeft = Math.max(
    0,
    element.offsetLeft - (scrollElement.value.clientWidth - element.offsetWidth) / 2,
  )
}

watch([year, todayKey], async ([selectedYear, today]) => {
  focusedDay.value = selectedYear === maxYear.value
    ? today
    : (yearCells.value[0]?.dayKey ?? '')
  await revealFocusedDay()
}, { immediate: true })

const gridSummary = computed(() =>
  t('stats.activity.grid_summary', {
    year: year.value,
    days: yearActiveDays.value,
    total: yearTotal.value,
  }),
)

function fmtDate(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
function cellLabel(cell: { dayKey: string; count: number }): string {
  return `${fmtDate(cell.dayKey)} · ${t('stats.activity.tooltip', { count: cell.count })}`
}
function inspectable(cell: { inYear: boolean; future: boolean }): boolean {
  return cell.inYear && !cell.future
}

function onCellFocus(
  event: FocusEvent,
  cell: { dayKey: string; count: number; inYear: boolean; future: boolean },
) {
  focusedDay.value = cell.dayKey
  showTip(event, cell.dayKey, cell.count, cell.inYear, cell.future)
}

async function moveCellFocus(event: KeyboardEvent, dayKey: string) {
  const cells = yearCells.value
  const current = cells.findIndex((cell) => cell.dayKey === dayKey)
  if (current < 0) return

  let target = current
  if (event.key === 'ArrowUp') target--
  else if (event.key === 'ArrowDown') target++
  else if (event.key === 'ArrowLeft') target -= 7
  else if (event.key === 'ArrowRight') target += 7
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = cells.length - 1
  else return

  event.preventDefault()
  target = Math.max(0, Math.min(cells.length - 1, target))
  const targetCell = cells[target]
  if (!targetCell) return

  focusedDay.value = targetCell.dayKey
  await nextTick()
  scrollElement.value
    ?.querySelector<HTMLElement>(`[data-day="${targetCell.dayKey}"]`)
    ?.focus()
}
</script>

<template>
  <section class="heat-block">
    <div class="heat-head">
      <div>
        <h2 class="heat-title">{{ t('stats.activity.title') }}</h2>
        <p class="heat-sub">{{ t('stats.activity.sub') }}</p>
      </div>
      <div class="heat-nav">
        <button
          type="button"
          data-test="heat-year-prev"
          :aria-label="t('stats.activity.year_prev')"
          :disabled="year <= minYear"
          @click="prevYear"
        ><span aria-hidden="true">‹</span></button>
        <span class="heat-year" data-test="heat-year">{{ year }}</span>
        <button
          type="button"
          data-test="heat-year-next"
          :aria-label="t('stats.activity.year_next')"
          :disabled="year >= maxYear"
          @click="nextYear"
        ><span aria-hidden="true">›</span></button>
      </div>
    </div>

    <div class="heat-visual">
      <div ref="scrollElement" class="heat-scroll" @scroll="hideTip">
        <div class="heat-canvas">
          <div class="heat-months">
            <span v-for="(_, col) in grid.weeks" :key="'m' + col" class="heat-month">{{ fmtMonth(col) }}</span>
          </div>
          <div class="heat-body">
            <div class="heat-weekdays" aria-hidden="true">
              <span v-for="(wd, row) in weekdayLabels" :key="'wd' + row">{{ wd }}</span>
            </div>
            <div class="heat-grid" role="group" :aria-label="gridSummary">
              <div v-for="(week, col) in grid.weeks" :key="col" class="heat-col">
                <div
                  v-for="cell in week"
                  :key="cell.dayKey"
                  class="heat-cell"
                  data-test="heat-cell"
                  :data-day="cell.dayKey"
                  :style="{
                    background: inspectable(cell) ? `var(--heat-${intensityBucket(cell.count)})` : 'transparent',
                    visibility: cell.inYear ? 'visible' : 'hidden',
                  }"
                  :role="inspectable(cell) ? 'img' : undefined"
                  :aria-label="inspectable(cell) ? cellLabel(cell) : undefined"
                  :aria-hidden="inspectable(cell) ? undefined : 'true'"
                  :tabindex="inspectable(cell) && cell.dayKey === focusedDay ? 0 : -1"
                  @mouseenter="showTip($event, cell.dayKey, cell.count, cell.inYear, cell.future)"
                  @focus="onCellFocus($event, cell)"
                  @keydown="moveCellFocus($event, cell.dayKey)"
                  @mouseleave="hideTip"
                  @blur="hideTip"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="tip"
        class="heat-tip"
        data-test="heat-tip"
        :style="{ left: tip.x + 'px', top: tip.y + 'px' }"
      >
        {{ fmtDate(tip.day) }} · {{ t('stats.activity.tooltip', { count: tip.count }) }}
      </div>
    </div>

    <div class="heat-bottom">
      <div class="heat-legend" data-test="heat-legend" aria-hidden="true">
        <span>{{ t('stats.activity.legend_less') }}</span>
        <i v-for="level in [0, 1, 2, 3, 4]" :key="level" :style="{ background: `var(--heat-${level})` }" />
        <span>{{ t('stats.activity.legend_more') }}</span>
      </div>
      <div class="heat-foot">
        <span>{{ t('stats.activity.avg') }} <b>{{ avg }}</b></span>
        <span>{{ t('stats.activity.days_active') }} <b>{{ active }}</b></span>
        <span data-test="heat-streak-longest">{{ t('stats.activity.streak_longest') }} <b>{{ streakLongest }}</b></span>
        <span data-test="heat-streak-current">{{ t('stats.activity.streak_current') }} <b>{{ streakCurrent }}</b></span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.heat-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--surface-elevated);
  border: 2px solid var(--border);
  border-left: 6px solid var(--sky);
  box-shadow: var(--bevel), var(--shadow-card);
}
.heat-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}
.heat-title {
  margin: 0;
  color: var(--text);
  font-family: var(--font-pixel-display);
  font-size: var(--text-md);
  line-height: 1.6;
}
.heat-sub {
  margin: var(--space-1) 0 0;
  color: var(--text-soft);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
}
.heat-nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
.heat-nav button {
  width: 44px;
  height: 44px;
  padding: 0;
  background: var(--surface);
  border: 2px solid var(--border-strong);
  color: var(--text);
  cursor: pointer;
  box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-display);
  font-size: 22px;
  line-height: 1;
  transition: transform var(--motion-quick) var(--ease-out), box-shadow var(--motion-quick) var(--ease-out);
}
.heat-nav button:hover:not(:disabled) {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.heat-nav button:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-button-pressed);
}
.heat-nav button:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.heat-nav button:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
.heat-year {
  min-width: 58px;
  color: var(--text);
  text-align: center;
  font-family: var(--font-pixel-small);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}
.heat-visual { position: relative; min-width: 0; }
.heat-scroll {
  overflow-x: auto;
  padding: 4px 2px var(--space-2);
  scrollbar-color: var(--border-strong) var(--surface-muted);
  scrollbar-width: thin;
}
.heat-canvas { width: max-content; min-width: 100%; }
.heat-months { display: flex; margin-left: 42px; height: 18px; }
.heat-month {
  width: 14px;
  flex: 0 0 14px;
  color: var(--text-soft);
  font-family: var(--font-pixel-small);
  font-size: 8px;
  line-height: 1;
  white-space: nowrap;
}
.heat-body { display: flex; }
.heat-weekdays { display: flex; flex-direction: column; width: 42px; flex: 0 0 42px; }
.heat-weekdays span {
  height: 14px;
  color: var(--text-soft);
  font-family: var(--font-pixel-small);
  font-size: 7px;
  line-height: 12px;
}
.heat-grid { display: flex; gap: 2px; }
.heat-col { display: flex; flex-direction: column; gap: 2px; }
.heat-cell {
  width: 12px;
  height: 12px;
  border: 1px solid color-mix(in srgb, var(--border) 45%, transparent);
  outline: none;
}
.heat-cell:hover,
.heat-cell:focus-visible {
  border-color: var(--border-strong);
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
  z-index: 1;
}
.heat-tip {
  position: absolute;
  transform: translate(-50%, -100%);
  max-width: calc(100% - 12px);
  padding: 7px 9px;
  background: var(--text);
  border: 2px solid var(--border-strong);
  color: var(--surface);
  box-shadow: var(--shadow-pixel-sm);
  font-family: var(--font-pixel-small);
  font-size: 9px;
  line-height: 1.5;
  white-space: nowrap;
  pointer-events: none;
  z-index: 5;
}
.heat-bottom { display: flex; flex-direction: column; gap: var(--space-3); }
.heat-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  color: var(--text-soft);
  font-family: var(--font-pixel-small);
  font-size: 8px;
}
.heat-legend i { width: 12px; height: 12px; border: 1px solid var(--border); }
.heat-foot {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
  color: var(--text-soft);
  font-family: var(--font-pixel-small);
  font-size: 9px;
  line-height: 1.7;
}
.heat-foot b { color: var(--text); font-variant-numeric: tabular-nums; }

@media (max-width: 600px) {
  .heat-block { padding: var(--space-4); }
  .heat-head { align-items: stretch; flex-direction: column; }
  .heat-nav { justify-content: space-between; }
  .heat-year { flex: 1; }
  .heat-legend { justify-content: flex-start; }
  .heat-foot { display: grid; grid-template-columns: 1fr 1fr; column-gap: var(--space-3); }
}

@media (prefers-reduced-motion: reduce) {
  .heat-nav button { transition: none; }
}
</style>
