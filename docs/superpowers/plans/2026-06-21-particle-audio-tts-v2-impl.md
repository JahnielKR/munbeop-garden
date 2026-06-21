# Particle Lab audio TTS (v2 — formality) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Regenerate the Particle Lab TTS as 42 clips (14 sentences × 합니다체/해요체/반말) and make the 🔊 button play the clip matching the current Explore formality level, plus add 🔊 to Spacing mode.

**Architecture:** `gen_voice.py` builds `sentence-<id>-<level>.ogg` for all three levels (one cast voice per sentence, reused from v1). `useParticleAudio`/`SentenceAudioButton` gain a `level` arg/prop; `ExploreMode` passes the slider's level, `SpacingCard` defaults to polite. A pure-TS contract test pins the 42 synthesized texts to the seed.

**Tech Stack:** Python 3.13 + edge-tts (asset gen); Nuxt 4 SPA, Vue 3, TypeScript, Vitest + @vue/test-utils, pnpm.

**Conventions:**
- Spec: `docs/superpowers/specs/2026-06-21-particle-audio-tts-v2-design.md`.
- App paths relative to repo root (app under `munbeop/`). JS from `munbeop/`; Python from the repo root.
- Single test: `pnpm exec vitest run <path>`. Suite: `pnpm test`. Types: `pnpm typecheck`. Lint: `pnpm lint`.
- `SpeechLevel = 'formal' | 'polite' | 'casual'` from `~/lib/domain`. `tokenText(token, level)` from `~/lib/particle-lab`.

---

### Task 1: Regenerate 42 leveled clips

**Files:**
- Modify: `tools/particle-lab-audio/gen_voice.py`
- Modify: `tools/particle-lab-audio/qa.py`
- Modify: `tools/particle-lab-audio/SPEC.md`
- Replace (generated): `munbeop/public/particle-lab/audio/sentence-<id>-<level>.ogg` (42; old 14 removed)

- [ ] **Step 1: Rewrite `gen_voice.py` to build 42 leveled clips**

Replace the whole body of `tools/particle-lab-audio/gen_voice.py` with:

```python
#!/usr/bin/env python3
"""Generate the 42 Korean TTS sentence clips for the Particle Lab (Explore).

14 Explore sentences x 3 speech levels (합니다체/해요체/반말). Mirrors
tools/escape-room-level02-audio/gen_voice.py and REUSES its common.py DSP. Each
sentence keeps ONE cast voice across its 3 levels (formality changes how it is
said, not who says it); age is expressed via edge-tts pitch/rate. Output:
munbeop/public/particle-lab/audio/sentence-<id>-<level>.ogg (OGG/Vorbis, 44100,
mono, peak ~ -2 dBFS). edge-tts is a network call.

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

ESC = Path(__file__).resolve().parents[1] / "escape-room-level02-audio"
sys.path.insert(0, str(ESC))
import common  # noqa: E402
from common import PEAK_VOICE_DBFS, SR, analyze, peak_dbfs, read_ogg, write_ogg  # noqa: E402

import edge_tts  # noqa: E402

OUT_DIR = common.REPO / "munbeop" / "public" / "particle-lab" / "audio"

TRIM_THRESH_DB = -45.0
TRIM_PAD_S = 0.06

# One cast (voice, rate, pitch) per sentence, applied to all 3 levels. ~10 F / 4 M.
CAST: dict[str, tuple[str, str, str]] = {
    "s01-jeoneun":     ("ko-KR-SunHiNeural",  "+0%",  "+8Hz"),
    "s02-goyangi":     ("ko-KR-SunHiNeural",  "+6%",  "+30Hz"),
    "s03-hakgyo":      ("ko-KR-InJoonNeural", "+0%",  "+0Hz"),
    "s04-doseogwan":   ("ko-KR-SunHiNeural",  "-2%",  "+5Hz"),
    "s05-jeodo":       ("ko-KR-SunHiNeural",  "+0%",  "-5Hz"),
    "s06-achime":      ("ko-KR-HyunsuMultilingualNeural", "+0%", "+5Hz"),
    "s07-biga":        ("ko-KR-SunHiNeural",  "+0%",  "-4Hz"),
    "s08-chinguhante": ("ko-KR-SunHiNeural",  "+0%",  "+6Hz"),
    "s09-beoseuro":    ("ko-KR-SunHiNeural",  "+5%",  "+24Hz"),
    "s10-ppangman":    ("ko-KR-SunHiNeural",  "+6%",  "+28Hz"),
    "s11-sagwawa":     ("ko-KR-SunHiNeural",  "-2%",  "-3Hz"),
    "s12-ahopsibuteo": ("ko-KR-InJoonNeural", "-4%",  "-6Hz"),
    "s13-yeonpillo":   ("ko-KR-SunHiNeural",  "-12%", "-22Hz"),
    "s14-jeodo":       ("ko-KR-InJoonNeural", "-3%",  "-8Hz"),
}

# (id, level, text) — Korean from the seed byLevel (predicate ending + 저->나 in 반말).
LEVELED: list[tuple[str, str, str]] = [
    ("s01-jeoneun", "formal", "저는 학생입니다."),
    ("s01-jeoneun", "polite", "저는 학생이에요."),
    ("s01-jeoneun", "casual", "나는 학생이야."),
    ("s02-goyangi", "formal", "고양이가 우유를 마십니다."),
    ("s02-goyangi", "polite", "고양이가 우유를 마셔요."),
    ("s02-goyangi", "casual", "고양이가 우유를 마셔."),
    ("s03-hakgyo", "formal", "학교에 갑니다."),
    ("s03-hakgyo", "polite", "학교에 가요."),
    ("s03-hakgyo", "casual", "학교에 가."),
    ("s04-doseogwan", "formal", "도서관에서 공부합니다."),
    ("s04-doseogwan", "polite", "도서관에서 공부해요."),
    ("s04-doseogwan", "casual", "도서관에서 공부해."),
    ("s05-jeodo", "formal", "저도 커피를 좋아합니다."),
    ("s05-jeodo", "polite", "저도 커피를 좋아해요."),
    ("s05-jeodo", "casual", "나도 커피를 좋아해."),
    ("s06-achime", "formal", "아침에 빵을 먹습니다."),
    ("s06-achime", "polite", "아침에 빵을 먹어요."),
    ("s06-achime", "casual", "아침에 빵을 먹어."),
    ("s07-biga", "formal", "비가 옵니다."),
    ("s07-biga", "polite", "비가 와요."),
    ("s07-biga", "casual", "비가 와."),
    ("s08-chinguhante", "formal", "친구한테 편지를 씁니다."),
    ("s08-chinguhante", "polite", "친구한테 편지를 써요."),
    ("s08-chinguhante", "casual", "친구한테 편지를 써."),
    ("s09-beoseuro", "formal", "버스로 학교에 갑니다."),
    ("s09-beoseuro", "polite", "버스로 학교에 가요."),
    ("s09-beoseuro", "casual", "버스로 학교에 가."),
    ("s10-ppangman", "formal", "빵만 먹습니다."),
    ("s10-ppangman", "polite", "빵만 먹어요."),
    ("s10-ppangman", "casual", "빵만 먹어."),
    ("s11-sagwawa", "formal", "사과와 바나나를 삽니다."),
    ("s11-sagwawa", "polite", "사과와 바나나를 사요."),
    ("s11-sagwawa", "casual", "사과와 바나나를 사."),
    ("s12-ahopsibuteo", "formal", "아홉 시부터 다섯 시까지 일합니다."),
    ("s12-ahopsibuteo", "polite", "아홉 시부터 다섯 시까지 일해요."),
    ("s12-ahopsibuteo", "casual", "아홉 시부터 다섯 시까지 일해."),
    ("s13-yeonpillo", "formal", "연필로 편지를 씁니다."),
    ("s13-yeonpillo", "polite", "연필로 편지를 써요."),
    ("s13-yeonpillo", "casual", "연필로 편지를 써."),
    ("s14-jeodo", "formal", "저도 커피를 마십니다."),
    ("s14-jeodo", "polite", "저도 커피를 마셔요."),
    ("s14-jeodo", "casual", "나도 커피를 마셔."),
]


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
    start = max(0, int(above[0]) - pad)
    end = min(x.size, int(above[-1]) + pad + 1)
    return x[start:end].copy()


async def synth_to_mp3(text: str, voice: str, rate: str, pitch: str, path: str) -> None:
    communicate = edge_tts.Communicate(text, voice=voice, rate=rate, pitch=pitch)
    await communicate.save(path)


async def build_one(sid: str, level: str, text: str) -> dict:
    voice, rate, pitch = CAST[sid]
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
    out_path = OUT_DIR / f"sentence-{sid}-{level}.ogg"
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
    return {"name": f"sentence-{sid}-{level}.ogg", "seconds": metrics["dur_s"],
            "peak_dbfs": round(pk, 2), "ok": ok}


async def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for i, (sid, level, text) in enumerate(LEVELED, 1):
        res = await build_one(sid, level, text)
        results.append(res)
        flag = "OK " if res["ok"] else "BAD"
        print(f"[{i:2d}/42] {flag} {res['seconds']:5.2f}s  peak {res['peak_dbfs']:6.2f}  {res['name']}")
    n_ok = sum(1 for r in results if r["ok"])
    all_ok = n_ok == len(LEVELED)
    print(f"\n{n_ok}/{len(LEVELED)} OK · all_ok={all_ok}")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
```

- [ ] **Step 2: Remove the v1 clips and regenerate all 42**

Run from the repo root:
```bash
rm -f munbeop/public/particle-lab/audio/sentence-s*.ogg
python tools/particle-lab-audio/gen_voice.py
```
Expected: `[ 1/42] OK …` through `[42/42] OK …`, `42/42 OK · all_ok=True`. The audio dir now holds 42 `sentence-<id>-<level>.ogg` and none of the old 14.

- [ ] **Step 3: Update `qa.py` to check 42**

In `tools/particle-lab-audio/qa.py`, replace the `IDS` list and the loop with:

```python
IDS = [
    "s01-jeoneun", "s02-goyangi", "s03-hakgyo", "s04-doseogwan", "s05-jeodo",
    "s06-achime", "s07-biga", "s08-chinguhante", "s09-beoseuro", "s10-ppangman",
    "s11-sagwawa", "s12-ahopsibuteo", "s13-yeonpillo", "s14-jeodo",
]
LEVELS = ["formal", "polite", "casual"]


def main() -> int:
    bad = 0
    n = 0
    for sid in IDS:
        for level in LEVELS:
            n += 1
            p = AUDIO / f"sentence-{sid}-{level}.ogg"
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
            print(f"{'OK ' if ok else 'BAD'} {sid+'-'+level:24s} {dur:5.2f}s peak {pk:6.2f}")
            if not ok:
                bad += 1
    print(f"\n{n - bad}/{n} OK")
    return 1 if bad else 0
```

Run from the repo root: `python tools/particle-lab-audio/qa.py`
Expected: 42 `OK` lines, `42/42 OK`.

- [ ] **Step 4: Update `SPEC.md`**

In `tools/particle-lab-audio/SPEC.md`, change the Output line to:
```markdown
- **Output:** `munbeop/public/particle-lab/audio/sentence-<id>-<level>.ogg`
  (42 files = 14 sentences × 3 levels: formal / polite / casual). One cast voice
  per sentence across its levels.
```

- [ ] **Step 5: Commit the tool + 42 assets**

```bash
git add tools/particle-lab-audio munbeop/public/particle-lab
git commit -m "$(cat <<'EOF'
feat(particles): regenerate TTS as 42 leveled clips (합니다체/해요체/반말)

One cast voice per sentence across its 3 speech levels; uniform
sentence-<id>-<level>.ogg naming. QA 42/42.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `useParticleAudio` — level-aware path

**Files:**
- Modify: `munbeop/app/composables/useParticleAudio.ts`
- Modify: `munbeop/tests/composables/useParticleAudio.test.ts`

- [ ] **Step 1: Update the test**

In `munbeop/tests/composables/useParticleAudio.test.ts`, replace the `sentenceAudioSrc` and the first two `playSentence` assertions:

```ts
  it('derives the public path from the sentence id and level', () => {
    expect(sentenceAudioSrc('s01-jeoneun')).toBe('/particle-lab/audio/sentence-s01-jeoneun-polite.ogg')
    expect(sentenceAudioSrc('s01-jeoneun', 'formal')).toBe('/particle-lab/audio/sentence-s01-jeoneun-formal.ogg')
    expect(sentenceAudioSrc('s05-jeodo', 'casual')).toBe('/particle-lab/audio/sentence-s05-jeodo-casual.ogg')
  })

  it('playSentence creates an Audio at the derived src and plays it', () => {
    const { playSentence } = useParticleAudio()
    playSentence('s01-jeoneun', 'formal')
    expect(created.length).toBe(1)
    expect(created[0]!.src).toContain('/particle-lab/audio/sentence-s01-jeoneun-formal.ogg')
    expect(created[0]!.play).toHaveBeenCalled()
  })

  it('defaults to the polite level', () => {
    const { playSentence } = useParticleAudio()
    playSentence('s02-goyangi')
    expect(created[0]!.src).toContain('sentence-s02-goyangi-polite.ogg')
  })
```

(Leave the cancel/stop/SSR tests; update their `playSentence` calls' expected src to `-polite` where they assert a path: the "cancels the previous" test now expects `sentence-s02-goyangi-polite.ogg`.)

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run tests/composables/useParticleAudio.test.ts`
Expected: FAIL — `sentenceAudioSrc` ignores the level arg / paths lack `-polite`.

- [ ] **Step 3: Update the composable**

In `munbeop/app/composables/useParticleAudio.ts`, add the import and change the two functions:

```ts
import type { SpeechLevel } from '~/lib/domain'
```

```ts
/** Public asset path for a sentence's audio clip at a speech level. */
export function sentenceAudioSrc(id: string, level: SpeechLevel = 'polite'): string {
  return `/particle-lab/audio/sentence-${id}-${level}.ogg`
}
```

```ts
  function playSentence(id: string, level: SpeechLevel = 'polite') {
    if (!audioAvailable() || !id) return
    if (voice) {
      try {
        voice.pause()
      } catch {
        /* dead element */
      }
    }
    const a = makeAudio(sentenceAudioSrc(id, level))
    if (!a) return
    a.volume = VOICE_VOL
    voice = a
    safePlay(a)
  }
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run tests/composables/useParticleAudio.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/composables/useParticleAudio.ts munbeop/tests/composables/useParticleAudio.test.ts
git commit -m "$(cat <<'EOF'
feat(particles): useParticleAudio plays a clip per speech level

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `SentenceAudioButton` — `level` prop

**Files:**
- Modify: `munbeop/app/components/particle-lab/SentenceAudioButton.vue`
- Modify: `munbeop/tests/components/particle-lab/SentenceAudioButton.test.ts`

- [ ] **Step 1: Update the test**

In `munbeop/tests/components/particle-lab/SentenceAudioButton.test.ts`, change the "plays" test and add a level case:

```ts
  it('plays the polite clip by default on click', async () => {
    const w = mount(SentenceAudioButton, { props: { sentenceId: 's03-hakgyo' } })
    await w.get('[data-testid="sentence-audio"]').trigger('click')
    expect(created.length).toBe(1)
    expect(created[0]!.src).toContain('sentence-s03-hakgyo-polite.ogg')
    expect(created[0]!.play).toHaveBeenCalled()
  })

  it('plays the clip for the given level', async () => {
    const w = mount(SentenceAudioButton, { props: { sentenceId: 's03-hakgyo', level: 'casual' } })
    await w.get('[data-testid="sentence-audio"]').trigger('click')
    expect(created[0]!.src).toContain('sentence-s03-hakgyo-casual.ogg')
  })
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run tests/components/particle-lab/SentenceAudioButton.test.ts`
Expected: FAIL — paths lack `-polite`/`-casual`.

- [ ] **Step 3: Update the component**

In `munbeop/app/components/particle-lab/SentenceAudioButton.vue`, change the script + click:

```vue
<script setup lang="ts">
import type { SpeechLevel } from '~/lib/domain'
import { useParticleAudio } from '~/composables/useParticleAudio'

/** 🔊 button that plays a sentence's pre-generated TTS clip at a speech level. */
interface Props {
  sentenceId: string
  level?: SpeechLevel
}
const props = defineProps<Props>()
const { t } = useI18n()
const { playSentence } = useParticleAudio()
</script>
```

```vue
    @click="playSentence(props.sentenceId, props.level ?? 'polite')"
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run tests/components/particle-lab/SentenceAudioButton.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/particle-lab/SentenceAudioButton.vue munbeop/tests/components/particle-lab/SentenceAudioButton.test.ts
git commit -m "$(cat <<'EOF'
feat(particles): SentenceAudioButton takes a speech-level prop

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Audio↔seed contract test

**Files:**
- Create: `munbeop/tests/unit/particle-lab/audio-text.test.ts`

- [ ] **Step 1: Write the test**

Create `munbeop/tests/unit/particle-lab/audio-text.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { tokenText } from '~/lib/particle-lab'
import { PARTICLE_SENTENCES } from '~/seed/particle-sentences'
import type { LabSentence, SpeechLevel } from '~/lib/domain'

/** The exact Korean the TTS tool synthesizes per (id, level) — must match the seed. */
const GOLD: Record<string, Record<SpeechLevel, string>> = {
  's01-jeoneun': { formal: '저는 학생입니다.', polite: '저는 학생이에요.', casual: '나는 학생이야.' },
  's02-goyangi': { formal: '고양이가 우유를 마십니다.', polite: '고양이가 우유를 마셔요.', casual: '고양이가 우유를 마셔.' },
  's03-hakgyo': { formal: '학교에 갑니다.', polite: '학교에 가요.', casual: '학교에 가.' },
  's04-doseogwan': { formal: '도서관에서 공부합니다.', polite: '도서관에서 공부해요.', casual: '도서관에서 공부해.' },
  's05-jeodo': { formal: '저도 커피를 좋아합니다.', polite: '저도 커피를 좋아해요.', casual: '나도 커피를 좋아해.' },
  's06-achime': { formal: '아침에 빵을 먹습니다.', polite: '아침에 빵을 먹어요.', casual: '아침에 빵을 먹어.' },
  's07-biga': { formal: '비가 옵니다.', polite: '비가 와요.', casual: '비가 와.' },
  's08-chinguhante': { formal: '친구한테 편지를 씁니다.', polite: '친구한테 편지를 써요.', casual: '친구한테 편지를 써.' },
  's09-beoseuro': { formal: '버스로 학교에 갑니다.', polite: '버스로 학교에 가요.', casual: '버스로 학교에 가.' },
  's10-ppangman': { formal: '빵만 먹습니다.', polite: '빵만 먹어요.', casual: '빵만 먹어.' },
  's11-sagwawa': { formal: '사과와 바나나를 삽니다.', polite: '사과와 바나나를 사요.', casual: '사과와 바나나를 사.' },
  's12-ahopsibuteo': { formal: '아홉 시부터 다섯 시까지 일합니다.', polite: '아홉 시부터 다섯 시까지 일해요.', casual: '아홉 시부터 다섯 시까지 일해.' },
  's13-yeonpillo': { formal: '연필로 편지를 씁니다.', polite: '연필로 편지를 써요.', casual: '연필로 편지를 써.' },
  's14-jeodo': { formal: '저도 커피를 마십니다.', polite: '저도 커피를 마셔요.', casual: '나도 커피를 마셔.' },
}

/** Assemble a sentence's surface at a level (eojeols joined by space, + period). */
function assemble(s: LabSentence, level: SpeechLevel): string {
  return s.eojeols.map((eo) => eo.map((tok) => tokenText(tok, level)).join('')).join(' ') + '.'
}

describe('audio ↔ seed text contract', () => {
  it('the 42 synthesized strings match the seed assembly at every level', () => {
    const levels: SpeechLevel[] = ['formal', 'polite', 'casual']
    for (const s of PARTICLE_SENTENCES) {
      const gold = GOLD[s.id]
      expect(gold, `gold missing for ${s.id}`).toBeDefined()
      for (const level of levels) {
        expect(assemble(s, level), `${s.id}/${level}`).toBe(gold![level])
      }
    }
    expect(Object.keys(GOLD)).toHaveLength(PARTICLE_SENTENCES.length)
  })
})
```

- [ ] **Step 2: Run it to verify it passes**

Run: `pnpm exec vitest run tests/unit/particle-lab/audio-text.test.ts`
Expected: PASS (proves the seed assembles to exactly the strings the gen tool synthesizes). If it FAILS, the seed's `byLevel` differs from the gen tool's `LEVELED` — reconcile them (the seed is the source of truth) and regenerate.

- [ ] **Step 3: Commit**

```bash
git add munbeop/tests/unit/particle-lab/audio-text.test.ts
git commit -m "$(cat <<'EOF'
test(particles): pin the 42 TTS texts to the seed assembly

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Explore — 🔊 follows the formality slider

**Files:**
- Modify: `munbeop/app/components/particle-lab/ExploreMode.vue`

- [ ] **Step 1: Pass the level**

In `munbeop/app/components/particle-lab/ExploreMode.vue`, change the button to pass the level:

```vue
    <SentenceAudioButton
      :sentence-id="explore.sentence.value.id"
      :level="explore.level.value"
    />
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/components/particle-lab/ExploreMode.vue
git commit -m "$(cat <<'EOF'
feat(particles): the Explore 🔊 plays the current formality level

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Spacing — add the 🔊 (bonus)

**Files:**
- Modify: `munbeop/app/components/particle-lab/SpacingCard.vue`

- [ ] **Step 1: Import the button**

In `munbeop/app/components/particle-lab/SpacingCard.vue`, add after `import SpacingGap from './SpacingGap.vue'`:

```ts
import SentenceAudioButton from './SentenceAudioButton.vue'
```

- [ ] **Step 2: Render it after the translation line**

Replace:

```vue
    <p class="spacing__trans">{{ tl(trans) }}</p>
```

with:

```vue
    <p class="spacing__trans">{{ tl(trans) }}</p>

    <SentenceAudioButton :sentence-id="puzzle.sentenceId" />
```

(No `level` → defaults to polite, the 해요체 base spacing teaches.)

- [ ] **Step 3: Typecheck + full suite**

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm test`
Expected: PASS — all prior tests (with the updated audio path assertions) plus the new `audio-text` test; zero failures.

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/components/particle-lab/SpacingCard.vue
git commit -m "$(cat <<'EOF'
feat(particles): 🔊 the sentence in Spacing mode too (polite)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Verification — gates + adversarial Workflow + finish

**Files:** none.

- [ ] **Step 1: Gates + audio QA**

```bash
pnpm test
pnpm typecheck
pnpm lint
python tools/particle-lab-audio/qa.py
```
Expected: suite green, no type errors, 0 lint errors, `42/42 OK`.

- [ ] **Step 2: Adversarial Workflow**

Launch a Workflow with one check (the cast and i18n were verified in v1; v2's new risk is the 28 formal/casual conjugations):
- **Conjugation audit** — confirm the 28 formal (합니다체) and casual (반말) strings in `LEVELED` (and the `audio-text.test.ts` `GOLD`) are correct, natural Korean for each sentence (predicate ending; 저→나 in 반말; no spacing/particle drift from the polite base). Flag any wrong conjugation with the fix.

Apply any fix to BOTH the seed `byLevel` and the gen `LEVELED`/test `GOLD` (they must stay equal — the contract test enforces it), regenerate the affected clips, re-run Step 1. Target: 0 blockers.

- [ ] **Step 3: Manual smoke (logged-in)**

`/practice/particles` Explore: switch 합니다체 / 해요체 / 반말 and press 🔊 — each plays the matching level in the sentence's cast voice. Spacing mode: the 🔊 plays the base sentence.

- [ ] **Step 4: Finish the branch**

Use superpowers:finishing-a-development-branch → merge + push (Vercel prod), per the user's standing authorization.

---

## Self-Review (completed during planning)

- **Spec coverage:** 42-clip gen + qa + spec (Task 1), level-aware composable (Task 2), button level prop (Task 3), audio↔seed contract test (Task 4), Explore level wiring (Task 5), Spacing 🔊 (Task 6), gates + conjugation Workflow + finish (Task 7). All spec sections map to a task.
- **Placeholder scan:** complete code in every step; the 42 strings ship in both `LEVELED` (Task 1) and `GOLD` (Task 4), kept identical by the contract test.
- **Type consistency:** `sentenceAudioSrc(id, level)` / `playSentence(id, level)` (Task 2) match the button's `playSentence(props.sentenceId, props.level ?? 'polite')` (Task 3) and the `-<level>.ogg` names the gen tool writes (Task 1) and the tests assert (Tasks 2/3); `SpeechLevel` is the same `~/lib/domain` type used by `explore.level` (Task 5) and the button prop (Task 3); `SentenceAudioButton` `sentenceId`/`level` props match both call sites (Explore Task 5, Spacing Task 6 default polite); `tokenText`/`PARTICLE_SENTENCES` in the contract test (Task 4) are the same the engine uses.
```