# Level 3 «El mercado nocturno» — Code/Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Level 3 as a playable escape-room level — a faithful seed transcription of `docs/escape-room-level-03.md` over the existing (L2-mature) engine, plus one small comparison-robustness tweak, flipped to `playable` in the registry.

**Architecture:** The dossier is the content spec. This plan does NOT touch the art or audio pipelines (separate later plans) — the level runs with the `Scene.vue` gradient fallback for missing art and the error-tolerant audio composable for missing sound. The only engine change is a 1-line robustness tweak: `completion` answers are compared whitespace-insensitively (Korean 보조용언 spacing, 한글 맞춤법 §47, lets a learner write `먹어보세요` or `먹어 보세요`). The seed carries the required `image`/`ambientAudio` path strings (files arrive in the art/audio plans) but DEFERS the optional per-candidate `voiceAudio`/`reactionVoiceAudio`/hotspot `sfx` fields to the audio plan.

**Tech Stack:** Nuxt 4 (SPA), TypeScript, Pinia, Vitest (happy-dom), pnpm. Run all commands from `munbeop/`.

---

## Scope

This is the **code/seed** sub-project of the dossier. Two later plans cover the other independent subsystems:
- **Art plan** — the ~22-image pixel pipeline (`public/escape-room/level-03/`), like the L1/L2 Python pipelines.
- **Audio plan** — 3-voice TTS (이모/도윤/하나) + 4 ambient loops + 8 SFX, then wires the optional audio fields into the seed and adds the on-disk audio test.

Each produces working software on its own. This plan ends with a playable-but-unstyled, silent, fully-tested level.

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `munbeop/app/lib/escape-room/answer.ts` | Pure `normalizeCompletionAnswer` helper (whitespace-insensitive compare) | Create |
| `munbeop/tests/unit/escape-room/answer.test.ts` | Unit-test the helper in isolation | Create |
| `munbeop/app/stores/escape-room.ts` | `answerCompletion` uses the helper (line ~142) | Modify |
| `munbeop/tests/unit/escape-room/store.test.ts` | One integration test: spaced answer still matches | Modify |
| `munbeop/tests/unit/escape-room/level-03.test.ts` | Structural invariants for `LEVEL_03` (mirror level-02.test.ts, minus on-disk audio) | Create |
| `munbeop/app/seed/escape-room/level-03.ts` | The `LEVEL_03` seed — faithful transcription of the dossier | Create |
| `munbeop/app/seed/escape-room/registry.ts` | Flip `level-03` stub to `playable` (lines 63-74) | Modify |
| `docs/escape-room-level-03.md` | Footnote §12.1's "zero engine" claim re: the compare tweak | Modify |

---

## Task 1: Whitespace-insensitive `completion` comparison

**Why:** the engine compares `text.trim() === cand.answer.trim()` (`store.ts:142`) — internal spaces must match exactly. Korean auxiliary-verb spacing (보조용언) is optional per 한글 맞춤법 §47, so `먹어보세요` and `먹어 보세요` are both correct; a strict compare unfairly fails one. A pure helper makes it testable and reusable.

**Files:**
- Create: `munbeop/app/lib/escape-room/answer.ts`
- Test: `munbeop/tests/unit/escape-room/answer.test.ts`
- Modify: `munbeop/app/stores/escape-room.ts:142`
- Test: `munbeop/tests/unit/escape-room/store.test.ts`

- [ ] **Step 1: Write the failing helper test**

Create `munbeop/tests/unit/escape-room/answer.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { normalizeCompletionAnswer } from '~/lib/escape-room/answer'

describe('normalizeCompletionAnswer', () => {
  it('strips leading/trailing whitespace', () => {
    expect(normalizeCompletionAnswer('  이  ')).toBe('이')
  })

  it('ignores internal whitespace (보조용언 spacing, 한글 맞춤법 §47)', () => {
    // A learner may write the auxiliary-verb form spaced or closed; both are valid.
    expect(normalizeCompletionAnswer('먹어 보세요')).toBe(
      normalizeCompletionAnswer('먹어보세요'),
    )
  })

  it('collapses any run of whitespace, including tabs/newlines', () => {
    expect(normalizeCompletionAnswer('가\t보세요')).toBe('가보세요')
    expect(normalizeCompletionAnswer('올리기  전에')).toBe('올리기전에')
  })

  it('leaves a genuinely different answer different', () => {
    expect(normalizeCompletionAnswer('먹어 보세요')).not.toBe(
      normalizeCompletionAnswer('마셔 보세요'),
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/escape-room/answer.test.ts`
Expected: FAIL — `Failed to resolve import "~/lib/escape-room/answer"`.

- [ ] **Step 3: Create the helper**

Create `munbeop/app/lib/escape-room/answer.ts`:

```ts
/**
 * Normalize a `completion` answer for comparison.
 *
 * Removes ALL whitespace (leading, trailing, internal). Korean auxiliary-verb
 * spacing (보조용언) is optional under 한글 맞춤법 §47 — `먹어 보세요` and
 * `먹어보세요` are both correct — so a learner shouldn't be failed over a space.
 * Answers in this game are short single forms, so dropping spaces never makes a
 * genuinely-wrong answer match a right one.
 */
export function normalizeCompletionAnswer(s: string): string {
  return s.replace(/\s+/g, '')
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/escape-room/answer.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Wire the helper into the store**

In `munbeop/app/stores/escape-room.ts`, add the import near the other `~/lib/escape-room/*` imports at the top of the file:

```ts
import { normalizeCompletionAnswer } from '~/lib/escape-room/answer'
```

Then replace the comparison in `answerCompletion` (line ~142):

```ts
  function answerCompletion(slotId: string, text: string): AnswerResult {
    if (status.value !== 'playing') return 'wrong'
    const cand = drawnCandidate<CompletionCandidate>(slotId)
    if (!cand) return recordError()
    return normalizeCompletionAnswer(text) === normalizeCompletionAnswer(cand.answer)
      ? resolveSlot(slotId)
      : recordError()
  }
```

- [ ] **Step 6: Add a store integration test**

In `munbeop/tests/unit/escape-room/store.test.ts`, ensure `Level` is imported (add to the existing type import if absent):

```ts
import type { Level } from '~/lib/domain'
```

Add this test inside the top-level `describe` (next to the existing `answerCompletion trims whitespace` test):

```ts
  it('answerCompletion accepts a differently-spaced but equivalent answer', () => {
    const store = useEscapeRoomStore()
    const base = makeLevel()
    // Give slot-2 a spaced auxiliary-verb answer; the player types it closed.
    const level: Level = {
      ...base,
      slots: base.slots.map((s) =>
        s.type === 'completion'
          ? { ...s, candidates: s.candidates.map((c) => ({ ...c, answer: '먹어 보세요' })) }
          : s,
      ),
    }
    store.startRun(level, 'seed-x', 0)
    expect(store.answerCompletion('slot-2', '먹어보세요')).toBe('correct')
  })
```

- [ ] **Step 7: Run the escape-room store + answer tests**

Run: `npx vitest run tests/unit/escape-room/answer.test.ts tests/unit/escape-room/store.test.ts`
Expected: PASS (all, including the existing trim test which still holds).

- [ ] **Step 8: Commit**

```bash
git add munbeop/app/lib/escape-room/answer.ts munbeop/tests/unit/escape-room/answer.test.ts munbeop/app/stores/escape-room.ts munbeop/tests/unit/escape-room/store.test.ts
git commit -m "feat(escape-room): whitespace-insensitive completion compare

Korean auxiliary-verb spacing (보조용언, 한글 맞춤법 §47) is optional, so
먹어보세요 and 먹어 보세요 are both correct. Compare completion answers via a
pure normalizeCompletionAnswer helper that drops all whitespace. Fixes a
false-negative for level-3 Slots 2/4 (and benefits every completion slot).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Level 3 invariant tests (test-first)

**Why:** the seed is data; the test is its contract. Written first, it fails on a missing module, then the seed makes it pass. Mirrors `level-02.test.ts` but OMITS the on-disk audio test (audio is a later plan) and the audio-wiring assertions.

**Files:**
- Create: `munbeop/tests/unit/escape-room/level-03.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/escape-room/level-03.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { LEVEL_03 } from '~/seed/escape-room/level-03'
import { validateLevel } from '~/lib/escape-room/rules'

describe('LEVEL_03 — El mercado nocturno', () => {
  it('passes validateLevel with zero issues', () => {
    expect(validateLevel(LEVEL_03)).toEqual([])
  })

  it('has id "level-03" anchored at TOPIK level 2', () => {
    expect(LEVEL_03.id).toBe('level-03')
    expect(LEVEL_03.topikLevel).toBe(2)
  })

  it('references the 6 grammar codes from the dossier (G013 is the climax callback)', () => {
    expect([...LEVEL_03.grammarCodes].sort()).toEqual([
      'G013',
      'G019',
      'G021',
      'G038',
      'G039',
      'G053',
    ])
  })

  it('has 4 rooms in order: hotteok, meokja, manmulsang, busstop', () => {
    expect(LEVEL_03.rooms.map((r) => r.id)).toEqual([
      'room-hotteok',
      'room-meokja',
      'room-manmulsang',
      'room-busstop',
    ])
  })

  it('has 6 slots in order with the sel/compl/sel/compl/sel/creation cadence', () => {
    expect(LEVEL_03.slots.map((s) => s.id)).toEqual([
      'slot-1',
      'slot-2',
      'slot-3',
      'slot-4',
      'slot-5',
      'slot-6',
    ])
    expect(LEVEL_03.slots.map((s) => s.type)).toEqual([
      'selection',
      'completion',
      'selection',
      'completion',
      'selection',
      'creation',
    ])
  })

  it('has 30 candidates total with non-empty Korean', () => {
    let total = 0
    for (const slot of LEVEL_03.slots) {
      for (const c of slot.candidates) {
        total += 1
        expect(c.korean.trim().length).toBeGreaterThan(0)
      }
    }
    expect(total).toBe(30)
  })

  it('distributes the correct option across the selection pools (not always A)', () => {
    for (const slot of LEVEL_03.slots) {
      if (slot.type !== 'selection') continue
      const indices = new Set(slot.candidates.map((c) => c.correctIndex))
      expect(indices.size).toBeGreaterThan(1)
    }
  })

  it('slot-2 (-아/어 보다) answers end in 보세요', () => {
    const slot2 = LEVEL_03.slots[1]
    expect(slot2?.type).toBe('completion')
    if (slot2?.type !== 'completion') throw new Error('unreachable')
    for (const c of slot2.candidates) {
      expect(c.answer.trim().endsWith('보세요')).toBe(true)
    }
  })

  it('slot-4 (-지만) answers end in 지만', () => {
    const slot4 = LEVEL_03.slots[3]
    expect(slot4?.type).toBe('completion')
    if (slot4?.type !== 'completion') throw new Error('unreachable')
    for (const c of slot4.candidates) {
      expect(c.answer.trim().endsWith('지만')).toBe(true)
    }
  })

  it('slot-6 (farewell) carries soft-reject tiles disjoint from correctOrder + a message', () => {
    const slot6 = LEVEL_03.slots[5]
    expect(slot6?.type).toBe('creation')
    if (slot6?.type !== 'creation') throw new Error('unreachable')
    for (const c of slot6.candidates) {
      expect(c.softRejectTiles?.length).toBeGreaterThan(0)
      const correct = new Set(c.correctOrder)
      for (const idx of c.softRejectTiles ?? []) {
        expect(idx).toBeGreaterThanOrEqual(0)
        expect(idx).toBeLessThan(c.tiles.length)
        expect(correct.has(idx)).toBe(false)
      }
      expect(c.softRejectMessage?.es?.length ?? 0).toBeGreaterThan(0)
    }
  })

  it('has one scripted beat — the twist — after slot-4', () => {
    const after = (LEVEL_03.scriptedBeats ?? []).map((b) => b.afterSlotId)
    expect(after).toEqual(['slot-4'])
    const slotIds = new Set(LEVEL_03.slots.map((s) => s.id))
    for (const b of LEVEL_03.scriptedBeats ?? []) {
      expect(slotIds.has(b.afterSlotId)).toBe(true)
      expect(b.narrative.es.trim().length).toBeGreaterThan(0)
      expect(b.voiceLine.trim().length).toBeGreaterThan(0)
    }
  })

  it('the outro quotes the player via the {farewell} token exactly once', () => {
    expect(LEVEL_03.outro.es.split('{farewell}').length - 1).toBe(1)
  })

  it('has all four reward tiers with ids distinct from level 1 and 2', () => {
    const priorIds = [
      'cosmetic-bg-sunrise', 'cosmetic-frame-apron', 'cosmetic-avatar-lantern', 'cosmetic-set-complete',
      'cosmetic-bg-rainsound', 'cosmetic-frame-dancheong', 'cosmetic-avatar-templecat', 'cosmetic-set-complete-02',
    ]
    for (const tier of ['common', 'rare', 'epic', 'legendary'] as const) {
      expect(LEVEL_03.rewards[tier].id.length).toBeGreaterThan(0)
      expect(priorIds).not.toContain(LEVEL_03.rewards[tier].id)
    }
    expect(LEVEL_03.rewards.legendary.id).toBe('cosmetic-set-complete-03')
  })

  it('uses the canonical run rules (2 errors, 600s epic, 3 clean runs)', () => {
    expect(LEVEL_03.rules.maxErrors).toBe(2)
    expect(LEVEL_03.rules.epicTimeThresholdSeconds).toBe(600)
    expect(LEVEL_03.rules.legendaryCleanRunsRequired).toBe(3)
  })

  it('every hotspot that triggers a slot points to a real slot id', () => {
    const slotIds = new Set(LEVEL_03.slots.map((s) => s.id))
    for (const room of LEVEL_03.rooms) {
      for (const h of room.hotspots) {
        if (h.triggersSlot) expect(slotIds.has(h.triggersSlot)).toBe(true)
      }
    }
  })

  it('intro is 5 paragraphs; tagline is a real hook; voice lines are Korean', () => {
    expect(LEVEL_03.intro.es.split('\n\n').length).toBeGreaterThanOrEqual(5)
    expect(LEVEL_03.tagline.es.length).toBeGreaterThan(40)
    expect(LEVEL_03.voiceIntro.length).toBeGreaterThan(0)
    expect(LEVEL_03.voiceOutro.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/escape-room/level-03.test.ts`
Expected: FAIL — `Failed to resolve import "~/seed/escape-room/level-03"`.

- [ ] **Step 3: Commit the failing test**

```bash
git add munbeop/tests/unit/escape-room/level-03.test.ts
git commit -m "test(escape-room): level-03 seed invariants (red — seed pending)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: The `LEVEL_03` seed

**Why:** the playable level. A faithful transcription of `docs/escape-room-level-03.md` into the `Level` shape, mirroring `app/seed/escape-room/level-02.ts` exactly (read it as the structural reference). Every visible string is `t(es)` (clones ES across all 8 locales as the V1 fallback, defined in `app/seed/escape-room/locale.ts`); Korean source-of-truth (`korean`, `answer`, `tiles`, `softRejectMessage` KO, voice lines) is NOT wrapped in `t()`.

**Scope guard for this plan:** include `rooms` (with `image` + `ambientAudio` path strings and `hotspots` with `triggersSlot`/`cosmeticDetail`), all 6 slots × 5 candidates, the one `scriptedBeats` entry, `rewards`, `rules`, `voiceIntro`/`voiceOutro` (KO strings). DO NOT add optional audio path fields (`voiceIntroAudio`, per-candidate `voiceAudio`, `reactionVoiceAudio`, hotspot `sfx`, `bellTollAudio`, `rainStopAudio`) — those land in the audio plan.

**Files:**
- Create: `munbeop/app/seed/escape-room/level-03.ts`

- [ ] **Step 1: Scaffold the file header + imports**

Create `munbeop/app/seed/escape-room/level-03.ts` starting with:

```ts
import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  ScriptedBeat,
  SelectionCandidate,
} from '~/lib/domain'
import { t } from './locale'

/**
 * Level 3 — "El mercado nocturno (달빛시장)"
 *
 * Faithful transcription of docs/escape-room-level-03.md.
 * 4 zones, 6 slots, 30 candidates (5 pool per slot), 4 reward tiers.
 * Energetic night-market register; the wingman caper whose twist is
 * found-family (도윤 is not 순자 이모's blood son). Zero new engine
 * features — reuses ScriptedBeat (the twist, after slot-4) and softReject
 * (Slot 6: goodbye-forever tiles vs the see-you-again 다녀오겠습니다).
 *
 * Per D12, every visible string is a LocalizedString via t(es). Korean
 * source-of-truth (korean, answer, tiles, the soft-reject KO) is NOT
 * translated. Audio path fields are intentionally absent — wired in the
 * separate audio plan.
 *
 * Validated by validateLevel(LEVEL_03) in level-03.test.ts.
 */
```

- [ ] **Step 2: Transcribe Slot 1 candidates (template — apply the same shape to all slots)**

For each `selection` slot (1, 3, 5), declare a `SelectionCandidate[]` const transcribing the dossier §8.x. Template (Slot 1, candidate 1.1, from dossier §8.1 — copy `options`/`correctIndex`/hints verbatim from the dossier):

```ts
// ─── SLOT 1 · El primer favor (호떡) · selección · G039 (-아/어 주다) ──────────
const SLOT_1_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '이 호떡 한 접시 도윤이한테 갖다줘요.',
    question: t('¿Qué te pide 이모?'),
    options: [
      t('Que le lleves este plato de 호떡 a 도윤.'),
      t('Que le pidas a 도윤 que te traiga a ti un plato de 호떡.'),
      t('Que le lleves este plato de 호떡 a 하나.'),
      t('Que le lleves un plato de 떡볶이 a 도윤.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('호떡 = el panqueque relleno de azúcar · 한 접시 = un plato · 갖다주다 = llevarle algo a alguien · 도윤이한테 = a 도윤.'),
      premium: t('-아/어 주다 (G039) = hacer algo en beneficio de otro; en 갖다줘요 el favor va de ti hacia 도윤, y 도윤이한테 marca a quién. No es «que él te lo traiga a ti».'),
    },
  },
  // ... candidates 1.2–1.5 transcribed from dossier §8.1 (correctIndex 1.2→D=3, 1.3→C=2, 1.4→B=1, 1.5→D=3)
]
```

Repeat for `SLOT_3_CANDIDATES` (§8.3, correctIndex 3.1→A,3.2→C,3.3→D,3.4→A,3.5→B) and `SLOT_5_CANDIDATES` (§8.5, correctIndex 5.1→A,5.2→C,5.3→D,5.4→B,5.5→A).

- [ ] **Step 3: Transcribe the `completion` slots (2 and 4)**

`CompletionCandidate` shape: `{ korean, translation, answer, hints }`. The `korean` MUST contain exactly one `___`. Template (Slot 2, candidate 2.1, from §8.2):

```ts
// ─── SLOT 2 · Averiguar qué le gusta a 하나 · completar · G038 (-아/어 보다) ────
const SLOT_2_CANDIDATES: CompletionCandidate[] = [
  {
    korean: '하나 씨, 이거 호떡인데… 한번 ___. 도윤이가 만들었어요.',
    translation: t('Hana, esto es un hotteok… pruébalo (a ver). Lo hizo 도윤.'),
    answer: '먹어 보세요',
    hints: {
      free: t('호떡 = hotteok · 한번 = una vez, prueba · 먹다 = comer.'),
      premium: t('-아/어 보다 (G038) = «hacer algo para ver qué tal». 먹다 + -어 보다 → 먹어 보다 → 먹어 보세요. NO 먹어요 (solo «come») ni 먹어 주세요 (eso pide un favor, G039).'),
    },
  },
  // 2.2 answer '물어보세요' (CLOSED, no space — dossier nota 2.2); 2.3 '가 보세요'; 2.4 '시켜 보세요'; 2.5 '마셔 보세요'
]
```

Slot 4 (§8.4) answers (verbatim, single token): `무뚝뚝하지만` · `싸지만` · `작지만` · `가지만` · `시끄럽지만`. Each `korean` has one `___` that the answer fills to produce the dossier sentence.

- [ ] **Step 4: Transcribe Slot 6 (creation + softReject)**

`CreationCandidate` shape: `{ korean, question, tiles, correctOrder, softRejectTiles, softRejectMessage, hints }`. Copy `tiles`/`correctOrder`/`softRejectTiles` EXACTLY from the §8.6 verification table (indices must match). Shared `softRejectMessage`. Template (6.1):

```ts
const SOFT_REJECT_LINE = t('Oye, ese es un adiós para siempre. Tú vas a volver. («다녀오겠습니다», no «안녕히 계세요».)')

// ─── SLOT 6 · La despedida (버스 정류장) · creación · G013 callback + softReject ─
const SLOT_6_CANDIDATES: CreationCandidate[] = [
  {
    korean: '도윤아, 이모한테 할 말 없어?',
    question: t('Doyun, ¿no tienes nada que decirle a la tía?'),
    tiles: ['그동안', '고마웠어요.', '이모,', '안녕히 계세요.', '다녀오겠습니다.', '고마워요.', '이모를'],
    correctOrder: [2, 0, 1, 4],
    softRejectTiles: [3],
    softRejectMessage: SOFT_REJECT_LINE,
    hints: {
      free: t('그동안 = todo este tiempo · 다녀오다 = ir y volver (lo que dice quien se marcha pero regresa).'),
      premium: t('Lo ya terminado lleva -았/었- → 고마웠어요, no 고마워요. 다녀오겠습니다 («iré y volveré») promete la vuelta.'),
    },
  },
  // 6.2–6.5 transcribed from §8.6 table (tiles/correctOrder/softRejectTiles per row); SOFT_REJECT_LINE shared
]
```

- [ ] **Step 5: Transcribe the scripted beat (the twist), rooms, rewards, and the `Level` export**

```ts
const SCRIPTED_BEATS: ScriptedBeat[] = [
  {
    afterSlotId: 'slot-4',
    voiceLine: '도윤이… 사실 내 친아들 아니에요. 십 년 전에, 배고픈 아이가 시장에 왔어요. 그냥 계속 밥을 줬어요. 그러다 보니까… 내 아들이 됐어요.',
    narrative: t(
      '이모 ha bajado la voz, pero no ha dejado de trabajar. …\n\n' + // §3 beat del giro, 3 párrafos ES
        '…\n\n' +
        '…',
    ),
  },
]

export const LEVEL_03: Level = {
  id: 'level-03',
  title: t('El mercado nocturno'),
  tagline: t('Subiste al mercado a comer algo antes del último autobús. La señora del puesto de 호떡 te quitó la mochila, sonrió y dijo: «ayúdame a cerrar y te la devuelvo».'),
  intro: t('…' /* §3 intro, 5 paragraphs joined with \n\n */),
  outro: t('…' /* §3 outro, the 6 beats joined with \n\n — MUST contain {farewell} exactly once */),
  voiceIntro: '어서 와요! 우리 가게 문 닫는 거 좀 도와줘요. 그럼 가방 돌려줄게요.',
  voiceOutro: '고마워요. 진짜 도와줬어요. 야 도윤아, 머리 짧게 깎고 와. 자리 빼놓을게!',
  grammarCodes: ['G039', 'G038', 'G053', 'G021', 'G019', 'G013'],
  topikLevel: 2,
  rooms: [
    {
      id: 'room-hotteok',
      title: t('El puesto de 호떡 (순자 이모)'),
      image: 'rooms/room-01-hotteok.png',
      ambientAudio: 'audio/ambient-hotteok.ogg',
      hotspots: [
        { id: 'imo', rect: [150, 90, 55, 80], triggersSlot: 'slot-1' }, // §6: same rect re-arms for slot-5
        { id: 'imo-list', rect: [150, 90, 55, 80], triggersSlot: 'slot-5' },
        { id: 'hotteok', rect: [120, 130, 50, 35], cosmeticDetail: t('설탕이 녹아요. 조심하세요.') },
        { id: 'backpack', rect: [25, 165, 45, 40], cosmeticDetail: t('이모가 내 가방을 안 줘요.') },
        { id: 'bulb', rect: [195, 35, 22, 28], cosmeticDetail: t('시장이 시끄러워요.') },
      ],
    },
    // room-meokja (slot-2), room-manmulsang (slot-3 + slot-4), room-busstop (slot-6) — rects from §6
  ],
  slots: [
    { id: 'slot-1', type: 'selection', grammarFocus: ['G039'], candidates: SLOT_1_CANDIDATES },
    { id: 'slot-2', type: 'completion', grammarFocus: ['G038'], candidates: SLOT_2_CANDIDATES },
    { id: 'slot-3', type: 'selection', grammarFocus: ['G053'], candidates: SLOT_3_CANDIDATES },
    { id: 'slot-4', type: 'completion', grammarFocus: ['G021'], candidates: SLOT_4_CANDIDATES },
    { id: 'slot-5', type: 'selection', grammarFocus: ['G019'], candidates: SLOT_5_CANDIDATES },
    { id: 'slot-6', type: 'creation', grammarFocus: ['G013', 'G039'], candidates: SLOT_6_CANDIDATES },
  ],
  scriptedBeats: SCRIPTED_BEATS,
  rewards: {
    common: { id: 'cosmetic-bg-neonalley', image: 'cosmetics/cosmetic-bg-neonalley.png', name: t('Fondo «네온 골목»'), description: t('El callejón del mercado bajo el neón nocturno: planchas humeantes, carteles rosa/cian/verde como halos, el asfalto mojado devolviéndolos partidos.') },
    rare: { id: 'cosmetic-frame-hotteokbag', image: 'cosmetics/cosmetic-frame-hotteokbag.png', name: t('Marco «호떡 봉지»'), description: t('Marco de bolsa de papel de estraza con sellos de tinta del mercado en las esquinas: plancha, cucharón, 호떡 y palillo.') },
    epic: { id: 'cosmetic-avatar-marketcat', image: 'cosmetics/cosmetic-avatar-marketcat.png', name: t('Avatar «시장 고양이»'), description: t('El gato del mercado sobre una caja de cartón junto a la plancha; cada pocos ciclos se lame la pata y mira el vapor.') },
    legendary: { id: 'cosmetic-set-complete-03', image: 'cosmetics/cosmetic-set-complete-03.png', name: t('Set completo «막차 손님»'), description: t('El huésped del último bus: avatar con el 호떡 caliente en la mano, marco de neón con guirnalda de bombillas, y el fondo del plano final con el bus arrancando bajo el neón.') },
  },
  rules: { maxErrors: 2, epicTimeThresholdSeconds: 600, legendaryCleanRunsRequired: 3 },
}
```

> Fill every `'…'` placeholder by transcribing the matching dossier section verbatim (intro §3, outro §3 — keep the literal `{farewell}` token once, beat §3, the remaining candidates §8.2–§8.6, the remaining 3 rooms §6). Do NOT invent content; the dossier is canonical.

- [ ] **Step 6: Run the level-03 test to verify it passes**

Run: `npx vitest run tests/unit/escape-room/level-03.test.ts`
Expected: PASS (all). If `validateLevel` reports issues, read them — common causes: a `completion.korean` missing/duplicating `___`, a `softRejectTiles` index inside `correctOrder`, a slot with ≠5 candidates.

- [ ] **Step 7: Typecheck (the discriminated union is strict)**

Run: `npx nuxt typecheck`
Expected: exit 0. (A `selection` candidate needs exactly 4 `options` and `correctIndex: 0|1|2|3`; a `creation` candidate's `correctOrder`/`softRejectTiles` are `number[]`.)

- [ ] **Step 8: Commit**

```bash
git add munbeop/app/seed/escape-room/level-03.ts
git commit -m "feat(escape-room): level-03 seed «El mercado nocturno»

Faithful transcription of docs/escape-room-level-03.md — 4 rooms, 6 slots,
30 candidates, the twist ScriptedBeat (after slot-4) and the Slot-6
softReject trap. Audio path fields deferred to the audio plan.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Flip the registry to `playable`

**Why:** `registry.ts` lists `level-03` as a `coming-soon` stub (lines 63-74). Importing `LEVEL_03` and switching the block to the playable shape (mirror the `level-02` block, lines 53-62) makes the notebook page launchable. The stub's `tagline`/`cover`/`mood`/`title` are canonical — do NOT rewrite them; instead source `title`/`tagline` from `LEVEL_03` like the other playable entries.

**Files:**
- Modify: `munbeop/app/seed/escape-room/registry.ts`

- [ ] **Step 1: Add the import**

At the top of `registry.ts`, next to the other level imports:

```ts
import { LEVEL_03 } from './level-03'
```

- [ ] **Step 2: Replace the `level-03` entry**

Replace the existing `level-03` object (the `status: 'coming-soon'` block) with:

```ts
  {
    id: 'level-03',
    number: 3,
    title: LEVEL_03.title,
    tagline: LEVEL_03.tagline,
    mood: t('Energético · Callejero'),
    cover: '/escape-room/covers/level-03.png',
    topikLevel: 2,
    status: 'playable',
    level: LEVEL_03,
  },
```

- [ ] **Step 3: Run the registry + full escape-room suite**

Run: `npx vitest run tests/unit/escape-room tests/components/escape-room`
Expected: PASS. `registry.test.ts` validates every `playable` entry via `validateLevel` and that `topikLevel` matches — level-03 now flows through it.

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/seed/escape-room/registry.ts
git commit -m "feat(escape-room): make level-03 playable in the registry

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Dossier footnote + full-suite verification

**Why:** the compare tweak (Task 1) is a small engine change, so the dossier's §12.1 "zero new engine features" line needs an honest footnote. Then run every gate before handing off.

**Files:**
- Modify: `docs/escape-room-level-03.md` (§12.1 / §12.7)

- [ ] **Step 1: Footnote the compare tweak in the dossier**

In `docs/escape-room-level-03.md`, append to the §12.1 table area (or the §12.8 one-line summary) a note:

```markdown
> **Nota (post-plan):** el Nivel 3 añade UN ajuste de robustez de 1 línea — `completion` se compara ignorando espacios internos (`normalizeCompletionAnswer`, `lib/escape-room/answer.ts`), para que `먹어보세요`/`먹어 보세요` (보조용언, 한글 맞춤법 §47) cuenten ambos. Es robustez de comparación, no una mecánica nueva; resuelve la cuestión abierta de §12.7 (espacios en Slots 2/4) y beneficia a todo `completion` futuro.
```

Also check the §12.7 "completion y espacios internos" flag as resolved (`[x]`).

- [ ] **Step 2: Run the full test suite**

Run: `npx vitest run`
Expected: PASS — all files, 0 failures (level-03 adds its file; the prior count grows).

- [ ] **Step 3: Typecheck + lint**

Run: `npx nuxt typecheck`
Expected: exit 0.
Run: `npx eslint app/seed/escape-room/level-03.ts app/lib/escape-room/answer.ts app/stores/escape-room.ts`
Expected: exit 0.

- [ ] **Step 4: Commit the dossier footnote**

```bash
git add docs/escape-room-level-03.md
git commit -m "docs(escape-room): footnote the level-3 completion-compare tweak

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 5 (optional, manual): preview the playable level**

With a dev server (see the dark-mode session notes: junction `node_modules`, `npx nuxi prepare`, copy `.env`, inject a fake `sb-*-auth-token` + theme in localStorage), open `/escape-room/play?level=level-03`. Expect: gradient-fallback scenes (art pending), silent (audio pending), the intro cinematic, hotspots that open each slot, the twist beat after slot-4, the Slot-6 soft-reject on a goodbye-forever tile, and the victory screen quoting the built farewell. This is confirmation only — not a blocker.

---

## Self-Review

**Spec coverage (dossier → task):**
- §2/§3 narrative (intro, twist beat, outro, tagline, voice lines) → Task 3 Steps 1, 5 (transcribed into the seed).
- §4 editorial rules → enforced by content (no task; they constrain transcription).
- §5 grammars (G039/G038/G053/G021/G019/G013) → Task 2 grammar-codes test + Task 3 `grammarCodes`/`grammarFocus`.
- §6 rooms/hotspots → Task 3 Step 5 (`rooms`), Task 2 room-id + hotspot tests.
- §7 map / runtime rules → Task 2 rules test + Task 3 `rules`.
- §8 30 puzzles → Task 3 Steps 2–4, Task 2 candidate/correctIndex/answer/softReject tests.
- §9 cosmetics → Task 3 `rewards` + Task 2 reward-id test.
- §10 assets (image/ambient path strings only) → Task 3 `rooms`; the 22 images + 32 audio lines are the **art/audio plans** (explicitly out of scope here).
- §11 production → informational.
- §12.1 zero-engine claim → Task 5 footnote (honest about the 1-line compare tweak); §12.2 seed/registry → Tasks 3–4; §12.3 {farewell} → Task 2 outro test; §12.7 completion-space flag → resolved by Task 1.

**Placeholder scan:** the `'…'` strings in Task 3 are explicit transcription markers with a verbatim-from-dossier instruction, not hidden TBDs. Every executable step has full code or an exact command. ✓

**Type consistency:** `normalizeCompletionAnswer` (Task 1) is the exact name used in the store edit and tests. Slot ids (`slot-1..slot-6`), room ids (`room-hotteok/meokja/manmulsang/busstop`), and reward ids (`cosmetic-set-complete-03`) match between Task 2 (tests) and Task 3 (seed). The `Level`/`CompletionCandidate`/`CreationCandidate`/`SelectionCandidate`/`ScriptedBeat` types match `app/lib/domain`. ✓

---

## Execution Handoff

**Out of scope (separate plans, after this one):**
1. **Art plan** — the ~22-image pixel pipeline + drop the gradient fallback for level-03.
2. **Audio plan** — 3-voice TTS + ambient + SFX, wire the optional audio fields into the seed, add the on-disk audio existence test (mirror level-02.test.ts).
3. **Human:** native (wife) review of the 30 Korean lines — runs in parallel; gate before the seed PR merges.
