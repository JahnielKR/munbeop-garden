<script setup lang="ts">
/**
 * TreeZones — the branches as menu (spec §4.4 / §5.1).
 *
 * Renders one pixel node per theme of the active level, absolutely
 * positioned over the tree canvas (mount this INSIDE the tree wrapper so
 * % anchors share the canvas coordinate space at any integer scale).
 *
 * - unlocked → navigate to the library filtered by that zone
 * - locked   → tooltip with the chain requirement + `locked-attempt`
 *   event so the page can switch Bomi to her thinking pose
 * - more themes than anchors → the last node groups the overflow ("+N")
 *   and navigates to the whole level in the library
 */
import { computed } from 'vue'
import type { TopikLevel } from '~/lib/domain'
import type { TreeSpecies } from '~/components/garden/PixelTree.vue'
import type { GardenZone } from '~/composables/useGardenState'
import { ZONE_ANCHORS } from '~/lib/garden/zone-anchors'

interface Props {
  species: TreeSpecies
  level: TopikLevel
  zones: GardenZone[]
}

const props = defineProps<Props>()

const emit = defineEmits<{ 'locked-attempt': [zone: GardenZone] }>()

const { t } = useI18n()

const anchors = computed(() => ZONE_ANCHORS[props.species])

interface ZoneNode {
  zone: GardenZone
  anchor: { top: string; left: string }
  index: number
  /** >0 on the last node when the level has more themes than anchors. */
  overflow: number
}

const nodes = computed<ZoneNode[]>(() => {
  const a = anchors.value
  const overflowing = props.zones.length > a.length
  const count = Math.min(props.zones.length, a.length)
  return Array.from({ length: count }, (_, i) => ({
    zone: props.zones[i]!,
    anchor: a[i]!,
    index: i,
    overflow: overflowing && i === count - 1 ? props.zones.length - count + 1 : 0,
  }))
})

function labelFor(n: ZoneNode): string {
  if (!n.zone.unlocked) {
    return t('garden.zone_locked', { zone: props.zones[n.index - 1]?.title ?? '' })
  }
  if (n.overflow) {
    return `${t('garden.zone_overflow', { n: n.overflow })} — ${t('garden.level', { n: props.level })}`
  }
  return `${n.zone.title} — ${n.zone.pct}%`
}

function onClick(n: ZoneNode) {
  if (!n.zone.unlocked) {
    emit('locked-attempt', n.zone)
    return
  }
  // Overflow node = the rest of the level; plain node = its single theme.
  void navigateTo(
    n.overflow
      ? { path: '/library', query: { level: String(props.level) } }
      : { path: '/library', query: { level: String(props.level), theme: n.zone.id } },
  )
}
</script>

<template>
  <div class="zones">
    <button
      v-for="n in nodes"
      :key="n.zone.id"
      type="button"
      class="zones__hit"
      :style="{ top: n.anchor.top, left: n.anchor.left }"
      :aria-label="labelFor(n)"
      @click="onClick(n)"
    >
      <span class="zones__node" :class="{ 'zones__node--locked': !n.zone.unlocked, 'zones__node--done': n.zone.unlocked && n.zone.pct >= 50 }">
        <img
          v-if="!n.zone.unlocked"
          class="zones__lock pixel"
          src="/img/tree/ui/lock_8.png"
          alt=""
          width="16"
          height="16"
          draggable="false"
        />
        <span v-else class="zones__num font-pixel">{{ n.overflow ? `+${n.overflow}` : n.index + 1 }}</span>
      </span>
      <span class="zones__tip" role="tooltip">{{ labelFor(n) }}</span>
    </button>
  </div>
</template>

<style scoped>
.zones {
  position: absolute;
  inset: 0;
}

/* 44px invisible hit area centered on the anchor; the visible node inside */
.zones__hit {
  position: absolute;
  width: 44px;
  height: 44px;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.zones__node {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: var(--gold);
  border: 2px solid var(--always-dark);
  box-shadow: 2px 2px 0 rgba(26, 17, 12, 0.55);
  transition: transform 120ms ease;
}

.zones__node--done {
  background: var(--jade);
}

.zones__node--locked {
  background: #9a8b7a;
  filter: grayscale(1) brightness(0.9);
}

.zones__hit:hover .zones__node,
.zones__hit:focus-visible .zones__node {
  transform: translate(-1px, -1px);
}

.zones__hit:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -6px;
}

.zones__num {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: var(--always-dark);
}

.zones__lock {
  image-rendering: pixelated;
}

/* pixel tooltip — shown on hover/focus, never blocks the pointer */
.zones__tip {
  position: absolute;
  bottom: calc(100% - 2px);
  left: 50%;
  transform: translateX(-50%);
  max-width: 200px;
  width: max-content;
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

.zones__hit:hover .zones__tip,
.zones__hit:focus-visible .zones__tip {
  opacity: 1;
  visibility: visible;
}

@media (prefers-reduced-motion: reduce) {
  .zones__node {
    transition: none;
  }
}
</style>
