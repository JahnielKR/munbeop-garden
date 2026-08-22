import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { REWARD_TIERS } from '~/lib/domain'
import { ESCAPE_REWARD_MANIFEST } from '~/lib/escape-room/reward-manifest'
import { loadAllPlayableLevels } from '~/seed/escape-room/load-level'

describe('escape reward manifest', () => {
  it('matches every authored playable reward without loading stories in app chrome', async () => {
    const levels = await loadAllPlayableLevels()
    const authored = levels.flatMap((level) =>
      REWARD_TIERS.map((tier) => ({
        levelId: level.id,
        tier,
        id: level.rewards[tier].id,
        image: level.rewards[tier].image,
      })),
    )

    expect(ESCAPE_REWARD_MANIFEST).toEqual(authored)
  })

  it('keeps reward ids unique so equipped layers resolve deterministically', () => {
    const ids = ESCAPE_REWARD_MANIFEST.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps the global premio summary independent from catalog and story chunks', () => {
    const sources = [
      'app/lib/escape-room/reward-manifest.ts',
      'app/composables/usePremioSummary.ts',
    ].map((file) => readFileSync(resolve(process.cwd(), file), 'utf8'))

    for (const source of sources) {
      expect(source).not.toMatch(/seed\/escape-room\/(?:catalog|registry|level-\d{2})/)
    }
  })
})
