import { computed } from 'vue'
import { TOPIK_LEVELS } from '~/lib/domain'
import { useStats } from '~/composables/useStats'
import { useLeeches } from '~/composables/useLeeches'
import { useSrsStore } from '~/stores/srs'
import { useGrammarStore } from '~/stores/grammar'
import { globalAchievementsFor, type DeckMastery } from '~/lib/achievements/global'

/**
 * useGlobalAchievements — the reactive trophy set for the /stats Achievements
 * section. Layers on useStats (totals, streak, mastered count) + useLeeches and
 * the grammar/srs stores, then hands a plain GlobalState to the pure derive.
 * `now` is injected (default Date.now()) so the streak window is deterministic
 * in tests, mirroring useStats.
 */
export function useGlobalAchievements(now: number = Date.now()) {
  const { sentences, streak, masteredCount, catalogTotal } = useStats(now)
  const { leeches } = useLeeches()
  const srs = useSrsStore()
  const grammar = useGrammarStore()

  const byLevel = computed<Record<number, DeckMastery>>(() => {
    const out: Record<number, DeckMastery> = {}
    for (const lvl of TOPIK_LEVELS) out[lvl] = { mastered: 0, total: 0 }
    for (const g of grammar.items) {
      const m = /^topik-(\d+)$/.exec(g.deckId)
      const bucket = m ? out[Number(m[1])] : undefined
      if (!bucket) continue
      bucket.total++
      if (srs.map[g.ko]?.mastery === 'tree') bucket.mastered++
    }
    return out
  })

  const achievements = computed(() =>
    globalAchievementsFor({
      reviews: sentences.value,
      trees: masteredCount.value,
      catalogTotal: catalogTotal.value,
      byLevel: byLevel.value,
      streak: streak.value,
      leeches: leeches.value.length,
    }),
  )

  return { achievements }
}
