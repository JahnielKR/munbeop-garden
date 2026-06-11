<script setup lang="ts">
/**
 * 내 정원 / My Garden — home hero (spec §5.1).
 *
 * The active level's tree IS the screen — and the menu: zone nodes over
 * the branches open the library filtered by theme, the diary chest sits
 * by the roots, and Bomi hovers over the furthest unlocked zone (guide
 * without tutorial). Everything anchored to the tree shares its wrapper
 * so % anchors live in canvas coordinates at any integer scale.
 *
 * The grove toggle (spec §5.2) swaps the hero for the six-tree map in the
 * same page — no new route; picking a tree pins it and returns here.
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import Bomi from '~/components/bomi/Bomi.vue'
import type { Pose } from '~/components/bomi/poses'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Button from '~/components/ui/Button.vue'
import DiaryChest from '~/components/garden/DiaryChest.vue'
import GardenGrove from '~/components/garden/GardenGrove.vue'
import GardenHud from '~/components/garden/GardenHud.vue'
import GardenStage from '~/components/garden/GardenStage.vue'
import PixelTree from '~/components/garden/PixelTree.vue'
import TreeZones from '~/components/garden/TreeZones.vue'
import { ZONE_ANCHORS } from '~/lib/garden/zone-anchors'
import { SPECIES_KO } from '~/lib/garden'
import { gardenStateKey, useGardenState } from '~/composables/useGardenState'
import type { TopikLevel } from '~/lib/domain'

definePageMeta({ surface: 'game' })

const { t } = useI18n()

const { active, activeLevel, levels, zones, pendingReviews, lastPracticedAt, setActiveLevel } =
  useGardenState()

// hero ↔ grove toggle (same page, spec §5.2)
const view = ref<'hero' | 'grove'>('hero')

function onGroveSelect(level: TopikLevel) {
  setActiveLevel(level)
  view.value = 'hero'
}

// Integer scale only (spec §7.2): x2 on narrow viewports, x3 otherwise.
const stageWrap = ref<HTMLElement | null>(null)
const { width } = useElementSize(stageWrap)
const treeScale = computed(() => (width.value > 0 && width.value < 432 ? 2 : 3))

const stateKey = computed(() => gardenStateKey(active.value.pct))
const speciesKo = computed(() => SPECIES_KO[active.value.species])
const speciesLabel = computed(() => t(`garden.species.${active.value.species}`))

// ── Bomi: hovers over the furthest unlocked zone node; 'thinking' for 2s
// when a locked zone is tapped; 'sleep' when the garden is untouched for
// a week (spec §5.1).
const SLEEP_AFTER_MS = 7 * 24 * 60 * 60 * 1000

const thinking = ref(false)
let thinkTimer: ReturnType<typeof setTimeout> | null = null

function onLockedAttempt() {
  thinking.value = true
  if (thinkTimer) clearTimeout(thinkTimer)
  thinkTimer = setTimeout(() => {
    thinking.value = false
  }, 2000)
}

onBeforeUnmount(() => {
  if (thinkTimer) clearTimeout(thinkTimer)
})

const bomiPose = computed<Pose>(() => {
  if (thinking.value) return 'thinking'
  const idle =
    active.value.pct === 0 &&
    (lastPracticedAt.value === null || Date.now() - lastPracticedAt.value > SLEEP_AFTER_MS)
  return idle ? 'sleep' : 'idle'
})

/** Anchor of the furthest unlocked node (Bomi floats 28px above it). */
const bomiAnchor = computed(() => {
  const anchors = ZONE_ANCHORS[active.value.species]
  const nodeCount = Math.min(zones.value.length, anchors.length)
  let lastUnlocked = 0
  for (let i = 0; i < nodeCount; i++) {
    if (zones.value[i]?.unlocked) lastUnlocked = i
  }
  return anchors[lastUnlocked] ?? { top: '30%', left: '60%' }
})
</script>

<template>
  <div class="page">
    <header class="page__head">
      <BilingualTitle ko="내 정원" :latin="t('title.garden')" />
      <Button variant="secondary" size="sm" @click="view = view === 'hero' ? 'grove' : 'hero'">
        {{ view === 'hero' ? t('garden.grove_open') : t('garden.grove_back') }}
      </Button>
    </header>

    <Transition name="garden-fade" mode="out-in">
      <div v-if="view === 'hero'" key="hero" class="page__view">
        <div ref="stageWrap">
          <GardenStage :pct="active.pct" :scale="treeScale">
            <!-- one wrapper = the tree's canvas coordinate space -->
            <div class="hero-tree">
              <PixelTree :species="active.species" :progress="active.pct" :scale="treeScale" />
              <TreeZones
                :species="active.species"
                :level="active.level"
                :zones="zones"
                @locked-attempt="onLockedAttempt"
              />
              <DiaryChest :pending="pendingReviews" />
              <Bomi
                class="hero-tree__bomi"
                :style="{ top: bomiAnchor.top, left: bomiAnchor.left }"
                :scale="2"
                :pose="bomiPose"
              />
            </div>
          </GardenStage>
        </div>

        <GardenHud
          :level="active.level"
          :species-ko="speciesKo"
          :species-label="speciesLabel"
          :pct="active.pct"
          :state-key="stateKey"
        />
      </div>

      <GardenGrove
        v-else
        key="grove"
        :levels="levels"
        :active-level="activeLevel"
        @select="onGroveSelect"
      />
    </Transition>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-tree {
  position: relative;
}

.hero-tree__bomi {
  position: absolute;
  /* anchor sits on the node; lift Bomi a sprite above it */
  transform: translate(-50%, -100%) translateY(-28px);
  pointer-events: none;
}

.page__view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.garden-fade-enter-active,
.garden-fade-leave-active {
  transition: opacity 180ms ease;
}

.garden-fade-enter-from,
.garden-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .garden-fade-enter-active,
  .garden-fade-leave-active {
    transition: none;
  }
}
</style>
