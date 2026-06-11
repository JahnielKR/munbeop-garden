<script setup lang="ts">
/**
 * GardenStage — the "window to the garden" of the home hero (spec §5.1).
 *
 * A v5 wood-framed panel whose interior sky is theme-INVARIANT (like the
 * welcome scenes): it changes with the active level's progress, not with
 * light/dark. The ground band height and the default slot's bottom padding
 * are derived from the tree scale so the trunk anchor (canvas y=148 of 160)
 * lands exactly on the grass horizon and the shadow spills onto it.
 *
 * Slots: default (the tree), `overlay` (zone nodes / chest / Bomi),
 * `weather` (particle layer, below the overlay).
 */
import { computed } from 'vue'

interface Props {
  /** Active level progress 0–100 — picks the season sky/ground. */
  pct: number
  /** Integer tree scale; drives ground band height + tree seating. */
  scale?: number
  /** Shift the sky one season colder (rain weather, spec §5.3). */
  cold?: boolean
}

const props = withDefaults(defineProps<Props>(), { scale: 3, cold: false })

// Season stops (spec §5.1): winter / thaw / early spring / full spring.
const SKY = ['#2c3e50', '#5d6d7e', '#7fb3d5', '#aed6f1']
const GROUND = ['#3b4a5a', '#5a6b5a', '#4a6f3a', '#5e8f4a']

const seasonIdx = computed(() => {
  const base = props.pct >= 80 ? 3 : props.pct >= 40 ? 2 : props.pct >= 10 ? 1 : 0
  return Math.max(0, base - (props.cold ? 1 : 0))
})

const sky = computed(() => SKY[seasonIdx.value])
const ground = computed(() => GROUND[seasonIdx.value])

const groundH = computed(() => 15 * props.scale)
const seatPad = computed(() => 3 * props.scale)
</script>

<template>
  <div class="stage">
    <div class="stage__window" :style="{ background: sky }">
      <div class="stage__ground" :style="{ background: ground, height: `${groundH}px` }" />
      <div class="stage__tree" :style="{ paddingBottom: `${seatPad}px` }">
        <slot />
      </div>
      <div class="stage__layer stage__layer--weather"><slot name="weather" /></div>
      <div class="stage__layer stage__layer--overlay"><slot name="overlay" /></div>
    </div>
  </div>
</template>

<style scoped>
.stage {
  background: var(--paper-warm);
  border: 2px solid var(--ink-line);
  box-shadow: var(--shadow-card, 4px 4px 0 var(--shadow-color));
  padding: 8px;
}

.stage__window {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  min-height: 240px;
  padding-top: 20px;
  transition: background 1.5s ease;
}

.stage__ground {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  transition: background 1.5s ease;
}

.stage__tree {
  /* No z-index on purpose: the tree paints above the ground by source
   * order already, and an explicit z would create a stacking context that
   * caps every descendant below the weather layer (z 2) — zone-node
   * tooltips must be able to rise above it (TreeZones hover z 50). */
  position: relative;
  display: flex;
  justify-content: center;
}

.stage__layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.stage__layer--weather {
  z-index: 2;
}

.stage__layer--overlay {
  z-index: 3;
}

/* interactive children of the overlay (zone nodes, chest) re-enable themselves */
.stage__layer--overlay :deep(> *) {
  pointer-events: auto;
}

@media (prefers-reduced-motion: reduce) {
  .stage__window,
  .stage__ground {
    transition: none;
  }
}
</style>
