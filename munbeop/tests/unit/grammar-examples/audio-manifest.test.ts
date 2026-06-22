// tests/unit/grammar-examples/audio-manifest.test.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { GRAMMAR_EXAMPLES } from '~/seed/grammar-examples'
import { exampleAudioId } from '~/lib/grammar-examples/audio'

// Read via node fs (the manifest lives outside munbeop/, so a Vite JSON import
// could be blocked by server.fs.allow; fs.readFileSync is unaffected).
// Use path.resolve + dirname(fileURLToPath(import.meta.url)) instead of new URL()
// because happy-dom intercepts new URL() against http://localhost:3000.
const HERE = dirname(fileURLToPath(import.meta.url))
const manifestPath = resolve(HERE, '../../../../tools/grammar-examples-audio/manifest.json')
const VOICES = ['ko-KR-InJoonNeural', 'ko-KR-SunHiNeural', 'ko-KR-HyunsuMultilingualNeural']
type Row = { id: string; sentence: string; level: string; voice: string; rate: string; pitch: string }
const rows = JSON.parse(readFileSync(manifestPath, 'utf-8')) as Row[]

describe('grammar-examples audio manifest ↔ seed', () => {
  it('covers exactly the seed example sentences', () => {
    expect(new Set(rows.map((r) => r.sentence))).toEqual(new Set(GRAMMAR_EXAMPLES.map((e) => e.sentence)))
    expect(rows.length).toBe(GRAMMAR_EXAMPLES.length)
  })
  it('each row id = FNV-1a of its sentence; ids unique; level matches; voice valid', () => {
    const bySentence = new Map(GRAMMAR_EXAMPLES.map((e) => [e.sentence, e.level]))
    for (const r of rows) {
      expect(r.id, r.sentence).toBe(exampleAudioId(r.sentence))
      expect(r.level).toBe(bySentence.get(r.sentence))
      expect(VOICES).toContain(r.voice)
    }
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length)
  })
})
