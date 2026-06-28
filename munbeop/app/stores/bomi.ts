/**
 * useBomiStore — Pinia setup store for Bomi's pose state machine.
 *
 * Two pose layers:
 *   - explicitPose: set by react() / think() / sleep(). Auto-clears
 *     after the pose's autoReturnMs (if defined).
 *   - activePose:    the resolved pose used by the UI. Equals
 *     explicitPose when set, OR derives from the inactivity timeline.
 *
 * Activity tracking:
 *   - lastActivityAt is a Date.now() timestamp updated on every
 *     activity event (mousemove/keydown/etc) and on every explicit
 *     pose change.
 *   - A 250 ms tick watcher checks (now - lastActivityAt) and
 *     transitions activePose through the timeline thresholds.
 */

import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { POSES, INACTIVITY_THRESHOLDS, type Pose } from '~/lib/bomi/poses'

export const useBomiStore = defineStore('bomi', () => {
  const explicitPose = ref<Pose | null>(null)
  const lastActivityAt = ref<number>(Date.now())
  const nowTick = ref<number>(Date.now())

  // Auto-return timer handle so successive react() calls cancel the
  // previous pending return.
  let autoReturnTimer: ReturnType<typeof setTimeout> | null = null

  /** The pose the UI should display. Explicit pose wins; otherwise
   * the inactivity timeline drives the choice. */
  const activePose = computed<Pose>(() => {
    if (explicitPose.value) return explicitPose.value
    const idleMs = nowTick.value - lastActivityAt.value
    if (idleMs >= INACTIVITY_THRESHOLDS.sleepMs) return 'sleep'
    if (idleMs >= INACTIVITY_THRESHOLDS.playHatMs) return 'play-hat'
    return 'idle'
  })

  /** Mark the user as active — clears any inactivity-derived pose. */
  function resetActivity() {
    lastActivityAt.value = Date.now()
  }

  /** Set an explicit pose. Auto-clears after autoReturnMs if defined. */
  function react(pose: Pose) {
    if (autoReturnTimer) {
      clearTimeout(autoReturnTimer)
      autoReturnTimer = null
    }
    explicitPose.value = pose
    resetActivity()

    const ms = POSES[pose].autoReturnMs
    if (ms !== undefined) {
      autoReturnTimer = setTimeout(() => {
        explicitPose.value = null
        autoReturnTimer = null
      }, ms)
    }
  }

  /** Set explicit pose to 'thinking' and hold (no auto-return). */
  function think() {
    if (autoReturnTimer) {
      clearTimeout(autoReturnTimer)
      autoReturnTimer = null
    }
    explicitPose.value = 'thinking'
    resetActivity()
  }

  /** Force sleep pose (e.g. empty-state surface). Holds until cleared. */
  function sleep() {
    if (autoReturnTimer) {
      clearTimeout(autoReturnTimer)
      autoReturnTimer = null
    }
    explicitPose.value = 'sleep'
  }

  /** Clear any explicit pose; revert to inactivity timeline. */
  function clearExplicit() {
    if (autoReturnTimer) {
      clearTimeout(autoReturnTimer)
      autoReturnTimer = null
    }
    explicitPose.value = null
    resetActivity()
  }

  // Tick the clock every 250 ms so activePose can recompute.
  // Only runs in the browser (SPA mode).
  let tickHandle: ReturnType<typeof setInterval> | null = null
  if (typeof window !== 'undefined') {
    tickHandle = setInterval(() => {
      nowTick.value = Date.now()
    }, 250)
  }

  onUnmounted(() => {
    if (tickHandle) {
      clearInterval(tickHandle)
      tickHandle = null
    }
    if (autoReturnTimer) {
      clearTimeout(autoReturnTimer)
      autoReturnTimer = null
    }
  })

  return {
    activePose,
    explicitPose,
    lastActivityAt,
    react,
    think,
    sleep,
    clearExplicit,
    resetActivity,
  }
})
