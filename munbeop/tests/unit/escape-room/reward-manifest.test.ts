import { describe, expect, it } from 'vitest'
import { REWARD_TIERS } from '~/lib/domain'
import { ESCAPE_REWARD_MANIFEST } from '~/lib/escape-room/reward-manifest'
import { LEVEL_REGISTRY } from '~/seed/escape-room/registry'

describe('escape reward manifest', () => {
  it('matches every authored playable reward without loading stories in app chrome', () => {
    const authored = LEVEL_REGISTRY.flatMap((entry) =>
      entry.level
        ? REWARD_TIERS.map((tier) => ({
            levelId: entry.id,
            tier,
            id: entry.level!.rewards[tier].id,
            image: entry.level!.rewards[tier].image,
          }))
        : [],
    )

    expect(ESCAPE_REWARD_MANIFEST).toEqual(authored)
  })

  it('keeps reward ids unique so equipped layers resolve deterministically', () => {
    const ids = ESCAPE_REWARD_MANIFEST.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
