import { defineStore } from 'pinia'

export type DataStatus = 'idle' | 'loading' | 'ready' | 'error'

/**
 * App-wide status of the user's data load. The adapter throws on a Supabase
 * error now (see lib/storage/supabase.ts), so the hydration paths route their
 * run through track() here: a failure becomes a visible 'error' the shell can
 * surface with a retry, instead of a silent empty state. retry() re-runs the
 * most recent tracked hydration.
 */
export const useAppStatus = defineStore('appStatus', () => {
  const status = ref<DataStatus>('idle')
  let lastRun: (() => Promise<unknown>) | null = null
  let generation = 0

  /**
   * Close the account-data gate synchronously when Auth publishes a different
   * identity. Supabase asks auth callbacks to return without awaiting client
   * I/O, so the real hydration starts on the next task; without this boundary
   * the shell could paint the new email beside the previous account's data for
   * one frame. Advancing the generation also prevents an older hydration from
   * reopening the gate after the identity changed.
   */
  function beginAccountTransition() {
    generation++
    lastRun = null
    status.value = 'loading'
  }

  async function track(run: () => Promise<unknown>) {
    const runGeneration = ++generation
    lastRun = run
    status.value = 'loading'
    try {
      await run()
      if (runGeneration === generation) status.value = 'ready'
    } catch (err) {
      // A newer hydration owns the shell state. An older response must never
      // publish ready/error while the latest account load is still in flight.
      if (runGeneration === generation) {
        console.error('appStatus: data hydration failed', err)
        status.value = 'error'
      }
    }
  }

  async function retry() {
    if (lastRun) await track(lastRun)
  }

  return { status, beginAccountTransition, track, retry }
})
