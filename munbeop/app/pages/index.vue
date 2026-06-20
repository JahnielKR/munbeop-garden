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
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import Bomi from '~/components/bomi/Bomi.vue'
import type { Pose } from '~/components/bomi/poses'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Button from '~/components/ui/Button.vue'
import DiaryChest from '~/components/garden/DiaryChest.vue'
import GardenGrove from '~/components/garden/GardenGrove.vue'
import GardenHud from '~/components/garden/GardenHud.vue'
import GardenStage from '~/components/garden/GardenStage.vue'
import PixelTree, { TREE_THRESHOLDS } from '~/components/garden/PixelTree.vue'
import TreeZones from '~/components/garden/TreeZones.vue'
import UnlockCelebration from '~/components/garden/UnlockCelebration.vue'
import WeatherLayer, { type WeatherKind } from '~/components/garden/WeatherLayer.vue'
import { ZONE_ANCHORS } from '~/lib/garden/zone-anchors'
import { SPECIES_BY_LEVEL, SPECIES_KO, SPECIES_PARTICLE } from '~/lib/garden'
import { gardenStateKey, useGardenState } from '~/composables/useGardenState'
import { useGardenCelebration } from '~/composables/useGardenCelebration'
import { useToast } from '~/composables/useToast'
import DailyGoalRing from '~/components/garden/DailyGoalRing.vue'
import { useSettingsStore } from '~/stores/settings'
import { useLogStore } from '~/stores/log'
import { todayCount } from '~/lib/stats/goal'
import EmptyPlot from '~/components/garden/EmptyPlot.vue'
import GuidedFirstSentence from '~/components/onboarding/GuidedFirstSentence.vue'
import { useOnboarding } from '~/composables/useOnboarding'
import type { TopikLevel } from '~/lib/domain'

definePageMeta({ surface: 'game' })

const { t } = useI18n()

const {
  active,
  activeLevel,
  levels,
  zones,
  pendingReviews,
  lastPracticedAt,
  milestones,
  setActiveLevel,
} = useGardenState()

// Daily goal ring (today's practiced count vs the user's goal).
const settings = useSettingsStore()
const logStore = useLogStore()
const goalCount = computed(() =>
  todayCount(logStore.entries.map((e) => new Date(e.date).getTime()), Date.now()),
)

// First-run onboarding: a distinct empty plot + one guided sentence. The
// overlay auto-opens once data is ready for a brand-new (empty-log) user;
// the empty plot doubles as the manual entry point after a skip.
const onboarding = useOnboarding()
watch(
  () => onboarding.shouldShow.value,
  (show) => {
    if (show) onboarding.start()
  },
  { immediate: true },
)

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

// ── Weather (spec §5.3): rain wins (it's the actionable signal), then
// mist, then season ambience (snow in winter, species fall at bloom).
const weatherKind = computed<WeatherKind>(() => {
  if (pendingReviews.value >= 5) return 'rain'
  if (pendingReviews.value >= 1) return 'mist'
  if (active.value.pct < TREE_THRESHOLDS.sprout) return 'snow'
  if (active.value.pct >= TREE_THRESHOLDS.bloom) return 'fall'
  return 'none'
})

const particleSrc = computed(() => SPECIES_PARTICLE[active.value.species])

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

const cheering = ref(false)

const bomiPose = computed<Pose>(() => {
  if (cheering.value) return 'cheer'
  if (thinking.value) return 'thinking'
  const idle =
    active.value.pct === 0 &&
    (lastPracticedAt.value === null || Date.now() - lastPracticedAt.value > SLEEP_AFTER_MS)
  return idle ? 'sleep' : 'idle'
})

// ── Milestone celebration (spec §5.4): toast + Bomi cheer 3s + particle
// burst from the crown. Seen-set persistence lives in the composable.
const { celebration, dismiss } = useGardenCelebration(milestones)
const toast = useToast()

const burst = ref(0)
let cheerTimer: ReturnType<typeof setTimeout> | null = null

watch(celebration, (c) => {
  if (!c) return
  const species = SPECIES_BY_LEVEL[c.level as TopikLevel] ?? active.value.species
  const treeName = `${SPECIES_KO[species]} · ${t(`garden.species.${species}`)}`
  toast.success(t(`garden.unlock.${c.kind}`, { tree: treeName }))
  burst.value += 1
  cheering.value = true
  if (cheerTimer) clearTimeout(cheerTimer)
  cheerTimer = setTimeout(() => {
    cheering.value = false
    dismiss()
  }, 3000)
})

onBeforeUnmount(() => {
  if (cheerTimer) clearTimeout(cheerTimer)
})

/** Burst origin = the crown's top node anchor of the active species. */
const burstOrigin = computed(() => {
  const anchors = ZONE_ANCHORS[active.value.species]
  return anchors[anchors.length - 1] ?? { top: '40%', left: '50%' }
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
      <EmptyPlot
        v-if="view === 'hero' && onboarding.showEmptyPlot.value"
        key="empty"
        @start="onboarding.start()"
      />

      <div v-else-if="view === 'hero'" key="hero" class="page__view">
        <div ref="stageWrap">
          <GardenStage :pct="active.pct" :scale="treeScale" :cold="weatherKind === 'rain'">
            <template #weather>
              <WeatherLayer :kind="weatherKind" :particle-src="particleSrc" />
            </template>
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
              <UnlockCelebration :burst="burst" :particle-src="particleSrc" :origin="burstOrigin" />
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

        <DailyGoalRing class="page__goal" :count="goalCount" :goal="settings.dailyGoal" />

        <NuxtLink v-if="weatherKind === 'rain'" class="page__rain-hint" to="/log">
          {{ t('garden.weather.rain_hint') }}
        </NuxtLink>
      </div>

      <GardenGrove
        v-else
        key="grove"
        :levels="levels"
        :active-level="activeLevel"
        @select="onGroveSelect"
      />
    </Transition>

    <GuidedFirstSentence
      :open="onboarding.open.value"
      @complete="onboarding.complete($event)"
      @skip="onboarding.skip()"
    />
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

.page__goal {
  align-self: center;
}

.page__rain-hint {
  align-self: center;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  color: var(--link);
  text-decoration: underline;
}

.page__rain-hint:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
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
