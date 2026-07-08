// app/composables/useLabMastery.ts
import { computed, ref } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import type { ClearedLabId } from '~/lib/practice/lab-mastery'

interface MasteryView {
  earned: boolean
}

const CLEAR_THRESHOLD = 0.7

/**
 * Shared machinery for the four cleared-set drill labs (conjugation, counter,
 * register, number-market). Each was a byte-identical 50-line composable reading
 * global localStorage; they now read/write the account-synced settings blob
 * through this factory, so a shared device never leaks one user's badges into
 * another. Each lab keeps its own thin wrapper for its field names and
 * recordRound signature.
 */
export function useLabMastery<V extends MasteryView>(
  lab: ClearedLabId,
  masteryOf: (cleared: Set<string>) => V,
) {
  const settings = useSettingsStore()
  const cleared = computed(() => new Set(settings.labCleared[lab]))
  const view = computed(() => masteryOf(cleared.value))
  // Earned = currently-earned (derived) OR ever-earned (sticky synced flag).
  const earned = computed(() => view.value.earned || settings.labEarned[lab])
  const celebrate = ref(false)

  /** Clear one item when the round was good enough; celebrate once on the edge.
   *  The clear and the sticky-earned flip go through a single settings write
   *  (recordLabClear's alsoEarn) so the two never race as separate blob upserts. */
  function record(item: string, accuracy: number): void {
    if (accuracy < CLEAR_THRESHOLD) return
    if (cleared.value.has(item)) return
    // Compute the post-clear earned-ness explicitly (recordLabClear is async;
    // this doesn't depend on when the reactive computed re-runs).
    const clearedAfter = new Set(cleared.value).add(item)
    const willEarn = !settings.labEarned[lab] && masteryOf(clearedAfter).earned
    void settings.recordLabClear(lab, item, willEarn)
    if (willEarn) celebrate.value = true
  }

  function dismiss(): void {
    celebrate.value = false
  }

  return { cleared, view, earned, celebrate, record, dismiss }
}
