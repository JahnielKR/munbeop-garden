// app/composables/useLabMastery.ts
import { computed, ref } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import type { ClearedLabId } from '~/lib/practice/lab-mastery'
import type { PracticeSaveStatus } from '~/lib/practice/persistence'

interface MasteryView {
  earned: boolean
}

const CLEAR_THRESHOLD = 0.7

interface PendingMasterySave {
  item: string
  alsoEarn: boolean
}

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
  const saveStatus = ref<PracticeSaveStatus>('idle')
  const celebrate = ref(false)
  let pendingSave: PendingMasterySave | null = null
  let saveInFlight: Promise<boolean> | null = null

  // Settings updates optimistically so the queued snapshot can include the new
  // clear. Keep that unconfirmed item out of the mastery UI until the write has
  // actually resolved; on failure the settings store also rolls its field back.
  const cleared = computed(() => {
    const result = new Set(settings.labCleared[lab])
    if (pendingSave && saveStatus.value !== 'saved') result.delete(pendingSave.item)
    return result
  })
  const view = computed(() => masteryOf(cleared.value))
  // Earned = currently-earned (derived) OR ever-earned (sticky synced flag).
  // recordLabClear flips the sticky flag optimistically too, so mask that edge
  // while its save is pending for the same reason as the clear above.
  const earned = computed(() => {
    const pendingEarn = !!pendingSave?.alsoEarn && saveStatus.value !== 'saved'
    return view.value.earned || (settings.labEarned[lab] && !pendingEarn)
  })
  const saving = computed(() => saveStatus.value === 'saving')
  const saveError = computed(() => saveStatus.value === 'error')
  const locked = computed(() => saving.value || saveError.value)

  /** Clear one item when the round was good enough; celebrate once on the edge.
   *  The clear and the sticky-earned flip go through a single settings write
   *  (recordLabClear's alsoEarn) so the two never race as separate blob upserts. */
  async function record(item: string, accuracy: number): Promise<boolean> {
    if (saveInFlight) return saveInFlight
    if (pendingSave) return false
    if (accuracy < CLEAR_THRESHOLD || cleared.value.has(item)) return true
    // Compute the post-clear earned-ness explicitly (recordLabClear is async;
    // this doesn't depend on when the reactive computed re-runs).
    const clearedAfter = new Set(cleared.value).add(item)
    const willEarn = !settings.labEarned[lab] && masteryOf(clearedAfter).earned
    pendingSave = { item, alsoEarn: willEarn }
    return persistPending()
  }

  function persistPending(): Promise<boolean> {
    if (saveInFlight) return saveInFlight
    const task = pendingSave
    if (!task) return Promise.resolve(true)

    saveStatus.value = 'saving'
    const operation = (async () => {
      try {
        // The settings store serializes blob snapshots and rejects after a
        // conditional rollback when the cloud write fails.
        await settings.recordLabClear(lab, task.item, task.alsoEarn)
        if (pendingSave === task) pendingSave = null
        saveStatus.value = 'saved'
        // Never celebrate an optimistic edge: only a confirmed write earns it.
        if (task.alsoEarn) celebrate.value = true
        return true
      } catch (error) {
        console.error(`${lab}: mastery failed to save`, error)
        saveStatus.value = 'error'
        return false
      }
    })()
    saveInFlight = operation
    void operation.then(() => {
      if (saveInFlight === operation) saveInFlight = null
    })
    return operation
  }

  function retrySave(): Promise<boolean> {
    if (saveStatus.value !== 'error') return Promise.resolve(!pendingSave)
    return persistPending()
  }

  /** Clear a completed save banner before a new run. Error/saving states stay
   *  locked so a pending cloud write cannot be discarded by restarting. */
  function resetSaveStatus(): boolean {
    if (locked.value) return false
    saveStatus.value = 'idle'
    pendingSave = null
    return true
  }

  function dismiss(): void {
    celebrate.value = false
  }

  return {
    cleared,
    view,
    earned,
    celebrate,
    saveStatus,
    saving,
    saveError,
    locked,
    record,
    retrySave,
    resetSaveStatus,
    dismiss,
  }
}
