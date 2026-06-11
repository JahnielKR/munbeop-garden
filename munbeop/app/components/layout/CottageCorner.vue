<script setup lang="ts">
import { computed } from 'vue'

// Ambient pixel-art cottage that sits in the lower-right viewport corner
// of the in-app surface. Rendered ONCE at app.vue's root (OUTSIDE
// CameraStage) so it behaves as a true wallpaper — viewport-fixed, never
// transformed, never riding the camera pan, never riding the per-page
// scroll. Decorative only — pointer-events disabled so it never blocks
// UI underneath.
//
// Surface gating: routes flagged `surface: 'welcome'` (the welcome page
// itself plus /pricing, /policies, /features which use WelcomeSectionShell
// with an opaque --paper background) must not show the cottage. On those
// routes the WelcomeSectionShell pages already paint over it while
// mounted, but during the 700 ms camera pan back to /welcome the leaving
// page unmounts instantly and the app panel goes transparent — without
// gating, the cottage flashes into view through that transparent panel
// before the welcome panel finishes sliding over it. We fade with
// opacity (not v-if) so the cottage stays mounted and reads as a piece
// of background being uncovered/covered, not a UI element popping in.
//
// Two variants are rendered as separate <img> tags; CSS toggles which
// one is visible based on [data-theme="dark"] on <html>. This mirrors
// the swap pattern in tokens/colors-dark.css — no JS needed for the
// theme flip, so the FOUC inline script in app.vue (which pre-sets
// dataset.theme before Vue mounts) keeps both initial paint and toggle
// flicker-free.
//
// Chimney smoke: the PNGs used to ship with static smoke puffs baked
// into the art. Those floating puffs were erased from both files
// (2026-06-11) so the chimney can emit LIVE smoke — the three <span>s
// below are CSS puffs that rise from the chimney mouth on a staggered
// loop. Only the wisp right at the mouth remains baked in the art, and
// it doubles as the emission point the animated puffs spawn from. The
// rise is quantized with steps() (same idea as --ease-step-* in
// tokens/motion.css game chrome) so puffs climb in discrete sprite-like
// jumps, while opacity fades smoothly on a second animation track.
//
// `src` is bound (not static) so Vite's asset-URL transform leaves it
// alone and treats it as a runtime public path served from `public/img/`.
const cottageLight = '/img/cottage-corner-light.png'
const cottageDark = '/img/cottage-corner-dark.png'

const route = useRoute()
const onAppSurface = computed(() => route.meta.surface !== 'welcome')
</script>

<template>
  <div
    class="cottage-corner"
    :class="{ 'cottage-corner--hidden': !onAppSurface }"
    aria-hidden="true"
  >
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
    <span v-for="n in 3" :key="n" class="cottage-smoke" />
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
  /* No z-index on purpose — the cottage is the wallpaper layer. It's
   * rendered at app.vue's root BEFORE <CameraStage>, so document order
   * keeps CameraStage on top (z-index: auto for both). On /welcome the
   * opaque welcome scene inside CameraStage hides the cottage; on the
   * app side CameraStage's panel is transparent and the cottage shows
   * through behind the in-app content. Any positive z-index here lifts
   * the cottage ABOVE CameraStage and leaks it onto the welcome page. */
  transition: opacity 350ms ease;
}
.cottage-corner--hidden {
  opacity: 0;
}

.cottage-corner__img {
  display: block;
  width: 100%;
  height: auto;
  image-rendering: pixelated;
}

.cottage-corner__img--light { display: block; }
.cottage-corner__img--dark  { display: none; }

/* ---- Chimney smoke ------------------------------------------------ */
/* Anchor: the chimney mouth centre sits at (428, 49) in the 669×373
 * art. Percentages keep the anchor glued to the chimney if the wrapper
 * width ever changes. Smoke colours are sampled from the puffs that
 * used to be baked into each PNG; the dark pair is lifted a step above
 * the original soot so the column stays readable on --paper #0c1220. */
.cottage-smoke {
  --smoke-core: #cfc5b6;
  --smoke-shade: #b0a695;
  --dx: 12px;
  --grow: 1;
  position: absolute;
  left: 63.9%;
  top: 13.1%;
  width: 24px;
  height: 24px;
  margin: -12px 0 0 -12px;
  border-radius: 50%;
  background: var(--smoke-core);
  box-shadow: inset -4px -5px 0 0 var(--smoke-shade);
  opacity: 0;
  transform: translate(0, 2px) scale(0.32);
  /* Two tracks on one element: the rise is stepped (pixel-sprite jumps,
   * ~4 px every ~250 ms), the fade is continuous so the puff doesn't
   * blink. A single duration/delay value applies to both tracks. */
  animation:
    cottage-smoke-rise 5400ms steps(22) infinite,
    cottage-smoke-fade 5400ms linear infinite;
  animation-delay: -600ms;
}
/* Stagger + vary the loop so the column never reads as a metronome:
 * each puff gets its own drift, final size and period, and the negative
 * delays put the column mid-emission on first paint. */
.cottage-smoke:nth-of-type(2) {
  --dx: 4px;
  --grow: 0.8;
  animation-duration: 6200ms;
  animation-delay: -2900ms;
}
.cottage-smoke:nth-of-type(3) {
  --dx: 19px;
  --grow: 1.15;
  animation-duration: 7000ms;
  animation-delay: -5200ms;
}

@keyframes cottage-smoke-rise {
  from {
    transform: translate(0, 2px) scale(0.32);
  }
  to {
    transform: translate(var(--dx), -84px) scale(var(--grow));
  }
}
@keyframes cottage-smoke-fade {
  0%   { opacity: 0; }
  7%   { opacity: 0.95; }
  60%  { opacity: 0.85; }
  100% { opacity: 0; }
}

@media (max-width: 768px) {
  /* Mobile nav owns the bottom strip — hide the cottage to avoid
   * overlap with the 64 px navbar and the practice keyboard. */
  .cottage-corner {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cottage-corner { transition: none; }
  /* Recreate the static smoke column the PNGs originally shipped with:
   * three frozen puffs, bigger and fainter with height. The global PRM
   * rule in tokens/motion.css would leave the animated puffs at
   * opacity 0 (a dead chimney), so they're parked explicitly instead. */
  .cottage-smoke {
    animation: none;
    opacity: 0.85;
    transform: translate(1px, -8px) scale(0.55);
  }
  .cottage-smoke:nth-of-type(2) {
    opacity: 0.7;
    transform: translate(6px, -28px) scale(0.75);
  }
  .cottage-smoke:nth-of-type(3) {
    opacity: 0.5;
    transform: translate(13px, -48px) scale(0.95);
  }
}
</style>

<!--
  Non-scoped block: the swap rules need to match [data-theme='dark'] on
  the <html> root, which Vue's scoped attribute rewrite cannot reach.
  Class names are namespaced (cottage-corner__img--*, cottage-smoke) so
  there is no collision risk with other components.
-->
<style>
[data-theme='dark'] .cottage-corner__img--light { display: none; }
[data-theme='dark'] .cottage-corner__img--dark  { display: block; }
[data-theme='dark'] .cottage-smoke {
  --smoke-core: #424659;
  --smoke-shade: #2d3041;
}
</style>
