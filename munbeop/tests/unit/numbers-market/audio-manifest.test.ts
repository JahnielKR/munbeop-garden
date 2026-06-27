// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { MARKET_ITEMS } from '~/seed/numbers-market'
import { numberMarketAudioId } from '~/lib/numbers-market/audio'

interface Row { id: string; sentence: string; voice: string; rate: string; pitch: string }

const manifest: Row[] = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../../../../tools/number-market-audio/manifest.json', import.meta.url)),
    'utf8',
  ),
)
const audioDir = fileURLToPath(new URL('../../../public/number-market/audio/', import.meta.url))

describe('number-market audio manifest contract', () => {
  it('covers exactly the seed\'s unique answers', () => {
    const inManifest = manifest.map((r) => r.sentence).sort()
    const seedAnswers = [...new Set(MARKET_ITEMS.map((i) => i.answer))].sort()
    expect(inManifest).toEqual(seedAnswers)
  })
  it('every row id is the FNV-1a hash of its sentence (TS player parity)', () => {
    for (const r of manifest) expect(r.id, r.sentence).toBe(numberMarketAudioId(r.sentence))
  })
  it('ids are unique', () => {
    const ids = manifest.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('every clip exists on disk', () => {
    for (const r of manifest) {
      expect(existsSync(`${audioDir}${r.id}.ogg`), `${r.sentence} (${r.id}.ogg)`).toBe(true)
    }
  })
})
