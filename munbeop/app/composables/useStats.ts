import { computed, ref } from 'vue'
import { useNow } from '@vueuse/core'
import { isPendingReview } from '~/lib/domain'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useGrammarStore } from '~/stores/grammar'
import { useActivityStore } from '~/stores/activity'
import { useSettingsStore } from '~/stores/settings'
import {
  currentStreak,
  longestStreak as longestStreakOf,
  STREAK_GRACE_DAYS,
} from '~/lib/stats/streak'
import { boundedActivityCounts, mergedDailyCounts, localDayKey } from '~/lib/stats/activity'
import { weeklyCounts, easyHardSplit } from '~/lib/stats/rhythm'
import { masteryByLevel, toughestGrammar } from '~/lib/stats/mastery'
import { periodInsights as calculatePeriodInsights, type StatsPeriod } from '~/lib/stats/period'

/**
 * useStats — the reactive source for the /stats page. Everything is derived
 * from the log / srs / grammar / activity stores via the pure helpers in lib/stats;
 * the page itself only renders. `now` is injected (defaulting to Date.now()) so the
 * streak/rhythm windows are deterministic in tests — same pattern as the srs
 * store's markSeen and the escape-room state machine.
 */
export function useStats(now?: number) {
  const log = useLogStore()
  const srs = useSrsStore()
  const grammar = useGrammarStore()
  const activity = useActivityStore()
  const settings = useSettingsStore()

  const liveNow = now === undefined ? useNow({ interval: 60_000 }) : null
  const nowMs = computed(() => now ?? liveNow!.value.getTime())
  const todayKey = computed(() => localDayKey(nowMs.value))

  const logDays = computed(() =>
    log.entries.map((entry) => entry.localDay ?? localDayKey(new Date(entry.date).getTime())),
  )

  const sentences = computed(() => log.entries.length)

  const dailyCounts = computed(() =>
    boundedActivityCounts(mergedDailyCounts(logDays.value, activity.map), todayKey.value),
  )
  const activityCounts = computed(() => Object.fromEntries(dailyCounts.value.entries()))
  const dayKeys = computed(() => new Set(dailyCounts.value.keys()))
  const insightPeriod = ref<StatsPeriod>(7)
  const periodInsights = computed(() =>
    calculatePeriodInsights(
      dailyCounts.value,
      todayKey.value,
      settings.dailyGoal,
      insightPeriod.value,
    ),
  )

  const streak = computed(() => currentStreak(dayKeys.value, todayKey.value, STREAK_GRACE_DAYS))
  const longestStreak = computed(() => longestStreakOf(dayKeys.value, STREAK_GRACE_DAYS))

  const masteredCount = computed(
    () => grammar.catalogItems.filter((g) => srs.map[g.ko]?.mastery === 'tree').length,
  )
  const catalogTotal = computed(() => grammar.catalogItems.length)
  const pendingReviews = computed(() => log.entries.filter(isPendingReview).length)

  const masteryLevels = computed(() => masteryByLevel(grammar.items, srs.map))
  const weekly = computed(() => weeklyCounts(logDays.value, nowMs.value, 8))
  const split = computed(() => easyHardSplit(log.entries))
  const toughest = computed(() => toughestGrammar(srs.map, grammar.items, 5))

  const topContexts = computed(() => {
    const counts = new Map<string, number>()
    for (const e of log.entries) counts.set(e.contextName, (counts.get(e.contextName) ?? 0) + 1)
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }))
  })

  const hasData = computed(
    () =>
      sentences.value > 0 ||
      grammar.items.some((g) => srs.map[g.ko] !== undefined) ||
      dayKeys.value.size > 0,
  )

  return {
    sentences,
    streak,
    longestStreak,
    masteredCount,
    catalogTotal,
    pendingReviews,
    masteryLevels,
    weekly,
    split,
    toughest,
    topContexts,
    hasData,
    activityCounts,
    dailyCounts,
    insightPeriod,
    periodInsights,
  }
}
