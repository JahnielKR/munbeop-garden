import { computed } from 'vue'
import { isPendingReview } from '~/lib/domain'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useGrammarStore } from '~/stores/grammar'
import { currentStreak, STREAK_GRACE_DAYS } from '~/lib/stats/streak'
import { localDayKey } from '~/lib/stats/activity'
import { weeklyCounts, easyHardSplit } from '~/lib/stats/rhythm'
import { masteryByLevel, toughestGrammar } from '~/lib/stats/mastery'

/**
 * useStats — the reactive source for the /stats page. Everything is derived
 * from the log / srs / grammar stores via the pure helpers in lib/stats; the
 * page itself only renders. `now` is injected (defaulting to Date.now()) so the
 * streak/rhythm windows are deterministic in tests — same pattern as the srs
 * store's markSeen and the escape-room state machine.
 */
export function useStats(now: number = Date.now()) {
  const log = useLogStore()
  const srs = useSrsStore()
  const grammar = useGrammarStore()

  const dateMs = computed(() => log.entries.map((e) => new Date(e.date).getTime()))

  const sentences = computed(() => log.entries.length)
  const todayKey = localDayKey(now)
  const dayKeys = computed(() => new Set(dateMs.value.map(localDayKey)))
  const streak = computed(() => currentStreak(dayKeys.value, todayKey, STREAK_GRACE_DAYS))
  const masteredCount = computed(
    () => Object.values(srs.map).filter((s) => s.mastery === 'tree').length,
  )
  const catalogTotal = computed(() => grammar.items.length)
  const pendingReviews = computed(() => log.entries.filter(isPendingReview).length)

  const masteryLevels = computed(() => masteryByLevel(grammar.items, srs.map))
  const weekly = computed(() => weeklyCounts(dateMs.value, now, 8))
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

  const hasData = computed(() => sentences.value > 0 || Object.keys(srs.map).length > 0)

  return {
    sentences,
    streak,
    masteredCount,
    catalogTotal,
    pendingReviews,
    masteryLevels,
    weekly,
    split,
    toughest,
    topContexts,
    hasData,
  }
}
