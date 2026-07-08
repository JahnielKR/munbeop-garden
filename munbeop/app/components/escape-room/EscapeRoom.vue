<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Level, RewardTier, ScriptedBeat, SelectionCandidate, CompletionCandidate, CreationCandidate } from '~/lib/domain'
import { useEscapeRoomStore } from '~/stores/escape-room'
import { useEscapeRoomProgress } from '~/composables/useEscapeRoomProgress'
import { useLocalized } from '~/composables/useLocalized'
import { useEscapeRoomAudio } from '~/composables/useEscapeRoomAudio'
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
// Persistence half of the store (it stays a pure state machine): write the
// run's outcome — unlocked cosmetic + racha — back to the account on run end.
const { persist } = useEscapeRoomProgress()
const { tl } = useLocalized()
const { t } = useI18n()
const audio = useEscapeRoomAudio()

/**
 * Generic UI feedback SFX (synthesized into every level's audio dir). Resolved
 * against `imageBase` at call time so the path follows the active level.
 */
const UI_SFX = {
  correct: 'audio/sfx-correct.ogg',
  wrong: 'audio/sfx-wrong.ogg',
  select: 'audio/sfx-select.ogg',
  door: 'audio/sfx-door-wood.ogg',
} as const

/** Join the level's asset base with a seed-relative path ('audio/...'). */
function url(path: string): string {
  return `${imageBase.value}${path}`
}

/** Visual phase. Store keeps run state; this drives which screen is up. */
const phase = ref<'intro' | 'playing'>('intro')
const activeSlotId = ref<string | null>(null)
const earnedTier = ref<RewardTier | null>(null)
const retryCount = ref(0)
/** Scripted beat currently playing (between-slot narrative); null = none. */
const activeBeat = ref<ScriptedBeat | null>(null)
/** NPC nudge shown inside the creation overlay after a soft-reject. */
const softMessage = ref<string | null>(null)
/** Visible + announced feedback for a non-fatal WRONG answer. The feedback used
 *  to be audio-only, so a muted or deaf player got nothing (and re-tapped,
 *  burning hearts). Cleared on the next answer / close. */
const wrongNudge = ref<string | null>(null)
/** The puzzle overlay element — focused on open and used to trap Tab (it is a
 *  modal but had no dialog semantics). */
const overlayEl = ref<HTMLElement | null>(null)
/** The element (a hotspot button) that opened the overlay, so focus can be
 *  restored to it on close instead of dropping to <body>. */
const overlayTrigger = ref<HTMLElement | null>(null)

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

/**
 * The player's built farewell for the final creation slot, fed to the outro's
 * `{farewell}` token so the closing cinematic quotes what they actually said.
 * Empty only when the last slot isn't a creation slot. For levels whose outro
 * has no `{farewell}` token (e.g. level 1) the value is simply ignored —
 * VictoryScreen's replaceAll is then a no-op.
 */
const farewell = computed(() => {
  const slots = props.level.slots
  const lastIdx = slots.length - 1
  const last = slots[lastIdx]
  if (!last || last.type !== 'creation' || !store.currentRun) return ''
  const drawn = store.currentRun.slots[lastIdx]
  if (!drawn) return ''
  const cand = last.candidates[drawn.candidateIndex]
  if (!cand) return ''
  return cand.correctOrder.map((i) => cand.tiles[i]).join(' ')
})

onMounted(() => {
  audio.hydrate()
  store.startRun(props.level, baseSeed.value)
  phase.value = 'intro'
})

// The ambient bed is a looping module-singleton <audio> that outlives this
// component. retry()/exitToBook() stop it, but navigating away via the app nav
// or browser back — including from the victory/game-over screens, where the
// leave guard is disarmed — used to leave it looping app-wide until a full
// reload. stopAll() is idempotent, so double-stopping via exitToBook is fine.
onBeforeUnmount(() => audio.stopAll())

watch(
  () => store.status,
  (s) => {
    if (s === 'completed' && earnedTier.value === null) {
      activeSlotId.value = null
      earnedTier.value = store.complete()
      // complete() just unlocked the tier's cosmetic and bumped the racha —
      // persist so it survives a reload and shows in the sidebar/trophies.
      void persist()
    }
    if (s === 'gameover') {
      activeSlotId.value = null
      // game-over reset consecutiveCleanRuns to 0 — persist the reset too.
      void persist()
    }
  },
)

/**
 * Drive the ambient bed off the active room (once we're in the playing phase).
 * The composable keeps ONE looping ambient and ignores a same-src re-call, so
 * re-entering the same room never restarts it. On an actual room CHANGE (not
 * the first entry of the run) a wooden-door one-shot punctuates the move.
 */
watch(
  [() => store.currentRoomId, phase],
  ([roomId], [prevRoomId, prevPhase]) => {
    if (phase.value !== 'playing' || !activeRoom.value) return
    const isRealRoomChange =
      prevPhase === 'playing' && prevRoomId != null && prevRoomId !== roomId
    if (isRealRoomChange) audio.playSfx(url(UI_SFX.door))
    audio.playAmbient(url(activeRoom.value.ambientAudio))
  },
)

type AnswerOutcome = 'correct' | 'wrong' | 'game-over' | 'level-complete' | 'soft-reject'

function onHotspot(hotspotId: string) {
  const h = activeRoom.value?.hotspots.find((x) => x.id === hotspotId)
  if (!h) return
  // Cosmetic click sound for any hotspot that declares one (tea pour, purr, …).
  if (h.sfx) audio.playSfx(url(h.sfx))
  if (h.triggersSlot && !store.resolvedSlots.includes(h.triggersSlot)) {
    softMessage.value = null
    audio.playSfx(url(UI_SFX.select))
    activeSlotId.value = h.triggersSlot
    // Slot 1 (the memory): the monk recalls the drawn line as the overlay opens.
    // Slots 5/6 instead speak their line on SUCCESS (handled in handleResult).
    if (h.triggersSlot === 'slot-1') {
      const voice = candidateVoiceAudio(h.triggersSlot)
      if (voice) audio.playVoice(url(voice))
    }
  }
}

/** Resolved candidate's spoken-line path for a slot, or null. */
function candidateVoiceAudio(slotId: string): string | null {
  const slot = props.level.slots.find((s) => s.id === slotId)
  if (!slot || !store.currentRun) return null
  const idx = props.level.slots.findIndex((s) => s.id === slotId)
  const drawn = store.currentRun.slots[idx]
  if (!drawn) return null
  return slot.candidates[drawn.candidateIndex]?.voiceAudio ?? null
}

/** Resolved candidate's soft-reject voice path for a slot, or null. */
function candidateSoftRejectVoiceAudio(slotId: string): string | null {
  const slot = props.level.slots.find((s) => s.id === slotId)
  if (!slot || slot.type !== 'creation' || !store.currentRun) return null
  const idx = props.level.slots.findIndex((s) => s.id === slotId)
  const drawn = store.currentRun.slots[idx]
  if (!drawn) return null
  return slot.candidates[drawn.candidateIndex]?.softRejectVoiceAudio ?? null
}

/**
 * Resolve the overlay after an answer + play its feedback audio.
 *
 * Keep the overlay open on a wrong or soft-reject answer (the player retries in
 * place); on a correct/complete answer, close it and play the slot's scripted
 * beat (if any) before the next screen.
 *
 * Audio:
 *   - 'wrong'        → the soft wrong thunk.
 *   - 'soft-reject'  → the monk's soft-reject voice (NO wrong sfx).
 *   - correct/done   → the correct chime, then ONE spoken line. For slot-5/
 *                      slot-6 the drawn candidate's line (the per-run confession
 *                      / farewell the monk repeats) IS the payload, so it wins;
 *                      the slot's reactionVoiceAudio is only the fallback when
 *                      that candidate has no spoken line. Other slots just play
 *                      their reaction voice. Only one playVoice fires, because
 *                      the voice channel is single-instance — a second call
 *                      would instantly cancel the first.
 */
function handleResult(slotId: string, result: AnswerOutcome) {
  // 'game-over' is the run-ending mistake: it must play the WRONG feedback and
  // return, exactly like a non-fatal 'wrong'. Falling through to the correct/
  // level-complete branch would play the success chime + reaction voice and fire
  // the next scripted narrative beat on top of the game-over screen. The store's
  // 'gameover' status watcher clears activeSlotId; nothing else is needed here.
  if (result === 'wrong' || result === 'game-over') {
    audio.playSfx(url(UI_SFX.wrong))
    // A non-fatal wrong answer keeps the overlay open, so give a VISIBLE +
    // announced nudge (audio alone is invisible to a muted/deaf player). On
    // 'game-over' the overlay is torn down for GameOverScreen, so skip it there.
    if (result === 'wrong') {
      wrongNudge.value = t('escape.wrong_nudge', { left: heartsLeft.value })
    }
    return
  }
  if (result === 'soft-reject') {
    const v = candidateSoftRejectVoiceAudio(slotId)
    if (v) audio.playVoice(url(v))
    return
  }
  // correct or level-complete
  audio.playSfx(url(UI_SFX.correct))
  const slot = props.level.slots.find((s) => s.id === slotId)
  // The drawn candidate line (slot-5 confession / slot-6 farewell) is the
  // emotional payload and takes precedence; otherwise fall back to the slot's
  // reaction line. Exactly one line plays so neither stomps the other.
  const candidateVoice =
    slotId === 'slot-5' || slotId === 'slot-6' ? candidateVoiceAudio(slotId) : null
  const lineToPlay = candidateVoice ?? slot?.reactionVoiceAudio ?? null
  if (lineToPlay) audio.playVoice(url(lineToPlay))

  activeSlotId.value = null
  const beat = store.scriptedBeatAfter(slotId)
  if (beat) activeBeat.value = beat
}

function onSelectionAnswer(idx: number) {
  if (!activeSlotId.value) return
  wrongNudge.value = null
  handleResult(activeSlotId.value, store.answerSelection(activeSlotId.value, idx))
}
function onCompletionAnswer(text: string) {
  if (!activeSlotId.value) return
  wrongNudge.value = null
  handleResult(activeSlotId.value, store.answerCompletion(activeSlotId.value, text))
}
function onCreationAnswer(order: number[]) {
  const slotId = activeSlotId.value
  if (!slotId) return
  softMessage.value = null
  wrongNudge.value = null
  const result = store.answerCreation(slotId, order)
  if (result === 'soft-reject') {
    const cand = activeCandidate.value as CreationCandidate | null
    softMessage.value = cand?.softRejectMessage ? tl(cand.softRejectMessage) : null
  }
  handleResult(slotId, result)
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
  activeBeat.value = null
  softMessage.value = null
  audio.stopAll()
  store.reset()
  store.startRun(props.level, `${baseSeed.value}#r${retryCount.value}`)
  // Roguelike loop stays fast: no cinematic on retry.
  phase.value = 'playing'
  // Kick the ambient for the first room (the watcher fires on real CHANGES only).
  if (activeRoom.value) audio.playAmbient(url(activeRoom.value.ambientAudio))
}

/** Toggle audio on/off from the HUD; persists the preference. */
function toggleAudio() {
  audio.setEnabled(!audio.enabled.value)
  // Re-arming: bring the ambient back for the current room when turning on.
  if (audio.enabled.value && phase.value === 'playing' && activeRoom.value) {
    audio.playAmbient(url(activeRoom.value.ambientAudio))
  }
}

/** Close the puzzle overlay and clear any lingering nudges. */
function closeOverlay() {
  activeSlotId.value = null
  softMessage.value = null
  wrongNudge.value = null
}

// The puzzle overlay is a modal: focus it on open so keyboard/SR users land
// inside (not on <body>), and trap Tab so focus can't walk into the occluded
// scene/HUD behind it. Esc closes it (wired in the template). On close, restore
// focus to the hotspot that opened it (any close path — Esc, ✕, correct answer)
// so focus never drops to <body>. When a new screen takes over (victory /
// game-over / scripted beat), that screen's own onMounted focus wins the race.
watch(
  () => !!activeSlot.value && !!activeCandidate.value,
  (open, wasOpen) => {
    if (open) {
      overlayTrigger.value = (document.activeElement as HTMLElement | null) ?? null
      void nextTick(() => overlayEl.value?.focus())
    } else if (wasOpen) {
      const trigger = overlayTrigger.value
      overlayTrigger.value = null
      void nextTick(() => trigger?.focus())
    }
  },
)
function trapTab(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !overlayEl.value) return
  const focusables = Array.from(
    overlayEl.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
  if (focusables.length === 0) return
  const first = focusables[0]!
  const last = focusables[focusables.length - 1]!
  const active = document.activeElement
  if (e.shiftKey && (active === first || active === overlayEl.value)) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}

function exitToBook() {
  audio.stopAll()
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
      :voice-audio="level.voiceIntroAudio ? url(level.voiceIntroAudio) : undefined"
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
      <span
        class="er__hearts"
        data-testid="er-hearts"
        role="img"
        :aria-label="t('escape.hearts_status', { left: heartsLeft, total: heartsTotal })"
        :title="t('escape.attempts')"
      >
        <span v-for="i in heartsTotal" :key="i" class="er__heart" aria-hidden="true">
          {{ i <= heartsLeft ? '♥' : '♡' }}
        </span>
      </span>
      <span class="er__solved">
        {{ t('escape.solved') }} {{ store.resolvedSlots.length }} / {{ level.slots.length }}
      </span>
      <button
        type="button"
        class="er__mute"
        data-testid="er-mute"
        :aria-label="audio.enabled.value ? t('escape.audio_off') : t('escape.audio_on')"
        :aria-pressed="!audio.enabled.value"
        @click="toggleAudio"
      >
        {{ audio.enabled.value ? '♪' : '🔇' }}
      </button>
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
    <Scene v-if="activeRoom" :room="activeRoom" :image-base="imageBase" :resolved-slots="store.resolvedSlots" @hotspot="onHotspot" />

    <!-- Puzzle overlay (a modal: dialog role, Tab trap, Esc, focus-on-open) -->
    <div
      v-if="activeSlot && activeCandidate"
      ref="overlayEl"
      class="er__overlay"
      data-testid="puzzle-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="tl(activeRoom?.title ?? level.title)"
      tabindex="-1"
      @keydown.esc="closeOverlay"
      @keydown="trapTab"
    >
      <div class="er__overlay-inner">
        <button
          type="button"
          class="er__overlay-close"
          data-testid="puzzle-close"
          :aria-label="t('escape.close')"
          @click="closeOverlay"
        >
          <span aria-hidden="true">✕</span>
        </button>
        <p
          v-if="wrongNudge"
          class="er__overlay-nudge"
          role="status"
          data-testid="puzzle-wrong"
        >
          {{ wrongNudge }}
        </p>
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
          :soft-message="softMessage"
          @answer="onCreationAnswer"
          @use-free-hint="onUseFreeHint"
          @use-premium-hint="onUsePremiumHint"
        />
      </div>
    </div>

    <!-- Scripted beat (between-slot narrative): diary's last entry, second cup… -->
    <IntroCinematic
      v-if="activeBeat"
      :key="activeBeat.afterSlotId"
      :narrative="activeBeat.narrative"
      :voice-line="activeBeat.voiceLine"
      :voice-audio="activeBeat.voiceAudio ? url(activeBeat.voiceAudio) : undefined"
      @done="activeBeat = null"
    />

    <!-- End screens -->
    <GameOverScreen v-if="store.status === 'gameover'" @retry="retry" @exit="exitToBook" />
    <VictoryScreen
      v-if="store.status === 'completed' && earnedTier && !activeBeat"
      :level="level"
      :tier="earnedTier"
      :farewell="farewell"
      :bell-toll-audio="level.bellTollAudio ? url(level.bellTollAudio) : undefined"
      :rain-stop-audio="level.rainStopAudio ? url(level.rainStopAudio) : undefined"
      :voice-outro-audio="level.voiceOutroAudio ? url(level.voiceOutroAudio) : undefined"
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
.er__mute {
  font: inherit;
  font-size: 12px;
  border: 2px solid var(--border-strong, #6b5b4a);
  background: transparent;
  padding: 6px 8px;
  cursor: pointer;
  min-width: 36px;
  line-height: 1;
}
.er__mute:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 1px;
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
  outline: none; /* focused on open for the modal trap; no ring on the backdrop */
}
.er__overlay-inner {
  position: relative;
  width: 100%;
  max-width: 600px;
}
.er__overlay-nudge {
  margin: 0 0 12px;
  padding: 8px 12px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: var(--red, #c0392b);
  border-radius: 6px;
  text-align: center;
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
