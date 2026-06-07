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
// No mask: --paper is matched to the PNG fill colour in
// tokens/colors-light.css and tokens/colors-dark.css, so the cottage
// blends into the page even though the PNG ships with a solid fill.
//
// `src` is bound (not static) so Vite's asset-URL transform leaves it
// alone and treats it as a runtime public path served from `public/img/`.
const cottageLight = '/img/cottage-corner-light.png'
const cottageDark = '/img/cottage-corner-dark.png'

const route = useRoute()
const onAppSurface = computed(() => route.meta.surface !== 'welcome')
</script>

<template>
  <img
    class="cottage-corner cottage-corner--light"
    :class="{ 'cottage-corner--hidden': !onAppSurface }"
    :src="cottageLight"
    alt=""
    aria-hidden="true"
  />
  <img
    class="cottage-corner cottage-corner--dark"
    :class="{ 'cottage-corner--hidden': !onAppSurface }"
    :src="cottageDark"
    alt=""
    aria-hidden="true"
  />
</template>

<style scoped>
.cottage-corner {
  position: fixed;
  bottom: 40px;
  right: 0;
  width: 720px;
  height: auto;
  pointer-events: none;
  user-select: none;
  image-rendering: pixelated;
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

.cottage-corner--light { display: block; }
.cottage-corner--dark  { display: none; }

@media (max-width: 768px) {
  /* Mobile nav owns the bottom strip — hide the cottage to avoid
   * overlap with the 64 px navbar and the practice keyboard. */
  .cottage-corner {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cottage-corner { transition: none; }
}
</style>

<!--
  Non-scoped block: the swap rules need to match [data-theme='dark'] on
  the <html> root, which Vue's scoped attribute rewrite cannot reach.
  Class names are namespaced (cottage-corner--*) so there is no collision
  risk with other components.
-->
<style>
[data-theme='dark'] .cottage-corner--light { display: none; }
[data-theme='dark'] .cottage-corner--dark  { display: block; }
</style>
