<script setup lang="ts">
// Night scene: same Mondstadt windrise composition as the day scene,
// just shot at night. v5 brings back lateral motion — but as a single
// flat background-position scroll, not the old mouse-driven 8-layer
// parallax that caused the rebote when the sidebar opened. The
// ambient scroll runs independently of sidebar state; only the parent
// stage's translateX shifts on sidebar open/close (handled by
// WelcomeStage + WelcomePanel).
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
@media (prefers-reduced-motion: reduce) {
  .night__bg { animation: none; }
}
</style>
