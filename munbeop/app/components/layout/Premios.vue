<script setup lang="ts">
/**
 * Premios — the profile trophy case (escape-room cosmetics).
 *
 * Two presentations over the same `usePremios` view-model:
 *   - variant="strip": a 4-slot tier summary for the sidebar plaque (hidden
 *     in the 64px rail — the count survives as AccountMenu's corner pip).
 *   - variant="detail": the full per-level inventory inside the popover.
 *
 * Tier colour lands on the slot BORDER + a 1px inset ring only, never as a
 * fill (a fill would soften the LADX pixel silhouette). Locked slots are
 * recessed "carved peg-holes" (inset shadow) with an inline-SVG padlock, so
 * the default empty state reads as an inviting case rather than broken UI.
 */
import { usePremios } from '~/composables/usePremios'

defineProps<{ variant: 'strip' | 'detail'; collapsed?: boolean }>()

const { t } = useI18n()
const { tl } = useLocalized()
const { totalCount, unlockedCount, tierSlots, detailLevels } = usePremios()
</script>

<template>
  <!-- STRIP — sidebar plaque (expanded rail only) -->
  <div v-if="variant === 'strip' && !collapsed" class="premios">
    <div class="premios__head">
      <span class="premios__title">{{ t('escape.premios_title') }}</span>
      <span class="premios__count" :class="{ 'premios__count--has': unlockedCount > 0 }">
        {{ unlockedCount }}/{{ totalCount }}
      </span>
    </div>
    <ul class="premios__strip">
      <li
        v-for="slot in tierSlots"
        :key="slot.tier"
        class="premio"
        :class="[`premio--${slot.tier}`, slot.unlocked ? 'premio--unlocked' : 'premio--locked']"
        :title="t(`escape.tier_${slot.tier}`)"
      >
        <img
          v-if="slot.unlocked"
          class="premio__icon"
          :src="slot.shown.url"
          :alt="tl(slot.shown.name)"
        >
        <span v-else class="premio__lock" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="12" height="12" shape-rendering="crispEdges">
            <path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2" />
            <rect x="3.5" y="7" width="9" height="7" fill="currentColor" />
          </svg>
        </span>
      </li>
    </ul>
  </div>

  <!-- DETAIL — popover inventory -->
  <div v-else-if="variant === 'detail'" class="premios__detail-wrap">
    <div class="premios__detail-head">
      <span>{{ t('escape.premios_title') }}</span>
      <span class="premios__count" :class="{ 'premios__count--has': unlockedCount > 0 }">
        {{ unlockedCount }}/{{ totalCount }}
      </span>
    </div>
    <p v-if="unlockedCount === 0" class="premios__empty">{{ t('escape.premios_empty') }}</p>
    <div class="premios__detail">
      <section v-for="lvl in detailLevels" :key="lvl.id" class="premios__group">
        <h3 class="premios__group-title">{{ tl(lvl.title) }}</h3>
        <div
          v-for="row in lvl.rows"
          :key="row.id"
          class="premios__row"
          :class="[`premio--${row.tier}`, { 'premios__row--locked': !row.unlocked }]"
        >
          <span
            class="premio premios__row-cell"
            :class="[`premio--${row.tier}`, row.unlocked ? 'premio--unlocked' : 'premio--locked']"
          >
            <img v-if="row.unlocked" class="premio__icon" :src="row.url" :alt="tl(row.name)" >
            <span v-else class="premio__lock" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="12" height="12" shape-rendering="crispEdges">
                <path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2" />
                <rect x="3.5" y="7" width="9" height="7" fill="currentColor" />
              </svg>
            </span>
          </span>
          <span class="premios__row-info">
            <span class="premios__row-name">{{ tl(row.name) }}</span>
            <span class="premios__row-tier">{{ t(`escape.tier_${row.tier}`) }}</span>
          </span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Tier colour on BORDER only (never fill). Locked = recessed peg-hole. The
 * --tier-epic purple has no global token; it's scoped here (and re-declared
 * on AccountMenu's teleported .acct__menu, which can't inherit through the
 * teleport boundary). Verified ~3:1 on --paper and --paper-warm, both themes. */
.premios,
.premios__detail-wrap {
  --tier-epic: #8a5cd0;
  width: 100%;
}
[data-theme='dark'] .premios,
[data-theme='dark'] .premios__detail-wrap {
  --tier-epic: #a982f0;
}

/* ---- strip header (rail) ---- */
.premios__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.premios__title,
.premios__count {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: var(--ink-soft);
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
.premios__count--has {
  color: var(--gold);
}

/* ---- strip grid: 4 tier slots ---- */
.premios__strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}
.premio {
  position: relative;
  aspect-ratio: 1;
  min-width: 0;
  display: grid;
  place-items: center;
  padding: 3px;
  border: 2px solid var(--ink-line);
  --tier: var(--ink-line);
}
.premio__icon {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}
.premio__lock {
  display: grid;
  place-items: center;
  color: var(--ink-soft);
  opacity: 0.55;
}

/* tier colour map (consumed by border + inset ring + locked hint) */
.premio--common {
  --tier: var(--jade);
}
.premio--rare {
  --tier: var(--sky);
}
.premio--epic {
  --tier: var(--tier-epic);
}
.premio--legendary {
  --tier: var(--gold);
}

/* unlocked = raised tile, tier-framed, hard offset shadow */
.premio--unlocked {
  background: var(--paper-deep);
  border-color: var(--tier);
  box-shadow:
    inset 0 0 0 1px var(--tier),
    var(--shadow-pixel-sm);
}
/* gold reads ~1.46:1 on warm wood in light — add a dark rim (the 문법 trick) */
.premio--unlocked.premio--legendary {
  box-shadow:
    inset 0 0 0 1px var(--always-dark),
    inset 0 0 0 2px var(--gold),
    var(--shadow-pixel-sm);
}

/* locked = recessed carved peg-hole (the default empty state). --paper (not
 * --paper-warm) so the hole reads against the plank in BOTH themes. */
.premio--locked {
  background: var(--paper);
  border-style: dashed;
  border-color: color-mix(in srgb, var(--ink-line) 55%, transparent);
  box-shadow: var(--shadow-inset);
}
.premio--locked::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 28%;
  right: 28%;
  height: 0;
  border-bottom: 2px dotted var(--tier);
  opacity: 0.5;
}

/* ---- popover detail list ---- */
.premios__detail-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: var(--ink-soft);
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
.premios__empty {
  margin: 6px 0 0;
  text-align: center;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 10px;
  color: var(--ink-soft);
}
/* Only THIS scrolls — sign-out below it never falls off as levels grow. */
.premios__detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;
}
.premios__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.premios__group-title {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.04em;
  color: var(--text-soft);
  text-transform: uppercase;
}
.premios__row {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 8px;
  align-items: center;
}
.premios__row-cell {
  width: 40px;
  height: 40px;
  aspect-ratio: auto;
}
.premios__row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.premios__row-name {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.premios__row--locked .premios__row-name {
  color: var(--ink-soft);
  font-weight: 400;
}
.premios__row-tier {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: var(--tier);
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
/* outlined-not-filled tier chip when locked */
.premios__row--locked .premios__row-tier {
  color: transparent;
  -webkit-text-stroke: 1px var(--tier);
}

:lang(th) .premios__title,
:lang(vi) .premios__title,
:lang(ja) .premios__title,
:lang(th) .premios__count,
:lang(vi) .premios__count,
:lang(ja) .premios__count,
:lang(th) .premios__detail-head,
:lang(vi) .premios__detail-head,
:lang(ja) .premios__detail-head {
  font-size: 10px;
}
</style>
