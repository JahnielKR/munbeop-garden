<script setup lang="ts">
// Night scene: same Mondstadt windrise composition as the day scene,
// just shot at night. Single static background image — no parallax
// layers, no GIF overlay. Keeps the welcome dead still when the user
// clicks ENTER (the old 8-layer parallax shifted on mouse position
// and the user perceived that as a "rebote" / bounce effect when the
// sidebar opened).
</script>

<template>
  <div class="night" aria-hidden="true">
    <img class="night__bg pixel" src="/welcome/night/garden-night.jpg" alt="" >
  </div>
</template>

<style scoped>
.night {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.night__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  image-rendering: pixelated;
}
</style>
