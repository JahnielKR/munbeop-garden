<script setup lang="ts">
// Day scene: Mondstadt-inspired meadow with a bobbing dodo sprite.
// Pure visual layer — no props, no state.
</script>

<template>
  <div class="day" aria-hidden="true">
    <img class="day__bg pixel" src="/welcome/day/garden-day.png" alt="" >
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
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
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
