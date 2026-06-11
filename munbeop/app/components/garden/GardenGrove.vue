<script setup lang="ts">
/**
 * GardenGrove — the whole TOPIK path as six trees (spec §5.2).
 *
 * Each card shows the species at its REAL layer state (the grove is the
 * global progress map, not a postcard): unlocked trees render their
 * progress, locked ones only the gray skeleton + padlock + the gate
 * requirement. Tapping an unlocked tree pins it as the active level and
 * returns to the hero.
 *
 * Desktop: 3×2 grid. Mobile: horizontal scroll-snap strip.
 */
import type { GardenLevel } from '~/composables/useGardenState'
import PixelTree from '~/components/garden/PixelTree.vue'
import { SPECIES_KO, TREE_GATE_PCT } from '~/lib/garden'

interface Props {
  levels: GardenLevel[]
  activeLevel: number
}

const props = defineProps<Props>()

const emit = defineEmits<{ select: [level: GardenLevel['level']] }>()

const { t } = useI18n()

function cardLabel(l: GardenLevel): string {
  const name = `${SPECIES_KO[l.species]} · ${t(`garden.species.${l.species}`)}`
  if (!l.unlocked) {
    return `${t('garden.level', { n: l.level })} — ${t('garden.tree_locked', { pct: TREE_GATE_PCT, n: l.level - 1 })}`
  }
  return `${t('garden.level', { n: l.level })} — ${name} — ${l.pct}%`
}

function onSelect(l: GardenLevel) {
  if (!l.unlocked) return
  emit('select', l.level)
}

const isActive = (l: GardenLevel) => l.level === props.activeLevel
</script>

<template>
  <div class="grove" role="list">
    <button
      v-for="l in levels"
      :key="l.level"
      type="button"
      role="listitem"
      class="grove__card"
      :class="{ 'grove__card--locked': !l.unlocked, 'grove__card--active': isActive(l) }"
      :aria-label="cardLabel(l)"
      :aria-current="isActive(l) ? 'true' : undefined"
      @click="onSelect(l)"
    >
      <span class="grove__canvas">
        <PixelTree
          class="grove__tree"
          :species="l.species"
          :progress="l.unlocked ? l.pct : 0"
          :scale="2"
        />
        <img
          v-if="!l.unlocked"
          class="grove__lock pixel"
          src="/img/tree/ui/lock_8.png"
          alt=""
          width="24"
          height="24"
          draggable="false"
        />
      </span>

      <span class="grove__meta">
        <span class="grove__level font-pixel">{{ t('garden.level', { n: l.level }) }}</span>
        <span class="grove__name">
          <span lang="ko">{{ SPECIES_KO[l.species] }}</span> · {{ t(`garden.species.${l.species}`) }}
        </span>
        <span class="grove__pct font-pixel">{{ l.unlocked ? `${l.pct}%` : '···' }}</span>
      </span>

      <span v-if="!l.unlocked" class="grove__tip" role="tooltip">
        {{ t('garden.tree_locked', { pct: TREE_GATE_PCT, n: l.level - 1 }) }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.grove {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.grove__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 14px 10px 12px;
  background: var(--paper-warm);
  border: 2px solid var(--ink-line);
  box-shadow: 3px 3px 0 var(--shadow-cream);
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.grove__card:hover:not(.grove__card--locked),
.grove__card:focus-visible {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--shadow-cream);
}

.grove__card:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.grove__card--active {
  border-color: var(--gold);
  box-shadow: 3px 3px 0 var(--gold);
}

.grove__card--locked {
  cursor: not-allowed;
}

.grove__card--locked .grove__tree {
  filter: grayscale(1) brightness(0.8);
}

.grove__canvas {
  position: relative;
  display: flex;
  justify-content: center;
}

.grove__lock {
  position: absolute;
  top: 38%;
  left: 50%;
  transform: translate(-50%, -50%);
  image-rendering: pixelated;
}

.grove__meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.grove__level {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  color: var(--text);
}

.grove__name {
  font-size: 12px;
  color: var(--text-soft);
}

.grove__name [lang='ko'] {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  color: var(--text);
}

.grove__pct {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: var(--text);
}

.grove__tip {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: 92%;
  padding: 5px 8px;
  background: var(--paper-deep);
  color: var(--ink);
  border: 2px solid var(--ink-line);
  box-shadow: 2px 2px 0 rgba(26, 17, 12, 0.45);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 11px;
  line-height: 1.35;
  text-align: center;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 5;
}

.grove__card--locked:hover .grove__tip,
.grove__card--locked:focus-visible .grove__tip {
  opacity: 1;
  visibility: visible;
}

/* Mobile: horizontal strip with scroll-snap (spec §5.2) */
@media (max-width: 760px) {
  .grove {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 12px;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
  }

  .grove__card {
    flex: 0 0 auto;
    width: min(78vw, 290px);
    scroll-snap-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .grove__card {
    transition: none;
  }
}
</style>
