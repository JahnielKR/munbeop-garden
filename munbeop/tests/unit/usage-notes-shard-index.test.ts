import { describe, expect, it } from 'vitest'
import type { LocalizedString } from '~/lib/domain'
import { USAGE_NOTES_SHARD_BY_LEVEL } from '~/lib/usage-notes/shard-index'
import { TOPIK_2_GRAMMAR } from '~/seed/grammars-n2'
import { TOPIK_3_GRAMMAR } from '~/seed/grammars-n3'
import { TOPIK_4_GRAMMAR } from '~/seed/grammars-n4'
import { TOPIK_5_GRAMMAR } from '~/seed/grammars-n5'
import { TOPIK_6_GRAMMAR } from '~/seed/grammars-n6'
import { TOPIK_2_USAGE_NOTES } from '~/seed/usage-notes/n2'
import { TOPIK_3_USAGE_NOTES } from '~/seed/usage-notes/n3'
import { TOPIK_4_USAGE_NOTES } from '~/seed/usage-notes/n4'
import { TOPIK_5_USAGE_NOTES } from '~/seed/usage-notes/n5'
import { TOPIK_6_USAGE_NOTES } from '~/seed/usage-notes/n6'

const levels = [
  [2, TOPIK_2_GRAMMAR, TOPIK_2_USAGE_NOTES],
  [3, TOPIK_3_GRAMMAR, TOPIK_3_USAGE_NOTES],
  [4, TOPIK_4_GRAMMAR, TOPIK_4_USAGE_NOTES],
  [5, TOPIK_5_GRAMMAR, TOPIK_5_USAGE_NOTES],
  [6, TOPIK_6_GRAMMAR, TOPIK_6_USAGE_NOTES],
] as const satisfies ReadonlyArray<
  readonly [
    2 | 3 | 4 | 5 | 6,
    ReadonlyArray<{ ko: string }>,
    Readonly<Record<string, LocalizedString>>,
  ]
>

describe('usage-note shard index', () => {
  for (const [level, grammars, notes] of levels) {
    it(`covers every TOPIK ${level} grammar exactly once`, () => {
      const grammarKeys = grammars.map(({ ko }) => ko).sort()
      const noteKeys = Object.keys(notes).sort()
      const indexEntries = Object.entries(USAGE_NOTES_SHARD_BY_LEVEL[level])

      expect(noteKeys).toEqual(grammarKeys)
      expect(indexEntries.map(([ko]) => ko).sort()).toEqual(grammarKeys)
      expect(indexEntries.every(([, shardId]) => shardId.startsWith(`n${level}-`))).toBe(true)
    })
  }
})
