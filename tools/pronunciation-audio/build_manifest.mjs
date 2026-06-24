#!/usr/bin/env node
/**
 * Build tools/pronunciation-audio/manifest.json from the pronunciation seed.
 *
 * Scans app/seed/pronunciation/topik-*.ts for every `parts: [...]` array,
 * collects the unique syllables, and emits one manifest row per syllable:
 *   { id: fnv1a(syllable), syllable, voice, rate, pitch }
 * id matches lib/pronunciation/audio.ts syllableAudioId() + gen_voice.py.
 *
 * Run from the repo root:  node tools/pronunciation-audio/build_manifest.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const SEED_DIR = join(HERE, '..', '..', 'munbeop', 'app', 'seed', 'pronunciation')

// One clear voice for "sound it out"; slightly slowed for syllable clarity.
const VOICE = 'ko-KR-SunHiNeural'
const RATE = '-10%'
const PITCH = '+0Hz'

function fnv1a(s) {
  let h = 0x811c9dc5
  for (const b of Buffer.from(s, 'utf8')) {
    h ^= b
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

const syllables = new Set()
for (const f of readdirSync(SEED_DIR)) {
  if (!/^topik-.*\.ts$/.test(f)) continue
  const src = readFileSync(join(SEED_DIR, f), 'utf8')
  for (const arr of src.matchAll(/parts:\s*\[([^\]]*)\]/g)) {
    for (const m of arr[1].matchAll(/'([^']+)'/g)) syllables.add(m[1])
  }
}

const rows = [...syllables]
  .sort()
  .map((syllable) => ({ id: fnv1a(syllable), syllable, voice: VOICE, rate: RATE, pitch: PITCH }))

writeFileSync(join(HERE, 'manifest.json'), JSON.stringify(rows, null, 2) + '\n', 'utf8')
console.log(`wrote manifest.json — ${rows.length} unique syllables`)
