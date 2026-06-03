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
import { POSES, type Pose, type PoseGroupAnimation } from './poses'

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

const beeAnim = computed(() => resolveGroup('bee'))
const wingsAnim = computed(() => resolveGroup('wings'))
const eyesAnim = computed(() => resolveGroup('eyes'))
const hatAnim = computed(() => resolveGroup('hat'))

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
        :animate="{ y: [14, 4], opacity: [0, 1, 0] }"
        :transition="{ duration: 2, repeat: Infinity, ease: 'easeOut' }"
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
  /* Bomi is decorative (role=img + aria-label). Prevent text selection
   * on the sleep-Z and on click-drag over any sprite layer; also keep
   * the cursor as default so users don't get an I-beam over the Z. */
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  cursor: default;
}
.bomi :deep(g),
.bomi :deep(svg g),
.bomi :deep(text) {
  transform-box: view-box;
}
.bomi :deep(text) {
  /* Belt-and-suspenders: also block selection on the text element
   * itself in case a browser ignores the parent user-select. */
  user-select: none;
  -webkit-user-select: none;
}
</style>
