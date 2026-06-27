// munbeop/app/lib/avatars/catalog.ts

/**
 * Garden avatar collection — a profile-picture gallery split into rarity tiers.
 * Pure & declarative (no Vue/store imports) so it is trivially unit-testable,
 * mirroring app/lib/achievements/global.ts. Unlock state is decided by
 * app/lib/avatars/evaluate.ts from a plain aggregate snapshot; this module only
 * defines WHAT exists and WHAT each one needs.
 */

export const AVATAR_TIERS = ['common', 'rare', 'epic', 'legendary'] as const
export type AvatarTier = (typeof AVATAR_TIERS)[number]

export const LAB_IDS = ['conjugation', 'counter', 'number', 'particle', 'register'] as const
export type LabId = (typeof LAB_IDS)[number]

/** Declarative unlock condition. Every kind is evaluated in evaluate.ts. */
export type UnlockRule =
  | { kind: 'always' }
  | { kind: 'trees'; n: number }
  | { kind: 'masteredPct'; pct: number }
  | { kind: 'gardenComplete' }
  | { kind: 'reviews'; n: number }
  | { kind: 'longestStreak'; n: number }
  | { kind: 'topikComplete'; levels: number[] }
  | { kind: 'labEarned'; lab: LabId }
  | { kind: 'allLabs' }
  | { kind: 'escapeCosmetics'; n: number | 'all' }
  | { kind: 'flourish'; trees: number }
  | { kind: 'collectAll' }

export interface AvatarDef {
  id: string
  tier: AvatarTier
  /** Bilingual display name (Korean + English), rendered in every UI locale. */
  name: { ko: string; en: string }
  rule: UnlockRule
}

const C = (id: string, ko: string, en: string): AvatarDef => ({
  id,
  tier: 'common',
  name: { ko, en },
  rule: { kind: 'always' },
})
const A = (id: string, tier: AvatarTier, ko: string, en: string, rule: UnlockRule): AvatarDef => ({
  id,
  tier,
  name: { ko, en },
  rule,
})

export const AVATARS: readonly AvatarDef[] = [
  // ── Common (12) — free from day 1 ──────────────────────────────────────────
  C('seed', '씨앗', 'Seed'),
  C('sprout', '새싹', 'Sprout'),
  C('leaf', '잎새', 'Leaf'),
  C('pebble', '조약돌', 'Pebble'),
  C('dewdrop', '물방울', 'Dewdrop'),
  C('watering-can', '물뿌리개', 'Watering Can'),
  C('pot', '화분', 'Clay Pot'),
  C('clover', '클로버', 'Clover'),
  C('dandelion', '민들레', 'Dandelion'),
  C('mushroom', '버섯', 'Mushroom'),
  C('earthworm', '지렁이', 'Earthworm'),
  C('ant', '개미', 'Ant'),
  // ── Rare (8) — early milestones ────────────────────────────────────────────
  A('bee', 'rare', '꿀벌', 'Bee', { kind: 'trees', n: 1 }),
  A('sprout-cluster', 'rare', '정원 새싹', 'Sprouting Bed', { kind: 'trees', n: 10 }),
  A('ladybug', 'rare', '무당벌레', 'Ladybug', { kind: 'longestStreak', n: 7 }),
  A('butterfly', 'rare', '나비', 'Butterfly', { kind: 'reviews', n: 100 }),
  A('tulip', 'rare', '튤립', 'Tulip', { kind: 'topikComplete', levels: [1] }),
  A('frog', 'rare', '개구리', 'Frog', { kind: 'labEarned', lab: 'conjugation' }),
  A('sunflower', 'rare', '해바라기', 'Sunflower', { kind: 'labEarned', lab: 'counter' }),
  A('carrot', 'rare', '당근', 'Carrot', { kind: 'labEarned', lab: 'number' }),
  // ── Epic (8) — mid/late milestones ─────────────────────────────────────────
  A('fox', 'epic', '여우', 'Fox', { kind: 'trees', n: 50 }),
  A('owl', 'epic', '올빼미', 'Owl', { kind: 'masteredPct', pct: 50 }),
  A('hedgehog', 'epic', '고슴도치', 'Hedgehog', { kind: 'longestStreak', n: 30 }),
  A('koi', 'epic', '잉어', 'Koi', { kind: 'reviews', n: 500 }),
  A('magpie', 'epic', '까치', 'Magpie', { kind: 'topikComplete', levels: [3] }),
  A('crane', 'epic', '학', 'Crane', { kind: 'labEarned', lab: 'particle' }),
  A('raccoon-dog', 'epic', '너구리', 'Raccoon Dog', { kind: 'labEarned', lab: 'register' }),
  A('persimmon', 'epic', '감나무', 'Persimmon Tree', { kind: 'escapeCosmetics', n: 4 }),
  // ── Legendary (8) — prestige / mythic ──────────────────────────────────────
  A('tiger', 'legendary', '호랑이', 'Tiger', { kind: 'gardenComplete' }),
  A('phoenix', 'legendary', '봉황', 'Phoenix', { kind: 'longestStreak', n: 100 }),
  A('dragon', 'legendary', '용', 'Dragon', { kind: 'reviews', n: 1000 }),
  A('dokkaebi', 'legendary', '도깨비', 'Dokkaebi', { kind: 'allLabs' }),
  A('golden-toad', 'legendary', '두꺼비', 'Golden Toad', { kind: 'escapeCosmetics', n: 'all' }),
  A('golden-crane', 'legendary', '금학', 'Golden Crane', { kind: 'topikComplete', levels: [5, 6] }),
  A('white-tiger', 'legendary', '백호', 'White Tiger', { kind: 'flourish', trees: 100 }),
  A('mountain-spirit', 'legendary', '산신령', 'Mountain Spirit', { kind: 'collectAll' }),
]

export function avatarUrl(id: string): string {
  return `/img/avatars/${id}.png`
}

export const LEGENDARY_FRAME_URL = '/img/avatars/_frame-legendary.png'

export interface RequirementLabel {
  key: string
  params: Record<string, string | number>
}

/**
 * Map an unlock rule to an i18n key + params for the locked-card hint.
 * Returns null for `always` (commons are never shown locked).
 */
export function requirementLabel(rule: UnlockRule): RequirementLabel | null {
  switch (rule.kind) {
    case 'always':
      return null
    case 'trees':
      return { key: 'settings.avatar.req.trees', params: { n: rule.n } }
    case 'masteredPct':
      return { key: 'settings.avatar.req.mastered_pct', params: { pct: rule.pct } }
    case 'gardenComplete':
      return { key: 'settings.avatar.req.garden_complete', params: {} }
    case 'reviews':
      return { key: 'settings.avatar.req.reviews', params: { n: rule.n } }
    case 'longestStreak':
      return { key: 'settings.avatar.req.streak', params: { n: rule.n } }
    case 'topikComplete':
      return { key: 'settings.avatar.req.topik', params: { levels: rule.levels.join(' & ') } }
    // Emits lab_conjugation | lab_counter | lab_number | lab_particle | lab_register
    case 'labEarned':
      return { key: `settings.avatar.req.lab_${rule.lab}`, params: {} }
    case 'allLabs':
      return { key: 'settings.avatar.req.all_labs', params: {} }
    case 'escapeCosmetics':
      return rule.n === 'all'
        ? { key: 'settings.avatar.req.escape_all', params: {} }
        : { key: 'settings.avatar.req.escape', params: { n: rule.n } }
    case 'flourish':
      // Param is `n` (not `trees`) to match the shared numeric `{n}` i18n template.
      return { key: 'settings.avatar.req.flourish', params: { n: rule.trees } }
    case 'collectAll':
      return { key: 'settings.avatar.req.collect_all', params: {} }
    default: {
      const _exhaustive: never = rule
      return _exhaustive
    }
  }
}
