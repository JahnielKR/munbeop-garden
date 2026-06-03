import type { LogEntry, MasteryLevel, SrsState } from '~/lib/domain'
import {
  PROMOTE_TO_PLANT_EASY_RATIO,
  PROMOTE_TO_PLANT_MIN_TOTAL,
  PROMOTE_TO_TREE_EASY_RATIO,
  PROMOTE_TO_TREE_MIN_TOTAL,
} from './thresholds'

export function freshSrs(): SrsState {
  return {
    lastSeen: null,
    easyCount: 0,
    hardCount: 0,
    mastery: 'seedling',
  }
}

/**
 * Recompute counts and mastery from the log for a given grammar.
 * Entries flagged 'incorrect' during review do NOT count toward promotion.
 * Mirrors legacy recalculateMastery() at index.html:3121.
 */
export function recalculateMastery(ko: string, log: readonly LogEntry[]): SrsState {
  const entries = log.filter((e) => e.ko === ko)
  let easyCount = 0
  let hardCount = 0
  let lastSeen: number | null = null

  for (const e of entries) {
    if (e.reviewState === 'incorrect') continue
    if (e.feedback === 'easy') easyCount++
    else hardCount++
    const ts = new Date(e.date).getTime()
    if (lastSeen === null || ts > lastSeen) lastSeen = ts
  }

  const total = easyCount + hardCount
  let mastery: MasteryLevel = 'seedling'
  if (total >= PROMOTE_TO_TREE_MIN_TOTAL && easyCount >= hardCount * PROMOTE_TO_TREE_EASY_RATIO) {
    mastery = 'tree'
  } else if (
    total >= PROMOTE_TO_PLANT_MIN_TOTAL &&
    easyCount >= hardCount * PROMOTE_TO_PLANT_EASY_RATIO
  ) {
    mastery = 'plant'
  }

  return { lastSeen, easyCount, hardCount, mastery }
}

export interface MasteryInfo {
  /** i18n key for the localized label (resolved by useI18n() in UI). */
  labelKey: string
  cls: string
}

const MASTERY_INFO: Record<MasteryLevel, MasteryInfo> = {
  seedling: { labelKey: 'mastery.seedling', cls: 'mastery-seedling' },
  plant: { labelKey: 'mastery.plant', cls: 'mastery-plant' },
  tree: { labelKey: 'mastery.tree', cls: 'mastery-tree' },
}

export function getMasteryInfo(level: MasteryLevel): MasteryInfo {
  return MASTERY_INFO[level]
}
