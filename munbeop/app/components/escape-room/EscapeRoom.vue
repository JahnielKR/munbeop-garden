<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { Level, RewardTier, SelectionCandidate, CompletionCandidate, CreationCandidate } from '~/lib/domain'
import { useEscapeRoomStore } from '~/stores/escape-room'
import { useLocalized } from '~/composables/useLocalized'
import Scene from './Scene.vue'
import IntroCinematic from './IntroCinematic.vue'
import VictoryScreen from './VictoryScreen.vue'
import GameOverScreen from './GameOverScreen.vue'
import SlotSelection from './SlotSelection.vue'
import SlotCompletion from './SlotCompletion.vue'
import SlotCreation from './SlotCreation.vue'

/**
 * EscapeRoom — orchestrator for a single level's playthrough.
 *
 * Flow: intro cinematic → playing (rooms + puzzle overlays) → victory or
 * game-over screen. Retry redraws the puzzles (roguelike) and skips the
 * cinematic so the loop stays fast.
 */

interface Props {
  level: Level
  seed?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ exit: [] }>()

const store = useEscapeRoomStore()
const { tl } = useLocalized()
const { t } = useI18n()

/** Visual phase. Store keeps run state; this drives which screen is up. */
const phase = ref<'intro' | 'playing'>('intro')
const activeSlotId = ref<string | null>(null)
const earnedTier = ref<RewardTier | null>(null)
const retryCount = ref(0)

const baseSeed = computed(() => props.seed ?? `run-${Date.now()}`)
const imageBase = computed(() => `/escape-room/${props.level.id}/`)

const activeRoom = computed(
  () => props.level.rooms.find((r) => r.id === store.currentRoomId) ?? null,
)

const activeSlot = computed(() => {
  if (!activeSlotId.value) return null
  return props.level.slots.find((s) => s.id === activeSlotId.value) ?? null
})

const activeHintFlags = computed(() => {
  if (!activeSlotId.value) return { free: false, premium: false }
  return store.hintsUsed[activeSlotId.value] ?? { free: false, premium: false }
})

/** The drawn candidate for the open slot, narrowed by slot type in template. */
const activeCandidate = computed(() => {
  if (!activeSlot.value || !store.currentRun) return null
  const idx = props.level.slots.findIndex((s) => s.id === activeSlot.value!.id)
  const drawn = store.currentRun.slots[idx]
  if (!drawn) return null
  return activeSlot.value.candidates[drawn.candidateIndex] ?? null
})

/** Hearts: total = maxErrors + 1 (the run ends on the heart you don't have). */
const heartsTotal = computed(() => props.level.rules.maxErrors + 1)
const heartsLeft = computed(() => Math.max(0, heartsTotal.value - store.errorsMade))

onMounted(() => {
  store.startRun(props.level, baseSeed.value)
  phase.value = 'intro'
})

watch(
  () => store.status,
  (s) => {
    if (s === 'completed' && earnedTier.value === null) {
      activeSlotId.value = null
      earnedTier.value = store.complete()
    }
    if (s === 'gameover') {
      activeSlotId.value = null
    }
  },
)

function onHotspot(hotspotId: string) {
  const h = activeRoom.value?.hotspots.find((x) => x.id === hotspotId)
  if (h?.triggersSlot && !store.resolvedSlots.includes(h.triggersSlot)) {
    activeSlotId.value = h.triggersSlot
  }
}

function closeUnlessWrong(result: 'correct' | 'wrong' | 'game-over' | 'level-complete') {
  if (result !== 'wrong') activeSlotId.value = null
}

function onSelectionAnswer(idx: number) {
  if (activeSlotId.value) closeUnlessWrong(store.answerSelection(activeSlotId.value, idx))
}
function onCompletionAnswer(text: string) {
  if (activeSlotId.value) closeUnlessWrong(store.answerCompletion(activeSlotId.value, text))
}
function onCreationAnswer(order: number[]) {
  if (activeSlotId.value) closeUnlessWrong(store.answerCreation(activeSlotId.value, order))
}
function onUseFreeHint() {
  if (activeSlotId.value) store.useFreeHint(activeSlotId.value)
}
function onUsePremiumHint() {
  if (activeSlotId.value) store.usePremiumHint(activeSlotId.value)
}

function retry() {
  retryCount.value++
  earnedTier.value = null
  activeSlotId.value = null
  store.reset()
  store.startRun(props.level, `${baseSeed.value}#r${retryCount.value}`)
  // Roguelike loop stays fast: no cinematic on retry.
  phase.value = 'playing'
}

function exitToBook() {
  store.reset()
  emit('exit')
}
</script>

<template>
  <div class="er" data-testid="escape-room">
    <!-- Intro cinematic -->
    <IntroCinematic
      v-if="phase === 'intro'"
      :narrative="level.intro"
      :voice-line="level.voiceIntro"
      @done="phase = 'playing'"
    />

    <!-- HUD -->
    <div class="er__hud" data-testid="status-bar">
      <button
        type="button"
        class="er__back"
        data-testid="er-exit"
        :aria-label="t('escape.back_to_book')"
        @click="exitToBook"
      >
        ◀
      </button>
      <span class="er__title">{{ tl(level.title) }}</span>
      <span class="er__hearts" data-testid="er-hearts" :title="t('escape.attempts')">
        <span v-for="i in heartsTotal" :key="i" class="er__heart" aria-hidden="true">
          {{ i <= heartsLeft ? '♥' : '♡' }}
        </span>
      </span>
      <span class="er__solved">
        {{ t('escape.solved') }} {{ store.resolvedSlots.length }} / {{ level.slots.length }}
      </span>
    </div>

    <!-- Room tabs -->
    <nav class="er__rooms" :aria-label="t('escape.rooms')">
      <button
        v-for="room in level.rooms"
        :key="room.id"
        type="button"
        class="er__room-tab"
        :class="{ 'er__room-tab--active': room.id === store.currentRoomId }"
        data-testid="room-tab"
        @click="store.enterRoom(room.id)"
      >
        {{ tl(room.title) }}
      </button>
    </nav>

    <!-- Active scene -->
    <Scene v-if="activeRoom" :room="activeRoom" :image-base="imageBase" @hotspot="onHotspot" />

    <!-- Puzzle overlay -->
    <div v-if="activeSlot && activeCandidate" class="er__overlay" data-testid="puzzle-overlay">
      <div class="er__overlay-inner">
        <button
          type="button"
          class="er__overlay-close"
          data-testid="puzzle-close"
          aria-label="✕"
          @click="activeSlotId = null"
        >
          ✕
        </button>
        <SlotSelection
          v-if="activeSlot.type === 'selection'"
          :candidate="activeCandidate as SelectionCandidate"
          :flags="activeHintFlags"
          @answer="onSelectionAnswer"
          @use-free-hint="onUseFreeHint"
          @use-premium-hint="onUsePremiumHint"
        />
        <SlotCompletion
          v-else-if="activeSlot.type === 'completion'"
          :candidate="activeCandidate as CompletionCandidate"
          :flags="activeHintFlags"
          @answer="onCompletionAnswer"
          @use-free-hint="onUseFreeHint"
          @use-premium-hint="onUsePremiumHint"
        />
        <SlotCreation
          v-else
          :candidate="activeCandidate as CreationCandidate"
          :flags="activeHintFlags"
          @answer="onCreationAnswer"
          @use-free-hint="onUseFreeHint"
          @use-premium-hint="onUsePremiumHint"
        />
      </div>
    </div>

    <!-- End screens -->
    <GameOverScreen v-if="store.status === 'gameover'" @retry="retry" @exit="exitToBook" />
    <VictoryScreen
      v-if="store.status === 'completed' && earnedTier"
      :level="level"
      :tier="earnedTier"
      @exit="exitToBook"
    />
  </div>
</template>

<style scoped>
.er {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 720px;
  margin: 0 auto;
  padding: 16px;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
}
.er__hud {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  background: var(--surface, #fff7eb);
  border: 2px solid var(--border-strong, #6b5b4a);
  font-size: 10px;
}
.er__back {
  font: inherit;
  border: 2px solid var(--border-strong, #6b5b4a);
  background: transparent;
  padding: 6px 10px;
  cursor: pointer;
  min-width: 36px;
}
.er__title {
  flex: 1;
  font-size: 10px;
  line-height: 1.5;
}
.er__hearts {
  letter-spacing: 2px;
}
.er__heart {
  color: #c0392b;
  font-size: 15px;
}
.er__solved {
  color: var(--text-muted, #8a6f4a);
  white-space: nowrap;
}

.er__rooms {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.er__room-tab {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 12px;
  padding: 8px 12px;
  border: 2px solid var(--border-strong, #6b5b4a);
  background: var(--surface, #fff7eb);
  cursor: pointer;
  min-height: 40px;
  opacity: 0.75;
}
.er__room-tab--active {
  background: var(--accent, #c97c5d);
  color: var(--text-on-accent, #fff7eb);
  opacity: 1;
}
.er__room-tab:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 1px;
}

.er__overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 14, 8, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  z-index: 50;
  overflow-y: auto;
}
.er__overlay-inner {
  position: relative;
  width: 100%;
  max-width: 600px;
}
.er__overlay-close {
  position: absolute;
  top: -14px;
  right: -6px;
  z-index: 1;
  font-family: inherit;
  font-size: 12px;
  width: 36px;
  height: 36px;
  border: 2px solid var(--border-strong, #6b5b4a);
  background: var(--surface, #fff7eb);
  cursor: pointer;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.35);
}
</style>
