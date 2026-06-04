<script setup lang="ts">
// Day scene: Mondstadt-inspired meadow with a bobbing dodo sprite.
// Pure visual layer — no props, no state.
//
// v6.1: the .day container is fully static (the v6 vientoSuave skew
// felt off per user feedback, "tampoco se ve bien"). Only the dodo
// sprite keeps its character bob — that's a sprite animation, not a
// scene-level effect.
</script>

<template>
  <div class="day" aria-hidden="true">
    <div class="day__bg pixel" />
    <img class="day__dodo pixel-sprite" src="/welcome/day/dodo.png" alt="" >
  </div>
</template>

<style scoped>
.day {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.day__bg {
  position: absolute;
  inset: 0;
  background-image: url('/welcome/day/garden-day.png');
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: cover;
  image-rendering: pixelated;
}
.day__dodo {
  position: absolute;
  bottom: 28%;
  left: 18%;
  width: 48px;
  height: auto;
  image-rendering: pixelated;
  animation: dodo-bob 12s ease-in-out infinite;
  transform-origin: bottom center;
}
@keyframes dodo-bob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50%      { transform: translateY(-6px) rotate(1deg); }
}
@media (prefers-reduced-motion: reduce) {
  .day__dodo { animation: none; }
}
</style>
