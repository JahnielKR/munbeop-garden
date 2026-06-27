// munbeop/app/lib/avatars/evaluate.ts
import { AVATARS, LAB_IDS, type AvatarDef, type LabId, type UnlockRule } from './catalog'

/** A plain snapshot of the user's progress. Assembled in useAvatars(). */
export interface AvatarState {
  trees: number
  catalogTotal: number
  reviews: number
  longestStreak: number
  /** mastered/total per TOPIK level (1..6). */
  byLevel: Record<number, { mastered: number; total: number }>
  labsEarned: Record<LabId, boolean>
  escapeUnlocked: number
  escapeTotal: number
  leeches: number
}

export interface AvatarProgress {
  current: number
  target: number
}

export interface DecoratedAvatar extends AvatarDef {
  unlocked: boolean
  progress: AvatarProgress
}

type NonCollect = Exclude<UnlockRule, { kind: 'collectAll' }>

function topik(rule: { levels: number[] }, s: AvatarState): AvatarProgress {
  let mastered = 0
  let total = 0
  for (const lv of rule.levels) {
    const d = s.byLevel[lv]
    if (d) {
      mastered += d.mastered
      total += d.total
    }
  }
  return { current: mastered, target: total > 0 ? total : Infinity }
}

function ruleProgress(rule: NonCollect, s: AvatarState): AvatarProgress {
  switch (rule.kind) {
    case 'always':
      return { current: 1, target: 1 }
    case 'trees':
      return { current: Math.min(s.trees, rule.n), target: rule.n }
    case 'masteredPct': {
      const target = s.catalogTotal > 0 ? Math.ceil((s.catalogTotal * rule.pct) / 100) : Infinity
      return { current: Math.min(s.trees, target), target }
    }
    case 'gardenComplete': {
      const target = s.catalogTotal > 0 ? s.catalogTotal : Infinity
      return { current: Math.min(s.trees, target), target }
    }
    case 'reviews':
      return { current: Math.min(s.reviews, rule.n), target: rule.n }
    case 'longestStreak':
      return { current: Math.min(s.longestStreak, rule.n), target: rule.n }
    case 'topikComplete':
      return topik(rule, s)
    case 'labEarned':
      return { current: s.labsEarned[rule.lab] ? 1 : 0, target: 1 }
    case 'allLabs':
      return { current: LAB_IDS.filter((l) => s.labsEarned[l]).length, target: LAB_IDS.length }
    case 'escapeCosmetics': {
      const target = rule.n === 'all' ? (s.escapeTotal > 0 ? s.escapeTotal : Infinity) : rule.n
      return { current: Math.min(s.escapeUnlocked, target), target }
    }
    case 'flourish':
      return { current: Math.min(s.trees, rule.trees), target: rule.trees }
  }
}

function ruleMet(rule: NonCollect, s: AvatarState): boolean {
  if (rule.kind === 'flourish') return s.trees >= rule.trees && s.leeches === 0
  if (rule.kind === 'topikComplete') {
    return rule.levels.every((lv) => {
      const d = s.byLevel[lv]
      return !!d && d.total > 0 && d.mastered >= d.total
    })
  }
  const p = ruleProgress(rule, s)
  return p.target !== Infinity && p.current >= p.target
}

/**
 * Decorate every avatar with its unlock + progress state. An avatar is unlocked
 * iff its rule is `always`, OR it is in `storedUnlocked` (sticky ownership), OR
 * its live rule is met. `collectAll` is resolved last (it depends on the other
 * 35). Output order matches the catalog.
 */
export function evaluateAvatars(
  state: AvatarState,
  storedUnlocked: ReadonlySet<string>,
): DecoratedAvatar[] {
  const base = AVATARS.filter((a) => a.rule.kind !== 'collectAll').map((a) => {
    const rule = a.rule as NonCollect
    const unlocked = rule.kind === 'always' || storedUnlocked.has(a.id) || ruleMet(rule, state)
    return { ...a, unlocked, progress: ruleProgress(rule, state) }
  })
  const ownedCount = base.filter((b) => b.unlocked).length
  const target = base.length
  const collect = AVATARS.filter((a) => a.rule.kind === 'collectAll').map((a) => ({
    ...a,
    unlocked: storedUnlocked.has(a.id) || ownedCount >= target,
    progress: { current: ownedCount, target },
  }))
  const byId = new Map<string, DecoratedAvatar>([...base, ...collect].map((d) => [d.id, d]))
  return AVATARS.map((a) => byId.get(a.id)!)
}
