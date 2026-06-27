# Garden Avatar Collection — Design Spec

**Date:** 2026-06-27
**Status:** Approved design, pending spec review
**Author:** Claude (with owner)

## 1. Problem

The user's profile portrait (sidebar `AccountMenu`, and the Settings → Account
panel) can only show:

1. The **first letter of the email** in an accent-colored box (the default), or
2. An **escape-room cosmetic avatar**, which is gated behind beating escape-room
   levels with clean runs and equipped on `/trophies`.

There is **no way to set a profile picture** from Settings. The owner wants a
gallery of pixel-art avatars to choose from — no uploads — divided by **rarity**,
with the common ones available from day 1 and the rest unlocked by real learning
progress.

## 2. Goals

- A **collection of 36 garden-themed pixel-art avatars**, split into 4 rarity
  tiers: **common (12) / rare (8) / epic (8) / legendary (8)**.
- **Commons unlocked from day 1.** Rare/epic/legendary unlock when the user hits
  milestones the app **already measures** (no new tracking tables).
- **Collectible semantics:** once unlocked, an avatar is owned forever (sticky;
  never re-locks).
- A picker in **Settings → Account** styled like `/trophies`: the unlocked ones
  are selectable; locked ones show their **requirement + progress**.
- The chosen avatar renders in the sidebar portrait (expanded and collapsed).
- **Legendary avatars get an ornate frame + an animated aura effect.** Epic gets
  a softer static glow. This makes rarity legible at a glance.
- **No DB migration** — persist in the existing `user_settings.prefs` jsonb blob.

## 3. Non-goals

- **No image upload** (no Supabase Storage bucket, no file handling). Gallery only.
- No change to the escape-room cosmetic system or `/trophies` page behavior.
- No new analytics/telemetry (project rule: "no trackers").
- No per-locale translation of 36 avatar names (names live in the catalog as a
  `{ ko, en }` bilingual pair, rendered Korean + English everywhere).

## 4. The collection

Stable string ids live in their own namespace (files at
`public/img/avatars/<id>.png`). Names are a `{ ko, en }` pair.

### Common (12) — `always` unlocked (day 1)

| id | ko · en |
|---|---|
| `seed` | 씨앗 · Seed |
| `sprout` | 새싹 · Sprout |
| `leaf` | 잎새 · Leaf |
| `pebble` | 조약돌 · Pebble |
| `dewdrop` | 물방울 · Dewdrop |
| `watering-can` | 물뿌리개 · Watering Can |
| `pot` | 화분 · Clay Pot |
| `clover` | 클로버 · Clover |
| `dandelion` | 민들레 · Dandelion |
| `mushroom` | 버섯 · Mushroom |
| `earthworm` | 지렁이 · Earthworm |
| `ant` | 개미 · Ant |

### Rare (8)

| id | ko · en | unlock rule |
|---|---|---|
| `bee` | 꿀벌 · Bee | `trees ≥ 1` |
| `sprout-cluster` | 정원 새싹 · Sprouting Bed | `trees ≥ 10` |
| `ladybug` | 무당벌레 · Ladybug | `longestStreak ≥ 7` |
| `butterfly` | 나비 · Butterfly | `reviews ≥ 100` |
| `tulip` | 튤립 · Tulip | TOPIK 1 complete |
| `frog` | 개구리 · Frog | Conjugation lab earned |
| `sunflower` | 해바라기 · Sunflower | Counter lab earned |
| `carrot` | 당근 · Carrot | Number-market lab earned |

### Epic (8)

| id | ko · en | unlock rule |
|---|---|---|
| `fox` | 여우 · Fox | `trees ≥ 50` |
| `owl` | 올빼미 · Owl | `mastered ≥ 50%` of catalog |
| `hedgehog` | 고슴도치 · Hedgehog | `longestStreak ≥ 30` |
| `koi` | 잉어 · Koi | `reviews ≥ 500` |
| `magpie` | 까치 · Magpie | TOPIK 3 complete |
| `crane` | 학 · Crane | Particle lab earned |
| `raccoon-dog` | 너구리 · Raccoon Dog | Register lab earned |
| `persimmon` | 감나무 · Persimmon Tree | 4 escape-room cosmetics unlocked |

### Legendary (8) — ornate frame + animated aura

| id | ko · en | unlock rule |
|---|---|---|
| `tiger` | 호랑이 · Tiger (minhwa) | Garden complete (whole catalog mastered) |
| `phoenix` | 봉황 · Phoenix | `longestStreak ≥ 100` |
| `dragon` | 용 · Dragon | `reviews ≥ 1000` |
| `dokkaebi` | 도깨비 · Dokkaebi | All 5 labs earned |
| `golden-toad` | 두꺼비 · Golden Toad | All escape-room cosmetics unlocked |
| `golden-crane` | 금학 · Golden Crane | TOPIK 5 **and** 6 complete |
| `white-tiger` | 백호 · White Tiger | `trees ≥ 100` **and** `leeches == 0` |
| `mountain-spirit` | 산신령 · Mountain Spirit | Collect all other 35 avatars |

Thresholds reuse the constants already in
`app/lib/achievements/global.ts` (`GREEN_THUMB_TREES = 10`,
`GARDENER_TREES = 50`, `REVIEWS_CENTURY = 100`, `REVIEWS_HALF_K = 500`, etc.) so
the avatar milestones line up with the existing `/stats` trophies.

## 5. Data model

### 5.1 Catalog (`app/lib/avatars/catalog.ts`)

Declarative, pure, no Vue/store imports — trivially unit-testable.

```ts
export const AVATAR_TIERS = ['common', 'rare', 'epic', 'legendary'] as const
export type AvatarTier = (typeof AVATAR_TIERS)[number]

export type LabId = 'conjugation' | 'counter' | 'number' | 'particle' | 'register'

export type UnlockRule =
  | { kind: 'always' }
  | { kind: 'trees'; n: number }
  | { kind: 'masteredPct'; pct: number }
  | { kind: 'gardenComplete' }
  | { kind: 'reviews'; n: number }
  | { kind: 'longestStreak'; n: number }
  | { kind: 'topikComplete'; levels: number[] }
  | { kind: 'labEarned'; lab: LabId }
  | { kind: 'allLabs' }
  | { kind: 'escapeCosmetics'; n: number | 'all' }
  | { kind: 'flourish'; trees: number }
  | { kind: 'collectAll' }

export interface AvatarDef {
  id: string
  tier: AvatarTier
  name: { ko: string; en: string }
  rule: UnlockRule
}

export const AVATARS: readonly AvatarDef[] = [ /* 36 entries, table above */ ]

/** Public URL for an avatar png. */
export function avatarUrl(id: string): string  // `/img/avatars/${id}.png`
```

### 5.2 Evaluator (`app/lib/avatars/evaluate.ts`)

Pure function over a plain aggregate state — no store access — so the unlock
logic is unit-tested in isolation (mirrors `globalAchievementsFor`).

```ts
export interface AvatarState {
  trees: number              // mastered (tree) grammar count
  catalogTotal: number
  reviews: number            // total log entries
  longestStreak: number
  byLevel: Record<number, { mastered: number; total: number }>  // 1..6
  labsEarned: Record<LabId, boolean>
  escapeUnlocked: number
  escapeTotal: number
  leeches: number
}

export interface AvatarProgress { current: number; target: number }

export interface DecoratedAvatar extends AvatarDef {
  unlocked: boolean
  progress: AvatarProgress   // for the locked-state bar; {1,1} for booleans met
}

/**
 * Evaluate every avatar. `storedUnlocked` is the sticky owned set: an avatar is
 * unlocked iff it is common, OR already in storedUnlocked, OR its rule is met
 * now. `collectAll` is resolved last (needs all other unlocks decided).
 */
export function evaluateAvatars(
  state: AvatarState,
  storedUnlocked: ReadonlySet<string>,
): DecoratedAvatar[]
```

### 5.3 Composable (`app/composables/useAvatars.ts`)

- Assembles `AvatarState` from existing composables/stores:
  - `trees`, `catalogTotal`, `byLevel`, `reviews`, `longestStreak` ← `useStats()`
    (`masteredCount`, `catalogTotal`, `masteryLevels`, `sentences`,
    `longestStreak`).
  - `labsEarned` ← `useConjugationMaster().earned`, `useCounterMaster().earned`,
    `useNumberMarketMaster().earned`, `useParticleMaster().earned`,
    `useRegisterMaster().earned`.
  - `escapeUnlocked` / `escapeTotal` ← `useEscapeRoomStore().unlockedCosmetics`
    length and `usePremios().totalCount`.
  - `leeches` ← `useLeeches().leeches.length`.
- Reads the sticky set from `useSettingsStore().unlockedAvatarIds`.
- Exposes:
  - `avatars: ComputedRef<DecoratedAvatar[]>` (decorated catalog),
  - `byTier: ComputedRef<Record<AvatarTier, DecoratedAvatar[]>>`,
  - `ownedCount`, `totalCount`,
  - `chosenId`, `chosenAvatar` (the `DecoratedAvatar | null` for the portrait),
  - `choose(id: string | null)` → `settings.setChosenAvatar(id)` (guarded:
    refuses ids not currently unlocked; `null` resets to initial),
  - `syncUnlocks()` → unions newly-met rule ids into the sticky set and persists
    only if it grew (called on picker mount; idempotent, cheap).

### 5.4 Persistence (settings blob — **no migration**)

Extend the `Settings` interface in `app/stores/settings.ts`:

```ts
chosenAvatarId: string | null     // null = use email initial
unlockedAvatarIds: string[]       // sticky owned set (non-common)
```

- `ref`s default to `null` / `[]`.
- `hydrate()`: type-guarded reads
  (`typeof cloud.chosenAvatarId === 'string' | null`; array-of-strings filter for
  `unlockedAvatarIds`), inside the existing try/catch.
- `persistCloud()`: include both new fields in the blob.
- New actions:
  - `setChosenAvatar(id: string | null)` → set ref + `persistCloud()`.
  - `unlockAvatars(ids: string[])` → union into `unlockedAvatarIds`; if it grew,
    `persistCloud()`; no-op otherwise.
- Existing store tests updated to expect the two new keys in the persisted blob.

## 6. Portrait integration & precedence

Extend `usePremios().portrait` (the single source for the portrait layers). It
must also expose the chosen avatar's **tier** so the renderer can apply the
frame/effect.

New precedence (single frame, single avatar slot):

1. **Escape-room SET equipped** → render only the set (unchanged; a legendary
   full-portrait overrides everything).
2. Otherwise:
   - **avatar slot** = settings chosen avatar url **??** escape-room avatar url
     **??** email initial. *(The user's explicit Settings choice wins the center
     image; most users have no escape-room avatar anyway.)*
   - **frame slot** = escape-room frame url (if equipped) **else** the shared
     legendary frame **iff** the chosen avatar's tier is `legendary`.
   - **bg slot** = escape-room bg url (unchanged).
   - **effect** = `epic` → static glow; `legendary` → animated aura — applied
     only when the *settings* avatar is the one showing.

`portrait` return shape gains:
```ts
{ setUrl?, avatarUrl?, frameUrl?, bgUrl?, avatarTier?: AvatarTier | null }
```

`AccountMenu.vue` already renders `avatarUrl`/`frameUrl`/`bgUrl`/`setUrl`. Changes:
- Bind a tier class on `.acct__avatar` (or `.acct__inner`):
  `acct__avatar--epic` / `acct__avatar--legendary` from `portrait.avatarTier`.
- Add CSS: `--legendary` → ornate-frame already covered by `frameUrl`; the
  **animated aura** is a `box-shadow`/pseudo-element keyframe (gold pulse + soft
  sparkle), wrapped in `@media (prefers-reduced-motion: reduce)` to a static glow.
  `--epic` → a static soft purple (`--tier-epic`) glow ring. Collapsed rail keeps
  the existing behavior of hiding cosmetics; the aura is also suppressed when
  collapsed (the 48px tile stays clean).

## 7. UI — `AvatarPickerSetting.vue`

Placed at the **top of the Account tab** in `app/pages/settings.vue` (above
`AccountCredentials`):

```
<section v-show="active === 'account'" ...>
  <AvatarPickerSetting />     <!-- NEW -->
  <AccountWidget />
  <AccountCredentials />
  <DangerZone />
</section>
```

Structure (matching `DailyGoalSetting` conventions: `<section>` + `<h2>` +
hint `<p>`):

- **Header**: bilingual title (정원 아바타 · t('settings.avatar.title')) +
  "owned / total" counter (e.g. `14/36`), Press Start 2P.
- **Live preview** of the current portrait + a **"Use initial"** button
  (`choose(null)`), shown selected when `chosenId == null`.
- **Tier groups** (common → legendary), each a labeled grid of cards
  (reuse `/trophies` visual language: `premio--{tier}` color, `--unlocked` /
  `--locked` / `--equipped` states, `image-rendering: pixelated`):
  - Unlocked card: avatar art + name; click → `choose(id)`; equipped card shows a
    ✓ / ring. Epic/legendary cards render their glow/frame+aura so rarity reads.
  - Locked card: silhouette + **requirement text** (i18n template from the rule)
    + a **progress bar** from `progress.current/target`.
- Calls `syncUnlocks()` on mount.

Accessibility: cards are `<button>`s with `aria-pressed` for the equipped one;
the grid has a group label; focus-visible rings as elsewhere.

## 8. Art pipeline

New generator `tools/avatars/gen_garden_avatars.py`, modeled on
`tools/achievements/gen_badges.py` but at **64×64** (matches the portrait's 64px
inner slot and the escape-room cosmetic avatars — pixel-perfect, no upscale blur).

- Reuses `tools/escape-room-level01/common.py`: `PAL`, `OUTLINE`, `rgb`, and the
  draw primitives; 8-neighbor `add_outline` for a soft silhouette.
- Output: `munbeop/public/img/avatars/<id>.png` (36 sprites) +
  `munbeop/public/img/avatars/_frame-legendary.png` (one shared 96×96 ornate gold
  frame) + contact sheets per tier in `tools/avatars/out/` for review.
- Deterministic (no unseeded randomness → byte-identical re-runs).
- Rarity is expressed in the art: commons humble/simple; rare/epic richer; the
  shared legendary **frame** is a separate asset (the animated aura is CSS, not
  baked).
- Run from repo root: `python tools/avatars/gen_garden_avatars.py`. Deps: Pillow
  only (no ffmpeg). `tools/avatars/.gitignore` excludes `out/` and `__pycache__/`.

**Art is the bulk of the effort.** 36 distinct, readable 64×64 garden/mythic
sprites + 1 frame. Contact sheets are produced for the owner (and wife) to
eyeball; iterate on any that don't read.

## 9. i18n

`LocalizedString` is `Record<LocaleCode, string>` (all 8 locales), so avatar
names are **not** `LocalizedString` — they live in the catalog as `{ ko, en }`
and render Korean + English in every UI locale (consistent with `BilingualTitle`
and the "화이팅 stays Korean" convention).

Only **chrome + requirement templates** are translated across all 8 locales
(`i18n/locales/{en,es,fr,id,ja,pt-BR,th,vi}.json`), ~16 short keys under
`settings.avatar.*`, e.g.:

```
settings.avatar.title            "Avatar"
settings.avatar.hint             "Pick a garden avatar. Unlock more as you grow."
settings.avatar.use_initial      "Use initial"
settings.avatar.owned            "{owned}/{total} collected"
settings.avatar.locked           "Locked"
settings.avatar.tier.common|rare|epic|legendary
settings.avatar.req.trees        "Master {n} grammar points"
settings.avatar.req.reviews      "Reach {n} reviews"
settings.avatar.req.streak       "Reach a {n}-day streak"
settings.avatar.req.topik        "Complete TOPIK {levels}"
settings.avatar.req.lab          "Master the {lab} lab"
settings.avatar.req.all_labs     "Master all 5 labs"
settings.avatar.req.escape       "Unlock {n} escape-room cosmetics"
settings.avatar.req.escape_all   "Unlock every escape-room cosmetic"
settings.avatar.req.flourish     "Master {n} grammars with no struggling plants"
settings.avatar.req.collect_all  "Collect every other avatar"
```

A small helper maps an `UnlockRule` → `{ key, params }` for the locked label.

## 10. Testing

- **Catalog** (`tests/unit/avatars/catalog.test.ts`): exactly 36 entries; unique
  ids; per-tier counts 12/8/8/8; ≥8 legendary; every legendary has tier
  `legendary`; every `id` resolves to a `public/img/avatars/<id>.png` path
  string; rule shapes valid.
- **Evaluator** (`tests/unit/avatars/evaluate.test.ts`): each `UnlockRule` kind
  locks below / unlocks at threshold; commons always unlocked; `storedUnlocked`
  makes an avatar sticky even when its live rule is unmet; `collectAll` unlocks
  only when all other 35 are unlocked; progress `{current,target}` correct.
- **Store** (`tests/unit/stores/settings.test.ts`, extend existing): hydrate
  applies `chosenAvatarId` + `unlockedAvatarIds` with type guards; rejects junk;
  `setChosenAvatar` + `unlockAvatars` persist the full blob including the new
  keys; `unlockAvatars` is a no-op (no write) when the set doesn't grow.
- **Component** (`tests/components/settings/AvatarPickerSetting.test.ts`): renders
  groups; clicking an unlocked card calls `choose`; "Use initial" calls
  `choose(null)`; a locked card is not selectable and shows its requirement.
- **Asset QA** (mirrors the existing audio/asset count guards): a test or check
  asserts every catalog id has a matching PNG on disk (36 + frame).

## 11. File manifest

**Create**
- `tools/avatars/gen_garden_avatars.py`
- `tools/avatars/.gitignore`
- `munbeop/public/img/avatars/*.png` (36 + `_frame-legendary.png`)
- `munbeop/app/lib/avatars/catalog.ts`
- `munbeop/app/lib/avatars/evaluate.ts`
- `munbeop/app/composables/useAvatars.ts`
- `munbeop/app/components/settings/AvatarPickerSetting.vue`
- `munbeop/tests/unit/avatars/catalog.test.ts`
- `munbeop/tests/unit/avatars/evaluate.test.ts`
- `munbeop/tests/components/settings/AvatarPickerSetting.test.ts`

**Modify**
- `munbeop/app/stores/settings.ts` (two fields + two actions + hydrate/persist)
- `munbeop/app/composables/usePremios.ts` (portrait: settings avatar + tier)
- `munbeop/app/components/layout/AccountMenu.vue` (tier class + epic/legendary CSS)
- `munbeop/app/pages/settings.vue` (mount `AvatarPickerSetting` in Account tab)
- `munbeop/i18n/locales/{en,es,fr,id,ja,pt-BR,th,vi}.json` (`settings.avatar.*`)
- `munbeop/tests/unit/stores/settings.test.ts` (new blob keys)

## 12. Build sequence

1. **Catalog + evaluator + tests** (pure TS; fast, no art needed).
2. **Settings store fields/actions + tests.**
3. **Art generator** → produce the 36 PNGs + legendary frame; review contact
   sheets; iterate on readability.
4. **`useAvatars()` composable.**
5. **`AvatarPickerSetting.vue`** + i18n keys (all 8 locales) + component test.
6. **Portrait wiring** (`usePremios` + `AccountMenu` tier class/CSS effects).
7. **Verify**: vitest, typecheck, eslint, asset-count QA; preview the portrait
   (default initial → pick common → pick legendary shows frame+aura) and the
   picker (locked progress bars).

## 13. Risks / open notes

- **Art quality at 64×64** for mythic legendaries (tiger/dragon/phoenix) is the
  main risk; mitigated by contact-sheet review + iteration, and the frame/aura
  add legendary "weight" beyond the sprite itself.
- **`syncUnlocks()` write cadence**: only writes when the owned set grows (rare),
  so no chatty network writes.
- **Mastery regression**: avoided as a re-lock source because the owned set is
  sticky (persisted union), not purely derived.
- Owner follow-up after build: native review of the 36 ko names + eyeball the art.
