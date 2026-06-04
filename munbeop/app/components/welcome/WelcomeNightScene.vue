<script setup lang="ts">
// Night scene: same Mondstadt windrise composition as the day scene,
// just shot at night.
//
// v6: the background is static (no horizontal scroll). Atmosphere is
// added by two stacked overlay layers:
//   - .night::before — a soft moonglow radial from the upper right,
//     pulsing between 0.2 and 0.4 opacity over 8s (pulsoLunar) like
//     a thin cloud drifting in front of the moon.
//   - .night::after  — three scattered white pinpricks for stars,
//     twinkling between 0.3 and 0.8 opacity with a slight 5% scale
//     bump over 4s (titileoEstrellas).
// Two separate pseudo-elements so each animation can own its opacity
// channel cleanly — the MD's original single-overlay design had both
// animations fighting for the same opacity, with the faster star
// twinkle silently overriding the slower moonglow.
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
  animation: pulsoLunar 8s ease-in-out infinite;
}
.night::after {
  background:
    radial-gradient(circle at 20% 40%, #ffffff 1px, transparent 2px),
    radial-gradient(circle at 40% 15%, #ffffff 1.5px, transparent 3px),
    radial-gradient(circle at 75% 50%, #ffffff 1px, transparent 2px);
  background-size: cover;
  animation: titileoEstrellas 4s ease-in-out infinite;
}
@keyframes pulsoLunar {
  0%, 100% { opacity: 0.2; }
  50%      { opacity: 0.4; }
}
@keyframes titileoEstrellas {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50%      { opacity: 0.8; transform: scale(1.05); }
}
@media (prefers-reduced-motion: reduce) {
  .night::before,
  .night::after { animation: none; }
}
</style>
