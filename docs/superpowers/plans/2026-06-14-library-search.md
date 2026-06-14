# Library Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an instant, URL-driven search + filter to the Library page so a learner finds any grammar pattern by typing Korean or its meaning, instead of scanning deck by deck.

**Architecture:** A pure ranking module (`lib/library/search.ts`, no Vue) does the matching/scoring; a `useLibrarySearch` composable binds it to the URL (`?q=` / `?level=` / `?cat=`, plus the garden's `?theme=`); a `LibrarySearchBar.vue` renders the controls; `GrammarCard.vue` (extracted from the duplicated card markup) is reused by both the grouped view and the flat results list. `pages/library.vue` becomes a thin orchestrator.

**Tech Stack:** Nuxt 4 (SPA, `ssr:false`), Vue 3 `<script setup>`, Pinia, `@nuxtjs/i18n` v9 (8 locales), `@vueuse/core` (`watchDebounced`), Vitest 3 + `@vue/test-utils`, pnpm.

**Spec:** `docs/superpowers/specs/2026-06-14-library-search-design.md`

> **Working directory for all commands:** `munbeop/` (the Nuxt app root). Paths
> below are relative to `munbeop/` unless they start with `docs/`.
>
> **Project rule (load-bearing):** `verify → commit → verify → push`. Each
> commit step runs `pnpm typecheck && pnpm test` first (typecheck has caught
> real bugs here). `pnpm lint` + `pnpm build` run once at the end (Task 8).
> Reply to the user in Spanish; all code/commits/this plan stay English.

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `app/lib/domain/topik.ts` | spine lookups; **add** memoized `categoryOf`/`levelOf`/`presentCategories` + `GRAMMAR_TYPE_ORDER` | Modify |
| `app/lib/library/search.ts` | pure `normalize`/`scoreItem`/`searchLibrary` (no Vue) | Create |
| `app/composables/useLibrarySearch.ts` | URL ↔ filter state, debounce, `results`/`isFiltering`/`clear` | Create |
| `app/components/library/GrammarCard.vue` | one grammar card (ko/meaning/example/trans + mastery), emits `click` | Create |
| `app/components/library/LibrarySearchBar.vue` | input + level/category selects + clear + count + zone banner | Create |
| `app/pages/library.vue` | mount bar; flat results when filtering, grouped otherwise; drop old zoneFilter | Modify |
| `i18n/locales/*.json` (×8) | `library.search.*` chrome + category labels | Modify |
| `tests/unit/library/search.test.ts` | ranking, filters, locale, romanization regression, NFC | Create |
| `tests/unit/library/topik-index.test.ts` | `categoryOf`/`levelOf`/`presentCategories` | Create |
| `tests/unit/library/i18n-search-keys.test.ts` | 8-locale key parity for `library.search` | Create |
| `tests/components/library/GrammarCard.test.ts` | renders fields, emits click | Create |
| `tests/components/library/LibrarySearchBar.test.ts` | typing/selects/clear/count/banner | Create |

Build order: Task 1 (index) → 2 (search module) → 3 (i18n) → 4 (GrammarCard + refactor) → 5 (composable) → 6 (search bar) → 7 (integrate) → 8 (full verify). Each task is independently committable and leaves the app working.

---

## Task 1: Spine cross-reference index (`categoryOf` / `levelOf`)

**Files:**
- Modify: `app/lib/domain/topik.ts` (append after the existing `searchByKo` / `STARS_TO_IMPORTANCE` block)
- Test: `tests/unit/library/topik-index.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/library/topik-index.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { allItems, categoryOf, levelOf, presentCategories, GRAMMAR_TYPE_ORDER } from '~/lib/domain'

describe('spine ko-index', () => {
  it('levelOf resolves the TOPIK level of a known topik pattern', () => {
    const sample = allItems().find((x) => x.source.kind === 'topik')!
    const expected = sample.source.kind === 'topik' ? sample.source.level : undefined
    expect(levelOf(sample.ko)).toBe(expected)
  })

  it('categoryOf resolves a defined type for a typed item', () => {
    const typed = allItems().find((x) => x.type)!
    expect(categoryOf(typed.ko)).toBeDefined()
  })

  it('returns undefined for an unknown ko', () => {
    expect(levelOf('___nope___')).toBeUndefined()
    expect(categoryOf('___nope___')).toBeUndefined()
  })

  it('presentCategories is a non-empty, ordered subset of GRAMMAR_TYPE_ORDER', () => {
    const present = presentCategories()
    expect(present.length).toBeGreaterThan(0)
    for (const c of present) expect(GRAMMAR_TYPE_ORDER).toContain(c)
    const idx = present.map((c) => GRAMMAR_TYPE_ORDER.indexOf(c))
    expect(idx).toEqual([...idx].sort((a, b) => a - b))
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test -- tests/unit/library/topik-index.test.ts`
Expected: FAIL — `categoryOf`/`levelOf`/`presentCategories`/`GRAMMAR_TYPE_ORDER` are not exported.

- [ ] **Step 3: Implement the index in `topik.ts`**

Append to `app/lib/domain/topik.ts`:

```ts
// ─── ko → {level, type} index (for Library search/filter) ──────────────────

/** Fixed, human-friendly display order for the 15 GrammarType values. */
export const GRAMMAR_TYPE_ORDER: GrammarType[] = [
  'particle', 'ending', 'conj', 'expr', 'aux', 'verb', 'voice', 'lex',
  'nominal', 'modifier', 'copula', 'negation', 'adv', 'indirect', 'meta',
]

let _koIndex: Map<string, { level?: TopikLevel; type?: GrammarType }> | null = null

function koIndex(): Map<string, { level?: TopikLevel; type?: GrammarType }> {
  if (_koIndex) return _koIndex
  const m = new Map<string, { level?: TopikLevel; type?: GrammarType }>()
  for (const it of allItems()) {
    if (!m.has(it.ko)) {
      m.set(it.ko, {
        level: it.source.kind === 'topik' ? it.source.level : undefined,
        type: it.type,
      })
    }
  }
  _koIndex = m
  return m
}

/** Coarse grammar category for a rendered pattern, or undefined if unknown. */
export function categoryOf(ko: string): GrammarType | undefined {
  return koIndex().get(ko)?.type
}

/** TOPIK level for a rendered pattern, or undefined for transversal/unknown. */
export function levelOf(ko: string): TopikLevel | undefined {
  return koIndex().get(ko)?.level
}

/** Distinct categories actually present in the spine, in GRAMMAR_TYPE_ORDER. */
export function presentCategories(): GrammarType[] {
  const seen = new Set<GrammarType>()
  for (const it of allItems()) if (it.type) seen.add(it.type)
  return GRAMMAR_TYPE_ORDER.filter((t) => seen.has(t))
}
```

These are re-exported automatically via `app/lib/domain/index.ts` (`export * from './topik'`).

- [ ] **Step 4: Run it to confirm it passes**

Run: `pnpm test -- tests/unit/library/topik-index.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
pnpm typecheck && pnpm test -- tests/unit/library/topik-index.test.ts
git add app/lib/domain/topik.ts tests/unit/library/topik-index.test.ts
git commit -m "feat(library): ko→level/category spine index for search"
```

---

## Task 2: Pure search module (`lib/library/search.ts`)

**Files:**
- Create: `app/lib/library/search.ts`
- Test: `tests/unit/library/search.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/library/search.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import type { Grammar, GrammarType, TopikLevel } from '~/lib/domain'
import { normalize, scoreItem, searchLibrary } from '~/lib/library/search'

function g(ko: string, en: string, es = '', opts: Partial<Grammar> = {}): Grammar {
  return { ko, meaning: { en, es, fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' }, deckId: 'd', ...opts }
}

const LEVELS: Record<string, TopikLevel> = { '은/는': 1, '-기 전에': 2, '-더라': 5 }
const CATS: Record<string, GrammarType> = { '은/는': 'particle', '-기 전에': 'expr', '-더라': 'ending' }
const ctxEn = { locale: 'en' as const, levelOf: (ko: string) => LEVELS[ko], categoryOf: (ko: string) => CATS[ko] }
const ctxEs = { ...ctxEn, locale: 'es' as const }

const items: Grammar[] = [
  g('은/는', 'topic particle — marks the topic'),
  g('-기 전에', 'before doing something', 'antes de hacer algo', {
    example: '자기 전에',
    trans: { en: 'before sleeping', es: 'antes de dormir', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  }),
  g('-더라', 'retrospective ending'),
]
const noFilter = { level: null, category: null, themeKos: null }

describe('normalize', () => {
  it('trims and lowercases Latin', () => {
    expect(normalize('  ABC de  ')).toBe('abc de')
  })
  it('NFC-composes decomposed Hangul jamo', () => {
    expect(normalize('은')).toBe('은') // ㅇ+ㅡ+ㄴ → 은
  })
})

describe('scoreItem', () => {
  it('exact ko outranks prefix outranks substring', () => {
    const exact = scoreItem(g('은/는', 'x'), '은/는', 'en')
    const prefix = scoreItem(g('은/는', 'x'), '은', 'en')
    const substr = scoreItem(g('은/는', 'x'), '는', 'en')
    expect(exact).toBeGreaterThan(prefix)
    expect(prefix).toBeGreaterThan(substr)
    expect(substr).toBeGreaterThan(0)
  })
  it('meaning match scores lower than ko match', () => {
    const ko = scoreItem(items[1]!, '기', 'en')
    const meaning = scoreItem(items[1]!, 'before', 'en')
    expect(ko).toBeGreaterThan(meaning)
    expect(meaning).toBeGreaterThan(0)
  })
})

describe('searchLibrary', () => {
  it('finds a pattern by its meaning in the active locale (es)', () => {
    const r = searchLibrary(items, { query: 'antes', ...noFilter }, ctxEs)
    expect(r.map((x) => x.ko)).toEqual(['-기 전에'])
  })

  it('does NOT match romanization (no eun/neun/seyo support)', () => {
    for (const q of ['eun', 'neun', 'seyo']) {
      expect(searchLibrary(items, { query: q, ...noFilter }, ctxEn)).toEqual([])
    }
  })

  it('filters by level', () => {
    const r = searchLibrary(items, { query: '', level: 2, category: null, themeKos: null }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['-기 전에'])
  })

  it('filters by category', () => {
    const r = searchLibrary(items, { query: '', level: null, category: 'particle', themeKos: null }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['은/는'])
  })

  it('ANDs text + level + category', () => {
    const r = searchLibrary(items, { query: '', level: 1, category: 'particle', themeKos: null }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['은/는'])
  })

  it('empty query returns all (filtered) items in level-then-index order', () => {
    const r = searchLibrary(items, { query: '', ...noFilter }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['은/는', '-기 전에', '-더라'])
  })

  it('restricts to themeKos when provided', () => {
    const r = searchLibrary(items, { query: '', level: null, category: null, themeKos: new Set(['-더라']) }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['-더라'])
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test -- tests/unit/library/search.test.ts`
Expected: FAIL — module `~/lib/library/search` not found.

- [ ] **Step 3: Implement the module**

Create `app/lib/library/search.ts`:

```ts
import type { Grammar, GrammarType, LocaleCode, TopikLevel } from '~/lib/domain'
import { localized } from '~/lib/domain'

export interface LibraryFilter {
  query: string
  level: TopikLevel | null
  category: GrammarType | null
  /** ko allow-set from ?theme= (garden deep-link); null = no theme filter. */
  themeKos: Set<string> | null
}

export interface SearchContext {
  locale: LocaleCode
  levelOf: (ko: string) => TopikLevel | undefined
  categoryOf: (ko: string) => GrammarType | undefined
}

/** Normalize for matching: NFC (compose Hangul), trim, lowercase (Latin). */
export function normalize(s: string): string {
  return s.normalize('NFC').trim().toLowerCase()
}

const SCORE = {
  KO_EXACT: 100,
  KO_PREFIX: 80,
  KO_SUBSTR: 60,
  MEANING_WORD: 40,
  MEANING_SUBSTR: 25,
  TEXT_SUBSTR: 10, // example or trans
} as const

/** Relevance score for one item against an already-normalized query `q`. */
export function scoreItem(it: Grammar, q: string, locale: LocaleCode): number {
  const ko = normalize(it.ko)
  if (ko === q) return SCORE.KO_EXACT
  let best = 0
  if (ko.startsWith(q)) best = Math.max(best, SCORE.KO_PREFIX)
  else if (ko.includes(q)) best = Math.max(best, SCORE.KO_SUBSTR)

  const meaning = normalize(localized(it.meaning, locale))
  if (meaning) {
    if ((' ' + meaning).includes(' ' + q)) best = Math.max(best, SCORE.MEANING_WORD)
    else if (meaning.includes(q)) best = Math.max(best, SCORE.MEANING_SUBSTR)
  }
  if (it.example && normalize(it.example).includes(q)) best = Math.max(best, SCORE.TEXT_SUBSTR)
  if (it.trans && normalize(localized(it.trans, locale)).includes(q)) best = Math.max(best, SCORE.TEXT_SUBSTR)
  return best
}

/**
 * Filter (AND over level/category/theme) then rank. With no query, returns
 * filtered items in stable level-then-original-order. With a query, returns
 * only positive-score items, sorted by score desc, then level asc, then index.
 */
export function searchLibrary(items: Grammar[], filter: LibraryFilter, ctx: SearchContext): Grammar[] {
  const q = normalize(filter.query)
  const lvlRank = (it: Grammar) => ctx.levelOf(it.ko) ?? 99
  const passes = (it: Grammar): boolean => {
    if (filter.themeKos && !filter.themeKos.has(it.ko)) return false
    if (filter.level != null && ctx.levelOf(it.ko) !== filter.level) return false
    if (filter.category != null && ctx.categoryOf(it.ko) !== filter.category) return false
    return true
  }

  const rows = items.map((it, idx) => ({ it, idx })).filter((r) => passes(r.it))

  if (!q) {
    return rows.sort((a, b) => lvlRank(a.it) - lvlRank(b.it) || a.idx - b.idx).map((r) => r.it)
  }
  return rows
    .map((r) => ({ ...r, score: scoreItem(r.it, q, ctx.locale) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || lvlRank(a.it) - lvlRank(b.it) || a.idx - b.idx)
    .map((r) => r.it)
}
```

- [ ] **Step 4: Run it to confirm it passes**

Run: `pnpm test -- tests/unit/library/search.test.ts`
Expected: PASS (all cases, including the romanization-regression block).

- [ ] **Step 5: Commit**

```bash
pnpm typecheck && pnpm test -- tests/unit/library/search.test.ts
git add app/lib/library/search.ts tests/unit/library/search.test.ts
git commit -m "feat(library): pure search/rank module (ko + meaning + example + trans)"
```

---

## Task 3: i18n keys `library.search.*` (8 locales) + parity guard

**Files:**
- Modify: `i18n/locales/en.json`, `es.json`, `fr.json`, `pt-BR.json`, `th.json`, `id.json`, `vi.json`, `ja.json`
- Test: `tests/unit/library/i18n-search-keys.test.ts`

In each locale file, add a `"search"` object **inside the existing `"library"`
object**, as a sibling of `"lead"` and `"modal"` (i.e. insert after the
`"modal": { ... }` block, before `library`'s closing `}`). Keep the existing
2-space indentation.

> The Thai/Indonesian/Vietnamese/Japanese `category.*` wordings are
> best-effort grammatical terms; flag them to the user (who reads these
> languages) for a wording pass. The key set must stay identical across all 8
> files — the parity test enforces that.

- [ ] **Step 1: Write the failing parity test**

Create `tests/unit/library/i18n-search-keys.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import id from '../../../i18n/locales/id.json'
import vi from '../../../i18n/locales/vi.json'
import ja from '../../../i18n/locales/ja.json'

const locales: Record<string, unknown> = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }

function searchKeys(obj: unknown): string[] {
  const root = (obj as { library?: { search?: Record<string, unknown> } })?.library?.search
  const out: string[] = []
  const walk = (o: Record<string, unknown>, p: string) => {
    for (const k of Object.keys(o)) {
      const key = p ? `${p}.${k}` : k
      const v = o[k]
      if (v && typeof v === 'object') walk(v as Record<string, unknown>, key)
      else out.push(key)
    }
  }
  if (root) walk(root, '')
  return out.sort()
}

describe('library.search i18n parity', () => {
  const reference = searchKeys(en)
  it('en defines the full search key set', () => {
    expect(reference).toContain('placeholder')
    expect(reference).toContain('result_count')
    expect(reference).toContain('category.particle')
    expect(reference).toContain('category.meta')
  })
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} has identical library.search keys to en`, () => {
      expect(searchKeys(msgs)).toEqual(reference)
    })
  }
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test -- tests/unit/library/i18n-search-keys.test.ts`
Expected: FAIL — no `library.search` block exists yet (reference is empty / `placeholder` missing).

- [ ] **Step 3: Add the `search` block to all 8 locales**

`en.json` — inside `"library"`, after `"modal": { ... },`:

```jsonc
    "search": {
      "placeholder": "Search a pattern or its meaning…",
      "result_count": "{n} results",
      "no_results": "No patterns match your search.",
      "clear": "Clear",
      "filter_level": "Level",
      "filter_all_levels": "All levels",
      "filter_category": "Category",
      "filter_all_categories": "All categories",
      "active_zone": "Filtering by: {zone}",
      "category": {
        "particle": "Particle", "ending": "Ending", "conj": "Conjunction",
        "expr": "Expression", "aux": "Auxiliary", "verb": "Verb", "voice": "Voice",
        "lex": "Lexical", "nominal": "Nominalizer", "modifier": "Modifier",
        "copula": "Copula", "negation": "Negation", "adv": "Adverbial",
        "indirect": "Indirect speech", "meta": "Meta"
      }
    }
```

`es.json`:

```jsonc
    "search": {
      "placeholder": "Busca un patrón o su significado…",
      "result_count": "{n} resultados",
      "no_results": "Ningún patrón coincide con tu búsqueda.",
      "clear": "Limpiar",
      "filter_level": "Nivel",
      "filter_all_levels": "Todos los niveles",
      "filter_category": "Categoría",
      "filter_all_categories": "Todas las categorías",
      "active_zone": "Filtrando por: {zone}",
      "category": {
        "particle": "Partícula", "ending": "Terminación", "conj": "Conjunción",
        "expr": "Expresión", "aux": "Auxiliar", "verb": "Verbo", "voice": "Voz",
        "lex": "Léxico", "nominal": "Nominalizador", "modifier": "Modificador",
        "copula": "Cópula", "negation": "Negación", "adv": "Adverbial",
        "indirect": "Estilo indirecto", "meta": "Meta"
      }
    }
```

`fr.json`:

```jsonc
    "search": {
      "placeholder": "Cherchez un schéma ou son sens…",
      "result_count": "{n} résultats",
      "no_results": "Aucun schéma ne correspond à votre recherche.",
      "clear": "Effacer",
      "filter_level": "Niveau",
      "filter_all_levels": "Tous les niveaux",
      "filter_category": "Catégorie",
      "filter_all_categories": "Toutes les catégories",
      "active_zone": "Filtre : {zone}",
      "category": {
        "particle": "Particule", "ending": "Terminaison", "conj": "Conjonction",
        "expr": "Expression", "aux": "Auxiliaire", "verb": "Verbe", "voice": "Voix",
        "lex": "Lexical", "nominal": "Nominalisateur", "modifier": "Déterminant",
        "copula": "Copule", "negation": "Négation", "adv": "Adverbial",
        "indirect": "Discours indirect", "meta": "Méta"
      }
    }
```

`pt-BR.json`:

```jsonc
    "search": {
      "placeholder": "Busque um padrão ou seu significado…",
      "result_count": "{n} resultados",
      "no_results": "Nenhum padrão corresponde à sua busca.",
      "clear": "Limpar",
      "filter_level": "Nível",
      "filter_all_levels": "Todos os níveis",
      "filter_category": "Categoria",
      "filter_all_categories": "Todas as categorias",
      "active_zone": "Filtrando por: {zone}",
      "category": {
        "particle": "Partícula", "ending": "Terminação", "conj": "Conjunção",
        "expr": "Expressão", "aux": "Auxiliar", "verb": "Verbo", "voice": "Voz",
        "lex": "Lexical", "nominal": "Nominalizador", "modifier": "Modificador",
        "copula": "Cópula", "negation": "Negação", "adv": "Adverbial",
        "indirect": "Discurso indireto", "meta": "Meta"
      }
    }
```

`th.json`:

```jsonc
    "search": {
      "placeholder": "ค้นหารูปประโยคหรือความหมาย…",
      "result_count": "{n} ผลลัพธ์",
      "no_results": "ไม่พบรูปประโยคที่ตรงกับการค้นหา",
      "clear": "ล้าง",
      "filter_level": "ระดับ",
      "filter_all_levels": "ทุกระดับ",
      "filter_category": "หมวด",
      "filter_all_categories": "ทุกหมวด",
      "active_zone": "กำลังกรอง: {zone}",
      "category": {
        "particle": "คำช่วย", "ending": "คำลงท้าย", "conj": "คำเชื่อม",
        "expr": "สำนวน", "aux": "กริยาช่วย", "verb": "คำกริยา", "voice": "วาจก",
        "lex": "ศัพท์", "nominal": "ตัวสร้างคำนาม", "modifier": "คำขยาย",
        "copula": "กริยาเชื่อม", "negation": "การปฏิเสธ", "adv": "คำวิเศษณ์",
        "indirect": "คำพูดทางอ้อม", "meta": "เมตา"
      }
    }
```

`id.json`:

```jsonc
    "search": {
      "placeholder": "Cari pola atau artinya…",
      "result_count": "{n} hasil",
      "no_results": "Tidak ada pola yang cocok dengan pencarianmu.",
      "clear": "Hapus",
      "filter_level": "Tingkat",
      "filter_all_levels": "Semua tingkat",
      "filter_category": "Kategori",
      "filter_all_categories": "Semua kategori",
      "active_zone": "Memfilter: {zone}",
      "category": {
        "particle": "Partikel", "ending": "Akhiran", "conj": "Konjungsi",
        "expr": "Ekspresi", "aux": "Kata bantu", "verb": "Kata kerja", "voice": "Diatesis",
        "lex": "Leksikal", "nominal": "Penominal", "modifier": "Pewatas",
        "copula": "Kopula", "negation": "Negasi", "adv": "Keterangan",
        "indirect": "Kalimat tak langsung", "meta": "Meta"
      }
    }
```

`vi.json`:

```jsonc
    "search": {
      "placeholder": "Tìm một mẫu câu hoặc nghĩa của nó…",
      "result_count": "{n} kết quả",
      "no_results": "Không có mẫu nào khớp với tìm kiếm của bạn.",
      "clear": "Xóa",
      "filter_level": "Cấp độ",
      "filter_all_levels": "Tất cả cấp độ",
      "filter_category": "Loại",
      "filter_all_categories": "Tất cả các loại",
      "active_zone": "Đang lọc: {zone}",
      "category": {
        "particle": "Tiểu từ", "ending": "Đuôi từ", "conj": "Liên từ",
        "expr": "Cấu trúc", "aux": "Trợ động từ", "verb": "Động từ", "voice": "Dạng",
        "lex": "Từ vựng", "nominal": "Danh từ hóa", "modifier": "Định ngữ",
        "copula": "Hệ từ", "negation": "Phủ định", "adv": "Trạng từ",
        "indirect": "Lời nói gián tiếp", "meta": "Meta"
      }
    }
```

`ja.json`:

```jsonc
    "search": {
      "placeholder": "文型や意味を検索…",
      "result_count": "{n} 件",
      "no_results": "検索に一致する文型がありません。",
      "clear": "クリア",
      "filter_level": "レベル",
      "filter_all_levels": "すべてのレベル",
      "filter_category": "カテゴリ",
      "filter_all_categories": "すべてのカテゴリ",
      "active_zone": "絞り込み: {zone}",
      "category": {
        "particle": "助詞", "ending": "語尾", "conj": "接続",
        "expr": "表現", "aux": "補助", "verb": "動詞", "voice": "態",
        "lex": "語彙", "nominal": "名詞化", "modifier": "連体修飾",
        "copula": "コピュラ", "negation": "否定", "adv": "副詞的",
        "indirect": "間接話法", "meta": "メタ"
      }
    }
```

> Remember the comma: the `"modal": { ... }` block now needs a trailing comma
> before `"search"`. Validate JSON after editing (`pnpm lint` parses them).

- [ ] **Step 4: Run it to confirm it passes**

Run: `pnpm test -- tests/unit/library/i18n-search-keys.test.ts`
Expected: PASS (1 + 8 tests). If a locale fails, its key set drifted — fix that file.

- [ ] **Step 5: Commit**

```bash
pnpm typecheck && pnpm test -- tests/unit/library/i18n-search-keys.test.ts
git add i18n/locales/*.json tests/unit/library/i18n-search-keys.test.ts
git commit -m "feat(library): library.search.* i18n keys across 8 locales"
```

---

## Task 4: Extract `GrammarCard.vue` and use it in the grouped view

This is a behavior-preserving refactor: the card markup is duplicated twice in
`library.vue` today. Extract it, test it, and rewire the existing grouped +
orphan lists to use it. No search yet — the page must look and behave exactly
as before.

**Files:**
- Create: `app/components/library/GrammarCard.vue`
- Test: `tests/components/library/GrammarCard.test.ts`
- Modify: `app/pages/library.vue` (replace the two `<Card>` blocks; move `.item__*` CSS out)

- [ ] **Step 1: Write the failing test**

Create `tests/components/library/GrammarCard.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Grammar } from '~/lib/domain'
import GrammarCard from '~/components/library/GrammarCard.vue'

vi.mock('~/stores/srs', () => ({
  useSrsStore: () => ({ ensure: () => ({ mastery: 'seedling', lastSeen: null }) }),
}))

const full: Grammar = {
  ko: '은/는',
  meaning: { en: 'topic particle', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  example: '저는 학생이에요.',
  trans: { en: 'I am a student.', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-1',
}
const bare: Grammar = {
  ko: '-다',
  meaning: { en: 'plain ending', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-1',
}

describe('GrammarCard', () => {
  it('renders ko, meaning, example, trans when present', () => {
    const html = mount(GrammarCard, { props: { grammar: full } }).html()
    expect(html).toContain('은/는')
    expect(html).toContain('topic particle')
    expect(html).toContain('저는 학생이에요')
    expect(html).toContain('I am a student')
  })

  it('hides example and trans when undefined', () => {
    const w = mount(GrammarCard, { props: { grammar: bare } })
    expect(w.find('.item__example').exists()).toBe(false)
    expect(w.find('.item__trans').exists()).toBe(false)
  })

  it('emits click when the card is clicked', async () => {
    const w = mount(GrammarCard, { props: { grammar: full } })
    await w.find('button.card').trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test -- tests/components/library/GrammarCard.test.ts`
Expected: FAIL — component `~/components/library/GrammarCard.vue` not found.

- [ ] **Step 3: Create `GrammarCard.vue`**

Create `app/components/library/GrammarCard.vue` (markup + `.item__*` CSS moved
verbatim from `library.vue`; mastery/accent logic moved in too):

```vue
<script setup lang="ts">
/**
 * One grammar card for the Library — ko + localized meaning + optional
 * example/trans + mastery badge. Extracted from pages/library.vue (was
 * duplicated in the deck sections and the orphan section). Reused by both
 * the grouped deck view and the flat search-results list. Reads its own
 * mastery from the SRS store so the page stays thin. Emits `click`.
 */
import Badge from '~/components/ui/Badge.vue'
import Card from '~/components/ui/Card.vue'
import MasteryIcon from '~/components/practice/MasteryIcon.vue'
import { getMasteryInfo } from '~/lib/srs'
import type { Grammar } from '~/lib/domain'
import { useSrsStore } from '~/stores/srs'

const props = defineProps<{ grammar: Grammar }>()
defineEmits<{ click: [] }>()

const { tl } = useLocalized()
const { t } = useI18n()
const srsStore = useSrsStore()

const level = computed(() => srsStore.ensure(props.grammar.ko).mastery)
const info = computed(() => getMasteryInfo(level.value))
const accent = computed<'jade' | 'gold' | 'sky'>(() => {
  if (info.value.cls === 'mastery-tree') return 'jade'
  if (info.value.cls === 'mastery-plant') return 'gold'
  return 'sky'
})
</script>

<template>
  <Card :accent="accent" clickable @click="$emit('click')">
    <div class="item__head">
      <span class="item__ko">{{ grammar.ko }}</span>
      <Badge>
        <MasteryIcon :level="level" :size="10" />
        <span>{{ t(info.labelKey) }}</span>
      </Badge>
    </div>
    <div class="item__meaning">{{ tl(grammar.meaning) }}</div>
    <div v-if="grammar.example" class="item__example">{{ grammar.example }}</div>
    <div v-if="grammar.trans" class="item__trans">{{ tl(grammar.trans) }}</div>
  </Card>
</template>

<style scoped>
.item__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}
.item__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--ink);
}
.item__meaning {
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
  font-size: 14px;
}
.item__example {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: var(--ink);
  margin-top: 8px;
}
.item__trans {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
  margin-top: 2px;
}
</style>
```

- [ ] **Step 4: Rewire `library.vue` to use it (no search yet)**

In `app/pages/library.vue`:

1. Add the import: `import GrammarCard from '~/components/library/GrammarCard.vue'`.
2. In the deck-section grid, replace the whole `<Card>…</Card>` block with:

```vue
            <GrammarCard
              v-for="item in section.items"
              :key="item.grammar.ko"
              :grammar="item.grammar"
              @click="onCardClick(item.grammar.ko)"
            />
```

3. In the orphan grid, replace the `<Card>…</Card>` block with:

```vue
          <GrammarCard
            v-for="item in orphans"
            :key="item.grammar.ko"
            :grammar="item.grammar"
            @click="onCardClick(item.grammar.ko)"
          />
```

4. Remove the now-unused imports `Badge`, `Card`, `MasteryIcon` and the
   `accentFor` function from the `<script setup>`.
5. Delete the `.item__head`, `.item__ko`, `.item__meaning`, `.item__example`,
   `.item__trans` rules from `library.vue`'s `<style>` (they now live in
   `GrammarCard.vue`). Keep everything else (`.page`, `.lead`, `.zone-filter*`,
   `.deck-*`, `.grid`, `.collapse-*`) unchanged for now.

> `sections`/`orphans` still expose `{ grammar, level, info }`; GrammarCard only
> needs `grammar` and computes mastery itself, so the `level`/`info` fields on
> those rows become unused but harmless. They are removed in Task 7.

- [ ] **Step 5: Run tests + verify the page is unchanged**

Run: `pnpm test -- tests/components/library/GrammarCard.test.ts`
Expected: PASS (3 tests).
Run: `pnpm typecheck`
Expected: no errors (unused `level`/`info` are fields on an object, not unused vars).

- [ ] **Step 6: Commit**

```bash
pnpm typecheck && pnpm test -- tests/components/library/GrammarCard.test.ts
git add app/components/library/GrammarCard.vue tests/components/library/GrammarCard.test.ts app/pages/library.vue
git commit -m "refactor(library): extract GrammarCard from duplicated card markup"
```

---

## Task 5: `useLibrarySearch` composable

**Files:**
- Create: `app/composables/useLibrarySearch.ts`
- Test: `tests/composables/useLibrarySearch.test.ts`

The composable owns the URL ↔ filter glue. The test mirrors the established
route-mock pattern from `tests/composables/useGrammarModal.test.ts` (live
`routeQuery` ref + `effectScope` to avoid watcher leaks). It asserts URL
plumbing and `isFiltering`; ranking correctness is already covered by Task 2,
and debounce timing is covered by manual verification (Task 8).

- [ ] **Step 1: Write the failing test**

Create `tests/composables/useLibrarySearch.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope, ref, type EffectScope } from 'vue'
import { useLibrarySearch as useRaw } from '~/composables/useLibrarySearch'

const routeQuery = ref<Record<string, string | undefined>>({})
const replaceSpy = vi.fn(async () => {})
vi.stubGlobal('useRoute', () => ({ get query() { return routeQuery.value } }))
vi.stubGlobal('useRouter', () => ({ replace: replaceSpy }))

const items = ref([
  { ko: '은/는', meaning: { en: 'topic', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' }, deckId: 'topik-1' },
])
vi.mock('~/stores/grammar', () => ({
  useGrammarStore: () => ({ get items() { return items.value } }),
}))

describe('useLibrarySearch', () => {
  let scope: EffectScope
  beforeEach(() => { routeQuery.value = {}; replaceSpy.mockClear(); scope = effectScope() })
  afterEach(() => { scope.stop() })
  const use = () => scope.run(() => useRaw())!

  it('isFiltering is false with no query/filters', () => {
    expect(use().isFiltering.value).toBe(false)
  })

  it('reads ?q= into query and isFiltering', () => {
    routeQuery.value = { q: '은' }
    const { query, isFiltering } = use()
    expect(query.value).toBe('은')
    expect(isFiltering.value).toBe(true)
  })

  it('parses ?level= and reflects it in isFiltering', () => {
    routeQuery.value = { level: '3' }
    const { level, isFiltering } = use()
    expect(level.value).toBe(3)
    expect(isFiltering.value).toBe(true)
  })

  it('ignores an out-of-range ?level=', () => {
    routeQuery.value = { level: '9' }
    expect(use().level.value).toBe(null)
  })

  it('setLevel writes ?level= via replace, preserving other params', () => {
    routeQuery.value = { grammar: '은/는' }
    use().setLevel(3)
    expect(replaceSpy).toHaveBeenCalledWith({ query: { grammar: '은/는', level: 3 } })
  })

  it('setCategory(null) removes ?cat=', () => {
    routeQuery.value = { cat: 'particle', grammar: '은/는' }
    use().setCategory(null)
    expect(replaceSpy).toHaveBeenCalledWith({ query: { grammar: '은/는' } })
  })

  it('clear drops q/level/cat/theme but keeps grammar', () => {
    routeQuery.value = { q: '은', level: '1', cat: 'particle', theme: 'x', grammar: '은/는' }
    use().clear()
    expect(replaceSpy).toHaveBeenCalledWith({ query: { grammar: '은/는' } })
  })

  it('results returns the single item when unfiltered', () => {
    expect(use().results.value.map((g) => g.ko)).toEqual(['은/는'])
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test -- tests/composables/useLibrarySearch.test.ts`
Expected: FAIL — composable not found.

- [ ] **Step 3: Implement the composable**

Create `app/composables/useLibrarySearch.ts`:

```ts
import { watchDebounced } from '@vueuse/core'
import type { Grammar, GrammarType, LocaleCode, TopikLevel } from '~/lib/domain'
import { TOPIK_LEVELS, categoryOf, levelOf, itemsByTheme } from '~/lib/domain'
import { searchLibrary } from '~/lib/library/search'
import { useGrammarStore } from '~/stores/grammar'

/**
 * Single filter authority for the Library. Owns ?q= / ?level= / ?cat= and the
 * garden's ?theme= deep-link, exposes ranked `results` + `isFiltering`, and
 * writes changes back to the URL with `router.replace` (no history spam).
 * Replaces the old per-page zoneFilter logic.
 */
export function useLibrarySearch() {
  const route = useRoute()
  const router = useRouter()
  const { locale } = useI18n()
  const grammarStore = useGrammarStore()

  // Live, instant input value; ?q= mirrors it (debounced) for shareability.
  const query = ref(typeof route.query.q === 'string' ? route.query.q : '')

  const level = computed<TopikLevel | null>(() => {
    const n = Number(route.query.level)
    return (TOPIK_LEVELS as readonly number[]).includes(n) ? (n as TopikLevel) : null
  })
  const category = computed<GrammarType | null>(() =>
    typeof route.query.cat === 'string' ? (route.query.cat as GrammarType) : null,
  )
  const themeKos = computed<Set<string> | null>(() => {
    const theme = typeof route.query.theme === 'string' ? route.query.theme : null
    if (!theme) return null
    const its = itemsByTheme(theme)
    return its.length ? new Set(its.map((i) => i.ko)) : null
  })
  const zoneLabel = computed<string | null>(() => {
    const theme = typeof route.query.theme === 'string' ? route.query.theme : null
    if (!theme) return null
    const src = itemsByTheme(theme)[0]?.source
    return src && src.kind === 'topik' ? src.themeTitle : theme
  })

  const isFiltering = computed(
    () => query.value.trim() !== '' || level.value !== null
       || category.value !== null || themeKos.value !== null,
  )

  const results = computed<Grammar[]>(() =>
    searchLibrary(
      grammarStore.items,
      { query: query.value, level: level.value, category: category.value, themeKos: themeKos.value },
      { locale: locale.value as LocaleCode, levelOf, categoryOf },
    ),
  )

  // Merge a patch into the current query (preserve ?grammar= etc.), dropping
  // any key whose value is undefined. Uses replace to avoid history spam.
  function mergeQuery(patch: Record<string, string | number | undefined>) {
    const next: Record<string, unknown> = { ...route.query, ...patch }
    for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k]
    void router.replace({ query: next as never })
  }

  function setLevel(l: TopikLevel | null) { mergeQuery({ level: l ?? undefined }) }
  function setCategory(c: GrammarType | null) { mergeQuery({ cat: c ?? undefined }) }
  function clear() {
    query.value = ''
    mergeQuery({ q: undefined, level: undefined, cat: undefined, theme: undefined })
  }

  // Mirror the live input to ?q= without spamming history.
  watchDebounced(query, (q) => mergeQuery({ q: q.trim() || undefined }), { debounce: 200 })

  // Keep the input in sync when ?q= changes from outside (back button, deep link).
  watch(() => route.query.q, (q) => {
    const v = typeof q === 'string' ? q : ''
    if (v !== query.value) query.value = v
  })

  return { query, level, category, zoneLabel, isFiltering, results, setLevel, setCategory, clear }
}
```

- [ ] **Step 4: Run it to confirm it passes**

Run: `pnpm test -- tests/composables/useLibrarySearch.test.ts`
Expected: PASS (8 tests).

> If the `watchDebounced` import causes a setup-time error under the route
> stub, confirm `@vueuse/core` resolves in tests (it is already a dependency).
> The test does not advance timers, so the debounced callback never fires —
> `replaceSpy` only records the explicit `setLevel`/`setCategory`/`clear` calls.

- [ ] **Step 5: Commit**

```bash
pnpm typecheck && pnpm test -- tests/composables/useLibrarySearch.test.ts
git add app/composables/useLibrarySearch.ts tests/composables/useLibrarySearch.test.ts
git commit -m "feat(library): useLibrarySearch composable (URL-driven filter authority)"
```

---

## Task 6: `LibrarySearchBar.vue`

**Files:**
- Create: `app/components/library/LibrarySearchBar.vue`
- Test: `tests/components/library/LibrarySearchBar.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/components/library/LibrarySearchBar.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LibrarySearchBar from '~/components/library/LibrarySearchBar.vue'

function mountBar(props: Partial<Record<string, unknown>> = {}) {
  return mount(LibrarySearchBar, {
    props: { query: '', level: null, category: null, zoneLabel: null, resultCount: 0, ...props },
  })
}

describe('LibrarySearchBar', () => {
  it('emits update:query when the user types', async () => {
    const w = mountBar()
    await w.find('input').setValue('은')
    expect(w.emitted('update:query')?.[0]).toEqual(['은'])
  })

  it('emits set-level with a parsed number from the level select', async () => {
    const w = mountBar()
    await w.find('.library-search__level').setValue('3')
    expect(w.emitted('set-level')?.[0]).toEqual([3])
  })

  it('emits set-level null when "all levels" is chosen', async () => {
    const w = mountBar({ level: 3 })
    await w.find('.library-search__level').setValue('')
    expect(w.emitted('set-level')?.[0]).toEqual([null])
  })

  it('emits set-category from the category select', async () => {
    const w = mountBar()
    const select = w.find('.library-search__category')
    const opts = select.findAll('option')
    const firstReal = opts.find((o) => o.element.value !== '')!
    await select.setValue(firstReal.element.value)
    expect(w.emitted('set-category')?.[0]).toEqual([firstReal.element.value])
  })

  it('emits clear when the clear button is pressed', async () => {
    const w = mountBar({ query: '은' })
    await w.get('[data-testid="library-search-clear"]').trigger('click')
    expect(w.emitted('clear')).toHaveLength(1)
  })

  it('shows the result count when filtering', () => {
    const w = mountBar({ query: '은', resultCount: 5 })
    expect(w.html()).toContain('library.search.result_count 5')
  })

  it('shows the active-zone banner when a zone label is provided', () => {
    const w = mountBar({ zoneLabel: 'Partículas básicas' })
    expect(w.html()).toContain('library.search.active_zone Partículas básicas')
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test -- tests/components/library/LibrarySearchBar.test.ts`
Expected: FAIL — component not found.

- [ ] **Step 3: Implement `LibrarySearchBar.vue`**

Create `app/components/library/LibrarySearchBar.vue`:

```vue
<script setup lang="ts">
/**
 * Library search + filter bar. Free-text input (ko / meaning), a TOPIK level
 * select, a grammar-category select (only categories present in the spine),
 * a result count, a clear button, and the active-zone banner for ?theme=
 * deep-links. Pure presentational: it emits intent; useLibrarySearch owns
 * the URL and the data.
 */
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import { TOPIK_LEVELS, presentCategories, type GrammarType, type TopikLevel } from '~/lib/domain'

const props = defineProps<{
  query: string
  level: TopikLevel | null
  category: GrammarType | null
  zoneLabel: string | null
  resultCount: number
}>()

const emit = defineEmits<{
  'update:query': [string]
  'set-level': [TopikLevel | null]
  'set-category': [GrammarType | null]
  clear: []
}>()

const { t } = useI18n()

const categories = presentCategories()
const hasFilter = computed(
  () => props.query.trim() !== '' || props.level !== null
     || props.category !== null || props.zoneLabel !== null,
)

function onLevel(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  emit('set-level', v === '' ? null : (Number(v) as TopikLevel))
}
function onCategory(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  emit('set-category', v === '' ? null : (v as GrammarType))
}
</script>

<template>
  <div class="library-search">
    <div class="library-search__row">
      <Input
        class="library-search__input"
        type="text"
        inputmode="search"
        :model-value="query"
        :placeholder="t('library.search.placeholder')"
        @update:model-value="emit('update:query', $event)"
      />

      <select
        class="library-search__level"
        :value="level ?? ''"
        :aria-label="t('library.search.filter_level')"
        @change="onLevel"
      >
        <option value="">{{ t('library.search.filter_all_levels') }}</option>
        <option v-for="n in TOPIK_LEVELS" :key="n" :value="n">
          {{ t('garden.level', { n }) }}
        </option>
      </select>

      <select
        class="library-search__category"
        :value="category ?? ''"
        :aria-label="t('library.search.filter_category')"
        @change="onCategory"
      >
        <option value="">{{ t('library.search.filter_all_categories') }}</option>
        <option v-for="c in categories" :key="c" :value="c">
          {{ t(`library.search.category.${c}`) }}
        </option>
      </select>

      <Button
        v-if="hasFilter"
        variant="secondary"
        size="sm"
        data-testid="library-search-clear"
        @click="emit('clear')"
      >
        {{ t('library.search.clear') }}
      </Button>
    </div>

    <div v-if="zoneLabel" class="library-search__zone">
      {{ t('library.search.active_zone', { zone: zoneLabel }) }}
    </div>
    <p v-if="hasFilter" class="library-search__count">
      {{ t('library.search.result_count', { n: resultCount }) }}
    </p>
  </div>
</template>

<style scoped>
.library-search {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.library-search__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.library-search__input {
  flex: 1 1 220px;
}
.library-search__level,
.library-search__category {
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border);
  padding: 10px 12px;
  font-family: 'Noto Sans KR', 'Inter', sans-serif;
  font-size: var(--text-base);
  box-shadow: var(--shadow-input);
  cursor: pointer;
}
.library-search__level:focus-visible,
.library-search__category:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-color: var(--border-strong);
}
.library-search__zone {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  padding: 8px 12px;
  background: var(--surface-hover);
  border: 2px solid var(--border);
}
.library-search__count {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 9px;
  color: var(--text-soft);
  margin: 0;
}
</style>
```

- [ ] **Step 4: Run it to confirm it passes**

Run: `pnpm test -- tests/components/library/LibrarySearchBar.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
pnpm typecheck && pnpm test -- tests/components/library/LibrarySearchBar.test.ts
git add app/components/library/LibrarySearchBar.vue tests/components/library/LibrarySearchBar.test.ts
git commit -m "feat(library): LibrarySearchBar (input + level/category filters + count)"
```

---

## Task 7: Integrate into `library.vue` (activate the feature)

Mount the bar, add the flat-results branch, and remove the old zoneFilter
logic now owned by the composable.

**Files:**
- Modify: `app/pages/library.vue`

- [ ] **Step 1: Replace the `<script setup>`**

Replace the entire `<script setup lang="ts">…</script>` block in
`app/pages/library.vue` with:

```vue
<script setup lang="ts">
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Modal from '~/components/ui/Modal.vue'
import GrammarStudySheet from '~/components/library/GrammarStudySheet.vue'
import GrammarCard from '~/components/library/GrammarCard.vue'
import LibrarySearchBar from '~/components/library/LibrarySearchBar.vue'
import { useGrammarStore } from '~/stores/grammar'
import { useGrammarModal } from '~/composables/useGrammarModal'
import { useLibrarySearch } from '~/composables/useLibrarySearch'

const grammarStore = useGrammarStore()
const { t } = useI18n()
const { selected, isOpen, open, close } = useGrammarModal()
const { query, level, category, zoneLabel, isFiltering, results, setLevel, setCategory, clear } =
  useLibrarySearch()

/** Grouped view (shown when not filtering): decks in order, empty decks dropped. */
const sections = computed(() => {
  const sortedDecks = [...grammarStore.decks].sort((a, b) => a.order - b.order)
  return sortedDecks
    .map((deck) => ({
      deck,
      items: grammarStore.items.filter((g) => g.deckId === deck.id),
    }))
    .filter((s) => s.items.length > 0)
})

/** Items whose deckId matches no current deck — rendered under a fallback section. */
const orphans = computed(() => {
  const known = new Set(grammarStore.decks.map((d) => d.id))
  return grammarStore.items.filter((g) => !known.has(g.deckId))
})

async function onToggleDeck(deckId: string) {
  await grammarStore.toggleDeckCollapsed(deckId)
}
async function onCardClick(ko: string) {
  await open(ko)
}
</script>
```

- [ ] **Step 2: Replace the `<template>`**

Replace the entire `<template>…</template>` block with:

```vue
<template>
  <div class="page">
    <BilingualTitle ko="도서관" :latin="t('title.library')" />
    <p class="lead">{{ t('library.lead') }}</p>

    <LibrarySearchBar
      v-model:query="query"
      :level="level"
      :category="category"
      :zone-label="zoneLabel"
      :result-count="results.length"
      @set-level="setLevel"
      @set-category="setCategory"
      @clear="clear"
    />

    <!-- Filtering: a single relevance-ranked flat list. -->
    <template v-if="isFiltering">
      <p v-if="results.length === 0" class="empty">{{ t('library.search.no_results') }}</p>
      <div v-else class="grid">
        <GrammarCard
          v-for="g in results"
          :key="g.ko"
          :grammar="g"
          @click="onCardClick(g.ko)"
        />
      </div>
    </template>

    <!-- Default: grouped, collapsible decks. -->
    <template v-else>
      <section
        v-for="section in sections"
        :key="section.deck.id"
        class="deck-section"
        :class="`deck-section--${section.deck.colorId}`"
      >
        <button
          type="button"
          class="deck-header"
          :aria-expanded="!section.deck.collapsed"
          :aria-controls="`deck-body-${section.deck.id}`"
          @click="onToggleDeck(section.deck.id)"
        >
          <span class="deck-header__caret" :class="{ 'deck-header__caret--open': !section.deck.collapsed }" aria-hidden="true">▸</span>
          <h2 class="deck-title">{{ section.deck.name }}</h2>
          <span class="deck-count">{{ section.items.length }}</span>
        </button>

        <Transition name="collapse">
          <div v-show="!section.deck.collapsed" :id="`deck-body-${section.deck.id}`" class="deck-body">
            <div class="grid">
              <GrammarCard
                v-for="item in section.items"
                :key="item.ko"
                :grammar="item"
                @click="onCardClick(item.ko)"
              />
            </div>
          </div>
        </Transition>
      </section>

      <section v-if="orphans.length" class="deck-section deck-section--orphan">
        <header class="deck-header deck-header--static">
          <span class="deck-header__caret" aria-hidden="true">▸</span>
          <h2 class="deck-title">기타 (Otros)</h2>
          <span class="deck-count">{{ orphans.length }}</span>
        </header>
        <div class="deck-body">
          <div class="grid">
            <GrammarCard
              v-for="item in orphans"
              :key="item.ko"
              :grammar="item"
              @click="onCardClick(item.ko)"
            />
          </div>
        </div>
      </section>
    </template>

    <Modal
      :open="isOpen"
      :title="selected?.ko ?? ''"
      :close-label="t('library.modal.close')"
      @close="close"
    >
      <GrammarStudySheet v-if="selected" :key="selected.ko" :grammar="selected" />
    </Modal>
  </div>
</template>
```

- [ ] **Step 3: Trim the `<style>`**

In `library.vue`'s `<style scoped>`:
- Delete the `.zone-filter`, `.zone-filter__label`, `.zone-filter__clear`,
  `.zone-filter__clear:hover`, `.zone-filter__clear:focus-visible` rules
  (the banner is now `LibrarySearchBar`'s `.library-search__zone`).
- Keep `.page`, `.lead`, `.deck-*`, `.grid`, `.collapse-*`.
- Add an `.empty` rule:

```css
.empty {
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
}
```

- [ ] **Step 4: Verify with the existing suite + typecheck**

Run: `pnpm typecheck`
Expected: no errors (no leftover references to `Card`, `Badge`, `MasteryIcon`,
`accentFor`, `zoneFilter`, `inZone`, `queryLevel`, `useTopikSpine`,
`TOPIK_LEVELS`, `srsStore`, `getMasteryInfo` in `library.vue`).
Run: `pnpm test`
Expected: the full suite passes (no library page component test exists; the
units/components from Tasks 1–6 cover the moving parts).

- [ ] **Step 5: Commit**

```bash
pnpm typecheck && pnpm test
git add app/pages/library.vue
git commit -m "feat(library): wire search bar + flat results into the Library page"
```

---

## Task 8: Full verification + manual smoke

**Files:** none (verification only; commit any fixes you make).

- [ ] **Step 1: Full automated gate**

Run, from `munbeop/`:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

Expected: all green. `pnpm build` matters — Nuxt 4 SPA surfaces some errors
only at build time. Fix anything that fails, then re-run.

- [ ] **Step 2: Manual smoke (`pnpm dev`, open the printed URL)**

Verify each — the feature is not done without these:

1. `/library` — grouped decks render as before; search bar on top.
2. Type `은` — list collapses to a flat ranked set; after ~200ms URL shows `?q=은`.
3. Switch locale to Spanish, type `antes` — finds `-기 전에`.
4. Type `seyo` — no spurious matches (romanization unsupported).
5. Pick Level 3 — only level-3 patterns; combine with text.
6. Pick a Category — narrows further; only present categories are listed.
7. Clear — grouped view returns; URL clean.
8. Reload on `/library?q=은&level=1` — state restored after hydration.
9. Open a card → modal (`?grammar=`), close — `?q=` preserved.
10. Browser back after a search — returns to the unfiltered library.
11. Switch locale to Japanese while searching by meaning — results recompute.
12. Garden deep-link `/library?level=4` (and a `?theme=` link from the garden)
    — flat results + active-zone banner; Clear resets.
13. Mobile 360px — bar + selects wrap cleanly; cards stack.
14. Dark mode — input/selects/banner respect tokens (no invisible text).

- [ ] **Step 3: Final commit (only if Step 1/2 required fixes)**

```bash
pnpm typecheck && pnpm test && pnpm lint
git add -A
git commit -m "fix(library): polish search after verification"
```

---

## Notes for the implementer

- **Reply to the user in Spanish; keep code/comments/commits in English.**
- **Do not push.** Stop after Task 8 and report status; the user pushes.
- The old `searchByKo()` in `topik.ts` is left untouched (still exported via
  `useTopikSpine`); it is not used by the new search and is out of scope.
- If `pnpm test -- <path>` filtering is unavailable in this Vitest setup, run
  the whole suite with `pnpm test` — it is fast.
- Korean cultural particles (e.g. 화이팅) are never introduced into these new
  UI strings; they are neutral chrome.
```
