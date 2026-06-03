<script setup lang="ts">
/**
 * Bomi — composition root.
 *
 * Wraps the 32x32 SVG, composes the 6 sub-groups in the canonical
 * render order, and exposes `pose` + `scale` props.
 *
 * Render order (DOM top-to-bottom = paints first-to-last, later
 * siblings paint ON TOP):
 *   #abdomen → #body → #wings → #hat → #antennae → #eyes
 *
 * Eyes are BELOW the hat in the DOM order so during extreme
 * play-hat rotation the brim can cover them (per spec §3.12).
 *
 * In Task 2 the `pose` prop is accepted but not yet consumed
 * (sprite is static). Task 4 wires motion-v based on this prop.
 */

import BomiAbdomen from './BomiAbdomen.vue'
import BomiBody from './BomiBody.vue'
import BomiWings from './BomiWings.vue'
import BomiHat from './BomiHat.vue'
import BomiAntennae from './BomiAntennae.vue'
import BomiEyes from './BomiEyes.vue'

interface Props {
  /** Animation pose. Default 'idle'. Used by Task 4 onward. */
  pose?: string
  /** Integer scale multiplier. Sprite is 32x32 at scale=1. */
  scale?: number
  /** Optional aria label; defaults to '봄이 (Bomi) mascot'. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  pose: 'idle',
  scale: 3,
  label: '봄이 (Bomi) mascot',
})

const renderSize = computed(() => 32 * props.scale)
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
    <g id="bee">
      <BomiAbdomen />
      <BomiBody />
      <BomiWings />
      <BomiHat />
      <BomiAntennae />
      <BomiEyes />
    </g>
  </svg>
</template>

<style scoped>
.bomi {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  /* Preserve transforms when scaling — important for Task 4 motion */
}
.bomi :deep(g) {
  transform-box: view-box;
}
</style>
