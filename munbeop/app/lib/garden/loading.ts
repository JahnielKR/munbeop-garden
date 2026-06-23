import type { DataStatus } from '~/stores/appStatus'

export type HeroState = 'loading' | 'empty' | 'tree'

/** Which garden-hero branch to render. Skeleton until the data is ready. */
export function heroState(status: DataStatus, logEmpty: boolean): HeroState {
  if (status !== 'ready') return 'loading'
  return logEmpty ? 'empty' : 'tree'
}
