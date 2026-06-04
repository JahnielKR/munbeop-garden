<script setup lang="ts">
// Night scene: 8 parallax layers + a falling-star GIF.
// Layer 1 is the closest (fastest), Layer 8 is the deepest (slowest).
// Mouse-X parallax is bound via --mouse-x CSS var set on the root by WelcomeStage.
import { computed } from 'vue'

const LAYERS = [1, 2, 3, 4, 5, 6, 7, 8] as const
// Parallax shift factor per layer, in pixels per unit of (mouse-x - 0.5).
// Layer 1 moves the most; Layer 8 barely moves.
const FACTORS: Record<number, number> = { 1: 40, 2: 32, 3: 24, 4: 18, 5: 12, 6: 8, 7: 4, 8: 2 }

const layers = computed(() => LAYERS.map((n) => ({ n, factor: FACTORS[n] })))
</script>

<template>
  <div class="night" aria-hidden="true">
    <img
      v-for="layer in layers"
      :key="layer.n"
      class="night__layer pixel"
      :src="`/welcome/night/layer-${layer.n}.png`"
      :style="{ '--factor': layer.factor }"
      alt=""
    >
    <img class="night__star pixel-sprite" src="/welcome/night/falling-star.gif" alt="" >
  </div>
</template>

<style scoped>
.night {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #0a0414;
}
.night__layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  image-rendering: pixelated;
  transform: translateX(calc((var(--mouse-x, 0.5) - 0.5) * var(--factor, 0) * 1px));
  transition: transform 200ms ease-out;
}
.night__star {
  position: absolute;
  top: 12%;
  right: 16%;
  width: 320px;
  height: auto;
  opacity: 0.55;
  image-rendering: pixelated;
  pointer-events: none;
  mix-blend-mode: screen;
}
@media (prefers-reduced-motion: reduce) {
  .night__layer { transform: none; transition: none; }
}
</style>
