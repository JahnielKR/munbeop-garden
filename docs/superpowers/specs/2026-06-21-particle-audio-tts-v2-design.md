# Particle Lab audio TTS (v2 — formality) — design

**2026-06-21 · Subproject 9 (v2) of the Particle Lab follow-up program**
**Status: SPEC — proceeding under the user's standing "pick recommended, run to the end" authorization.**

## Goal

Make the Explore **formality slider audible**: the 🔊 button plays the clip that
matches the current speech level — 합니다체 (formal) / 해요체 (polite) / 반말
(casual). v1 shipped the 14 polite clips; v2 adds formal + casual (28 more) so all
three levels are hearable. As a cheap bonus, the same 🔊 appears in **Spacing
mode** (plays the 해요체 clip — spacing teaches the base form).

Each sentence keeps **one cast voice across its three levels** (formality changes
*how* it's said, not *who* says it). Per-toggle (particle-off) audio, drill audio,
and phonetic annotation remain **v3** (deferred).

## Current state (what v1 + #6 left)

- `tools/particle-lab-audio/gen_voice.py` — `CAST` of 14 `(id, text, voice, rate, pitch)`; writes `sentence-<id>.ogg`. `qa.py` checks the 14.
- `munbeop/public/particle-lab/audio/sentence-<id>.ogg` — 14 polite clips (v1).
- `munbeop/app/composables/useParticleAudio.ts` — `sentenceAudioSrc(id)` → `/particle-lab/audio/sentence-<id>.ogg`; `playSentence(id)`; one-at-a-time, SSR-safe, 404→silent.
- `munbeop/app/components/particle-lab/SentenceAudioButton.vue` — prop `sentenceId`; plays via the composable. Rendered in `ExploreMode.vue` above the sentence.
- `munbeop/app/lib/particle-lab/explore.ts` — `tokenText(token, level)` returns a word token's surface at a `SpeechLevel` (base `text` = polite; `byLevel.{formal,casual}` otherwise); particles are level-invariant.
- `munbeop/app/composables/useParticleExplore.ts` — exposes a sticky `level: Ref<SpeechLevel>`.
- `munbeop/app/seed/particle-sentences.ts` — each sentence's tokens carry `byLevel` (verified in subproject #6, 14-agent conjugation review, 0 issues).
- `munbeop/app/components/particle-lab/SpacingCard.vue` — has `puzzle.sentenceId`.
- `munbeop/app/lib/domain/particles.ts` — `SpeechLevel = 'formal' | 'polite' | 'casual'`.

## The 42 leveled gold strings (formal / polite / casual)

Assembled from the seed `byLevel` (predicate ending + 저→나 in 반말); a final period.

| id | 합니다체 (formal) | 해요체 (polite) | 반말 (casual) |
|---|---|---|---|
| s01-jeoneun | 저는 학생입니다. | 저는 학생이에요. | 나는 학생이야. |
| s02-goyangi | 고양이가 우유를 마십니다. | 고양이가 우유를 마셔요. | 고양이가 우유를 마셔. |
| s03-hakgyo | 학교에 갑니다. | 학교에 가요. | 학교에 가. |
| s04-doseogwan | 도서관에서 공부합니다. | 도서관에서 공부해요. | 도서관에서 공부해. |
| s05-jeodo | 저도 커피를 좋아합니다. | 저도 커피를 좋아해요. | 나도 커피를 좋아해. |
| s06-achime | 아침에 빵을 먹습니다. | 아침에 빵을 먹어요. | 아침에 빵을 먹어. |
| s07-biga | 비가 옵니다. | 비가 와요. | 비가 와. |
| s08-chinguhante | 친구한테 편지를 씁니다. | 친구한테 편지를 써요. | 친구한테 편지를 써. |
| s09-beoseuro | 버스로 학교에 갑니다. | 버스로 학교에 가요. | 버스로 학교에 가. |
| s10-ppangman | 빵만 먹습니다. | 빵만 먹어요. | 빵만 먹어. |
| s11-sagwawa | 사과와 바나나를 삽니다. | 사과와 바나나를 사요. | 사과와 바나나를 사. |
| s12-ahopsibuteo | 아홉 시부터 다섯 시까지 일합니다. | 아홉 시부터 다섯 시까지 일해요. | 아홉 시부터 다섯 시까지 일해. |
| s13-yeonpillo | 연필로 편지를 씁니다. | 연필로 편지를 써요. | 연필로 편지를 써. |
| s14-jeodo | 저도 커피를 마십니다. | 저도 커피를 마셔요. | 나도 커피를 마셔. |

## Design

### A. Generation tool — extend to 42 clips

`gen_voice.py`: replace the 14-row `CAST` with a `LEVELED` build over the table
above — `(id, level, text)` × the per-sentence `(voice, rate, pitch)` from v1's
cast (s07 already re-cast to adult woman). One voice per sentence applies to all
three levels. Output **uniform** `sentence-<id>-<level>.ogg` (so the v1
`sentence-<id>.ogg` files are renamed to `-polite`; regenerate all 42). `qa.py`
checks 42 files. Keeps importing the escape-room `common.py` DSP.

### B. Composable — level-aware path

```ts
export function sentenceAudioSrc(id: string, level: SpeechLevel = 'polite'): string {
  return `/particle-lab/audio/sentence-${id}-${level}.ogg`
}
```
`playSentence(id, level = 'polite')` uses it. `SpeechLevel` imported from `~/lib/domain`. (v1's test updates to the new path.)

### C. Button — `level` prop

`SentenceAudioButton` gains `level?: SpeechLevel` (default `'polite'`); click calls `playSentence(props.sentenceId, props.level ?? 'polite')`.

### D. Explore wiring

`ExploreMode.vue`: `<SentenceAudioButton :sentence-id="explore.sentence.value.id" :level="explore.level.value" />` — the button follows the slider.

### E. Spacing wiring (bonus)

`SpacingCard.vue`: render `<SentenceAudioButton :sentence-id="puzzle.sentenceId" />` (defaults to polite) near the sentence/trans. Spacing only teaches the base form, so polite is correct. (SpacingCard already imports nothing audio; add the one import + element.)

### F. Audio↔seed contract test (TS)

`tests/unit/particle-lab/audio-text.test.ts`: for every sentence × level, the
Korean assembled from the seed via `tokenText` (joined per eojeol, eojeols
space-separated, + '.') equals the gold table above. If the seed `byLevel`
changes, this fails — the reminder to regenerate the clips. Pins the exact text
the gen tool synthesizes.

## Files

| Action | Path |
|---|---|
| Edit | `tools/particle-lab-audio/gen_voice.py` (42-clip `LEVELED` build) |
| Edit | `tools/particle-lab-audio/qa.py` (42 ids × levels) |
| Edit | `tools/particle-lab-audio/SPEC.md` (note the 3 levels + naming) |
| Replace (generated) | `munbeop/public/particle-lab/audio/sentence-<id>-<level>.ogg` (42; removes the 14 v1 names) |
| Edit | `munbeop/app/composables/useParticleAudio.ts` (`level` arg) |
| Edit | `munbeop/tests/composables/useParticleAudio.test.ts` (new path) |
| Edit | `munbeop/app/components/particle-lab/SentenceAudioButton.vue` (`level` prop) |
| Edit | `munbeop/tests/components/particle-lab/SentenceAudioButton.test.ts` (level path) |
| Edit | `munbeop/app/components/particle-lab/ExploreMode.vue` (pass `level`) |
| Edit | `munbeop/app/components/particle-lab/SpacingCard.vue` (🔊) |
| Add | `munbeop/tests/unit/particle-lab/audio-text.test.ts` |

No new i18n (the `play_audio` label is reused). No seed change. No SQL.

## Testing / verification

- `useParticleAudio` test: `sentenceAudioSrc('s01-jeoneun','formal')` → `…/sentence-s01-jeoneun-formal.ogg`; default level = polite; `playSentence` plays that path.
- `SentenceAudioButton` test: a `level='casual'` prop plays the `-casual` clip; default plays `-polite`.
- `audio-text.test.ts`: all 42 assembled strings match the gold table.
- Full suite + typecheck + lint green; `python tools/particle-lab-audio/qa.py` → 42/42.
- Adversarial Workflow: confirm the 28 new formal/casual conjugations are correct (re-checks #6's byLevel as the audio source of truth).
- Manual (logged in): in Explore, switching 합니다체/해요체/반말 and pressing 🔊 plays the matching level; in Spacing the 🔊 plays the base sentence.

## Out of scope (v3 / YAGNI)

- Per-toggle (particle-off) audio — combinatorial (2^n per sentence).
- Drill-mode audio (drill items have their own sentences).
- Phonetic "sounds-like" 연음 annotation.
- A global audio enable toggle / volume slider.
- mp3 fallback for old Safari (repo standard is OGG).
