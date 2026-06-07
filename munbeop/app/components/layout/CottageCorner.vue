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
// No mask: --paper is matched to the PNG fill colour in
// tokens/colors-light.css and tokens/colors-dark.css, so the cottage
// blends into the page even though the PNG ships with a solid fill.
//
// `src` is bound (not static) so Vite's asset-URL transform leaves it
// alone and treats it as a runtime public path served from `public/img/`.
const cottageLight = '/img/cottage-corner-light.png'
const cottageDark = '/img/cottage-corner-dark.png'
</script>

<template>
  <img
    class="cottage-corner cottage-corner--light"
    :src="cottageLight"
    alt=""
    aria-hidden="true"
  />
  <img
    class="cottage-corner cottage-corner--dark"
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
  /* Mobile nav is z-index 50, Toast is 100. Stay well below both. */
  z-index: 1;
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
