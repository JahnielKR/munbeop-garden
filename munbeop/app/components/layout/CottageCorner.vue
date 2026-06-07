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
// PNGs ship with transparent backgrounds so no CSS mask is needed for
// blending — they sit directly on --paper.
//
// The chimney smoke in the PNG is static, so we MASK out the top 12.6 %
// of the image (everything above where the chimney bricks begin,
// measured by walking down the alpha + colour channels) and replace it
// with our own animated puffs. That way the trail is a single source
// — pixel-art chunks rising from the chimney mouth — instead of fixed
// PNG smoke plus floating extra puffs.
//
// Puff colour is sampled from the PNG smoke (#d4cabf light, #242430
// dark) so the eraser-and-redraw is invisible. Three puffs at 1.8 s
// delay phases give a continuous-rise effect.
// prefers-reduced-motion disables the animation entirely.
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
  /* Erase ONLY the smoke column. Two mask layers composited with
   * default `add` (source-over): a pixel is hidden iff BOTH layers
   * are transparent at that pixel. The intersection of the two
   * transparent bands is a rectangle at x = 62-67 %, y = 0-13 %,
   * which is exactly the smoke column. The roof peak (x ≈ 74 %,
   * y ≈ 9 %) is outside the x-band so it stays intact; the chimney
   * bricks (y > 13.5 %) are outside the y-band so they stay intact. */
  -webkit-mask-image:
    linear-gradient(
      to right,
      #000 0,
      #000 62%,
      transparent 62%,
      transparent 67%,
      #000 67%
    ),
    linear-gradient(
      to bottom,
      transparent 0,
      transparent 13.5%,
      #000 13.5%
    );
  mask-image:
    linear-gradient(
      to right,
      #000 0,
      #000 62%,
      transparent 62%,
      transparent 67%,
      #000 67%
    ),
    linear-gradient(
      to bottom,
      transparent 0,
      transparent 13.5%,
      #000 13.5%
    );
}

.cottage-corner__img--light { display: block; }
.cottage-corner__img--dark  { display: none; }

/* Chimney mouth: x = 63.5 % (sampled smoke column), y ≈ 13 % (just
 * inside the brick line revealed by the img mask above). Origin is
 * zero-sized; puffs animate UP from here. */
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
  width: 16px;
  height: 16px;
  border-radius: 3px;            /* chunky, not round — pixel-art chibi */
  background: #d4cabf;           /* sampled from the PNG smoke */
  transform: translate(-50%, 0);
  opacity: 0;
  animation: cottage-smoke-rise 5.4s linear infinite;
}

.cottage-corner__puff:nth-child(2) { animation-delay: 1.8s; }
.cottage-corner__puff:nth-child(3) { animation-delay: 3.6s; }

@keyframes cottage-smoke-rise {
  0%   { transform: translate(-50%, 0)    scale(0.6);  opacity: 0; }
  12%  { opacity: 1; }
  55%  { transform: translate(-25%, -50px) scale(1);    opacity: 0.7; }
  100% { transform: translate(0,    -100px) scale(0.4); opacity: 0; }
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

/* Dark-mode smoke: matches the sampled PNG smoke colour so the puff
 * reads as the same trail (very subtle against the abyssal-blue
 * --paper, which is intentional — the PNG smoke is also faint at night). */
[data-theme='dark'] .cottage-corner__puff {
  background: #242430;
}
</style>
