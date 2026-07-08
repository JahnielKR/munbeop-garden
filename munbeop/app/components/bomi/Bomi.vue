<script setup lang="ts">
/**
 * Bomi — composition root with motion-v wiring.
 *
 * Reads the pose prop, resolves to a POSES entry, provides per-group
 * animate+transition tuples to children via `provide`. Sub-components
 * inject what they need.
 *
 * The #bee root group itself animates the body-level translation and
 * rotation (idle float, happy jump, cheer wobble).
 */

import { computed, provide } from 'vue'
import { motion } from 'motion-v'
import BomiAbdomen from './BomiAbdomen.vue'
import BomiBody from './BomiBody.vue'
import BomiWings from './BomiWings.vue'
import BomiHat from './BomiHat.vue'
import BomiAntennae from './BomiAntennae.vue'
import BomiEyes from './BomiEyes.vue'
import { POSES, staticPoseGroup, type Pose, type PoseGroupAnimation } from '~/lib/bomi/poses'
import { useReducedMotion } from '~/composables/useReducedMotion'

interface Props {
  pose?: Pose
  scale?: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  pose: 'idle' as Pose,
  scale: 3,
  label: '봄이 (Bomi) mascot',
})

const renderSize = computed(() => 32 * props.scale)

const currentPose = computed(() => POSES[props.pose])
const idlePose = POSES.idle

// Per-group resolution: pose's group def OR idle's group def.
// This way 'play-hat' (which only specifies hat + eyes) still gets
// idle bee-float and idle wing-flap, per spec §3.10.
function resolveGroup(group: 'bee' | 'wings' | 'eyes' | 'hat'): PoseGroupAnimation | undefined {
  return currentPose.value[group] ?? idlePose[group]
}

// motion-v drives WAAPI/JS animations that the app's CSS reduced-motion rules
// can't touch, so honor the preference here: collapse each animated property's
// keyframes to its resting value (last frame) and drop the looping transition,
// leaving Bomi as a static pose for users who asked for reduced motion.
const reduced = useReducedMotion()
function anim(group: 'bee' | 'wings' | 'eyes' | 'hat'): PoseGroupAnimation | undefined {
  const g = resolveGroup(group)
  return reduced.value ? staticPoseGroup(g) : g
}

const beeAnim = computed(() => anim('bee'))
const wingsAnim = computed(() => anim('wings'))
const eyesAnim = computed(() => anim('eyes'))
const hatAnim = computed(() => anim('hat'))

// Children inject these refs so they can self-wire their motion.g.
provide('bomi:wingsAnim', wingsAnim)
provide('bomi:eyesAnim', eyesAnim)
provide('bomi:hatAnim', hatAnim)
</script>

<template>
  <svg
    :width="renderSize"
    :height="renderSize"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    :aria-label="label"
    role="img"
    class="bomi"
  >
    <motion.g
      id="bee"
      :animate="beeAnim?.animate"
      :transition="beeAnim?.transition"
    >
      <!--
        Render order (later siblings paint on top):
        abdomen -> body -> wings -> eyes -> hat -> antennae

        Eyes paint BEFORE hat in DOM so the hat-brim can cover them
        during extreme play-hat rotation (Task 4 / spec §3.10 +
        §3.12 parenthetical — "hat falls over her eyes" beat).

        The spec's §3.12 first sentence listed eyes last, but that
        contradicts the §3.12 parenthetical and the play-hat intent;
        the parenthetical wins.
      -->
      <BomiAbdomen />
      <BomiBody />
      <BomiWings />
      <BomiEyes />
      <BomiHat />
      <BomiAntennae />

      <!--
        Sleep "Z" overlay (spec §3.9). Conditionally rendered only
        when pose === 'sleep'. Floats up + fades, loops every 2s.
        Painted last so it appears on top of antennae/hat.
        Position anchor: x=22 (right of head center col 16, near
        right antenna), starting y=14 (near hat brim), animating
        translateY=-10 (10 sprite-units upward = above the viewbox
        top edge, fades out before clipping).
      -->
      <motion.text
        v-if="pose === 'sleep'"
        x="22"
        y="14"
        font-size="5"
        font-family="'Press Start 2P', monospace"
        font-weight="bold"
        fill="#1a1f1a"
        shape-rendering="auto"
        :animate="reduced ? { y: 4, opacity: 0 } : { y: [14, 4], opacity: [0, 1, 0] }"
        :transition="reduced ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'easeOut' }"
        aria-hidden="true"
      >Z</motion.text>
    </motion.g>
  </svg>
</template>

<style scoped>
.bomi {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  /* Bomi is decorative (role=img + aria-label). Three layers of defense
   * against unwanted selection / interaction behavior:
   *   1. pointer-events:none -- the strongest: clicks pass through, so
   *      no individual sub-group (wings, hat, etc.) can be tap-selected
   *      on mobile, no focus rings on inner motion.g elements.
   *   2. user-select:none + -webkit-user-drag:none -- belt-and-suspenders
   *      for text selection on the sleep-Z + drag-select on desktop.
   *   3. -webkit-tap-highlight-color:transparent -- suppresses the iOS
   *      Safari "blue flash" on tap.
   * cursor:default keeps the mouse pointer normal instead of I-beam
   * over the Z text.
   *
   * If a future iteration needs Bomi to be clickable (petting,
   * /mascota detail link), flip pointer-events back to auto on the
   * specific wrapper that should receive clicks. */
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  -webkit-tap-highlight-color: transparent;
  cursor: default;
}
.bomi :deep(g),
.bomi :deep(svg g),
.bomi :deep(text) {
  transform-box: view-box;
}
</style>
