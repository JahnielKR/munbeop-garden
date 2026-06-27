# 숫자 시장 — Number Market DICTATION mode (받아쓰기) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a **받아쓰기 (Dictation)** mode to the Number Market lab: 🔊 plays the Korean reading of a quantity and the learner **types the numeral/value** (no Korean keyboard needed) — training listening comprehension, the inverse of Learn mode's production. Selected via the existing Learn/Speed/**Dictation** toggle. Audio is pre-generated edge-tts clips (the pipeline is verified to run locally).

**Architecture:** A pre-generated TTS clip per seed reading (`public/number-market/audio/<fnv1a(reading)>.ogg`), produced by a `tools/number-market-audio/` gen tool that mirrors the grammar-examples pipeline. A pure `lib/numbers-market/audio.ts` (FNV-1a id → src) + a `useNumberMarketAudio` composable (mirror `useExampleAudio`) play one clip at a time. A self-contained `useNumberDictation` composable runs the round (audio prompt → value entry → normalized compare vs the seed's `valueKey`). A `DictationInput` component + a 3rd `ModeToggle` option + the page wire it in. No engine/seed changes (the seed already carries `valueKey`), no migration, no SRS writes (only `useActivityStore().record()`); dictation is practice-only (no mastery coupling).

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia, Vitest + @vue/test-utils (happy-dom), `@nuxtjs/i18n` (8 locales). pnpm. Audio gen: Python 3.13 + edge-tts + numpy + soundfile + scipy (all confirmed installed; edge-tts is a network call — confirmed reachable).

**Spec:** `docs/superpowers/specs/2026-06-27-number-market-design.md` (받아쓰기 / Dictation mode).

**Builds on (merged to main):** Plan 1 (Learn) + Plan 2 (Speed). `MARKET_ITEMS`/`MarketItem` (with `valueKey`) from `~/seed/numbers-market` + `~/lib/domain`; `~/lib/numbers-market` (`buildRound`, `scoreOf`, `itemId`, `DrillResult`); `NUMBER_DOMAINS`; the page + `ModeToggle` (currently `'learn'|'speed'`) + the `numberMarket.*` i18n.

**House conventions (verified):**
- Audio mirrors grammar-examples: `lib/grammar-examples/audio.ts` (`exampleAudioId` = FNV-1a, `exampleAudioSrc` = `/grammar-examples/audio/<id>.ogg`) and `useExampleAudio` (module-singleton, SSR-safe, silent on 404/autoplay). The gen tool mirrors `tools/grammar-examples-audio/gen_voice.py`; the manifest-contract test mirrors `tests/unit/pronunciation/audio-manifest.test.ts` (`// @vitest-environment node`).
- Composable tests: mock `~/stores/activity` AND `~/composables/useNumberMarketAudio` (so no real `Audio` in happy-dom); `setActivePinia` + clear `localStorage` in `beforeEach`; SUT import at top despite `vi.mock`.
- i18n: nested JSON in `i18n/locales/*.json` (2-space); parity test imports each locale with a RELATIVE path. Add to all 8; Korean fragments verbatim.
- `~/` = `munbeop/app/`. Commands from `munbeop/`. Voice = `ko-KR-SunHiNeural`, rate `+0%`, pitch `+4Hz`.
- **No DB/migration, no SRS/log/catalog writes.**

---

## Task 1: Audio infrastructure + generated clips

**Files:**
- Create: `munbeop/app/lib/numbers-market/audio.ts`; modify `munbeop/app/lib/numbers-market/index.ts` (`export * from './audio'`)
- Create: `munbeop/app/composables/useNumberMarketAudio.ts`
- Create: `tools/number-market-audio/manifest.json`, `tools/number-market-audio/gen_voice.py`
- Generate: 18 clips in `munbeop/public/number-market/audio/`
- Test: `munbeop/tests/unit/numbers-market/audio-manifest.test.ts`

- [ ] **Step 1: Write the pure id/src helper.** Create `munbeop/app/lib/numbers-market/audio.ts`:
```ts
/** FNV-1a 32-bit hex over the reading's UTF-8 bytes. Deterministic; the Python gen tool replicates it. */
export function numberMarketAudioId(reading: string): string {
  const bytes = new TextEncoder().encode(reading)
  let h = 0x811c9dc5
  for (const b of bytes) {
    h ^= b
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/** Public asset path for a reading's pre-generated TTS clip. */
export function numberMarketAudioSrc(reading: string): string {
  return `/number-market/audio/${numberMarketAudioId(reading)}.ogg`
}
```
Append to `munbeop/app/lib/numbers-market/index.ts`: `export * from './audio'`.

- [ ] **Step 2: Write the playback composable.** Create `munbeop/app/composables/useNumberMarketAudio.ts` (clone of `useExampleAudio`):
```ts
/**
 * Number-market reading playback — one clip at a time. Module singleton, SSR-safe,
 * error-tolerant (404/codec/autoplay → silent). Opt-in via the 🔊 button / dictation prompt.
 */
import { numberMarketAudioSrc } from '~/lib/numbers-market/audio'

const VOICE_VOL = 0.95
let voice: HTMLAudioElement | null = null

function audioAvailable(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined'
}
function makeAudio(src: string): HTMLAudioElement | null {
  if (!audioAvailable()) return null
  const a = new Audio(src)
  a.addEventListener('error', () => { /* 404 / codec — stay silent */ })
  return a
}
function safePlay(a: HTMLAudioElement | null) {
  if (!a) return
  try {
    const p = a.play()
    if (p && typeof (p as Promise<void>).catch === 'function') {
      ;(p as Promise<void>).catch(() => { /* autoplay blocked / missing — silent */ })
    }
  } catch { /* play() threw synchronously (test env) — silent */ }
}

export function useNumberMarketAudio() {
  function playReading(reading: string) {
    if (!audioAvailable() || !reading) return
    if (voice) {
      try { voice.pause() } catch { /* dead element */ }
    }
    const a = makeAudio(numberMarketAudioSrc(reading))
    if (!a) return
    a.volume = VOICE_VOL
    voice = a
    safePlay(a)
  }
  function stop() {
    if (!voice) return
    try { voice.pause() } catch { /* dead element */ }
    voice = null
  }
  return { playReading, stop }
}

// Test-only: clear the singleton between cases.
export function _resetNumberMarketAudioForTest() {
  voice = null
}
```

- [ ] **Step 3: Write the manifest.** Create `tools/number-market-audio/manifest.json` (the `id` of each row is the FNV-1a hash of its `sentence`, precomputed — the Task 1 test re-verifies):
```json
[
  { "id": "600e4c29", "sentence": "세 개", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "e4992e5c", "sentence": "두 마리", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "00a9b366", "sentence": "스무 명", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "42b3764d", "sentence": "백", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "e6c8af12", "sentence": "십육", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "64004ed1", "sentence": "삼백오십", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "c9274e27", "sentence": "세 시 십오 분", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "cea67417", "sentence": "아홉 시 오 분", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "4cda8264", "sentence": "열두 시 삼십 분", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "831b08c0", "sentence": "천오백 원", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "04e34e11", "sentence": "만 이천 원", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "337ad34d", "sentence": "이만 오천 원", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "3f735803", "sentence": "유월 십오 일", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "f331b3d0", "sentence": "시월 삼 일", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "d357395b", "sentence": "십일월 이십 일", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "c76cc8a2", "sentence": "공일공 일이삼사", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "3a1433c2", "sentence": "일일구", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" },
  { "id": "0bee4b0e", "sentence": "공일공 구팔칠육", "voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+4Hz" }
]
```

- [ ] **Step 4: Write the gen tool.** Create `tools/number-market-audio/gen_voice.py` (clone of `tools/grammar-examples-audio/gen_voice.py`, only the OUT_DIR/MANIFEST/docstring differ):
```python
#!/usr/bin/env python3
"""Generate the number-market dictation TTS clips from manifest.json.

Reads tools/number-market-audio/manifest.json (one row per reading: id, sentence,
voice, rate, pitch), synthesizes with edge-tts, and writes
munbeop/public/number-market/audio/<id>.ogg via the escape-room common.py DSP.
<id> is the FNV-1a hash of the reading (matches numberMarketAudioId in TS).
edge-tts is a network call.

Run from the repo root:
    python tools/number-market-audio/gen_voice.py
"""
from __future__ import annotations
import asyncio, json, os, sys, tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy import signal as sps

HERE = Path(__file__).resolve().parent
ESC = Path(__file__).resolve().parents[1] / "escape-room-level02-audio"
sys.path.insert(0, str(ESC))
import common  # noqa: E402
from common import PEAK_VOICE_DBFS, SR, analyze, peak_dbfs, read_ogg, write_ogg  # noqa: E402
import edge_tts  # noqa: E402

OUT_DIR = common.REPO / "munbeop" / "public" / "number-market" / "audio"
MANIFEST = HERE / "manifest.json"
TRIM_THRESH_DB = -45.0
TRIM_PAD_S = 0.06


def fnv1a(s: str) -> str:
    h = 0x811c9dc5
    for b in s.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def to_mono_44100(x: np.ndarray, sr: int) -> np.ndarray:
    x = np.asarray(x, dtype=np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        g = np.gcd(int(SR), int(sr))
        x = sps.resample_poly(x, SR // g, sr // g)
    return x.astype(np.float64)


def trim_silence(x: np.ndarray) -> np.ndarray:
    x = np.asarray(x, dtype=np.float64)
    if x.size == 0:
        return x
    pk = float(np.max(np.abs(x)))
    if pk <= common.EPS:
        return x
    thresh = pk * (10.0 ** (TRIM_THRESH_DB / 20.0))
    win = max(1, int(0.005 * SR))
    env = np.convolve(np.abs(x), np.ones(win) / win, mode="same")
    above = np.where(env >= thresh)[0]
    if above.size == 0:
        return x
    pad = int(TRIM_PAD_S * SR)
    return x[max(0, int(above[0]) - pad): min(x.size, int(above[-1]) + pad + 1)].copy()


async def build_one(row: dict) -> dict:
    assert fnv1a(row["sentence"]) == row["id"], f"id mismatch for {row['sentence']}"
    fd, mp3 = tempfile.mkstemp(suffix=".mp3"); os.close(fd)
    try:
        await edge_tts.Communicate(row["sentence"], voice=row["voice"], rate=row["rate"], pitch=row["pitch"]).save(mp3)
        raw, sr = sf.read(mp3, dtype="float32")
    finally:
        try: os.remove(mp3)
        except OSError: pass
    x = trim_silence(to_mono_44100(raw, sr))
    out = OUT_DIR / f"{row['id']}.ogg"
    write_ogg(out, x, peak_dbfs=PEAK_VOICE_DBFS)
    y, ysr = read_ogg(out)
    info = sf.info(str(out))
    m = analyze(y, ysr); pk = peak_dbfs(y)
    ok = (info.samplerate == SR and info.channels == 1 and info.format == "OGG"
          and 0.3 < m["dur_s"] < 8.0 and pk <= -1.0 and not bool(np.any(np.abs(y) >= 0.999)))
    return {"name": f"{row['id']}.ogg", "seconds": m["dur_s"], "peak_dbfs": round(pk, 2), "ok": ok}


async def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = json.loads(MANIFEST.read_text(encoding="utf-8"))
    results = []
    for i, row in enumerate(rows, 1):
        r = await build_one(row)
        results.append(r)
        print(f"[{i:2d}/{len(rows)}] {'OK ' if r['ok'] else 'BAD'} {r['seconds']:5.2f}s peak {r['peak_dbfs']:6.2f} {r['name']}")
    n_ok = sum(1 for r in results if r["ok"])
    print(f"\n{n_ok}/{len(rows)} OK")
    return 0 if n_ok == len(rows) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
```

- [ ] **Step 5: Generate the clips.** From the repo root (`C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0`):
```bash
PYTHONUTF8=1 python tools/number-market-audio/gen_voice.py
```
Expected: `18/18 OK`. This writes 18 `.ogg` files into `munbeop/public/number-market/audio/`. (edge-tts needs network; if a row fails transiently, re-run — it's idempotent.)

- [ ] **Step 6: Write the manifest-contract test.** Create `munbeop/tests/unit/numbers-market/audio-manifest.test.ts`:
```ts
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
  it('covers exactly the seed’s unique answers', () => {
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
```

- [ ] **Step 7: Gates.** From `munbeop/`: `pnpm exec vitest run tests/unit/numbers-market/audio-manifest.test.ts` (4/4 pass — proves coverage, FNV parity, and all 18 clips on disk), `pnpm typecheck`, `pnpm exec eslint app/lib/numbers-market/audio.ts app/composables/useNumberMarketAudio.ts tests/unit/numbers-market/audio-manifest.test.ts` (0 errors).

- [ ] **Step 8: Commit** (includes the 18 binary clips).
```bash
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" add munbeop/app/lib/numbers-market/audio.ts munbeop/app/lib/numbers-market/index.ts munbeop/app/composables/useNumberMarketAudio.ts tools/number-market-audio munbeop/public/number-market/audio munbeop/tests/unit/numbers-market/audio-manifest.test.ts
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" commit -m "feat(number-market): dictation audio pipeline + 18 TTS clips + manifest test"
```

---

## Task 2: `useNumberDictation` composable

**Files:**
- Create: `munbeop/app/composables/useNumberDictation.ts`
- Test: `munbeop/tests/unit/numbers-market/useNumberDictation.test.ts`

- [ ] **Step 1: Write the failing test.** Create `munbeop/tests/unit/numbers-market/useNumberDictation.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNumberDictation, normalizeValue } from '~/composables/useNumberDictation'

vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))
const play = vi.fn()
vi.mock('~/composables/useNumberMarketAudio', () => ({ useNumberMarketAudio: () => ({ playReading: play, stop: vi.fn() }) }))

beforeEach(() => {
  setActivePinia(createPinia())
  play.mockClear()
})

describe('normalizeValue', () => {
  it('strips whitespace', () => {
    expect(normalizeValue('  12 000 ')).toBe('12000')
    expect(normalizeValue('3:15')).toBe('3:15')
  })
})

describe('useNumberDictation', () => {
  it('starts a round and plays the first reading', () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    expect(d.phase.value).toBe('input')
    expect(d.sessionItems.value.length).toBeGreaterThan(0)
    expect(play).toHaveBeenCalledWith(d.item.value.answer)
  })
  it('correct valueKey → right; wrong → wrong', () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    d.entry.value = d.item.value.valueKey
    d.submit()
    expect(d.phase.value).toBe('right')
  })
  it('a wrong entry is marked wrong and shows in failedItems', () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    d.entry.value = 'zzz'
    d.submit()
    expect(d.phase.value).toBe('wrong')
    d.next()
    expect(d.failedItems.value.length).toBe(1)
  })
  it('replay button re-plays the current reading', () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    play.mockClear()
    d.play()
    expect(play).toHaveBeenCalledWith(d.item.value.answer)
  })
  it('next advances and replays; round ends at done', () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    while (d.phase.value !== 'done') {
      d.entry.value = d.item.value.valueKey
      d.submit()
      d.next()
    }
    expect(d.score.value.accuracy).toBe(1)
  })
})
```

- [ ] **Step 2: Run — FAIL.** `pnpm exec vitest run tests/unit/numbers-market/useNumberDictation.test.ts`.

- [ ] **Step 3: Implement.** Create `munbeop/app/composables/useNumberDictation.ts`:
```ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { buildRound, scoreOf, itemId, type DrillResult } from '~/lib/numbers-market'
import { NUMBER_DOMAINS } from '~/lib/numbers-market/sets'
import type { MarketItem, NumberDomain } from '~/lib/domain'
import { useNumberMarketAudio } from '~/composables/useNumberMarketAudio'
import { useActivityStore } from '~/stores/activity'

export type DictationPhase = 'input' | 'right' | 'wrong' | 'done'
export type DictationRunMode = 'normal' | 'replay'
const ROUND_SIZE = 8

/** Compare-normalize a typed value: strip all whitespace (valueKeys have none). */
export function normalizeValue(s: string): string {
  return s.replace(/\s+/g, '')
}

export function useNumberDictation() {
  const audio = useNumberMarketAudio()
  const activity = useActivityStore()

  const selectedDomain = ref<NumberDomain>(NUMBER_DOMAINS[0]!.id)
  const sessionItems = ref<MarketItem[]>([])
  const runMode = ref<DictationRunMode>('normal')
  const index = ref(0)
  const phase = ref<DictationPhase>('input')
  const entry = ref('')
  const results = ref<DrillResult[]>([])

  const item = computed<MarketItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === itemId(i) && !r.correct)),
  )

  function play() {
    if (item.value) audio.playReading(item.value.answer)
  }
  function resetRound() {
    index.value = 0
    phase.value = 'input'
    entry.value = ''
    results.value = []
  }

  function selectDomain(id: NumberDomain) {
    selectedDomain.value = id
  }

  function start() {
    runMode.value = 'normal'
    sessionItems.value = buildRound(selectedDomain.value, ROUND_SIZE, shuffle)
    resetRound()
    if (sessionItems.value.length) play()
  }

  function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    runMode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    play()
  }

  function submit() {
    if (phase.value !== 'input') return
    const correct = normalizeValue(entry.value) === item.value.valueKey
    results.value.push({ itemId: itemId(item.value), correct })
    phase.value = correct ? 'right' : 'wrong'
    void activity.record()
  }

  function next() {
    if (phase.value === 'input' || phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      return
    }
    index.value += 1
    phase.value = 'input'
    entry.value = ''
    play()
  }

  return {
    selectedDomain, sessionItems, runMode, index, phase, entry,
    item, score, failedItems,
    selectDomain, start, replayFailed, play, submit, next,
  }
}
```

- [ ] **Step 4: Run — PASS** (6/6). Then `pnpm typecheck` + `pnpm exec eslint app/composables/useNumberDictation.ts tests/unit/numbers-market/useNumberDictation.test.ts` (0 errors).

- [ ] **Step 5: Commit.**
```bash
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" add munbeop/app/composables/useNumberDictation.ts munbeop/tests/unit/numbers-market/useNumberDictation.test.ts
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" commit -m "feat(number-market): useNumberDictation composable (audio prompt → value entry)"
```

---

## Task 3: DictationInput component + ModeToggle 3rd option

**Files:**
- Create: `munbeop/app/components/numbers-market/DictationInput.vue`
- Modify: `munbeop/app/components/numbers-market/ModeToggle.vue` (add `dictation`)
- Test: `munbeop/tests/components/numbers-market/DictationInput.test.ts`

- [ ] **Step 1: Write the failing test.** Create `munbeop/tests/components/numbers-market/DictationInput.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DictationInput from '~/components/numbers-market/DictationInput.vue'

const base = { domain: 'time' as const, phase: 'input' as const, modelValue: '' }

describe('DictationInput', () => {
  it('emits update:modelValue on input and submit on the form', async () => {
    const w = mount(DictationInput, { props: base })
    const input = w.find('[data-testid="dictation-input"]')
    await input.setValue('3:15')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['3:15'])
    await w.find('[data-testid="dictation-submit"]').trigger('submit')
    expect(w.emitted('submit')).toBeTruthy()
  })
  it('emits replay when the 🔊 button is clicked', async () => {
    const w = mount(DictationInput, { props: base })
    await w.find('[data-testid="dictation-replay"]').trigger('click')
    expect(w.emitted('replay')).toBeTruthy()
  })
  it('disables input + submit when not in input phase', () => {
    const w = mount(DictationInput, { props: { ...base, phase: 'right' } })
    expect(w.find('[data-testid="dictation-input"]').attributes('disabled')).toBeDefined()
  })
})
```
Note: the submit test triggers `submit` on the submit button; the component wraps input+button in a `<form @submit.prevent>` so a submit-type button triggers the form. (If `trigger('submit')` on the button doesn't bubble in the test, trigger it on the form element instead — adjust the selector to `w.find('form')`.)

- [ ] **Step 2: Run — FAIL.** `pnpm exec vitest run tests/components/numbers-market/DictationInput.test.ts`.

- [ ] **Step 3: Implement `DictationInput.vue`.** Create `munbeop/app/components/numbers-market/DictationInput.vue`:
```vue
<script setup lang="ts">
import type { NumberDomain } from '~/lib/domain'

interface Props {
  domain: NumberDomain
  phase: 'input' | 'right' | 'wrong' | 'done'
  modelValue: string
}
defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [v: string]; submit: []; replay: [] }>()
const { t } = useI18n()

const FMT: Partial<Record<NumberDomain, string>> = {
  time: 'numberMarket.dictation.fmt_time',
  dates: 'numberMarket.dictation.fmt_date',
}
function fmtKey(domain: NumberDomain): string {
  return FMT[domain] ?? 'numberMarket.dictation.fmt_number'
}
</script>

<template>
  <form class="dict" @submit.prevent="emit('submit')">
    <button
      type="button"
      class="dict__play"
      data-testid="dictation-replay"
      :aria-label="t('numberMarket.dictation.replay')"
      @click="emit('replay')"
    ><span aria-hidden="true">🔊</span></button>
    <input
      :value="modelValue"
      type="text"
      class="dict__input"
      data-testid="dictation-input"
      :placeholder="t(fmtKey(domain))"
      :aria-label="t('numberMarket.dictation.listen')"
      :disabled="phase !== 'input'"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button
      type="submit"
      class="dict__submit"
      data-testid="dictation-submit"
      :disabled="phase !== 'input' || !modelValue"
    >{{ t('numberMarket.submit') }}</button>
  </form>
</template>

<style scoped>
.dict { display: flex; gap: 8px; align-items: center; }
.dict__play { flex: none; width: 44px; height: 44px; font-size: 18px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer; }
.dict__play:hover { border-color: var(--ink); }
.dict__input { flex: 1; font-family: 'Inter', sans-serif; font-size: 20px; padding: 10px 12px; background: var(--paper, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); }
.dict__input:disabled { opacity: 0.55; }
.dict__submit { flex: none; font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 16px; background: var(--accent, #2e7d32); color: var(--paper, #fff); border: 2px solid var(--accent, #2e7d32); cursor: pointer; }
.dict__submit:disabled { opacity: 0.5; cursor: default; }
.dict__play:focus-visible, .dict__input:focus-visible, .dict__submit:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 4: Extend `ModeToggle.vue` to 3 options.** In `munbeop/app/components/numbers-market/ModeToggle.vue`, change the prop + emit types from `'learn' | 'speed'` to `'learn' | 'speed' | 'dictation'` (both `Props.modelValue` and the `update:modelValue` payload), and add a third entry to `MODES`:
```ts
const MODES = [
  { id: 'learn' as const, key: 'numberMarket.mode.learn' },
  { id: 'speed' as const, key: 'numberMarket.mode.speed' },
  { id: 'dictation' as const, key: 'numberMarket.mode.dictation' },
]
```
(The existing ModeToggle test — index [1] = speed — stays valid; `data-testid="mode-option"` now yields 3 buttons.)

- [ ] **Step 5: Run the tests — PASS.** `pnpm exec vitest run tests/components/numbers-market/DictationInput.test.ts tests/components/numbers-market/ModeToggle.test.ts`. Then `pnpm typecheck` + `pnpm exec eslint app/components/numbers-market tests/components/numbers-market` (0 errors).

- [ ] **Step 6: Commit.**
```bash
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" add munbeop/app/components/numbers-market/DictationInput.vue munbeop/app/components/numbers-market/ModeToggle.vue munbeop/tests/components/numbers-market/DictationInput.test.ts
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" commit -m "feat(number-market): DictationInput + 3rd ModeToggle option (dictation)"
```

---

## Task 4: Page integration + i18n

**Files:**
- Modify: `munbeop/app/pages/practice/number-market.vue`
- Modify: all 8 `munbeop/i18n/locales/*.json`
- Test: `munbeop/tests/unit/numbers-market/i18n-parity.test.ts` (extend KEYS)

- [ ] **Step 1: Extend the parity test (failing).** Add to the `KEYS` array in `munbeop/tests/unit/numbers-market/i18n-parity.test.ts`:
```ts
  'numberMarket.mode.dictation', 'numberMarket.dictation.listen', 'numberMarket.dictation.replay',
  'numberMarket.dictation.fmt_number', 'numberMarket.dictation.fmt_time', 'numberMarket.dictation.fmt_date',
```
Run — FAIL.

- [ ] **Step 2: Add the i18n keys to all 8 locales.** Add `mode.dictation` and a `dictation` block under `numberMarket` in each locale. en + es by hand; the other 6 via a temp `munbeop/scripts/_add-nm-dictation-i18n.mjs` (delete before commit; verify add-only diffs).

en.json — add `"dictation"` to `numberMarket.mode` (i.e. `mode` becomes `{label, learn, speed, dictation}`) and a new `numberMarket.dictation`:
```jsonc
// numberMarket.mode.dictation:
"dictation": "Dictation"
// numberMarket.dictation:
"dictation": {
  "listen": "Listen and type the number",
  "replay": "Replay audio",
  "fmt_number": "e.g. 12000",
  "fmt_time": "e.g. 3:15",
  "fmt_date": "e.g. 6/15"
}
```
es.json:
```jsonc
// numberMarket.mode.dictation:
"dictation": "Dictado"
// numberMarket.dictation:
"dictation": {
  "listen": "Escucha y escribe el número",
  "replay": "Repetir audio",
  "fmt_number": "ej. 12000",
  "fmt_time": "ej. 3:15",
  "fmt_date": "ej. 6/15"
}
```
Temp script for fr/pt-BR/th/id/vi/ja (also do en/es through it for consistency):
```js
// scripts/_add-nm-dictation-i18n.mjs  (TEMPORARY — delete before commit)
import { readFileSync, writeFileSync } from 'node:fs'
const T = {
  en: { mode: 'Dictation', listen: 'Listen and type the number', replay: 'Replay audio', fmt_number: 'e.g. 12000', fmt_time: 'e.g. 3:15', fmt_date: 'e.g. 6/15' },
  es: { mode: 'Dictado', listen: 'Escucha y escribe el número', replay: 'Repetir audio', fmt_number: 'ej. 12000', fmt_time: 'ej. 3:15', fmt_date: 'ej. 6/15' },
  fr: { mode: 'Dictée', listen: 'Écoute et tape le nombre', replay: 'Réécouter', fmt_number: 'ex. 12000', fmt_time: 'ex. 3:15', fmt_date: 'ex. 6/15' },
  'pt-BR': { mode: 'Ditado', listen: 'Ouça e digite o número', replay: 'Repetir áudio', fmt_number: 'ex. 12000', fmt_time: 'ex. 3:15', fmt_date: 'ex. 6/15' },
  th: { mode: 'เขียนตามคำบอก', listen: 'ฟังแล้วพิมพ์ตัวเลข', replay: 'เล่นเสียงอีกครั้ง', fmt_number: 'เช่น 12000', fmt_time: 'เช่น 3:15', fmt_date: 'เช่น 6/15' },
  id: { mode: 'Dikte', listen: 'Dengar dan ketik angkanya', replay: 'Putar ulang audio', fmt_number: 'mis. 12000', fmt_time: 'mis. 3:15', fmt_date: 'mis. 6/15' },
  vi: { mode: 'Chính tả', listen: 'Nghe và gõ con số', replay: 'Phát lại', fmt_number: 'vd. 12000', fmt_time: 'vd. 3:15', fmt_date: 'vd. 6/15' },
  ja: { mode: '聞き取り', listen: '聞いて数字を入力', replay: 'もう一度再生', fmt_number: '例: 12000', fmt_time: '例: 3:15', fmt_date: '例: 6/15' },
}
for (const [code, v] of Object.entries(T)) {
  const path = `i18n/locales/${code}.json`
  const j = JSON.parse(readFileSync(path, 'utf8'))
  j.numberMarket = j.numberMarket || {}
  j.numberMarket.mode = { ...(j.numberMarket.mode || {}), dictation: v.mode }
  j.numberMarket.dictation = { listen: v.listen, replay: v.replay, fmt_number: v.fmt_number, fmt_time: v.fmt_time, fmt_date: v.fmt_date }
  writeFileSync(path, JSON.stringify(j, null, 2) + '\n', 'utf8')
}
console.log('added numberMarket.dictation keys')
```
Run from `munbeop/`, then `rm scripts/_add-nm-dictation-i18n.mjs`. Verify each locale diff is ONLY the added `mode.dictation` + `dictation` block (no reformat).

- [ ] **Step 3: Wire the page.** In `munbeop/app/pages/practice/number-market.vue`:

(a) Change the `mode` ref type to include dictation, and add the dictation composable + imports. In `<script setup>`:
- Add imports:
```ts
import DictationInput from '~/components/numbers-market/DictationInput.vue'
import { useNumberDictation } from '~/composables/useNumberDictation'
```
- Add `const d = useNumberDictation()` next to `const s = useNumberSpeed()`.
- Change `const mode = ref<'learn' | 'speed'>('learn')` → `const mode = ref<'learn' | 'speed' | 'dictation'>('learn')`.
- Extend `dirty`:
```ts
const dirty = () =>
  started.value &&
  (mode.value === 'learn'
    ? m.phase.value !== 'done'
    : mode.value === 'speed'
      ? s.phase.value === 'playing'
      : d.phase.value !== 'done')
```
- Extend `begin` with a dictation branch (after the speed branch):
```ts
function begin(deckId: string) {
  started.value = true
  phase.value = 'play'
  if (mode.value === 'learn') {
    m.selectDomain(deckId as NumberDomain)
    m.start()
  } else if (mode.value === 'speed') {
    s.start(deckId)
    startTimer()
  } else {
    d.selectDomain(deckId as NumberDomain)
    d.start()
  }
}
```
(`begin('mixed')` can only fire from the speed-only mixed button, so dictation/learn never receive `'mixed'`.)

(b) In the `pick` template block, the `start_hint` line should only apply to speed; keep it as-is (it already conditions on `mode === 'speed'`). The mixed button already conditions on `mode === 'speed'`. No change needed there — `DomainPicker @select="begin"` serves all three modes.

(c) Add a dictation play branch. After the speed `<template v-else>` block's closing tag... — restructure the three modes as explicit branches. Change the speed branch opener from `<template v-else>` to `<template v-else-if="mode === 'speed'">`, and append a new dictation branch:
```vue
    <template v-else>
      <p
        v-if="d.runMode.value === 'replay' && d.phase.value !== 'done'"
        class="lab__replay"
        role="status"
      >
        🔁 {{ t('numberMarket.replay_failed') }}
      </p>
      <ProgressDots
        v-if="d.phase.value !== 'done'"
        :total="d.sessionItems.value.length"
        :progress="d.index.value"
        :label="t('numberMarket.progress')"
      />
      <template v-if="d.phase.value !== 'done'">
        <p class="lab__listen">🎧 {{ t('numberMarket.dictation.listen') }}</p>
        <DictationInput
          :domain="d.item.value.domain"
          :phase="d.phase.value"
          :model-value="d.entry.value"
          @update:model-value="(v) => (d.entry.value = v)"
          @submit="d.submit"
          @replay="d.play"
        />
        <p v-if="d.phase.value === 'right'" class="lab__verdict lab__verdict--ok" role="status">
          ✓ {{ t('numberMarket.correct') }}
        </p>
        <p v-else-if="d.phase.value === 'wrong'" class="lab__verdict lab__verdict--no" role="status">
          ✗ {{ t('numberMarket.wrong') }}
        </p>
        <p
          v-if="d.phase.value === 'right' || d.phase.value === 'wrong'"
          class="lab__reveal"
          role="status"
          lang="ko"
        >{{ d.item.value.answer }} — {{ d.item.value.display }}</p>
        <button
          v-if="d.phase.value === 'right' || d.phase.value === 'wrong'"
          type="button"
          class="lab__next"
          @click="d.next"
        >
          {{ t('numberMarket.next') }}
        </button>
      </template>
      <MarketSummary
        v-else
        :score="d.score.value"
        :failed-items="d.failedItems.value"
        @restart="restart"
        @replay-failed="d.replayFailed"
      />
    </template>
```
Add a `.lab__listen` + `.lab__reveal` style:
```css
.lab__listen { margin: 0; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink-soft); }
.lab__reveal { margin: 0; font-family: 'Noto Sans KR', sans-serif; font-size: 20px; color: var(--accent-bright, #2e7d32); }
```

- [ ] **Step 4: Gates.** From `munbeop/`:
- `pnpm exec vitest run tests/unit/numbers-market/i18n-parity.test.ts` → 8/8.
- `pnpm exec vitest run tests/unit/numbers-market tests/components/numbers-market` → all green.
- `pnpm typecheck` → clean. `pnpm lint` → 0 errors.
Confirm the temp script is deleted; `git status` clean after commit.

- [ ] **Step 5: Commit.**
```bash
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" add munbeop/app/pages/practice/number-market.vue munbeop/i18n/locales munbeop/tests/unit/numbers-market/i18n-parity.test.ts
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" commit -m "feat(number-market): wire dictation mode into the page + i18n x8"
```

---

## Task 5: Final review + PR

**Files:** none (verification + PR).

- [ ] **Step 1: Full gates.** From `munbeop/`: `pnpm test` (whole suite green — confirm count up by the new tests), `pnpm typecheck`, `pnpm lint` (0 errors).
- [ ] **Step 2: Self-review.** Confirm: no migration, no SRS/log writes (only `useActivityStore().record()`), Learn + Speed modes unchanged, 18 clips committed + manifest test green, dictation grading is `normalizeValue(entry) === valueKey`. Audio composable is SSR/test-safe (silent on missing).
- [ ] **Step 3: Push + PR** against `main` with a summary + test plan; flag for the owner: wife ear-check of the 18 clips + logged-in smoke of the Dictation toggle.

## Out of scope
Per-syllable audio, alternate accepted formats (e.g. `03:15` vs `3:15`), audio for items beyond the seed answers (grows with the seed via the manifest test). Mastery coupling for dictation (kept practice-only, like Speed).

## Self-review notes (author)
- **Spec coverage:** 🔊 audio prompt → numeral entry (§Dictation) → Tasks 1–4; "listen and write what you hear" → `useNumberDictation` + `DictationInput`; reuses existing edge-tts pipeline (§Testing audio gate) → Task 1 manifest test + the verified gen tool.
- **Type consistency:** `numberMarketAudioId`/`Src` (Task 1) consumed by `useNumberMarketAudio` (Task 1) and the manifest test; `useNumberDictation` returns `{phase,entry,item,score,failedItems,...}` matching the page + `DictationInput` props; `ModeToggle` payload widened to `'learn'|'speed'|'dictation'` matches the page `mode` ref. `valueKey` (Plan-1 seed field) is finally consumed here.
- **No placeholders:** all code complete; the 18 manifest ids are precomputed (FNV-1a) and re-verified by the Task 1 test; the i18n temp script is fully written.
