<script setup lang="ts">
// Day scene: Mondstadt-inspired meadow with a bobbing dodo sprite.
// Pure visual layer — no props, no state.
//
// v6: the background is static (no horizontal scroll). Instead the
// whole .day container sways with a 1.5° skewX + 1% scaleY breeze
// every 6s, anchored at bottom center so the silhouette mimics
// foliage in the wind. The dodo's own bob composes on top of the
// container sway, so it both rocks and rides the breeze.
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
  animation: vientoSuave 6s ease-in-out infinite;
  transform-origin: bottom center;
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
@keyframes vientoSuave {
  0%, 100% { transform: skewX(0deg) scaleY(1); }
  50%      { transform: skewX(1.5deg) scaleY(0.99); }
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
  .day { animation: none; }
  .day__dodo { animation: none; }
}
</style>
