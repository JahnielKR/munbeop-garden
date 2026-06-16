<script setup lang="ts">
/**
 * Trophies — the full cosmetic collection earned across the escape-room games.
 *
 * Reached from the account popover ("Trophies n/total ▸"). Shows every reward
 * grouped by level: unlocked ones render their pixel art framed in their tier
 * colour; locked ones are recessed peg-holes that still tease the name + tier,
 * so the page reads as a collection to complete. Unlocked rewards can be
 * EQUIPPED — choosing which avatar / frame / background (or the legendary set)
 * is active on the sidebar portrait; the choice persists per account.
 */
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import { usePremios, type Premio } from '~/composables/usePremios'
import { useEscapeRoomStore } from '~/stores/escape-room'
import { useEscapeRoomProgress } from '~/composables/useEscapeRoomProgress'

const { t } = useI18n()
const { tl } = useLocalized()
const { detailLevels, unlockedCount, totalCount } = usePremios()
const store = useEscapeRoomStore()
const { persist } = useEscapeRoomProgress()

/** Toggle a reward as the active cosmetic for its type, then persist. */
function toggleEquip(row: Premio) {
  if (row.equipped) store.unequip(row.type)
  else store.equip(row.type, row.id)
  void persist()
}
</script>

<template>
  <div class="page trophies">
    <header class="trophies__head">
      <BilingualTitle ko="전리품" :latin="t('escape.premios_title')" />
      <span class="trophies__count" :class="{ 'trophies__count--has': unlockedCount > 0 }">
        {{ unlockedCount }}/{{ totalCount }}
      </span>
    </header>

    <p v-if="unlockedCount === 0" class="trophies__empty">{{ t('escape.premios_empty') }}</p>

    <section v-for="lvl in detailLevels" :key="lvl.id" class="trophies__level">
      <h2 class="trophies__level-title">{{ tl(lvl.title) }}</h2>
      <div class="trophies__grid">
        <article
          v-for="row in lvl.rows"
          :key="row.id"
          class="trophy"
          :class="[
            `premio--${row.tier}`,
            row.unlocked ? 'trophy--unlocked' : 'trophy--locked',
            { 'trophy--equipped': row.equipped },
          ]"
        >
          <div class="trophy__art">
            <img v-if="row.unlocked" class="trophy__img" :src="row.url" :alt="tl(row.name)" >
            <span v-else class="trophy__lock" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="26" height="26" shape-rendering="crispEdges">
                <path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2" />
                <rect x="3.5" y="7" width="9" height="7" fill="currentColor" />
              </svg>
            </span>
          </div>
          <span class="trophy__tier">{{ t(`escape.tier_${row.tier}`) }}</span>
          <h3 class="trophy__name">{{ tl(row.name) }}</h3>
          <p class="trophy__desc">{{ tl(row.description) }}</p>
          <button
            v-if="row.unlocked"
            type="button"
            class="trophy__equip"
            :class="{ 'trophy__equip--on': row.equipped }"
            :aria-pressed="row.equipped"
            @click="toggleEquip(row)"
          >
            {{ row.equipped ? `✓ ${t('escape.equipped')}` : t('escape.equip') }}
          </button>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  /* the missing global epic-tier purple, scoped here (light + dark) */
  --tier-epic: #8a5cd0;
}
[data-theme='dark'] .page {
  --tier-epic: #a982f0;
}

.trophies__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.trophies__count {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: var(--ink-soft);
  border: 2px solid var(--ink-line);
  background: var(--paper-warm);
  box-shadow: var(--shadow-pixel-sm);
  padding: 8px 12px;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
.trophies__count--has {
  color: var(--gold);
}
.trophies__empty {
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: var(--ink-soft);
}

.trophies__level {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.trophies__level-title {
  margin: 0;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--heading-accent);
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}

.trophies__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

/* ---- card: tier colour on the border only; recessed when locked ---- */
.trophy {
  --tier: var(--ink-line);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border: 2px solid var(--ink-line);
}
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
.trophy--unlocked {
  background: var(--paper-deep);
  border-color: var(--tier);
  box-shadow: inset 0 0 0 1px var(--tier), var(--shadow-pixel-md);
}
.trophy--unlocked.premio--legendary {
  box-shadow:
    inset 0 0 0 1px var(--always-dark),
    inset 0 0 0 2px var(--gold),
    var(--shadow-pixel-md);
}
.trophy--locked {
  background: var(--paper);
  border-style: dashed;
  border-color: color-mix(in srgb, var(--ink-line) 55%, transparent);
  box-shadow: var(--shadow-inset);
}

.trophy__art {
  display: grid;
  place-items: center;
  height: 116px;
  background: color-mix(in srgb, var(--ink-line) 12%, transparent);
}
.trophy--locked .trophy__art {
  background: transparent;
}
.trophy__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}
.trophy__lock {
  color: var(--ink-soft);
  opacity: 0.5;
}

.trophy__tier {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.06em;
  color: var(--tier);
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
.trophy--locked .trophy__tier {
  color: transparent;
  -webkit-text-stroke: 1px var(--tier);
}
.trophy__name {
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}
.trophy--locked .trophy__name {
  color: var(--ink-soft);
}
.trophy__desc {
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: var(--ink-soft);
}

/* equipped card reads as the active one: a thicker tier ring */
.trophy--equipped {
  box-shadow:
    inset 0 0 0 2px var(--tier),
    var(--shadow-pixel-md);
}
.trophy--equipped.premio--legendary {
  box-shadow:
    inset 0 0 0 1px var(--always-dark),
    inset 0 0 0 3px var(--gold),
    var(--shadow-pixel-md);
}

.trophy__equip {
  margin-top: auto; /* pin to the card foot so buttons align across a row */
  align-self: flex-start;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  letter-spacing: 0.04em;
  padding: 8px 10px;
  background: var(--surface);
  border: 2px solid var(--ink-line);
  color: var(--text);
  cursor: pointer;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
.trophy__equip:hover {
  background: var(--surface-hover);
  border-color: var(--border-strong);
}
.trophy__equip:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.trophy__equip--on {
  background: var(--gold);
  color: var(--text-on-accent);
  border-color: var(--always-dark);
}
:lang(th) .trophy__equip,
:lang(vi) .trophy__equip,
:lang(ja) .trophy__equip {
  font-size: 10px;
}
</style>
