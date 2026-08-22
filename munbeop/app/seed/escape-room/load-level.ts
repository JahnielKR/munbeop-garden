import type { Level } from '~/lib/domain'

type LevelLoader = () => Promise<Level>

/**
 * Keep gameplay level data out of the route shell. Each story becomes its own
 * async boundary and only the selected level is evaluated.
 */
const LEVEL_LOADERS: Readonly<Record<string, LevelLoader>> = {
  'level-01': () => import('./level-01').then((module) => module.LEVEL_01),
  'level-02': () => import('./level-02').then((module) => module.LEVEL_02),
  'level-03': () => import('./level-03').then((module) => module.LEVEL_03),
  'level-04': () => import('./level-04').then((module) => module.LEVEL_04),
  'level-05': () => import('./level-05').then((module) => module.LEVEL_05),
  'level-06': () => import('./level-06').then((module) => module.LEVEL_06),
  'level-07': () => import('./level-07').then((module) => module.LEVEL_07),
  'level-08': () => import('./level-08').then((module) => module.LEVEL_08),
  'level-09': () => import('./level-09').then((module) => module.LEVEL_09),
  'level-10': () => import('./level-10').then((module) => module.LEVEL_10),
}

export async function loadPlayableLevel(id: string): Promise<Level | null> {
  const loader = LEVEL_LOADERS[id]
  return loader ? loader() : null
}
