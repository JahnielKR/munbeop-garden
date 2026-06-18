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

  async function track(run: () => Promise<unknown>) {
    lastRun = run
    status.value = 'loading'
    try {
      await run()
      status.value = 'ready'
    } catch (err) {
      console.error('appStatus: data hydration failed', err)
      status.value = 'error'
    }
  }

  async function retry() {
    if (lastRun) await track(lastRun)
  }

  return { status, track, retry }
})
