import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { LEVEL_REGISTRY } from '~/seed/escape-room/registry'
import {
  loadAllPlayableLevels,
  loadPlayableLevel,
  PLAYABLE_LEVEL_IDS,
} from '~/seed/escape-room/load-level'
import { validateLevel } from '~/lib/escape-room/rules'

describe('LEVEL_REGISTRY', () => {
  it('has 10 entries numbered 1..10 in order', () => {
    expect(LEVEL_REGISTRY).toHaveLength(10)
    expect(LEVEL_REGISTRY.map((e) => e.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('has unique ids and covers', () => {
    const ids = LEVEL_REGISTRY.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    const covers = LEVEL_REGISTRY.map((e) => e.cover)
    expect(new Set(covers).size).toBe(covers.length)
  })

  it('every entry carries a non-trivial tagline (the hook)', () => {
    for (const e of LEVEL_REGISTRY) {
      expect(e.tagline.es.length).toBeGreaterThan(40)
    }
  })

  it('keeps full stories behind async level loaders', async () => {
    const playable = LEVEL_REGISTRY.filter((e) => e.status === 'playable')
    expect(playable).toHaveLength(10)
    const levels = await loadAllPlayableLevels()
    for (const level of levels) {
      expect(validateLevel(level)).toEqual([])
      const entry = LEVEL_REGISTRY.find((candidate) => candidate.id === level.id)
      expect(entry).toMatchObject({
        title: level.title,
        tagline: level.tagline,
        topikLevel: level.topikLevel,
        maxErrors: level.rules.maxErrors,
        rewards: level.rewards,
      })
    }
  })

  it('topik level is monotonically non-decreasing through the notebook', () => {
    const seq = LEVEL_REGISTRY.map((e) => e.topikLevel)
    for (let i = 1; i < seq.length; i++) {
      expect(seq[i]!).toBeGreaterThanOrEqual(seq[i - 1]!)
    }
  })

  it('loadPlayableLevel resolves all ten levels and rejects unknown ids', async () => {
    expect(PLAYABLE_LEVEL_IDS).toEqual(LEVEL_REGISTRY.map((entry) => entry.id))
    for (const id of PLAYABLE_LEVEL_IDS) {
      expect((await loadPlayableLevel(id))?.id).toBe(id)
    }
    expect(await loadPlayableLevel('nope')).toBeNull()
  })

  it('has no static dependency on full levels or narrative translations', () => {
    const files = [
      'app/seed/escape-room/catalog.ts',
      'app/seed/escape-room/registry.ts',
      'app/pages/escape-room/index.vue',
      'app/composables/usePremios.ts',
    ]
    for (const file of files) {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8')
      expect(source, file).not.toMatch(/(?:from|import\()\s*['"].*level-\d{2}/)
      expect(source, file).not.toContain('/translations')
    }
  })
})
