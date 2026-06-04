<script setup lang="ts">
// Night scene: same Mondstadt windrise composition as the day scene,
// just shot at night.
//
// v6.1: fully static. The v6 pulsoLunar moonglow pulse and
// titileoEstrellas star twinkle were dropped per user feedback
// ("tampoco se ve bien"). The radial moonglow + star pinpricks
// remain as a still overlay so the night sky doesn't feel flat, but
// nothing animates.
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
.night::before,
.night::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}
.night::before {
  background: radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.25) 0%, transparent 50%);
  opacity: 0.4;
}
.night::after {
  background:
    radial-gradient(circle at 20% 40%, #ffffff 1px, transparent 2px),
    radial-gradient(circle at 40% 15%, #ffffff 1.5px, transparent 3px),
    radial-gradient(circle at 75% 50%, #ffffff 1px, transparent 2px);
  background-size: cover;
  opacity: 0.7;
}
</style>
