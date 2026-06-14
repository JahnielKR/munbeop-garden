# Library Search — Design Spec

**Status:** approved, ready to plan
**Date:** 2026-06-14
**Branch:** `claude/priceless-lichterman-541d96`

## Motivation

The Library (`pages/library.vue`) renders the ~290 grammar patterns grouped
into collapsible deck sections (one per TOPIK level, plus transversal decks).
There is no search: to find a single pattern the user must scan deck by deck,
expanding each section until they spot it. This is slow and gets worse as the
catalog grows.

The page already has a precedent for *narrowing* the view — the garden
deep-links `?theme=<themeId>` / `?level=<1-6>` drive a `zoneFilter` that hides
non-matching items and shows a "filtering by zone X / clear" banner. The
search feature builds on that same URL-as-source-of-truth pattern instead of
inventing a parallel state system.

## Goals

- Type any text and instantly narrow the library to matching patterns,
  ranked by relevance.
- A learner who cannot type Hangul can still find a pattern by typing its
  meaning in their own language (e.g. Spanish `"antes de"` → `-기 전에`).
- Combine free text with structured filters: **TOPIK level (1–6)** and
  **grammar category** (particle, ending, conjunction…).
- Keep the existing grouped, collapsible view untouched when nothing is
  being searched or filtered.

## Non-Goals (explicit, see Decisions)

- **No romanization search ever.** Typing `"eun/neun"` or `"seyo"` will not
  match. User decision: romanization quality is poor and would degrade the
  catalog. We do not add a `romanization` field and we do not auto-transliterate.
- No fuzzy / typo-tolerant matching. Precision over cleverness — substring on
  normalized text only.
- No `usageNotes` in the search corpus (long multi-paragraph text → noisy
  matches). Searchable fields are `ko`, `meaning`, `example`, `trans` only.
- No mastery/importance filters in v1 (user selected level + category only).
- No external search library (Fuse.js, lunr). ~290 items → naive in-memory
  scan is sub-millisecond.

## Decisions

- **Search is client-side, instant, and URL-driven.** State lives in the
  query string: `?q=<text>`, `?level=<1-6>`, `?cat=<type>`. Shareable,
  back/forward friendly, and consistent with the existing `?grammar=` modal
  and `?theme=`/`?level=` zone deep-links. Rejected: component-local `ref`
  only (not shareable, does not compose with garden deep-links, grows
  `library.vue` into a god file) and a Pinia store (over-engineered for
  ephemeral UI state; risks `Set`/devalue serialization issues the codebase
  already fights).
- **Searchable fields:** `ko` (Hangul, not translated) + `meaning` +
  `example` + `trans`. `meaning`/`trans` are evaluated in the **active
  locale** (with fallback to `en`) via `localized()` — the user searches what
  they see on screen.
- **Flat ranked results while filtering.** When any of `q`/`level`/`cat`/
  `theme` is active (`isFiltering === true`) the deck grouping is dropped and
  a single relevance-ranked list of `GrammarCard`s is shown. When nothing is
  active, the existing grouped/collapsible deck view renders unchanged.
- **Level filter reuses `?level=`.** The new level control and the garden's
  existing `?level=` deep-link are the **same** source of truth. The current
  `zoneFilter`/`clearZoneFilter`/`inZone` logic in `library.vue` is *replaced*
  by the new `useLibrarySearch` composable, which subsumes `?theme=` and
  `?level=` so there is exactly one filter authority — not two competing ones.
- **Category comes from the spine, cross-referenced by `ko`.** The rendered
  `Grammar` type has no `type` field; the curated `GrammarType` lives in
  `topik.ts`'s spine, keyed by `ko`. We add a memoized `categoryOf(ko)` /
  `levelOf(ko)` index over `allItems()` rather than duplicating `type` onto
  every seed entry. Rendered items with no spine match degrade to
  "uncategorized" — never an error.
- **No romanization.** Restated as a decision because it shapes the corpus and
  a regression test guards it.
- **Split by responsibility — no god file.** Pure ranking module (no Vue) +
  composable (reactive glue) + small presentational components. `library.vue`
  stays a thin orchestrator. Respects the project's "no god files" rule.
- **Extract `GrammarCard.vue`.** The grammar card markup is currently
  duplicated twice inside `library.vue` (deck sections + orphans). Extracting
  one `GrammarCard.vue` removes that duplication and lets the flat results
  list reuse the exact same card. This is a targeted refactor in service of
  the feature, not unrelated cleanup.

## File Layout

```
app/
  lib/
    library/
      search.ts                  NEW. Pure ranking/filtering module (no Vue).
    domain/
      topik.ts                   EDIT. Add memoized categoryOf(ko) / levelOf(ko).
  composables/
    useLibrarySearch.ts          NEW. q/level/cat/theme ↔ URL, debounce, results.
  components/
    library/
      LibrarySearchBar.vue       NEW. Input + level select + category select
                                      + clear + result count + active-filter banner.
      GrammarCard.vue            NEW (refactor). The card, used by both views.
  pages/
    library.vue                  EDIT. Mount search bar; flat results when
                                      filtering, grouped view otherwise. Drops
                                      the old zoneFilter/inZone code.

i18n/locales/
  en.json es.json fr.json pt-BR.json
  th.json id.json vi.json ja.json     EDIT. Add library.search.* keys (×8).

tests/
  unit/
    library/
      search.test.ts             NEW. Ranking, locale-aware match, filters,
                                      no-romanization regression, NFC.
  components/
    library/
      LibrarySearchBar.test.ts   NEW. Typing filters, count, clear, no-results.
      GrammarCard.test.ts        NEW. Renders ko/meaning/example/trans, click.
```

Expected new code: ~450–550 LOC across ~10 files. Largest single file
(`LibrarySearchBar.vue`) target < 160 LOC. No god files.

## Responsibilities — One Thing Per Unit

| Unit | Knows | Does not know |
|---|---|---|
| `lib/library/search.ts` | how to score & rank a `Grammar[]` against `{query, level, category}` given a locale + `categoryOf`/`levelOf` | Vue, the URL, i18n machinery, the DOM |
| `topik.ts` index | `ko → {level, type}` lookup from the spine | rendered `Grammar`, search ranking |
| `useLibrarySearch.ts` | `q`/`level`/`cat`/`theme` ↔ `route.query`, debounce, expose `results`/`isFiltering`/`clear` | card markup, scoring math |
| `LibrarySearchBar.vue` | render the input + selects + clear + count + banner | how results are computed/ranked |
| `GrammarCard.vue` | render one grammar's `ko`/meaning/example/trans + mastery badge, emit click | filtering, search, grouping |
| `pages/library.vue` | mount the bar; choose grouped vs flat; mount the modal | scoring, debounce, card internals |

## Domain / Spine Change

No change to the `Grammar` interface. Add a memoized cross-reference index to
`topik.ts` (built once from `allItems()`):

```ts
// app/lib/domain/topik.ts  (additions)

let _koIndex: Map<string, { level?: TopikLevel; type?: GrammarType }> | null = null

function koIndex(): Map<string, { level?: TopikLevel; type?: GrammarType }> {
  if (_koIndex) return _koIndex
  const m = new Map<string, { level?: TopikLevel; type?: GrammarType }>()
  for (const it of allItems()) {
    // first spine hit per ko wins; transversal items have no level
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

/** Distinct categories actually present, in a stable display order. */
export function presentCategories(): GrammarType[] {
  const seen = new Set<GrammarType>()
  for (const it of allItems()) if (it.type) seen.add(it.type)
  return GRAMMAR_TYPE_ORDER.filter((t) => seen.has(t))
}
```

`GRAMMAR_TYPE_ORDER` is a const array fixing the 15 `GrammarType` values in a
human-friendly order so the category select is deterministic. The spine `ko`
notation already matches seed `ko` exactly (per the seed file headers), so the
cross-reference resolves cleanly; `scripts/topik-spine-gap.mjs` is the existing
guard for drift.

## Search Module API

```ts
// app/lib/library/search.ts
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

export function scoreItem(it: Grammar, q: string, locale: LocaleCode): number {
  const ko = normalize(it.ko)
  if (ko === q) return SCORE.KO_EXACT
  let best = 0
  if (ko.startsWith(q)) best = Math.max(best, SCORE.KO_PREFIX)
  else if (ko.includes(q)) best = Math.max(best, SCORE.KO_SUBSTR)

  const meaning = normalize(localized(it.meaning, locale))
  if (meaning) {
    // word-prefix: q starts a word in the meaning
    if ((' ' + meaning).includes(' ' + q)) best = Math.max(best, SCORE.MEANING_WORD)
    else if (meaning.includes(q)) best = Math.max(best, SCORE.MEANING_SUBSTR)
  }
  if (it.example && normalize(it.example).includes(q)) best = Math.max(best, SCORE.TEXT_SUBSTR)
  if (it.trans && normalize(localized(it.trans, locale)).includes(q)) best = Math.max(best, SCORE.TEXT_SUBSTR)
  return best
}

/** Filter (AND) then rank. With no query, returns filtered items in a stable
 *  level-then-original-order. With a query, returns only positive-score items
 *  sorted by score desc, then level asc, then original index. */
export function searchLibrary(
  items: Grammar[],
  filter: LibraryFilter,
  ctx: SearchContext,
): Grammar[] {
  const q = normalize(filter.query)
  const passes = (it: Grammar): boolean => {
    if (filter.themeKos && !filter.themeKos.has(it.ko)) return false
    if (filter.level != null && ctx.levelOf(it.ko) !== filter.level) return false
    if (filter.category != null && ctx.categoryOf(it.ko) !== filter.category) return false
    return true
  }
  const lvlRank = (it: Grammar) => ctx.levelOf(it.ko) ?? 99
  const rows = items.map((it, idx) => ({ it, idx })).filter((r) => passes(r.it))

  if (!q) {
    return rows
      .sort((a, b) => lvlRank(a.it) - lvlRank(b.it) || a.idx - b.idx)
      .map((r) => r.it)
  }
  return rows
    .map((r) => ({ ...r, score: scoreItem(r.it, q, ctx.locale) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || lvlRank(a.it) - lvlRank(b.it) || a.idx - b.idx)
    .map((r) => r.it)
}
```

Pure, synchronous, no Vue/i18n imports beyond the `localized` helper and
types. Fully unit-testable with hand-built fixtures.

## Composable: `useLibrarySearch`

Owns the reactive glue between the URL and the pure module.

```ts
// app/composables/useLibrarySearch.ts  (sketch)
import { watchDebounced } from '@vueuse/core'
import { searchLibrary } from '~/lib/library/search'
import { categoryOf, levelOf, itemsByTheme, itemsByLevel, TOPIK_LEVELS } from '~/lib/domain'

export function useLibrarySearch() {
  const route = useRoute()
  const router = useRouter()
  const { locale } = useI18n()
  const grammarStore = useGrammarStore()

  // live, instant input value; ?q= mirrors it (debounced) for shareability
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
    const items = itemsByTheme(theme)
    return items.length ? new Set(items.map((i) => i.ko)) : null
  })
  // human label for the ?theme= deep-link banner (level shows in its own select)
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

  const results = computed(() =>
    searchLibrary(
      grammarStore.items,
      { query: query.value, level: level.value, category: category.value, themeKos: themeKos.value },
      { locale: locale.value as LocaleCode, levelOf, categoryOf },
    ),
  )

  // mirror live input → ?q= without spamming history (replace, debounced)
  watchDebounced(query, (q) => mergeQuery({ q: q.trim() || undefined }), { debounce: 200 })

  function setLevel(l: TopikLevel | null) { mergeQuery({ level: l ?? undefined }) }
  function setCategory(c: GrammarType | null) { mergeQuery({ cat: c ?? undefined }) }
  function clear() {
    query.value = ''
    mergeQuery({ q: undefined, level: undefined, cat: undefined, theme: undefined })
  }

  // merge into existing query (preserve ?grammar= etc.), drop undefined keys
  function mergeQuery(patch: Record<string, string | number | undefined>) {
    const next: Record<string, unknown> = { ...route.query, ...patch }
    for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k]
    void router.replace({ query: next as never })
  }

  // keep live input in sync if ?q= changes from outside (back button, deep link)
  watch(() => route.query.q, (q) => {
    const v = typeof q === 'string' ? q : ''
    if (v !== query.value) query.value = v
  })

  return { query, level, category, zoneLabel, isFiltering, results, setLevel, setCategory, clear }
}
```

**Why `router.replace` (not `push`):** typing must not push one history entry
per keystroke; discrete filter clicks also use `replace` so the back button
returns to the pre-search page rather than stepping through every filter
toggle. The `?grammar=` modal keeps its own push/replace contract from
`useGrammarModal` and is preserved because `mergeQuery` spreads `route.query`.

## `library.vue` Changes

- Delete `zoneFilter`, `clearZoneFilter`, `inZone`, `queryLevel`, and the
  inline `.zone-filter` banner — `useLibrarySearch` owns this now.
- `sections` / `orphans` computeds stay for the **grouped** (no-filter) view,
  but their per-item card markup moves into `<GrammarCard>`.
- Template:

```text
<BilingualTitle/> + lead
<LibrarySearchBar
   v-model:query="query" :level :category :zone-label="zoneLabel"
   :result-count="results.length"
   @set-level @set-category @clear />

<template v-if="isFiltering">
  <p v-if="!results.length" class="empty">{{ t('library.search.no_results') }}</p>
  <div v-else class="grid">
    <GrammarCard v-for="g in results" :key="g.ko" :grammar="g" @click="onCardClick(g.ko)" />
  </div>
</template>

<template v-else>
  ...existing deck sections + orphans, now using <GrammarCard>...
</template>

<Modal .../>  <!-- unchanged -->
```

`GrammarCard` encapsulates: accent computation (`accentFor`), mastery badge
(`MasteryIcon` + `getMasteryInfo`), and the `ko`/meaning/example/trans block.
It receives `grammar` and emits `click`; it reads the SRS mastery itself
(same `srsStore.ensure(ko).mastery` call the page does today) to stay
self-contained.

## i18n: `library.search.*` Keys (×8 locales)

Added under the existing `library` namespace in all 8 locale files:

```jsonc
"library": {
  "lead": "...",
  "search": {
    "placeholder": "Search a pattern or its meaning…",
    "result_count": "{n} results",
    "no_results": "No patterns match your search.",
    "clear": "Clear",
    "filter_level": "Level",
    "filter_all_levels": "All levels",
    "filter_category": "Category",
    "filter_all_categories": "All categories",
    "active_zone": "Filtering by: {zone}",       // replaces garden.zone_filter usage here
    "category": {
      "particle": "Particle",
      "ending": "Ending",
      "conj": "Conjunction",
      "expr": "Expression",
      "aux": "Auxiliary",
      "verb": "Verb",
      "voice": "Voice",
      "lex": "Lexical",
      "nominal": "Nominalizer",
      "modifier": "Modifier",
      "copula": "Copula",
      "negation": "Negation",
      "adv": "Adverbial",
      "indirect": "Indirect speech",
      "meta": "Meta"
    }
  }
}
```

Rules respected:
- All 8 locale files get the identical key tree (asymmetric keys cause
  fallback surprises). `es`/`fr`/`pt-BR`/`th`/`id`/`vi`/`ja` get real
  translations of the chrome strings; category labels translated per locale.
- Korean cultural particles (e.g. 화이팅) are never introduced/translated here;
  these are neutral UI chrome strings.
- `result_count` uses i18n interpolation (`t('library.search.result_count', { n })`).

## Data Flow

```
[user types "antes"] 
  → LibrarySearchBar v-model:query → useLibrarySearch.query (ref) updates instantly
  → results computed re-runs: searchLibrary(items, {query:"antes",...}, {locale:"es",...})
      · normalize("antes") → "antes"
      · per item: scoreItem → meaning "...antes de..." matches MEANING_SUBSTR/WORD
      · filter score>0, sort by score desc
  → isFiltering = true → library.vue shows flat <GrammarCard> list
  → 200ms later: watchDebounced → router.replace ?q=antes  (URL now shareable)
```

```
[user picks Level = 3 in the select]
  → LibrarySearchBar @set-level(3) → useLibrarySearch.setLevel(3)
  → router.replace ?level=3  → level computed = 3
  → results re-filters: levelOf(ko) === 3 AND current text/category
```

```
[user clicks Clear]
  → useLibrarySearch.clear() → query="" + drop q/level/cat/theme from URL
  → isFiltering = false → grouped deck view returns
```

```
[deep link /library?level=4&theme=...  (from the garden)]
  → level computed = 4, themeKos resolves from itemsByTheme
  → isFiltering = true → flat results; banner shows active zone label
```

## Edge Cases

| Situation | Behavior |
|---|---|
| Empty query, no filters | `isFiltering=false`; grouped collapsible view unchanged. |
| Whitespace-only `?q=   ` | `query.trim()===''` → not filtering; trimmed out of URL on next edit. |
| Romanization typed (`"seyo"`) | `normalize` keeps Latin; no `ko` field contains Latin → no match unless it also appears in a localized meaning. Guarded by regression test. |
| Query matches nothing | Flat view shows `library.search.no_results`. |
| `?cat=bogus` (not a real type) | `categoryOf` never returns it → zero matches; select shows "all" since value isn't in `presentCategories`. |
| Item with no spine match | `levelOf`/`categoryOf` = undefined → excluded only when a level/category filter is active; always shown for pure text/no-filter. |
| Locale switch while searching | `results` recomputes against new locale's `meaning`/`trans`; ranking can change (expected). |
| Back button after typing | `route.query.q` change → `watch` resyncs `query` ref → input + results follow. |
| Open `?grammar=X` while `?q=` active | `mergeQuery` preserves `q`; closing the modal (useGrammarModal) preserves `q` too. |
| Hangul typed via IME mid-composition (`ㅇㅡㄴ`) | NFC compose handles completed syllables; partial jamo may not match until the syllable composes — acceptable for v1 (documented future improvement). |
| 290 items, fast typing | Each keystroke is one O(n) scan over ~290 items (sub-ms). URL write debounced 200ms. No perf concern. |

## Testing

### Unit — `tests/unit/library/search.test.ts`

- `normalize` composes NFC and lowercases Latin; leaves Hangul syllables intact.
- `ko` exact match outranks prefix outranks substring.
- `meaning` match works in the active locale (Spanish fixture: `"antes"` →
  the `-기 전에` item) and respects `localized` fallback to `en`.
- `example`/`trans` substring matches score lowest.
- **Romanization regression:** a query of `"eun"` / `"neun"` / `"seyo"`
  returns no item whose only relation is romanization (no `romanization`
  field exists; assert empty or meaning-only matches).
- Level filter: only items whose `levelOf(ko)===L` survive.
- Category filter: only items whose `categoryOf(ko)===C` survive.
- AND composition: text + level + category narrows correctly.
- Empty query returns all (filtered) items in level-then-index order.
- `themeKos` restricts to the allow-set.
- Ties break by level asc then original index (deterministic order).

### Unit — `topik.ts` index (add to existing or new file)

- `categoryOf`/`levelOf` resolve known `ko`; return `undefined` for unknown.
- `presentCategories()` returns only types that appear, in `GRAMMAR_TYPE_ORDER`.
- Index is memoized (second call returns same Map instance).

### Component — `tests/components/library/GrammarCard.test.ts`

- Renders `ko`, localized `meaning`, optional `example`/`trans`.
- Hides `example`/`trans` when undefined.
- Emits `click` with no args (page resolves `ko` from the bound grammar).
- Mastery badge reflects the mocked SRS store mastery.

### Component — `tests/components/library/LibrarySearchBar.test.ts`

- Typing emits `update:query` / updates the bound value.
- Level/category selects emit `set-level`/`set-category` with parsed values.
- Clear button emits `clear`.
- Result count renders `t('library.search.result_count', { n })` (stub echoes key).
- Renders the active-zone banner when a zone label is provided.

Conventions: Vitest 3 + `@vue/test-utils` `mount`, `setActivePinia(createPinia())`
in `beforeEach`, `vi.mock('~/stores/...')` where a store is needed, i18n stub
echoes keys (assert on key names, not translations). Files live under
`tests/unit/library/` and `tests/components/library/` to match the existing
by-domain / by-feature layout. `~`/`@` resolve to `app/`.

### Manual verification (golden path + edges)

Run `pnpm dev` from `/munbeop`. The feature is not done without these:

1. `/library` — grouped decks render as before, search bar visible on top.
2. Type a Hangul pattern (`은`) — list collapses to a flat ranked set; URL
   gains `?q=은` after ~200ms.
3. Type a Spanish meaning (`antes`) with locale = ES — finds `-기 전에`.
4. Type romanization (`seyo`) — no spurious matches.
5. Pick Level 3 — only level-3 patterns; combine with text.
6. Pick a Category — narrows further; only present categories listed.
7. Clear — grouped view returns, URL clean.
8. Reload on `/library?q=은&level=1` — state restored after hydration.
9. Open a card → modal (`?grammar=`), close — `?q=` preserved.
10. Back button after a search — returns to unfiltered library.
11. Switch locale JA while searching by meaning — results recompute.
12. Garden deep-link `/library?level=4` and `?theme=...` — flat results +
    active-zone banner; Clear resets.
13. Mobile 360px — search bar + selects wrap cleanly; cards stack.
14. Dark mode — input/selects/banner respect `--surface`/`--border`/`--ink`
    tokens.

### Pre/post-commit verification

Project rule: `verify → commit → verify → push`.

Before each commit: `pnpm typecheck` (load-bearing — catches real bugs),
`pnpm test`, `pnpm lint`.
After commit, before push: all three again + `pnpm build` (Nuxt 4 SPA — some
errors only surface in build) + manual smoke of the golden path.

## Risks

- **Spine `ko` ↔ seed `ko` drift.** A category filter silently shows fewer
  items if notations diverge. Mitigation: the cross-reference is the same one
  the seed headers promise; `pnpm gap` (`scripts/topik-spine-gap.mjs`) already
  audits it. Add a sanity assertion that most rendered items resolve a level.
- **15 categories is a lot for one select.** Mitigated by `presentCategories()`
  (only show what exists) and localized labels. If still noisy, a future pass
  can group rare types under "Other".
- **Locale-dependent ranking.** Results reorder on locale switch. This is
  correct (you search what you see) but call it out in the PR so it is not
  read as a bug.
- **IME partial-jamo.** Mid-composition Hangul may not match until the
  syllable composes. Acceptable v1; documented as a future enhancement.
- **`@vueuse/core` `watchDebounced`.** Already a dependency (^14.3.0); no new
  package. If SSR ever returns, the debounce is client-only anyway (SPA).

## Open Questions

None blocking. Tactical choices deferred to the implementation plan: exact
placeholder/label wording per locale, whether Level renders as a `<select>`
or a compact chip row (spec allows either; default `<select>` for parity with
Category), and whether `GrammarCard` reads SRS itself or receives mastery as a
prop (default: reads itself, to keep `library.vue` thin).
