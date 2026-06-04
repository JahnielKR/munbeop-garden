<script setup lang="ts">
// Day scene: Mondstadt-inspired meadow background.
// Fully static — no sprite overlay, no animation. Matches the night
// scene's "just the JPG/PNG" treatment per user feedback ("fondo
// limpio como el de night").
</script>

<template>
  <div class="day" aria-hidden="true">
    <div class="day__bg pixel" />
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
</style>
