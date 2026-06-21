# Particle Lab audio TTS (v1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pre-generate Korean TTS audio (edge-tts → OGG) for the 14 Explore sentences with per-sentence voice casting, and add a 🔊 play button in Explore mode backed by a small, error-tolerant audio composable.

**Architecture:** A Python tool (`tools/particle-lab-audio/`) mirrors the escape-room edge-tts pipeline, reusing its `common.py` DSP, to write `munbeop/public/particle-lab/audio/sentence-<id>.ogg`. A `useParticleAudio` composable plays one sentence at a time (SSR-safe, 404/autoplay → silent), and `SentenceAudioButton.vue` triggers it from `ExploreMode.vue`. The path is derived purely from `sentence.id`.

**Tech Stack:** Python 3.13 + edge-tts 7.2.8 + soundfile/scipy/numpy (asset gen); Nuxt 4 SPA, Vue 3 `<script setup>`, TypeScript, Vitest + @vue/test-utils, pnpm.

**Conventions:**
- Spec: `docs/superpowers/specs/2026-06-21-particle-audio-tts-design.md`.
- App paths relative to repo root; app code under `munbeop/`. Run JS commands from `munbeop/`; run Python from the **repo root**.
- Single test: `pnpm exec vitest run <path>`. Suite: `pnpm test`. Types: `pnpm typecheck`. Lint: `pnpm lint`.
- Tests stub `useI18n` (echoes the key) and the global `Audio` with a `FakeAudio` (see `tests/composables/useEscapeRoomAudio.test.ts`).

---

### Task 1: TTS generation tool + the 14 OGG assets

**Files:**
- Create: `tools/particle-lab-audio/gen_voice.py`
- Create: `tools/particle-lab-audio/qa.py`
- Create: `tools/particle-lab-audio/SPEC.md`
- Create (generated): `munbeop/public/particle-lab/audio/sentence-*.ogg` (14)

- [ ] **Step 1: Write `gen_voice.py`**

Create `tools/particle-lab-audio/gen_voice.py`:

```python
#!/usr/bin/env python3
"""Generate the 14 Korean TTS sentence clips for the Particle Lab (Explore).

Mirrors tools/escape-room-level02-audio/gen_voice.py and REUSES its common.py
DSP (resample/trim/normalize/write_ogg/analyze). Each of the 14 base 해요체
sentences is cast to a fitting voice + age (≈70% female), with age expressed via
edge-tts pitch/rate (edge-tts ships only one ko-KR female voice). Output:
munbeop/public/particle-lab/audio/sentence-<id>.ogg (OGG/Vorbis, 44100, mono,
peak ≈ -2 dBFS). edge-tts is a network call; it need not be byte-deterministic.

Run from the repo root:
    python tools/particle-lab-audio/gen_voice.py
"""

from __future__ import annotations

import asyncio
import os
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal as sps

# Reuse the escape-room house DSP (write_ogg/analyze/constants) without copying.
ESC = Path(__file__).resolve().parents[1] / "escape-room-level02-audio"
sys.path.insert(0, str(ESC))
import common  # noqa: E402
from common import PEAK_VOICE_DBFS, SR, analyze, peak_dbfs, read_ogg, write_ogg  # noqa: E402

import edge_tts  # noqa: E402

OUT_DIR = common.REPO / "munbeop" / "public" / "particle-lab" / "audio"

TRIM_THRESH_DB = -45.0
TRIM_PAD_S = 0.06

# (id, Korean 해요체 text, voice, rate, pitch). Korean == the spacing gold strings
# (spacing.test.ts) + a period. ≈10 female / 4 male; age via pitch/rate.
CAST: list[tuple[str, str, str, str, str]] = [
    ("s01-jeoneun",     "저는 학생이에요.",               "ko-KR-SunHiNeural",  "+0%",  "+8Hz"),
    ("s02-goyangi",     "고양이가 우유를 마셔요.",          "ko-KR-SunHiNeural",  "+6%",  "+30Hz"),
    ("s03-hakgyo",      "학교에 가요.",                   "ko-KR-InJoonNeural", "+0%",  "+0Hz"),
    ("s04-doseogwan",   "도서관에서 공부해요.",            "ko-KR-SunHiNeural",  "-2%",  "+5Hz"),
    ("s05-jeodo",       "저도 커피를 좋아해요.",           "ko-KR-SunHiNeural",  "+0%",  "-5Hz"),
    ("s06-achime",      "아침에 빵을 먹어요.",             "ko-KR-HyunsuMultilingualNeural", "+0%", "+5Hz"),
    ("s07-biga",        "비가 와요.",                     "ko-KR-SunHiNeural",  "-12%", "-25Hz"),
    ("s08-chinguhante", "친구한테 편지를 써요.",           "ko-KR-SunHiNeural",  "+0%",  "+6Hz"),
    ("s09-beoseuro",    "버스로 학교에 가요.",             "ko-KR-SunHiNeural",  "+5%",  "+24Hz"),
    ("s10-ppangman",    "빵만 먹어요.",                   "ko-KR-SunHiNeural",  "+6%",  "+28Hz"),
    ("s11-sagwawa",     "사과와 바나나를 사요.",           "ko-KR-SunHiNeural",  "-2%",  "-3Hz"),
    ("s12-ahopsibuteo", "아홉 시부터 다섯 시까지 일해요.",   "ko-KR-InJoonNeural", "-4%",  "-6Hz"),
    ("s13-yeonpillo",   "연필로 편지를 써요.",             "ko-KR-SunHiNeural",  "-12%", "-22Hz"),
    ("s14-jeodo",       "저도 커피를 마셔요.",             "ko-KR-InJoonNeural", "-3%",  "-8Hz"),
]


def to_mono_44100(x: np.ndarray, sr: int) -> np.ndarray:
    """Downmix to mono and resample to SR (44100) with a polyphase filter."""
    x = np.asarray(x, dtype=np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        g = np.gcd(int(SR), int(sr))
        x = sps.resample_poly(x, SR // g, sr // g)
    return x.astype(np.float64)


def trim_silence(x: np.ndarray) -> np.ndarray:
    """Conservatively trim leading/trailing silence, keeping a 60 ms guard pad."""
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
    start = max(0, int(above[0]) - pad)
    end = min(x.size, int(above[-1]) + pad + 1)
    return x[start:end].copy()


async def synth_to_mp3(text: str, voice: str, rate: str, pitch: str, path: str) -> None:
    """Synthesize one line to MP3 via edge-tts (voice + rate + pitch)."""
    communicate = edge_tts.Communicate(text, voice=voice, rate=rate, pitch=pitch)
    await communicate.save(path)


async def build_one(sid: str, text: str, voice: str, rate: str, pitch: str) -> dict:
    fd, mp3_path = tempfile.mkstemp(suffix=".mp3")
    os.close(fd)
    try:
        await synth_to_mp3(text, voice, rate, pitch, mp3_path)
        raw, sr = sf.read(mp3_path, dtype="float32")
    finally:
        try:
            os.remove(mp3_path)
        except OSError:
            pass

    x = to_mono_44100(raw, sr)
    x = trim_silence(x)
    out_path = OUT_DIR / f"sentence-{sid}.ogg"
    write_ogg(out_path, x, peak_dbfs=PEAK_VOICE_DBFS)

    y, ysr = read_ogg(out_path)
    info = sf.info(str(out_path))
    metrics = analyze(y, ysr)
    pk = peak_dbfs(y)
    clipped = bool(np.any(np.abs(y) >= 0.999))
    ok = (
        info.samplerate == SR
        and info.channels == 1
        and info.format == "OGG"
        and 0.4 < metrics["dur_s"] < 8.0
        and pk <= -1.0
        and not clipped
    )
    return {
        "path": str(out_path).replace("\\", "/"),
        "seconds": metrics["dur_s"],
        "peak_dbfs": round(pk, 2),
        "voice": voice,
        "ok": ok,
    }


async def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for i, (sid, text, voice, rate, pitch) in enumerate(CAST, 1):
        res = await build_one(sid, text, voice, rate, pitch)
        results.append(res)
        flag = "OK " if res["ok"] else "BAD"
        print(f"[{i:2d}/14] {flag} {res['seconds']:5.2f}s  peak {res['peak_dbfs']:6.2f}  "
              f"{res['voice'].split('-')[-1]:24s}  {res['path'].split('/audio/')[-1]}")
    n_ok = sum(1 for r in results if r["ok"])
    all_ok = n_ok == len(CAST)
    print(f"\n{n_ok}/{len(CAST)} OK · all_ok={all_ok}")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
```

- [ ] **Step 2: Run the generator (network call to edge-tts)**

Run from the repo root: `python tools/particle-lab-audio/gen_voice.py`
Expected: `[ 1/14] OK …` through `[14/14] OK …`, then `14/14 OK · all_ok=True`. The 14 OGGs now exist under `munbeop/public/particle-lab/audio/`.

If edge-tts rejects `pitch` on `ko-KR-HyunsuMultilingualNeural` (multilingual voices can ignore pitch), change s06's voice to `ko-KR-InJoonNeural` and re-run.

- [ ] **Step 3: Write `qa.py` and verify the 14 files**

Create `tools/particle-lab-audio/qa.py`:

```python
#!/usr/bin/env python3
"""QA the 14 Particle Lab sentence OGGs: format, mono, 44100, duration, peak."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ESC = Path(__file__).resolve().parents[1] / "escape-room-level02-audio"
sys.path.insert(0, str(ESC))
import common  # noqa: E402
from common import SR, peak_dbfs, read_ogg  # noqa: E402

AUDIO = common.REPO / "munbeop" / "public" / "particle-lab" / "audio"
IDS = [
    "s01-jeoneun", "s02-goyangi", "s03-hakgyo", "s04-doseogwan", "s05-jeodo",
    "s06-achime", "s07-biga", "s08-chinguhante", "s09-beoseuro", "s10-ppangman",
    "s11-sagwawa", "s12-ahopsibuteo", "s13-yeonpillo", "s14-jeodo",
]


def main() -> int:
    bad = 0
    for sid in IDS:
        p = AUDIO / f"sentence-{sid}.ogg"
        if not p.exists():
            print(f"MISSING {p}")
            bad += 1
            continue
        info = sf.info(str(p))
        y, ysr = read_ogg(p)
        dur = y.shape[0] / ysr
        pk = peak_dbfs(y)
        clipped = bool(np.any(np.abs(y) >= 0.999))
        ok = (info.format == "OGG" and info.channels == 1 and info.samplerate == SR
              and 0.4 < dur < 8.0 and pk <= -1.0 and not clipped)
        print(f"{'OK ' if ok else 'BAD'} {sid:16s} {dur:5.2f}s peak {pk:6.2f} "
              f"{info.samplerate}Hz/{info.channels}ch/{info.format}")
        if not ok:
            bad += 1
    print(f"\n{len(IDS) - bad}/{len(IDS)} OK")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
```

Run from the repo root: `python tools/particle-lab-audio/qa.py`
Expected: 14 `OK` lines, `14/14 OK`.

- [ ] **Step 4: Write `SPEC.md`**

Create `tools/particle-lab-audio/SPEC.md`:

```markdown
# Particle Lab audio — TTS voice clips

Pre-generated Korean TTS for the 14 Explore sentences (`/practice/particles`).

- **Engine:** edge-tts (Microsoft neural, free, no API key). Network call.
- **Format:** OGG/Vorbis, 44100 Hz, mono, peak ≈ −2 dBFS (house writer
  `common.write_ogg`, reused from `tools/escape-room-level02-audio/`).
- **Output:** `munbeop/public/particle-lab/audio/sentence-<id>.ogg` (14 files).
- **Casting:** ≈70% female / 30% male. edge-tts has one ko-KR female voice
  (SunHi) + two male (InJoon, Hyunsu); age (child / young / adult / older) is
  expressed via `pitch` + `rate`. See the `CAST` table in `gen_voice.py`.
- **Regenerate:** `python tools/particle-lab-audio/gen_voice.py` then
  `python tools/particle-lab-audio/qa.py` (from the repo root).
- The Korean texts are the base 해요체 / all-particles-ON sentences (the
  `correctSpacing` gold strings from `spacing.test.ts`) + a period.
```

- [ ] **Step 5: Commit the tool + assets**

```bash
git add tools/particle-lab-audio munbeop/public/particle-lab
git commit -m "$(cat <<'EOF'
feat(particles): TTS pipeline + 14 cast Korean sentence clips (Explore)

edge-tts → OGG, reusing the escape-room common.py DSP. ~70% female voices,
age via pitch/rate. QA-verified (format/duration/peak/mono).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `useParticleAudio` composable

**Files:**
- Create: `munbeop/app/composables/useParticleAudio.ts`
- Test: `munbeop/tests/composables/useParticleAudio.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/composables/useParticleAudio.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  useParticleAudio,
  sentenceAudioSrc,
  _resetParticleAudioForTest,
} from '~/composables/useParticleAudio'

const created: FakeAudio[] = []
class FakeAudio {
  src: string
  volume = 1
  paused = true
  play = vi.fn(async () => {
    this.paused = false
  })
  pause = vi.fn(() => {
    this.paused = true
  })
  addEventListener = vi.fn()
  constructor(src?: string) {
    this.src = src ?? ''
    created.push(this)
  }
}

describe('useParticleAudio', () => {
  beforeEach(() => {
    created.length = 0
    vi.stubGlobal('Audio', FakeAudio)
    _resetParticleAudioForTest()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('derives the public path from the sentence id', () => {
    expect(sentenceAudioSrc('s01-jeoneun')).toBe('/particle-lab/audio/sentence-s01-jeoneun.ogg')
  })

  it('playSentence creates an Audio at the derived src and plays it', () => {
    const { playSentence } = useParticleAudio()
    playSentence('s01-jeoneun')
    expect(created.length).toBe(1)
    expect(created[0]!.src).toContain('/particle-lab/audio/sentence-s01-jeoneun.ogg')
    expect(created[0]!.play).toHaveBeenCalled()
  })

  it('a new playSentence cancels the previous one', () => {
    const { playSentence } = useParticleAudio()
    playSentence('s01-jeoneun')
    const first = created[0]!
    playSentence('s02-goyangi')
    expect(first.pause).toHaveBeenCalled()
    expect(created[created.length - 1]!.src).toContain('sentence-s02-goyangi.ogg')
  })

  it('stop pauses the active clip', () => {
    const { playSentence, stop } = useParticleAudio()
    playSentence('s01-jeoneun')
    const a = created[0]!
    stop()
    expect(a.pause).toHaveBeenCalled()
  })

  it('is SSR-safe and tolerates a play() rejection', async () => {
    vi.stubGlobal('Audio', undefined)
    _resetParticleAudioForTest()
    const { playSentence, stop } = useParticleAudio()
    expect(() => {
      playSentence('s01-jeoneun')
      stop()
    }).not.toThrow()

    class RejectingAudio extends FakeAudio {
      override play = vi.fn(async () => {
        throw new Error('NotAllowedError')
      })
    }
    vi.stubGlobal('Audio', RejectingAudio)
    _resetParticleAudioForTest()
    const { playSentence: play2 } = useParticleAudio()
    expect(() => play2('s01-jeoneun')).not.toThrow()
    await Promise.resolve()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run tests/composables/useParticleAudio.test.ts`
Expected: FAIL — module not found / exports undefined.

- [ ] **Step 3: Write the composable**

Create `munbeop/app/composables/useParticleAudio.ts`:

```ts
/**
 * Particle Lab voice playback — one sentence clip at a time.
 *
 * A trimmed sibling of useEscapeRoomAudio's voice channel: module singleton,
 * SSR-safe (guards `window`/`Audio`), error-tolerant (404/codec/autoplay → stay
 * silent). No enable toggle / autoplay — playback is opt-in via the 🔊 button,
 * so a missing OGG simply does nothing.
 */

const VOICE_VOL = 0.95

let voice: HTMLAudioElement | null = null

function audioAvailable(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined'
}

function makeAudio(src: string): HTMLAudioElement | null {
  if (!audioAvailable()) return null
  const a = new Audio(src)
  a.addEventListener('error', () => {
    /* 404 / codec failure — stay silent */
  })
  return a
}

function safePlay(a: HTMLAudioElement | null) {
  if (!a) return
  try {
    const p = a.play()
    if (p && typeof (p as Promise<void>).catch === 'function') {
      ;(p as Promise<void>).catch(() => {
        /* autoplay blocked / file missing — stay silent */
      })
    }
  } catch {
    /* play() threw synchronously (test env) — stay silent */
  }
}

/** Public asset path for a sentence's audio clip. */
export function sentenceAudioSrc(id: string): string {
  return `/particle-lab/audio/sentence-${id}.ogg`
}

export function useParticleAudio() {
  function playSentence(id: string) {
    if (!audioAvailable() || !id) return
    if (voice) {
      try {
        voice.pause()
      } catch {
        /* dead element */
      }
    }
    const a = makeAudio(sentenceAudioSrc(id))
    if (!a) return
    a.volume = VOICE_VOL
    voice = a
    safePlay(a)
  }

  function stop() {
    if (!voice) return
    try {
      voice.pause()
    } catch {
      /* dead element */
    }
    voice = null
  }

  return { playSentence, stop }
}

// Test-only: clear the singleton between cases.
export function _resetParticleAudioForTest() {
  voice = null
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run tests/composables/useParticleAudio.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/composables/useParticleAudio.ts munbeop/tests/composables/useParticleAudio.test.ts
git commit -m "$(cat <<'EOF'
feat(particles): useParticleAudio — one-at-a-time sentence playback

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `SentenceAudioButton.vue` + component test

**Files:**
- Create: `munbeop/app/components/particle-lab/SentenceAudioButton.vue`
- Test: `munbeop/tests/components/particle-lab/SentenceAudioButton.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/particle-lab/SentenceAudioButton.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SentenceAudioButton from '~/components/particle-lab/SentenceAudioButton.vue'
import { _resetParticleAudioForTest } from '~/composables/useParticleAudio'

const created: FakeAudio[] = []
class FakeAudio {
  src: string
  volume = 1
  play = vi.fn(async () => {})
  pause = vi.fn()
  addEventListener = vi.fn()
  constructor(src?: string) {
    this.src = src ?? ''
    created.push(this)
  }
}

describe('SentenceAudioButton', () => {
  beforeEach(() => {
    created.length = 0
    vi.stubGlobal('Audio', FakeAudio)
    _resetParticleAudioForTest()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders a button with the i18n aria-label', () => {
    const w = mount(SentenceAudioButton, { props: { sentenceId: 's01-jeoneun' } })
    const btn = w.get('[data-testid="sentence-audio"]')
    expect(btn.attributes('aria-label')).toBe('particles.explore.play_audio')
  })

  it('plays the sentence clip on click', async () => {
    const w = mount(SentenceAudioButton, { props: { sentenceId: 's03-hakgyo' } })
    await w.get('[data-testid="sentence-audio"]').trigger('click')
    expect(created.length).toBe(1)
    expect(created[0]!.src).toContain('sentence-s03-hakgyo.ogg')
    expect(created[0]!.play).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run tests/components/particle-lab/SentenceAudioButton.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Write the component**

Create `munbeop/app/components/particle-lab/SentenceAudioButton.vue`:

```vue
<script setup lang="ts">
import { useParticleAudio } from '~/composables/useParticleAudio'

/** 🔊 button that plays a sentence's pre-generated TTS clip. */
interface Props {
  sentenceId: string
}
const props = defineProps<Props>()
const { t } = useI18n()
const { playSentence } = useParticleAudio()
</script>

<template>
  <button
    type="button"
    class="audio-btn"
    :aria-label="t('particles.explore.play_audio')"
    data-testid="sentence-audio"
    @click="playSentence(props.sentenceId)"
  >
    <span aria-hidden="true">🔊</span>
  </button>
</template>

<style scoped>
.audio-btn {
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--surface);
  border: 2px solid var(--border);
  font-size: var(--text-md);
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    border-color var(--motion-quick) var(--ease-out);
}
.audio-btn:hover {
  transform: translate(-1px, -1px);
  border-color: var(--accent);
}
.audio-btn:active {
  transform: translate(0, 0);
}
.audio-btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run tests/components/particle-lab/SentenceAudioButton.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/particle-lab/SentenceAudioButton.vue munbeop/tests/components/particle-lab/SentenceAudioButton.test.ts
git commit -m "$(cat <<'EOF'
feat(particles): SentenceAudioButton — 🔊 plays the sentence clip

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: i18n key (×8 locales)

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`

Add `play_audio` inside the existing `particles.explore` object in each locale.

- [ ] **Step 1: Insert the key with an idempotent script**

Create `munbeop/_tmp_audio_i18n.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs'

const V = {
  en: 'Play pronunciation',
  es: 'Escuchar pronunciación',
  fr: 'Écouter la prononciation',
  'pt-BR': 'Ouvir a pronúncia',
  id: 'Putar pelafalan',
  vi: 'Nghe phát âm',
  th: 'ฟังการออกเสียง',
  ja: '発音を聞く',
}

// Anchor on the existing explore key `tap_hint` (present in all 8, first explore key).
for (const [loc, val] of Object.entries(V)) {
  const path = `i18n/locales/${loc}.json`
  let txt = readFileSync(path, 'utf8')
  if (!txt.includes('"play_audio"')) {
    txt = txt.replace(
      /("explore":\s*\{\s*\n)(\s*)("tap_hint")/,
      (_m, open, indent, key) => `${open}${indent}"play_audio": ${JSON.stringify(val)},\n${indent}${key}`,
    )
  }
  JSON.parse(txt)
  writeFileSync(path, txt)
  console.log(`ok ${loc}`)
}
console.log('done')
```

- [ ] **Step 2: Run it, delete it, validate**

Run (from `munbeop/`):
```bash
node _tmp_audio_i18n.mjs && rm _tmp_audio_i18n.mjs && node -e "const fs=require('fs'); for (const l of ['en','es','fr','pt-BR','th','id','vi','ja']) { const e=JSON.parse(fs.readFileSync('./i18n/locales/'+l+'.json','utf8')).particles.explore; if(!e.play_audio) throw new Error('missing '+l); } console.log('all 8 play_audio OK');"
```
Expected: `ok en … ok ja`, `done`, `all 8 play_audio OK`.

- [ ] **Step 3: Commit**

```bash
git add munbeop/i18n/locales/*.json
git commit -m "$(cat <<'EOF'
feat(particles): i18n play_audio label for the Explore 🔊 button (×8)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Wire the 🔊 button into `ExploreMode.vue`

**Files:**
- Modify: `munbeop/app/components/particle-lab/ExploreMode.vue`

- [ ] **Step 1: Import the button**

Add to the imports (next to the other `./` component imports):

```ts
import SentenceAudioButton from './SentenceAudioButton.vue'
```

- [ ] **Step 2: Render it above the sentence**

Insert the button between the formality control and `ParticleSentence`. Replace:

```vue
    <ParticleSentence
      :sentence="explore.sentence.value"
      :off="explore.off.value"
      :level="explore.level.value"
      @toggle="explore.toggle"
    />
```

with:

```vue
    <SentenceAudioButton :sentence-id="explore.sentence.value.id" />

    <ParticleSentence
      :sentence="explore.sentence.value"
      :off="explore.off.value"
      :level="explore.level.value"
      @toggle="explore.toggle"
    />
```

- [ ] **Step 3: Typecheck + full suite**

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm test`
Expected: PASS — all prior tests plus `useParticleAudio` (5) and `SentenceAudioButton` (2); zero failures.

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/components/particle-lab/ExploreMode.vue
git commit -m "$(cat <<'EOF'
feat(particles): show the 🔊 sentence-audio button in Explore mode

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Verification — gates + adversarial Workflow + finish

**Files:** none.

- [ ] **Step 1: Run the gates + audio QA**

```bash
pnpm test
pnpm typecheck
pnpm lint
python tools/particle-lab-audio/qa.py
```
Expected: suite green, no type errors, 0 lint errors, `14/14 OK`. Fix and re-run on any issue.

- [ ] **Step 2: Adversarial Workflow**

Launch a Workflow with two checks:
- **Cast review** — given the 14 `CAST` rows (sentence + persona + voice + rate + pitch), judge whether each persona fits the sentence's likely speaker and whether the female/male mix is ≈70/30; flag any awkward cast with a concrete swap. (Listening isn't possible; judge from text + casting choices.)
- **8-locale i18n audit** — `particles.explore.play_audio` reads naturally as a 🔊 button label in each locale.

Apply any agreed fixes (update the `CAST` table + re-run gen/qa for changed rows; update locale strings), then re-run Step 1. Target: 0 blockers.

- [ ] **Step 3: Manual smoke (logged-in, route auth-gated)**

Document for the user (`/practice/particles`, Explore): the 🔊 button plays each sentence in its cast voice; rapid clicks don't overlap (new cancels old); navigating sentences then playing uses the current sentence's clip; with the OGG present the sound plays in Chrome/Edge/Firefox.

- [ ] **Step 4: Finish the branch**

Use superpowers:finishing-a-development-branch. On the user's choice (merge / PR), land it; pushing to main triggers the Vercel production deploy.

---

## Self-Review (completed during planning)

- **Spec coverage:** gen tool + 14 cast OGGs (Task 1), composable (Task 2), button (Task 3), i18n (Task 4), Explore wiring (Task 5), gates + adversarial cast/i18n + finish (Task 6). All spec sections map to a task.
- **Placeholder scan:** every step has complete code; the gen script ships the full `CAST`; i18n ships all 8 values.
- **Type consistency:** `useParticleAudio` exports `playSentence`/`stop`/`sentenceAudioSrc`/`_resetParticleAudioForTest`, used identically in Tasks 2/3; the OGG path `/particle-lab/audio/sentence-<id>.ogg` is produced by `gen_voice.py` (Task 1) and consumed by `sentenceAudioSrc` (Task 2) and asserted in both tests; `SentenceAudioButton` prop `sentenceId` matches the `ExploreMode` binding `explore.sentence.value.id` (Task 5); i18n key `particles.explore.play_audio` (Task 4) is the one the button reads (Task 3).
```