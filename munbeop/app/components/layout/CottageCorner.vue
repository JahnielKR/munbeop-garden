<script setup lang="ts">
// Ambient pixel-art cottage that sits in the lower-right viewport corner
// across every page that renders the AppShell. Welcome page sets
// `layout: false` and therefore never mounts this. Decorative only —
// pointer-events disabled so it never blocks UI underneath.
//
// Two variants are rendered as separate <img> tags; CSS toggles which
// one is visible based on [data-theme="dark"] on <html>. This mirrors
// the swap pattern in tokens/colors-dark.css — no JS needed for the
// theme flip, so the FOUC inline script in app.vue (which pre-sets
// dataset.theme before Vue mounts) keeps both initial paint and toggle
// flicker-free.
//
// PNGs ship with transparent backgrounds so no CSS mask is needed —
// they sit directly on --paper.
//
// The chimney-smoke "puff" elements are absolutely positioned over the
// chimney mouth (around 85% × 14% inside the image box) and animate up
// in a staggered loop. Three puffs at 1.7s delay phases give a
// continuous-rise effect without the work of an SVG/canvas particle
// system. prefers-reduced-motion disables the animation entirely.
//
// `src` is bound (not static) so Vite's asset-URL transform leaves it
// alone and treats it as a runtime public path served from `public/img/`.
const cottageLight = '/img/cottage-corner-light.png'
const cottageDark = '/img/cottage-corner-dark.png'
</script>

<template>
  <div class="cottage-corner" aria-hidden="true">
    <img
      class="cottage-corner__img cottage-corner__img--light"
      :src="cottageLight"
      alt=""
    />
    <img
      class="cottage-corner__img cottage-corner__img--dark"
      :src="cottageDark"
      alt=""
    />
    <div class="cottage-corner__smoke">
      <span class="cottage-corner__puff" />
      <span class="cottage-corner__puff" />
      <span class="cottage-corner__puff" />
    </div>
  </div>
</template>

<style scoped>
.cottage-corner {
  position: fixed;
  bottom: 40px;
  right: 0;
  width: 720px;
  pointer-events: none;
  user-select: none;
  /* Mobile nav is z-index 50, Toast is 100. Stay well below both. */
  z-index: 1;
}

.cottage-corner__img {
  display: block;
  width: 100%;
  height: auto;
  image-rendering: pixelated;
}

.cottage-corner__img--light { display: block; }
.cottage-corner__img--dark  { display: none; }

/* Chimney-mouth origin point. Anchored to the PNG's chimney pixel
 * position: x = 63.5%, y = ~13% (measured by walking down the alpha
 * channel to the top-most non-transparent pixel). Tweak `right`/`top`
 * to nudge the puff stack; the box itself is zero-sized so it only
 * acts as a coordinate. */
.cottage-corner__smoke {
  position: absolute;
  right: 36.5%;
  top: 13%;
  width: 0;
  height: 0;
}

.cottage-corner__puff {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(180, 168, 144, 0.5);
  transform: translate(-50%, 0) scale(0.4);
  opacity: 0;
  animation: cottage-smoke-rise 5.4s ease-out infinite;
}

.cottage-corner__puff:nth-child(2) { animation-delay: 1.8s; }
.cottage-corner__puff:nth-child(3) { animation-delay: 3.6s; }

@keyframes cottage-smoke-rise {
  0%   { transform: translate(-50%, 0)    scale(0.4); opacity: 0; }
  18%  { opacity: 0.55; }
  60%  { transform: translate(-30%, -48px) scale(1.4); opacity: 0.35; }
  100% { transform: translate(-10%, -96px) scale(2);   opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .cottage-corner__puff {
    animation: none;
    opacity: 0;
  }
}

@media (max-width: 768px) {
  /* Mobile nav owns the bottom strip — hide the cottage to avoid
   * overlap with the 64 px navbar and the practice keyboard. */
  .cottage-corner {
    display: none;
  }
}
</style>

<!--
  Non-scoped block: the theme-swap rules need to match [data-theme='dark']
  on the <html> root, which Vue's scoped attribute rewrite cannot reach.
  Class names are namespaced (cottage-corner__*) so there is no collision
  risk with other components.
-->
<style>
[data-theme='dark'] .cottage-corner__img--light { display: none; }
[data-theme='dark'] .cottage-corner__img--dark  { display: block; }

/* Dark-mode smoke: cooler, slightly lighter so the puff reads against
 * the abyssal-blue --paper without going too bright. */
[data-theme='dark'] .cottage-corner__puff {
  background: rgba(150, 165, 180, 0.45);
}
</style>
