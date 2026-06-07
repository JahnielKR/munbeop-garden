<script setup lang="ts">
// Night scene: same Mondstadt windrise composition as the day scene,
// just shot at night. Fully static — only the JPG, no overlays. Matches
// the day scene's "fondo limpio" treatment per user feedback. The v6.1
// still moonglow + star pinpricks (::before/::after pseudo-elements)
// were dropped here.
</script>

<template>
  <div class="night" aria-hidden="true">
    <div class="night__bg pixel" />
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
  background-image: url('/welcome/night/garden-night.jpg');
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: cover;
  image-rendering: pixelated;
}
</style>
