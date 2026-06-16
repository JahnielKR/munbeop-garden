import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  RewardTier,
  ScriptedBeat,
  SelectionCandidate,
} from '~/lib/domain'
import { drawRun, type DrawnRun } from '~/lib/escape-room/shuffle'
import { scoreRun, type RunOutcome } from '~/lib/escape-room/scoring'

/**
 * Escape Room — Pinia store driving a single run.
 *
 * Pure state machine: no Date.now() or storage I/O inside. Time-sensitive
 * actions accept `now` as a parameter so tests stay deterministic. The
 * persistence layer (consecutive clean runs, unlocked cosmetics) is wired
 * separately by a composable that hydrates on mount and writes on mutations.
 *
 * Lifecycle:
 *   idle → startRun() → playing → (answer*) → completed → complete() → idle
 *                                          ↘  gameover  → reset() → idle
 */

type Status = 'idle' | 'playing' | 'gameover' | 'completed'

/**
 * Result of an answer*() action. The UI uses this to drive feedback animations.
 * `'soft-reject'` is the level-2 Slot-6 soft refusal: the answer used a
 * present-tense (soft-reject) tile for the first time — no error charged, the
 * overlay stays open, and the NPC nudges the player with `softRejectMessage`.
 */
type AnswerResult = 'correct' | 'wrong' | 'game-over' | 'level-complete' | 'soft-reject'

interface HintFlags {
  free: boolean
  premium: boolean
}

export const useEscapeRoomStore = defineStore('escape-room', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const currentLevel = ref<Level | null>(null)
  const currentRun = ref<DrawnRun | null>(null)
  const currentRoomId = ref<string | null>(null)
  const status = ref<Status>('idle')
  const errorsMade = ref(0)
  const resolvedSlots = ref<string[]>([])
  const hintsUsed = ref<Record<string, HintFlags>>({})
  /** Per-slot flag: the one free soft-reject (present-tense tile) already spent this run. */
  const softRejectConsumed = ref<Record<string, boolean>>({})
  const startedAt = ref<number | null>(null)
  /** Persisted across runs (hydrated by composable). */
  const consecutiveCleanRuns = ref(0)
  /** Persisted across runs (hydrated by composable). */
  const unlockedCosmetics = ref<string[]>([])
  /**
   * The cosmetic the player has CHOSEN to show, keyed by type
   * ('avatar' | 'frame' | 'bg' | 'set') → reward id. An equipped 'set' takes
   * precedence over the individual layers in the portrait. Persisted across
   * runs (hydrated by composable). Empty = framed initials.
   */
  const equipped = ref<Record<string, string>>({})

  // ─── Computed ─────────────────────────────────────────────────────────────
  const usedPremiumHint = computed(() =>
    Object.values(hintsUsed.value).some((h) => h.premium),
  )

  const allSlotsResolved = computed(() => {
    if (!currentLevel.value) return false
    return resolvedSlots.value.length === currentLevel.value.slots.length
  })

  // ─── Internal helpers ─────────────────────────────────────────────────────
  function ensureHintFlags(slotId: string): HintFlags {
    if (!hintsUsed.value[slotId]) hintsUsed.value[slotId] = { free: false, premium: false }
    return hintsUsed.value[slotId]!
  }

  function drawnCandidate<T>(slotId: string): T | null {
    if (!currentLevel.value || !currentRun.value) return null
    const slotIndex = currentLevel.value.slots.findIndex((s) => s.id === slotId)
    if (slotIndex < 0) return null
    const slot = currentLevel.value.slots[slotIndex]!
    const drawn = currentRun.value.slots[slotIndex]!
    return slot.candidates[drawn.candidateIndex] as T
  }

  function recordError(): AnswerResult {
    if (!currentLevel.value) return 'wrong'
    errorsMade.value++
    if (errorsMade.value > currentLevel.value.rules.maxErrors) {
      status.value = 'gameover'
      consecutiveCleanRuns.value = 0
      return 'game-over'
    }
    return 'wrong'
  }

  function resolveSlot(slotId: string): AnswerResult {
    if (!resolvedSlots.value.includes(slotId)) resolvedSlots.value.push(slotId)
    if (allSlotsResolved.value) {
      status.value = 'completed'
      return 'level-complete'
    }
    return 'correct'
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  function startRun(level: Level, seed: string, now: number = Date.now()) {
    currentLevel.value = level
    currentRun.value = drawRun(level, seed)
    currentRoomId.value = level.rooms[0]?.id ?? null
    status.value = 'playing'
    errorsMade.value = 0
    resolvedSlots.value = []
    hintsUsed.value = {}
    softRejectConsumed.value = {}
    startedAt.value = now
  }

  function enterRoom(roomId: string) {
    if (!currentLevel.value) return
    const exists = currentLevel.value.rooms.some((r) => r.id === roomId)
    if (exists) currentRoomId.value = roomId
  }

  function answerSelection(slotId: string, optionIndex: number): AnswerResult {
    if (status.value !== 'playing') return 'wrong'
    const cand = drawnCandidate<SelectionCandidate>(slotId)
    if (!cand) return recordError()
    return optionIndex === cand.correctIndex ? resolveSlot(slotId) : recordError()
  }

  function answerCompletion(slotId: string, text: string): AnswerResult {
    if (status.value !== 'playing') return 'wrong'
    const cand = drawnCandidate<CompletionCandidate>(slotId)
    if (!cand) return recordError()
    return text.trim() === cand.answer.trim() ? resolveSlot(slotId) : recordError()
  }

  function answerCreation(slotId: string, order: number[]): AnswerResult {
    if (status.value !== 'playing') return 'wrong'
    const cand = drawnCandidate<CreationCandidate>(slotId)
    if (!cand) return recordError()
    // Soft-reject (present-tense tile, first time only): nudge, no error charged.
    // Evaluated before the order check so the thematic refusal is never an error.
    const soft = cand.softRejectTiles
    if (soft && soft.length > 0 && order.some((i) => soft.includes(i))) {
      if (!softRejectConsumed.value[slotId]) {
        softRejectConsumed.value[slotId] = true
        return 'soft-reject'
      }
      // Already spent the free pass → falls through to a normal error.
    }
    const correct = cand.correctOrder
    if (order.length !== correct.length) return recordError()
    for (let i = 0; i < order.length; i++) {
      if (order[i] !== correct[i]) return recordError()
    }
    return resolveSlot(slotId)
  }

  /** The scripted beat (if any) that should play right after `slotId` resolves. */
  function scriptedBeatAfter(slotId: string): ScriptedBeat | null {
    return currentLevel.value?.scriptedBeats?.find((b) => b.afterSlotId === slotId) ?? null
  }

  function useFreeHint(slotId: string) {
    ensureHintFlags(slotId).free = true
  }

  function usePremiumHint(slotId: string) {
    ensureHintFlags(slotId).premium = true
  }

  /**
   * Finalize a completed run: score it, update racha, unlock the matching cosmetic.
   * No-op if the run isn't in 'completed' state. Returns the tier earned, or null.
   */
  function complete(now: number = Date.now()): RewardTier | null {
    if (!currentLevel.value || status.value !== 'completed') return null
    if (startedAt.value === null) return null

    const cleanRunsIncludingThis = usedPremiumHint.value ? 0 : consecutiveCleanRuns.value + 1

    const outcome: RunOutcome = {
      usedPremiumHint: usedPremiumHint.value,
      runDurationSeconds: Math.max(0, Math.floor((now - startedAt.value) / 1000)),
      consecutiveCleanRuns: cleanRunsIncludingThis,
    }
    const tier = scoreRun(outcome, currentLevel.value.rules)

    consecutiveCleanRuns.value = usedPremiumHint.value ? 0 : consecutiveCleanRuns.value + 1

    const reward = currentLevel.value.rewards[tier]
    if (!unlockedCosmetics.value.includes(reward.id)) {
      unlockedCosmetics.value.push(reward.id)
    }

    // Light up the profile on the first unlock of a type: auto-equip into an
    // empty slot. A 'set' is left for the player to equip deliberately (it
    // overrides their avatar/frame/bg picks).
    const type = reward.id.split('-')[1]
    if (type && type !== 'set' && !equipped.value[type]) {
      equipped.value[type] = reward.id
    }

    return tier
  }

  /** Choose a cosmetic to display (no-op if it isn't unlocked). */
  function equip(type: string, id: string) {
    if (!unlockedCosmetics.value.includes(id)) return
    equipped.value[type] = id
  }

  /** Clear the chosen cosmetic for a type (back to the default for that slot). */
  function unequip(type: string) {
    equipped.value = Object.fromEntries(
      Object.entries(equipped.value).filter(([t]) => t !== type),
    )
  }

  /** Clear the active run state. Leaves persisted progress (racha, cosmetics) untouched. */
  function reset() {
    currentLevel.value = null
    currentRun.value = null
    currentRoomId.value = null
    status.value = 'idle'
    errorsMade.value = 0
    resolvedSlots.value = []
    hintsUsed.value = {}
    softRejectConsumed.value = {}
    startedAt.value = null
  }

  return {
    // state
    currentLevel,
    currentRun,
    currentRoomId,
    status,
    errorsMade,
    resolvedSlots,
    hintsUsed,
    softRejectConsumed,
    startedAt,
    consecutiveCleanRuns,
    unlockedCosmetics,
    equipped,
    // computed
    usedPremiumHint,
    allSlotsResolved,
    // actions
    startRun,
    enterRoom,
    answerSelection,
    answerCompletion,
    answerCreation,
    scriptedBeatAfter,
    useFreeHint,
    usePremiumHint,
    complete,
    equip,
    unequip,
    reset,
  }
})
