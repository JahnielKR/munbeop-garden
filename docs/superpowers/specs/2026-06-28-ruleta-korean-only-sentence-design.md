# Ruleta — Korean-only sentence input

**Date:** 2026-06-28
**Status:** Approved

## Problem

In the Ruleta practice loop (`/practice/ruleta`), after the learner draws 3 cards
they produce sentences for each grammar × context. Today the sentence field
accepts any text. The owner wants the **sentence** to be Korean only: a sentence
written in another alphabet must not be savable, and the learner should see a red
message telling them to write in Korean. The **only** place another language is
allowed is the optional "what was hard" **note** (`ErrorNoteBlock`).

## Decisions (owner-approved)

1. **What's allowed in the sentence** — Hangul **plus numbers and punctuation**.
   - Must contain at least one Hangul character (`\p{Script=Hangul}` — syllables,
     jamo, compatibility jamo).
   - Must NOT contain any letter from another script (`\p{L}` that isn't Hangul →
     blocks Latin, Cyrillic, kana, hanja, …).
   - Neutral and allowed: digits (`3시`), spaces, punctuation (`. , ? ! ¿ ~ …`).
2. **When to validate** — **only on save attempt** (not live while typing). The
   buttons stay enabled (still gated by the existing `!sentence.trim()` rule);
   pressing FÁCIL / DIFÍCIL with non-Korean text shows the red message and does
   not save.
3. **Error message** — localized in all 8 UI locales; it appears in whichever
   language the learner has the UI set to. Sample (es): "Escribe la oración en
   coreano · 한국어로 써 주세요".
4. **Notes stay multilingual** — `ErrorNoteBlock` is untouched.

## Architecture

### 1. Pure helper — `app/lib/korean/script.ts` (new)

Lives in the existing Korean spine next to `hangul.ts`. No Vue, no i18n — pure
string predicate, fully unit-tested with golden cases.

```ts
const HANGUL = /\p{Script=Hangul}/u
const LETTER = /\p{L}/u

/** True if the text contains at least one Hangul character. */
export function hasHangul(text: string): boolean

/** True if the text contains a letter from a non-Korean script. */
export function hasForeignLetters(text: string): boolean // iterate by code point

/**
 * The sentence rule for the Ruleta: at least one Hangul character and no
 * foreign-script letters. Digits, spaces and punctuation are neutral.
 * Empty / whitespace-only is not valid.
 */
export function isKoreanSentence(text: string): boolean
```

Golden cases:
- valid: `안녕하세요`, `저는 학생이에요.`, `3시에 만나요?`, `'네!'`
- invalid: `` (empty), `   `, `hola`, `안녕 hello`, `1234`, `...`, `あいう`, `漢字`

### 2. Wiring — `app/components/practice/GrammarCard.vue`

- Import `isKoreanSentence`.
- New `showKoreanError = ref(false)`.
- A `validateSentence()` gate: returns `isKoreanSentence(sentence.value)`; when
  false it sets `showKoreanError.value = true`.
- Call the gate at the top of the three emit paths (`onEasy`, `onSaveWithNote`,
  `onSkipNote`) and of `onHard` (so the note block does not even open on bad
  input). On failure: set the flag and `return` — no emit, no reset, no advance.
- `watch(sentence, () => { showKoreanError.value = false })` — the message clears
  as soon as the learner edits the text.
- `reset()` also clears `showKoreanError`.
- Pass `:error="showKoreanError"` into `SentenceInput` (red border + aria-invalid).
- Render the message below `SentenceInput`:
  `<p v-if="showKoreanError" class="sentence-error" role="alert">{{ t('practice.sentence_korean_only') }}</p>`

`SentenceInput.vue` grows an `error?: boolean` prop forwarded to the base `Input`
(which already paints `--danger-bright` and sets `aria-invalid`).

### 3. i18n — `practice.sentence_korean_only` in all 8 locales

es, en, fr, pt-BR, th, id, vi, ja. The Korean tail (한국어로 써 주세요) stays Korean
in every locale (brand convention — like 화이팅).

## Testing

- `tests/unit/korean/script.test.ts` — golden valid/invalid cases for the helper.
- `tests/components/practice/GrammarCard.test.ts` — extend:
  - non-Korean sentence + click FÁCIL → no `submit` emitted, `.sentence-error`
    visible, `SentenceInput` in error state.
  - non-Korean sentence + click DIFÍCIL → note block does NOT open, error shown.
  - valid Korean sentence + click FÁCIL → `submit` emitted as before.
  - editing the sentence after an error clears `.sentence-error`.
- i18n parity test already enforces the new key across all locales (key-echo stub).

## Out of scope

- Live (as-you-type) validation — owner chose save-time only.
- Validating the note field — stays multilingual by design.
- Other practice surfaces (cloze, register, etc.) — this change is Ruleta-only.
