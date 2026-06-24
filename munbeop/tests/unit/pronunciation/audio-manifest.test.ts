// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { allSyllables } from '~/lib/pronunciation'
import { syllableAudioId } from '~/lib/pronunciation/audio'

interface Row {
  id: string
  syllable: string
  voice: string
  rate: string
  pitch: string
}

const manifest: Row[] = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../../../../tools/pronunciation-audio/manifest.json', import.meta.url)),
    'utf8',
  ),
)
const audioDir = fileURLToPath(new URL('../../../public/pronunciation/audio/', import.meta.url))

describe('pronunciation audio manifest contract', () => {
  it('covers exactly the seed’s unique syllables', () => {
    const inManifest = manifest.map((r) => r.syllable).sort()
    expect(inManifest).toEqual(allSyllables())
  })

  it('every row id is the FNV-1a hash of its syllable (TS player parity)', () => {
    for (const r of manifest) {
      expect(r.id, r.syllable).toBe(syllableAudioId(r.syllable))
    }
  })

  it('ids are unique', () => {
    const ids = manifest.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every clip exists on disk', () => {
    for (const r of manifest) {
      expect(existsSync(`${audioDir}${r.id}.ogg`), `${r.syllable} (${r.id}.ogg)`).toBe(true)
    }
  })
})
