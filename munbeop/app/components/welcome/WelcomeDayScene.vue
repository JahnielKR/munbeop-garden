<script setup lang="ts">
// Day scene: Mondstadt-inspired meadow with a bobbing dodo sprite.
// Pure visual layer — no props, no state.
//
// The background image is rendered as a CSS background (not an <img>)
// so we can repeat it horizontally and slide it laterally for the
// ambient parallax. The dodo stays a sprite <img> because it has its
// own keyframe and absolute positioning that don't compose with the
// background-position scroll.
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
  background-repeat: repeat-x;
  background-position: center bottom;
  background-size: auto 100%;
  image-rendering: pixelated;
  animation: scrollFondo 60s linear infinite;
}
@keyframes scrollFondo {
  from { background-position: 0 bottom; }
  to   { background-position: -1000px bottom; }
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
  .day__bg { animation: none; }
  .day__dodo { animation: none; }
}
</style>
