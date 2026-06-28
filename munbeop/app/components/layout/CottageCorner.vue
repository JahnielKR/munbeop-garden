<script setup lang="ts">
import { computed } from 'vue'
import CottageSmoke from './CottageSmoke.vue'
import CottageButterflies from './CottageButterflies.vue'

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
// A single element with a theme-aware CSS background-image: the light PNG by
// default, the dark PNG under [data-theme='dark']. The browser only fetches the
// image whose rule wins the cascade, so just ONE PNG downloads — the old
// dual-<img> approach hid one with display:none but still downloaded both.
// No JS needed for the theme flip, so app.vue's FOUC inline script (which
// pre-sets dataset.theme before Vue mounts) keeps both paint and toggle
// flicker-free.
//
// Ambient life rides the same theme flip (spec: docs/superpowers/specs/
// 2026-06-13-cottage-day-night-ambient-design.md): CottageSmoke puffs
// from the chimney at night only; CottageButterflies wander the flower
// beds by day only. Each child gates itself with the same
// [data-theme='dark'] display pattern, and both position themselves in
// % of this wrapper, so they scale with the art automatically and fade
// together with it on welcome-surface routes.
//
// The PNGs live in public/img/; the absolute url() paths in CSS below are left
// untouched by Vite and served at runtime from there.
const route = useRoute()
const onAppSurface = computed(() => route.meta.surface !== 'welcome')
</script>

<template>
  <div
    class="cottage-corner"
    :class="{ 'cottage-corner--hidden': !onAppSurface }"
    aria-hidden="true"
  >
    <div class="cottage-corner__art" />
    <CottageSmoke />
    <CottageButterflies />
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

.cottage-corner__art {
  display: block;
  width: 100%;
  /* Matches the source PNG (669x373) so the % positions of the smoke +
   * butterflies resolve against the same box the <img> used to give. */
  aspect-ratio: 669 / 373;
  background-image: url('/img/cottage-corner-light.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  image-rendering: pixelated;
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
}
</style>

<!--
  Non-scoped block: the swap rules need to match [data-theme='dark'] on
  the <html> root, which Vue's scoped attribute rewrite cannot reach.
  Class names are namespaced (cottage-corner__img--*) so there is no
  collision risk with other components.
-->
<style>
[data-theme='dark'] .cottage-corner__art {
  background-image: url('/img/cottage-corner-dark.png');
}
</style>
