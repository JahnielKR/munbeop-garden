/**
 * Regenerate manifest.json from the live Dictation seed.
 *
 * The manifest must cover EXACTLY the seed's unique answers (enforced by
 * tests/unit/numbers-market/audio-manifest.test.ts). Rather than re-implement
 * the number engine, this imports the real MARKET_ITEMS through Vite's loader.
 *
 * Run from the `munbeop/` directory:
 *     npx vite-node --config vitest.config.ts ../tools/number-market-audio/build_manifest.ts
 *
 * Then synthesize the clips:
 *     python tools/number-market-audio/gen_voice.py
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { MARKET_ITEMS } from '~/seed/numbers-market'
import { numberMarketAudioId } from '~/lib/numbers-market/audio'

const VOICE = 'ko-KR-SunHiNeural'
const RATE = '+0%'
const PITCH = '+4Hz'

const seen = new Set<string>()
const rows: Array<{ id: string; sentence: string; voice: string; rate: string; pitch: string }> = []
for (const it of MARKET_ITEMS) {
  if (seen.has(it.answer)) continue
  seen.add(it.answer)
  rows.push({ id: numberMarketAudioId(it.answer), sentence: it.answer, voice: VOICE, rate: RATE, pitch: PITCH })
}

const out = fileURLToPath(new URL('./manifest.json', import.meta.url))
const body = rows.map((r) => `  ${JSON.stringify(r)}`).join(',\n')
writeFileSync(out, `[\n${body}\n]\n`, 'utf-8')
console.log(`wrote ${rows.length} rows → ${out}`)
