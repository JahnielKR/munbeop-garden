/**
 * Bomi pose registry — Plan 4 spec §3.
 *
 * Each pose is a record keyed by SVG group id (`bee`, `wings`, `eyes`,
 * `hat`). The value is `{ animate, transition }` ready to pass to
 * motion-v's `<motion.g>`.
 *
 * Inactivity thresholds (§3.11) are exported as constants — tweakable
 * for future A/B testing without code edits to the store.
 */

import type { Transition } from 'motion-v'

export type Pose =
  | 'idle'
  | 'happy'
  | 'sad'
  | 'thinking'
  | 'cheer'
  | 'fly-l'
  | 'fly-r'
  | 'sleep'
  | 'play-hat'

export interface PoseGroupAnimation {
  // Each value is whatever motion-v's `:animate` accepts.
  // Arrays become keyframes; scalars become target values.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animate: Record<string, any>
  transition?: Transition
}

export interface PoseDefinition {
  bee?: PoseGroupAnimation
  wings?: PoseGroupAnimation
  eyes?: PoseGroupAnimation
  hat?: PoseGroupAnimation
  /** ms before auto-returning to 'idle'. Undefined = hold until cleared. */
  autoReturnMs?: number
}

/**
 * Reduce a pose group to a static frame for `prefers-reduced-motion`: collapse
 * every keyframe array to its resting value (the last frame) and drop the
 * looping transition. motion-v animates via WAAPI, which CSS reduced-motion
 * rules can't stop, so Bomi applies this itself. Returns undefined passthrough.
 */
export function staticPoseGroup(g: PoseGroupAnimation | undefined): PoseGroupAnimation | undefined {
  if (!g) return g
  const animate: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(g.animate)) {
    animate[k] = Array.isArray(v) ? v[v.length - 1] : v
  }
  return { animate, transition: { duration: 0 } }
}

export const POSES: Record<Pose, PoseDefinition> = {
  idle: {
    // idle is also the "reset all properties to defaults" pose. Every
    // property any other pose can mutate is explicitly set here so
    // motion-v transitions cleanly back when a pose returns/clears.
    // Without this, properties like wings.opacity (sleep), eyes.y
    // (play-hat), hat.y/rotate (play-hat), bee.rotate (thinking/cheer/
    // fly) get stuck at their last value when transitioning to idle.
    bee: {
      animate: { y: [0, -0.5, 0], rotate: 0 },
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    wings: {
      animate: { scaleX: [1, 0.45, 1], opacity: 1 },
      transition: { duration: 0.18, repeat: Infinity, ease: 'easeInOut' },
    },
    eyes: {
      animate: { scaleY: [1, 0.05, 1], y: 0 },
      transition: {
        duration: 0.15,
        repeat: Infinity,
        repeatDelay: 3.3,
        ease: 'easeInOut',
      },
    },
    hat: {
      animate: { y: 0, rotate: 0 },
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  },

  happy: {
    bee: {
      animate: { y: [-0.5, -2, -0.5] },
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    eyes: {
      animate: { scaleY: 0.3 },
      transition: { duration: 0.2 },
    },
    autoReturnMs: 600,
  },

  sad: {
    bee: {
      animate: { y: [-0.5, 1] },
      transition: { duration: 0.3, ease: 'easeIn' },
    },
    eyes: {
      animate: { scaleY: 0.55 },
      transition: { duration: 0.2 },
    },
    wings: {
      animate: { scaleX: [1, 0.7, 1] },
      transition: { duration: 0.4, repeat: 1 },
    },
    autoReturnMs: 500,
  },

  thinking: {
    bee: {
      animate: { rotate: [0, -3, 3, 0] },
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    // Eyes look side-to-side handled visually via sparkle position;
    // motion-v doesn't need to animate the eyes here.
  },

  cheer: {
    bee: {
      animate: { y: [-0.5, -3, -0.5], rotate: [0, 8, -8, 0] },
      transition: { duration: 0.8, ease: 'easeOut' },
    },
    wings: {
      animate: { scaleX: [1, 0.3, 1] },
      transition: { duration: 0.1, repeat: 6 },
    },
    autoReturnMs: 1000,
  },

  'fly-l': {
    bee: {
      // Travels off-screen left; the consumer translates the parent
      // container, not the sprite root. Inside the sprite we just tilt.
      animate: { rotate: [0, 10, 0] },
      transition: { duration: 0.6 },
    },
    wings: {
      animate: { scaleX: [1, 0.3, 1] },
      transition: { duration: 0.1, repeat: Infinity },
    },
    autoReturnMs: 600,
  },

  'fly-r': {
    bee: {
      animate: { rotate: [0, -10, 0] },
      transition: { duration: 0.6 },
    },
    wings: {
      animate: { scaleX: [1, 0.3, 1] },
      transition: { duration: 0.1, repeat: Infinity },
    },
    autoReturnMs: 600,
  },

  sleep: {
    bee: {
      animate: { y: [0, 0.3, 0] },
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
    wings: {
      animate: { opacity: 0, scaleX: 0.6 },
      transition: { duration: 0.5 },
    },
    eyes: {
      animate: { scaleY: 0.05 },
      transition: { duration: 0.5 },
    },
  },

  'play-hat': {
    hat: {
      animate: { y: [0, -0.6, -0.4, -0.6, 0], rotate: [0, -8, 6, -4, 0] },
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    },
    eyes: {
      animate: { y: [-0.2, -0.4, -0.2] },
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    },
    // bee and wings keep idle behavior — handled by the resolver in the
    // store: if a pose doesn't override a group, that group uses idle.
  },
}

/**
 * Inactivity thresholds in milliseconds. Pose transitions per spec §3.11.
 */
export const INACTIVITY_THRESHOLDS = {
  /** Pose 4 (thinking) — only inside practice page when input is focused but empty. */
  thinkingMs: 5_000,
  /** Pose 8 (play-hat) easter egg — any page. */
  playHatMs: 25_000,
  /** Pose 7 (sleep) easter egg — also fires on empty-state. */
  sleepMs: 60_000,
} as const
