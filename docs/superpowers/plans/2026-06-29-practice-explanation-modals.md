# Practice-mode Explanation Modals — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable "Explanation" button + modal to each practice lab that teaches the concept (e.g. what honorifics are, their three types, with real Korean examples) and how that mode is played — shipped fully for the `register` (높임법) pilot and wired into all 9 practice pages.

**Architecture:** Pedagogical content lives in typed TS seed modules using the existing `L()` 8-locale constructor (the same pattern as `usage-notes`); a small `PRACTICE_HELP` registry maps a mode id to its content; a single `PracticeHelp.vue` component (mounted on the existing `ui/Modal.vue`) reads the registry and renders a localized modal. UI chrome strings (button label, section headings) live in the i18n JSON. A page shows the button only when its mode has a registry entry, so all pages can be wired immediately and content fills in incrementally.

**Tech Stack:** Nuxt 4 (SPA), Vue 3 `<script setup>`, TypeScript, `@nuxtjs/i18n` (JSON locales), Vitest + `@vue/test-utils`, pnpm.

**Conventions (verified in this repo):**
- All commands run from the **`munbeop/`** app directory.
- `pnpm test <path>` runs one file (`vitest run`); `pnpm typecheck` is `nuxt typecheck`; `pnpm lint` is `eslint .`.
- `L(en, es, fr, pt-BR, th, id, vi, ja)` (`app/seed/locale.ts`) — positional, all 8 required by the compiler.
- `useI18n()` and `useLocalized()` are Nuxt auto-imports; in Vitest they are global stubs (`tests/setup.ts`): `t` echoes the key, `tl` resolves to the `en` value.
- Component tests: SUT import at top of file (eslint `import/first`), `mount` from `@vue/test-utils`.

---

## File Structure

| Path | Responsibility | Action |
|---|---|---|
| `app/lib/domain/practice-help.ts` | `PracticeHelpType`, `PracticeHelpContent`, `PracticeHelpMode` types | Create |
| `app/lib/domain/index.ts` | Re-export the new domain module | Modify |
| `app/seed/practice-help/register.ts` | `REGISTER_HELP` content (8 locales) — pilot | Create |
| `app/seed/practice-help/index.ts` | `PRACTICE_HELP` registry + `helpFor()` | Create |
| `app/components/practice/PracticeHelp.vue` | Button + modal, resolves content & locale | Create |
| `i18n/locales/*.json` (×8) | `practiceHelp.*` chrome strings | Modify |
| `app/pages/practice/*.vue` (×9) | Mount `<PracticeHelp mode="…" />` | Modify |
| `tests/unit/i18n/practice-help-keys.test.ts` | Chrome key parity across 8 locales | Create |
| `tests/unit/practice-help/seed-invariants.test.ts` | Registry shape + full localization | Create |
| `tests/components/practice/PracticeHelp.test.ts` | Renders trigger, opens modal, shows types | Create |

---

## Task 1: Domain types

**Files:**
- Create: `app/lib/domain/practice-help.ts`
- Modify: `app/lib/domain/index.ts`

- [ ] **Step 1: Create the type module**

Create `app/lib/domain/practice-help.ts`:

```ts
import type { LocalizedString } from './i18n'

/** One "type/kind" inside a concept (e.g. the 3 kinds of 높임법). */
export interface PracticeHelpType {
  /** Korean term, language-neutral (not translated). */
  ko: string
  /** Short localized label, e.g. "raising the subject". */
  label: LocalizedString
  /** One- to two-sentence localized explanation. */
  desc: LocalizedString
  /** Korean example sentence, language-neutral. */
  example: string
  /** Localized translation of `example`. */
  gloss: LocalizedString
}

/** The full explanation shown in one practice mode's modal. */
export interface PracticeHelpContent {
  /** Korean headline term, e.g. '높임법'. */
  ko: string
  /** Optional romanization of `ko`, e.g. 'nopimbeop'. */
  romanization?: string
  /** Localized one-line subtitle, e.g. "the honorific system". */
  subtitle: LocalizedString
  /** Localized "what is it?" paragraph. */
  concept: LocalizedString
  /** Optional list of kinds/types of the concept. */
  types?: PracticeHelpType[]
  /** Localized "how to play" steps, rendered as a numbered list. */
  howToPlay: LocalizedString[]
  /** Optional localized pro-tip / common trap. */
  tip?: LocalizedString
}

/** Practice modes that can carry an explanation modal (escape room excluded). */
export type PracticeHelpMode =
  | 'ruleta'
  | 'particles'
  | 'conjugation'
  | 'register'
  | 'cloze'
  | 'counters'
  | 'placement'
  | 'number-market'
  | 'rescue'
```

- [ ] **Step 2: Re-export from the domain barrel**

In `app/lib/domain/index.ts`, append after the last `export * from './numbers-market'` line:

```ts
export * from './practice-help'
```

- [ ] **Step 3: Typecheck**

Run: `cd munbeop && pnpm typecheck`
Expected: PASS (0 errors). The new module compiles and its exports resolve through `~/lib/domain`.

- [ ] **Step 4: Commit**

```bash
cd munbeop && git add app/lib/domain/practice-help.ts app/lib/domain/index.ts
git commit -m "feat(practice-help): add PracticeHelpContent domain types"
```

---

## Task 2: i18n chrome strings (TDD)

**Files:**
- Test: `tests/unit/i18n/practice-help-keys.test.ts`
- Modify: `i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`

- [ ] **Step 1: Write the failing parity test**

Create `tests/unit/i18n/practice-help-keys.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import id from '../../../i18n/locales/id.json'
import ja from '../../../i18n/locales/ja.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import vi from '../../../i18n/locales/vi.json'

const LOCALES = { en, es, fr, id, ja, ptBR, th, vi }
const helpKeys = (o: Record<string, unknown>) =>
  Object.keys((o.practiceHelp as Record<string, unknown>) ?? {})
const sectionKeys = (o: Record<string, unknown>) =>
  Object.keys(((o.practiceHelp as Record<string, unknown>)?.section as Record<string, unknown>) ?? {})

describe('practiceHelp i18n parity', () => {
  it('every locale has the same practiceHelp.* keys as en', () => {
    const base = helpKeys(en).sort()
    expect(base).toEqual(['button', 'close', 'section'])
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: helpKeys(loc).sort() }).toEqual({ name, keys: base })
    }
  })

  it('every locale has the same practiceHelp.section.* keys as en', () => {
    const base = sectionKeys(en).sort()
    expect(base).toEqual(['concept', 'howToPlay', 'tip', 'types'])
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: sectionKeys(loc).sort() }).toEqual({ name, keys: base })
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd munbeop && pnpm test tests/unit/i18n/practice-help-keys.test.ts`
Expected: FAIL — `practiceHelp` is absent, so `helpKeys(en)` is `[]` and the first `expect` mismatches.

- [ ] **Step 3: Add the `practiceHelp` key to every locale file**

Add the following top-level `"practiceHelp"` object to each locale JSON. **JSON key order does not matter** — place it alongside the other top-level keys (e.g. next to `"register"`). Use each locale's strings below.

`i18n/locales/en.json`:
```json
"practiceHelp": {
  "button": "Explanation",
  "close": "Close",
  "section": { "concept": "What is it?", "types": "Its types", "howToPlay": "How to play", "tip": "Tip" }
}
```
`i18n/locales/es.json`:
```json
"practiceHelp": {
  "button": "Explicación",
  "close": "Cerrar",
  "section": { "concept": "¿Qué es?", "types": "Sus tipos", "howToPlay": "Cómo se juega", "tip": "Truco" }
}
```
`i18n/locales/fr.json`:
```json
"practiceHelp": {
  "button": "Explication",
  "close": "Fermer",
  "section": { "concept": "Qu'est-ce que c'est ?", "types": "Ses types", "howToPlay": "Comment jouer", "tip": "Astuce" }
}
```
`i18n/locales/pt-BR.json`:
```json
"practiceHelp": {
  "button": "Explicação",
  "close": "Fechar",
  "section": { "concept": "O que é?", "types": "Seus tipos", "howToPlay": "Como jogar", "tip": "Dica" }
}
```
`i18n/locales/th.json`:
```json
"practiceHelp": {
  "button": "คำอธิบาย",
  "close": "ปิด",
  "section": { "concept": "คืออะไร?", "types": "ประเภทต่าง ๆ", "howToPlay": "วิธีเล่น", "tip": "เคล็ดลับ" }
}
```
`i18n/locales/id.json`:
```json
"practiceHelp": {
  "button": "Penjelasan",
  "close": "Tutup",
  "section": { "concept": "Apa itu?", "types": "Jenis-jenisnya", "howToPlay": "Cara bermain", "tip": "Tips" }
}
```
`i18n/locales/vi.json`:
```json
"practiceHelp": {
  "button": "Giải thích",
  "close": "Đóng",
  "section": { "concept": "Là gì?", "types": "Các loại", "howToPlay": "Cách chơi", "tip": "Mẹo" }
}
```
`i18n/locales/ja.json`:
```json
"practiceHelp": {
  "button": "説明",
  "close": "閉じる",
  "section": { "concept": "これは何？", "types": "種類", "howToPlay": "遊び方", "tip": "コツ" }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd munbeop && pnpm test tests/unit/i18n/practice-help-keys.test.ts`
Expected: PASS (2 passing).

- [ ] **Step 5: Commit**

```bash
cd munbeop && git add tests/unit/i18n/practice-help-keys.test.ts i18n/locales
git commit -m "feat(practice-help): add localized chrome strings (8 locales)"
```

---

## Task 3: Register pilot content + registry (TDD)

**Files:**
- Create: `app/seed/practice-help/register.ts`
- Create: `app/seed/practice-help/index.ts`
- Test: `tests/unit/practice-help/seed-invariants.test.ts`

- [ ] **Step 1: Write the failing invariants test**

Create `tests/unit/practice-help/seed-invariants.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { PRACTICE_HELP, helpFor } from '~/seed/practice-help'
import { LOCALE_CODES } from '~/lib/domain'

const MODES = [
  'ruleta', 'particles', 'conjugation', 'register', 'cloze',
  'counters', 'placement', 'number-market', 'rescue',
]

describe('practice-help seed invariants', () => {
  it('helpFor resolves a known entry and is undefined otherwise', () => {
    expect(helpFor('register')).toBeTruthy()
    expect(helpFor('does-not-exist')).toBeUndefined()
  })

  it('every registry key is a known practice mode', () => {
    for (const key of Object.keys(PRACTICE_HELP)) {
      expect(MODES, key).toContain(key)
    }
  })

  it('every entry is fully localized in all 8 locales', () => {
    for (const [mode, c] of Object.entries(PRACTICE_HELP)) {
      const content = c!
      expect(content.ko, `${mode} ko`).toBeTruthy()
      for (const code of LOCALE_CODES) {
        expect(content.subtitle[code], `${mode} subtitle ${code}`).toBeTruthy()
        expect(content.concept[code], `${mode} concept ${code}`).toBeTruthy()
      }
      expect(content.howToPlay.length, `${mode} howToPlay empty`).toBeGreaterThan(0)
      content.howToPlay.forEach((step, i) => {
        for (const code of LOCALE_CODES) {
          expect(step[code], `${mode} howToPlay[${i}] ${code}`).toBeTruthy()
        }
      })
      for (const type of content.types ?? []) {
        expect(type.ko, `${mode} type.ko`).toBeTruthy()
        expect(type.example, `${mode} ${type.ko} example`).toBeTruthy()
        for (const code of LOCALE_CODES) {
          expect(type.label[code], `${mode} ${type.ko} label ${code}`).toBeTruthy()
          expect(type.desc[code], `${mode} ${type.ko} desc ${code}`).toBeTruthy()
          expect(type.gloss[code], `${mode} ${type.ko} gloss ${code}`).toBeTruthy()
        }
      }
      if (content.tip) {
        for (const code of LOCALE_CODES) {
          expect(content.tip[code], `${mode} tip ${code}`).toBeTruthy()
        }
      }
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd munbeop && pnpm test tests/unit/practice-help/seed-invariants.test.ts`
Expected: FAIL — `~/seed/practice-help` does not resolve (module missing).

- [ ] **Step 3: Create the register content**

Create `app/seed/practice-help/register.ts`:

```ts
import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 높임법 (honorifics) — explanation for the register lab.
 * Korean examples are language-neutral; prose is localized via L().
 * Native review (owner's wife) pending on the 8 translations.
 */
export const REGISTER_HELP: PracticeHelpContent = {
  ko: '높임법',
  romanization: 'nopimbeop',
  subtitle: L(
    'the honorific system',
    'el sistema de honoríficos',
    'le système honorifique',
    'o sistema de honoríficos',
    'ระบบการยกย่อง (คำสุภาพ)',
    'sistem honorifik',
    'hệ thống kính ngữ',
    '敬語の体系',
  ),
  concept: L(
    "How Korean encodes respect. Depending on who you respect and who you're talking to, the language changes its particles, verb endings, and even whole words. Three layers work together: raising the subject, raising the object, and raising the listener.",
    'Cómo el coreano codifica el respeto. Según a quién respetas y con quién hablas, la lengua cambia sus partículas, las terminaciones del verbo e incluso palabras enteras. Tres capas trabajan juntas: elevar al sujeto, elevar al objeto y elevar al oyente.',
    "Comment le coréen encode le respect. Selon la personne que l'on respecte et celle à qui l'on parle, la langue change ses particules, ses terminaisons verbales et même des mots entiers. Trois niveaux agissent ensemble : élever le sujet, élever l'objet et élever l'interlocuteur.",
    'Como o coreano codifica o respeito. Dependendo de quem você respeita e com quem fala, a língua muda suas partículas, as terminações verbais e até palavras inteiras. Três camadas atuam juntas: elevar o sujeito, elevar o objeto e elevar o ouvinte.',
    'วิธีที่ภาษาเกาหลีแสดงความเคารพ ขึ้นกับว่าคุณเคารพใครและกำลังพูดกับใคร ภาษาจะเปลี่ยนทั้งคำชี้ (อนุภาค) ท้ายคำกริยา และแม้แต่คำศัพท์ทั้งคำ มีสามชั้นทำงานร่วมกัน คือ ยกย่องประธาน ยกย่องกรรม และยกย่องผู้ฟัง',
    'Cara bahasa Korea menyandikan rasa hormat. Bergantung pada siapa yang Anda hormati dan dengan siapa Anda bicara, bahasanya mengubah partikel, akhiran verba, bahkan kata utuh. Tiga lapisan bekerja bersama: meninggikan subjek, meninggikan objek, dan meninggikan lawan bicara.',
    'Cách tiếng Hàn thể hiện sự kính trọng. Tùy vào người bạn kính trọng và người bạn đang nói chuyện, ngôn ngữ thay đổi tiểu từ, đuôi động từ, thậm chí cả từ vựng. Ba tầng phối hợp với nhau: nâng chủ ngữ, nâng tân ngữ và nâng người nghe.',
    '韓国語が敬意を表す仕組み。誰を敬い、誰と話すかによって、助詞・語尾、さらには単語そのものまで変わる。主語を高める・客体を高める・聞き手を高める、の三つの層が組み合わさる。',
  ),
  types: [
    {
      ko: '주체 높임',
      label: L(
        'raising the subject', 'elevar al sujeto', 'élever le sujet', 'elevar o sujeito',
        'การยกย่องประธาน', 'meninggikan subjek', 'nâng chủ ngữ', '主体敬語',
      ),
      desc: L(
        'Respect the person doing the action. Add -(으)시- to the verb, use the particle 께서 instead of 이/가, and swap in special honorific verbs like 계시다 or 잡수시다.',
        'Respeta a quien realiza la acción. Añade -(으)시- al verbo, usa la partícula 께서 en vez de 이/가 y cambia a verbos honoríficos especiales como 계시다 o 잡수시다.',
        "Respecter la personne qui fait l'action. Ajoutez -(으)시- au verbe, utilisez 께서 au lieu de 이/가, et remplacez par des verbes honorifiques comme 계시다 ou 잡수시다.",
        'Respeite quem realiza a ação. Acrescente -(으)시- ao verbo, use 께서 em vez de 이/가 e troque por verbos honoríficos como 계시다 ou 잡수시다.',
        'ยกย่องผู้ที่ทำกริยา เติม -(으)시- ที่คำกริยา ใช้อนุภาค 께서 แทน 이/가 และเปลี่ยนเป็นคำกริยายกย่องพิเศษ เช่น 계시다 หรือ 잡수시다',
        'Hormati pelaku tindakan. Tambahkan -(으)시- pada verba, pakai partikel 께서 alih-alih 이/가, dan ganti dengan verba hormat khusus seperti 계시다 atau 잡수시다.',
        'Kính trọng người thực hiện hành động. Thêm -(으)시- vào động từ, dùng tiểu từ 께서 thay cho 이/가, và đổi sang động từ kính ngữ như 계시다 hay 잡수시다.',
        '動作をする人を敬う。動詞に -(으)시- を付け、이/가 の代わりに 께서 を使い、계시다・잡수시다 などの特別な尊敬動詞に置き換える。',
      ),
      example: '할아버지께서 신문을 읽으세요.',
      gloss: L(
        'Grandfather is reading the newspaper.', 'El abuelo está leyendo el periódico.',
        'Grand-père lit le journal.', 'O vovô está lendo o jornal.',
        'คุณปู่กำลังอ่านหนังสือพิมพ์', 'Kakek sedang membaca koran.',
        'Ông đang đọc báo.', 'おじいさまが新聞を読んでいらっしゃいます。',
      ),
    },
    {
      ko: '객체 높임',
      label: L(
        'raising the object', 'elevar al objeto', "élever l'objet", 'elevar o objeto',
        'การยกย่องกรรม', 'meninggikan objek', 'nâng tân ngữ', '客体敬語',
      ),
      desc: L(
        'Respect the person the action is aimed at. Use the particle 께 instead of 에게/한테, and special verbs like 드리다 (to give), 뵙다 (to see), 여쭙다 (to ask).',
        'Respeta a la persona hacia quien va la acción. Usa la partícula 께 en vez de 에게/한테 y verbos especiales como 드리다 (dar), 뵙다 (ver), 여쭙다 (preguntar).',
        "Respecter la personne visée par l'action. Utilisez 께 au lieu de 에게/한테, et des verbes spéciaux comme 드리다 (donner), 뵙다 (voir), 여쭙다 (demander).",
        'Respeite a quem a ação se dirige. Use a partícula 께 em vez de 에게/한테 e verbos especiais como 드리다 (dar), 뵙다 (ver), 여쭙다 (perguntar).',
        'ยกย่องผู้ที่เป็นเป้าหมายของการกระทำ ใช้อนุภาค 께 แทน 에게/한테 และคำกริยาพิเศษ เช่น 드리다 (ให้), 뵙다 (พบ), 여쭙다 (ถาม)',
        'Hormati orang yang menjadi sasaran tindakan. Pakai partikel 께 alih-alih 에게/한테, dan verba khusus seperti 드리다 (memberi), 뵙다 (menemui), 여쭙다 (bertanya).',
        'Kính trọng người mà hành động hướng tới. Dùng tiểu từ 께 thay cho 에게/한테, và động từ đặc biệt như 드리다 (biếu), 뵙다 (gặp), 여쭙다 (thưa hỏi).',
        '動作の向かう相手を敬う。에게/한테 の代わりに 께 を使い、드리다（差し上げる）・뵙다（お目にかかる）・여쭙다（伺う）などを用いる。',
      ),
      example: '선생님께 선물을 드렸어요.',
      gloss: L(
        'I gave the teacher a present.', 'Le di un regalo al profesor.',
        'J\'ai offert un cadeau au professeur.', 'Dei um presente ao professor.',
        'ฉันให้ของขวัญแก่คุณครู', 'Saya memberi hadiah kepada guru.',
        'Tôi đã tặng quà cho thầy giáo.', '先生にプレゼントを差し上げました。',
      ),
    },
    {
      ko: '상대 높임',
      label: L(
        'raising the listener', 'elevar al oyente', "élever l'interlocuteur", 'elevar o ouvinte',
        'การยกย่องผู้ฟัง', 'meninggikan lawan bicara', 'nâng người nghe', '相対敬語',
      ),
      desc: L(
        'Respect the person you are speaking to through the speech level — the sentence ending. From most formal to casual: 합니다체 (formal), 해요체 (polite), 해체/반말 (casual).',
        'Respeta a la persona con quien hablas mediante el nivel de habla — la terminación de la frase. De lo más formal a lo casual: 합니다체 (formal), 해요체 (cortés), 해체/반말 (casual).',
        "Respecter la personne à qui l'on parle via le niveau de langue — la terminaison de la phrase. Du plus formel au familier : 합니다체 (formel), 해요체 (poli), 해체/반말 (familier).",
        'Respeite a pessoa com quem fala pelo nível de fala — a terminação da frase. Do mais formal ao casual: 합니다체 (formal), 해요체 (polido), 해체/반말 (casual).',
        "ยกย่องคู่สนทนาผ่าน 'ระดับการพูด' คือท้ายประโยค จากทางการที่สุดไปกันเอง: 합니다체 (ทางการ), 해요체 (สุภาพ), 해체/반말 (กันเอง)",
        'Hormati lawan bicara lewat tingkat tutur — akhiran kalimat. Dari paling formal ke santai: 합니다체 (formal), 해요체 (sopan), 해체/반말 (santai).',
        'Kính trọng người đối thoại qua cấp độ lời nói — đuôi câu. Từ trang trọng nhất đến thân mật: 합니다체 (trang trọng), 해요체 (lịch sự), 해체/반말 (thân mật).',
        '話す相手を、文末の「話し方のレベル」で敬う。最も丁寧なものからくだけたものへ：합니다체（フォーマル）、해요체（丁寧）、해체/반말（タメ口）。',
      ),
      example: '안녕히 가십시오. / 잘 가.',
      gloss: L(
        'Goodbye. (formal) / Bye. (casual)', 'Adiós. (formal) / Chao. (casual)',
        'Au revoir. (formel) / Salut. (familier)', 'Até logo. (formal) / Tchau. (casual)',
        'ลาก่อนนะคะ/ครับ (ทางการ) / ไปนะ (กันเอง)', 'Selamat jalan. (formal) / Dah. (santai)',
        'Tạm biệt ạ. (trang trọng) / Đi nhé. (thân mật)', 'さようなら。（フォーマル）／じゃあね。（タメ口）',
      ),
    },
  ],
  howToPlay: [
    L(
      'Pick a mode: speech levels (formal ↔ casual) or honorifics (rewrite into the respectful form).',
      'Elige un modo: niveles de habla (formal ↔ casual) u honoríficos (reescribir en la forma respetuosa).',
      'Choisissez un mode : niveaux de langue (formel ↔ familier) ou honorifiques (réécrire à la forme respectueuse).',
      'Escolha um modo: níveis de fala (formal ↔ casual) ou honoríficos (reescrever na forma respeitosa).',
      'เลือกโหมด: ระดับการพูด (ทางการ ↔ กันเอง) หรือคำยกย่อง (เขียนใหม่เป็นรูปสุภาพ)',
      'Pilih mode: tingkat tutur (formal ↔ santai) atau honorifik (tulis ulang ke bentuk hormat).',
      'Chọn chế độ: cấp độ lời nói (trang trọng ↔ thân mật) hoặc kính ngữ (viết lại sang dạng kính trọng).',
      'モードを選ぶ：話し方のレベル（フォーマル↔タメ口）か、敬語（尊敬形に書き換える）。',
    ),
    L(
      'Read the sentence and choose the correct transformation from the options.',
      'Lee la frase y elige la transformación correcta entre las opciones.',
      'Lisez la phrase et choisissez la bonne transformation parmi les options.',
      'Leia a frase e escolha a transformação correta entre as opções.',
      'อ่านประโยคแล้วเลือกการแปลงที่ถูกต้องจากตัวเลือก',
      'Baca kalimatnya dan pilih transformasi yang benar dari pilihan yang ada.',
      'Đọc câu và chọn cách biến đổi đúng trong các lựa chọn.',
      '文を読み、選択肢から正しい変換を選ぶ。',
    ),
    L(
      'Get it right to grow your mastery of the set; misses come back in review.',
      'Acierta para subir tu maestría del set; los fallos vuelven en el repaso.',
      'Visez juste pour faire grandir votre maîtrise du set ; les erreurs reviennent en révision.',
      'Acerte para aumentar seu domínio do conjunto; os erros voltam na revisão.',
      'ตอบถูกเพื่อเพิ่มความเชี่ยวชาญของชุดนั้น ส่วนที่พลาดจะกลับมาให้ทบทวน',
      'Jawab benar untuk menumbuhkan penguasaan set ini; yang meleset kembali saat ulasan.',
      'Trả lời đúng để tăng độ thành thạo của bộ; câu sai sẽ quay lại khi ôn tập.',
      '正解するとそのセットの習熟度が上がる。間違いは復習で戻ってくる。',
    ),
  ],
  tip: L(
    "Classic trap: for 주체 높임, use 계시다 when the respected person is the one 'being' somewhere (할머니께서 집에 계세요), but 있으시다 when it's something they 'have' (할머니께서 시간이 있으세요).",
    "Trampa clásica: en 주체 높임, usa 계시다 cuando la persona respetada es quien 'está' en un lugar (할머니께서 집에 계세요), pero 있으시다 cuando es algo que 'tiene' (할머니께서 시간이 있으세요).",
    "Piège classique : pour 주체 높임, utilisez 계시다 quand la personne respectée « se trouve » quelque part (할머니께서 집에 계세요), mais 있으시다 quand il s'agit de ce qu'elle « a » (할머니께서 시간이 있으세요).",
    "Pegadinha clássica: em 주체 높임, use 계시다 quando a pessoa respeitada é quem 'está' em algum lugar (할머니께서 집에 계세요), mas 있으시다 quando é algo que ela 'tem' (할머니께서 시간이 있으세요).",
    "กับดักคลาสสิก: ใน 주체 높임 ใช้ 계시다 เมื่อผู้ที่เคารพ 'อยู่' ที่ไหนสักแห่ง (할머니께서 집에 계세요) แต่ใช้ 있으시다 เมื่อเป็นสิ่งที่ท่าน 'มี' (할머니께서 시간이 있으세요)",
    "Jebakan klasik: untuk 주체 높임, pakai 계시다 saat orang yang dihormati 'berada' di suatu tempat (할머니께서 집에 계세요), tetapi 있으시다 saat itu sesuatu yang 'dimiliki' (할머니께서 시간이 있으세요).",
    "Bẫy kinh điển: với 주체 높임, dùng 계시다 khi người được kính trọng 'đang ở' đâu đó (할머니께서 집에 계세요), nhưng 있으시다 khi đó là thứ họ 'có' (할머니께서 시간이 있으세요).",
    '定番の落とし穴：주체 높임 では、敬う人が「いる」ときは 계시다（할머니께서 집에 계세요）、その人が「持っている／ある」ときは 있으시다（할머니께서 시간이 있으세요）。',
  ),
}
```

- [ ] **Step 4: Create the registry**

Create `app/seed/practice-help/index.ts`:

```ts
import type { PracticeHelpContent, PracticeHelpMode } from '~/lib/domain'
import { REGISTER_HELP } from './register'

/** Mode id → explanation content. Modes without an entry simply show no button. */
export const PRACTICE_HELP: Partial<Record<PracticeHelpMode, PracticeHelpContent>> = {
  register: REGISTER_HELP,
}

/** Lookup by raw string so callers (and the v-if) need no cast. */
export function helpFor(mode: string): PracticeHelpContent | undefined {
  return PRACTICE_HELP[mode as PracticeHelpMode]
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd munbeop && pnpm test tests/unit/practice-help/seed-invariants.test.ts`
Expected: PASS (3 passing).

- [ ] **Step 6: Typecheck**

Run: `cd munbeop && pnpm typecheck`
Expected: PASS — confirms every `L()` call supplied all 8 locales.

- [ ] **Step 7: Commit**

```bash
cd munbeop && git add app/seed/practice-help tests/unit/practice-help/seed-invariants.test.ts
git commit -m "feat(practice-help): register (높임법) content + registry"
```

---

## Task 4: PracticeHelp component (TDD)

**Files:**
- Create: `app/components/practice/PracticeHelp.vue`
- Test: `tests/components/practice/PracticeHelp.test.ts`

- [ ] **Step 1: Write the failing component test**

Create `tests/components/practice/PracticeHelp.test.ts`:

```ts
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PracticeHelp from '~/components/practice/PracticeHelp.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('PracticeHelp', () => {
  it('renders the explanation trigger for a mode that has content', () => {
    const w = mount(PracticeHelp, { props: { mode: 'register' } })
    const btn = w.find('.practice-help__trigger')
    expect(btn.exists()).toBe(true)
    // i18n key-echo stub returns the key.
    expect(btn.text()).toContain('practiceHelp.button')
  })

  it('opens the modal and shows the concept and its three types', async () => {
    const w = mount(PracticeHelp, { props: { mode: 'register' }, attachTo: document.body })
    await w.find('.practice-help__trigger').trigger('click')
    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    // useLocalized resolves to 'en' under the test stub.
    expect(dialog!.textContent).toContain('How Korean encodes respect')
    expect(dialog!.querySelectorAll('.practice-help__type').length).toBe(3)
    w.unmount()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd munbeop && pnpm test tests/components/practice/PracticeHelp.test.ts`
Expected: FAIL — `~/components/practice/PracticeHelp.vue` does not exist.

- [ ] **Step 3: Create the component**

Create `app/components/practice/PracticeHelp.vue`:

```vue
<!-- app/components/practice/PracticeHelp.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import { helpFor } from '~/seed/practice-help'
import type { PracticeHelpMode } from '~/lib/domain'

const props = defineProps<{ mode: PracticeHelpMode }>()
const { t } = useI18n()
const { tl } = useLocalized()

const content = computed(() => helpFor(props.mode))
const open = ref(false)
</script>

<template>
  <div v-if="content" class="practice-help">
    <button type="button" class="practice-help__trigger" @click="open = true">
      <span aria-hidden="true">?</span> {{ t('practiceHelp.button') }}
    </button>

    <Modal
      :open="open"
      :title="content.ko"
      :close-label="t('practiceHelp.close')"
      @close="open = false"
    >
      <header class="practice-help__head">
        <h2 class="practice-help__title">
          {{ content.ko }}
          <span v-if="content.romanization" class="practice-help__rom">{{ content.romanization }}</span>
        </h2>
        <p class="practice-help__subtitle">{{ tl(content.subtitle) }}</p>
      </header>

      <section class="practice-help__section">
        <h3 class="practice-help__h">{{ t('practiceHelp.section.concept') }}</h3>
        <p class="practice-help__p">{{ tl(content.concept) }}</p>
      </section>

      <section v-if="content.types && content.types.length" class="practice-help__section">
        <h3 class="practice-help__h">{{ t('practiceHelp.section.types') }}</h3>
        <ul class="practice-help__types">
          <li v-for="type in content.types" :key="type.ko" class="practice-help__type">
            <p class="practice-help__type-name"><strong>{{ type.ko }}</strong> · {{ tl(type.label) }}</p>
            <p class="practice-help__p">{{ tl(type.desc) }}</p>
            <p class="practice-help__example">
              <span lang="ko">{{ type.example }}</span>
              <span class="practice-help__gloss">{{ tl(type.gloss) }}</span>
            </p>
          </li>
        </ul>
      </section>

      <section class="practice-help__section">
        <h3 class="practice-help__h">{{ t('practiceHelp.section.howToPlay') }}</h3>
        <ol class="practice-help__steps">
          <li v-for="(step, i) in content.howToPlay" :key="i">{{ tl(step) }}</li>
        </ol>
      </section>

      <section v-if="content.tip" class="practice-help__section practice-help__section--tip">
        <h3 class="practice-help__h">{{ t('practiceHelp.section.tip') }}</h3>
        <p class="practice-help__p">{{ tl(content.tip) }}</p>
      </section>
    </Modal>
  </div>
</template>

<style scoped>
.practice-help { align-self: flex-start; }
.practice-help__trigger {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em;
  color: var(--ink); background: var(--surface); border: 2px solid var(--border);
  box-shadow: 2px 2px 0 var(--shadow-cream); padding: 6px 12px; cursor: pointer;
}
.practice-help__trigger:hover { background: var(--paper-deep, var(--paper)); }
.practice-help__trigger:focus-visible { outline: 2px solid var(--focus-ring, var(--gold)); outline-offset: 2px; }

.practice-help__head { margin-bottom: 16px; }
.practice-help__title { margin: 0; font-family: var(--font-pixel); font-size: var(--text-lg); color: var(--ink); }
.practice-help__rom { margin-left: 8px; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.practice-help__subtitle { margin: 4px 0 0; font-family: var(--font-ui); color: var(--text-soft); }

.practice-help__section { margin-top: 18px; }
.practice-help__section--tip {
  background: var(--surface); border: 2px dashed var(--border); padding: 10px 14px;
}
.practice-help__h {
  margin: 0 0 8px; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-soft);
}
.practice-help__p { margin: 0; font-family: var(--font-ui); line-height: 1.6; color: var(--ink); white-space: pre-line; }

.practice-help__types { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.practice-help__type-name { margin: 0 0 4px; font-family: var(--font-ui); color: var(--ink); }
.practice-help__example { margin: 6px 0 0; display: flex; flex-direction: column; gap: 2px; }
.practice-help__example span[lang="ko"] { font-family: var(--font-ko, 'Noto Sans KR', sans-serif); color: var(--ink); }
.practice-help__gloss { font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }

.practice-help__steps { margin: 0; padding-left: 20px; font-family: var(--font-ui); line-height: 1.7; color: var(--ink); }
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd munbeop && pnpm test tests/components/practice/PracticeHelp.test.ts`
Expected: PASS (2 passing).

- [ ] **Step 5: Commit**

```bash
cd munbeop && git add app/components/practice/PracticeHelp.vue tests/components/practice/PracticeHelp.test.ts
git commit -m "feat(practice-help): PracticeHelp button + modal component"
```

---

## Task 5: Wire the component into all 9 practice pages

For each page below: (a) add the import in `<script setup>` next to the other component imports, and (b) add the `<PracticeHelp>` element on the line immediately after the existing `<BilingualTitle … />`.

Import line (identical in every page):
```ts
import PracticeHelp from '~/components/practice/PracticeHelp.vue'
```

- [ ] **Step 1: `app/pages/practice/register.vue`** — after line 72 `<BilingualTitle ko="높임법 연구소" :latin="t('register.title')" />` add:
```vue
    <PracticeHelp mode="register" />
```

- [ ] **Step 2: `app/pages/practice/ruleta.vue`** — after `<BilingualTitle ko="연습" :latin="t('title.practice')" />` (line ~289) add:
```vue
    <PracticeHelp mode="ruleta" />
```

- [ ] **Step 3: `app/pages/practice/particles.vue`** — after `<BilingualTitle ko="조사 연구소" :latin="t('particles.title')" />` (line ~92) add:
```vue
    <PracticeHelp mode="particles" />
```

- [ ] **Step 4: `app/pages/practice/conjugation.vue`** — after `<BilingualTitle ko="활용 연습" :latin="t('conjugation.title')" />` (line ~58) add:
```vue
    <PracticeHelp mode="conjugation" />
```

- [ ] **Step 5: `app/pages/practice/cloze.vue`** — after `<BilingualTitle ko="빈칸 연습" :latin="t('cloze.title')" />` (line ~112) add:
```vue
    <PracticeHelp mode="cloze" />
```

- [ ] **Step 6: `app/pages/practice/counters.vue`** — after `<BilingualTitle ko="수 분류사 연구소" :latin="t('counters.title')" />` (line ~41) add:
```vue
    <PracticeHelp mode="counters" />
```

- [ ] **Step 7: `app/pages/practice/placement.vue`** — after `<BilingualTitle ko="배치 테스트" :latin="t('placement.title')" />` (line ~36) add:
```vue
    <PracticeHelp mode="placement" />
```

- [ ] **Step 8: `app/pages/practice/number-market.vue`** — after `<BilingualTitle ko="숫자 시장" :latin="t('numberMarket.title')" />` (line ~88) add:
```vue
    <PracticeHelp mode="number-market" />
```

- [ ] **Step 9: `app/pages/practice/rescue.vue`** — after `<BilingualTitle ko="다시 돌보기" :latin="t('rescue.title')" />` (line ~42) add:
```vue
    <PracticeHelp mode="rescue" />
```

- [ ] **Step 10: Typecheck (catches a wrong/typo'd mode literal)**

Run: `cd munbeop && pnpm typecheck`
Expected: PASS — each `mode="…"` is a valid `PracticeHelpMode`. In Phase 1 only `register` renders a button; the other eight host the component silently until their content lands.

- [ ] **Step 11: Commit**

```bash
cd munbeop && git add app/pages/practice
git commit -m "feat(practice-help): mount PracticeHelp on all 9 practice pages"
```

---

## Task 6: Full gate + manual smoke

- [ ] **Step 1: Run the full test suite**

Run: `cd munbeop && pnpm test`
Expected: PASS — all suites green, including the 3 new ones. Note the new total count.

- [ ] **Step 2: Typecheck**

Run: `cd munbeop && pnpm typecheck`
Expected: PASS (0 errors).

- [ ] **Step 3: Lint**

Run: `cd munbeop && pnpm lint`
Expected: PASS (0 errors). If `import/first` complains in any page, move the `PracticeHelp` import up with the other imports.

- [ ] **Step 4: Manual smoke (dev server)**

Run: `cd munbeop && pnpm dev`, open `/practice/register`. Confirm: the "Explanation" button shows beside the title; clicking opens the modal with the 높임법 headline, concept, three 높임 types with Korean examples, the how-to-play steps, and the tip; ESC and the X close it; switching locale (settings) re-renders the modal text. Visit one other lab (e.g. `/practice/cloze`) and confirm no button appears (no content yet) and nothing is broken.

- [ ] **Step 5: No code commit needed** (verification only). If lint auto-fixes were applied, commit them:

```bash
cd munbeop && git add -A && git commit -m "chore(practice-help): lint fixups"
```

---

## Phase 2 (separate execution) — roll out the remaining 8 modes

Phase 1 ships the whole system + the `register` pilot. Phase 2 lights up each remaining mode by adding **one seed file** — no component, test-harness, or wiring changes. This is a **repeatable recipe**, run once per mode, each with native review (owner's wife) of the Korean examples and the 8 translations. The owner's established multilingual-authoring pipeline (Korean author-panel + adversarial-verify Workflow) is the recommended way to draft the 8 locales.

Recommended order (modes with clear "types" first, reinforcing what users already drill): `particles` → `counters` → `conjugation` → `number-market` → `ruleta` → `rescue` → `cloze` → `placement`.

Per-mode recipe:
1. Create `app/seed/practice-help/<mode>.ts` exporting `<MODE>_HELP: PracticeHelpContent`, following `register.ts` exactly (headline `ko`, `subtitle`, `concept`, optional `types`, `howToPlay`, optional `tip`), every `L()` filled in all 8 locales. `types` is optional — omit it for `cloze`/`placement` (mostly "what this is / how it works"); for `number-market`, use it for native vs Sino-Korean numbers and cover the 3 sub-modes (learn/speed/dictation) in `howToPlay`.
2. Register it in `app/seed/practice-help/index.ts`: import it and add the `<mode>:` entry to `PRACTICE_HELP`.
3. Run `cd munbeop && pnpm test tests/unit/practice-help/seed-invariants.test.ts` — the existing invariants test now validates the new entry (8-locale completeness, type fields). Run `pnpm typecheck` to confirm all `L()` slots are present.
4. Manual smoke: the button now appears on that lab's page (already wired in Phase 1).
5. Commit: `feat(practice-help): <mode> explanation content`.

The content-model concept outline per mode lives in the design spec (`docs/superpowers/specs/2026-06-29-practice-explanations-design.md`).

---

## Self-Review

**Spec coverage:** Architecture (registry + component + Modal reuse) → Tasks 1,3,4. Content model → Task 1 types + Task 3 content. Component → Task 4. Wiring all 9 pages → Task 5. i18n chrome + content via `L()` → Tasks 2,3. The three named tests → Tasks 2,3,4. Delivery Phase 1 vs Phase 2 → Tasks 1–6 + Phase 2 appendix. Out-of-scope items (audio, content expansion, escape-room, URL deep-link) are not implemented, as specified. All spec sections map to a task.

**Placeholder scan:** No "TBD/TODO/handle edge cases" — every code step shows complete code; every run step shows the exact command and expected result. Phase 2 is a real repeatable recipe, not a stand-in for missing Phase-1 detail.

**Type consistency:** `PracticeHelpContent` / `PracticeHelpType` / `PracticeHelpMode` (Task 1) are used identically in `register.ts`, `index.ts`, the component, and both unit tests. `helpFor(mode: string)` signature matches its call in `PracticeHelp.vue` (`helpFor(props.mode)`) and the seed test. `PRACTICE_HELP` is `Partial<Record<PracticeHelpMode, …>>` consistently. Locale order in every `L()` is `en, es, fr, pt-BR, th, id, vi, ja`. Test selectors (`.practice-help__trigger`, `.practice-help__type`, `[role="dialog"]`) match the component markup and the reused `ui/Modal.vue`.
