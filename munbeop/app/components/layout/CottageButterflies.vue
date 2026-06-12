<script setup lang="ts">
// Daytime butterflies — LIGHT ONLY (hidden in dark via the non-scoped
// block at the bottom; after dark the chimney smoke takes over,
// CottageSmoke.vue). Two of them over the cottage flowers:
//
//   - gold one wandering the rose/lavender bed on the left
//   - cream one (배추흰나비, the cabbage white — it belongs by the
//     vegetable patch) over the front garden beds
//
// Each butterfly is a <span> body with ::before/::after wings. The root
// span carries the looping waypoint flight (quantized with steps() —
// retro hops matching image-rendering: pixelated); the wings carry a
// 2-frame steps(1) flap. Flap periods and flight durations are
// co-prime-ish so the two never sync. No JS — pure CSS, compositor-only
// (transform/opacity), zero cost in dark where the layer is display:none.
</script>

<template>
  <div class="cottage-butterflies">
    <span class="cottage-butterflies__fly cottage-butterflies__fly--gold" />
    <span class="cottage-butterflies__fly cottage-butterflies__fly--cream" />
  </div>
</template>

<style scoped>
.cottage-butterflies {
  position: absolute;
  inset: 0;
}

/* Body: a 2×8 px dark sliver; the wings hang off ::before/::after.
 * Colors are scene constants — the butterflies fly over the fixed light
 * art, theme tokens don't apply (same convention as the smoke). */
.cottage-butterflies__fly {
  position: absolute;
  width: 2px;
  height: 8px;
  background: #2d1e18;
}

/* Wings: 6×8 px octagons (the pixel-art "circle", same language as the
 * smoke puffs) with an inset bottom-right shade for the two-tone pixel
 * look — the inset shadow survives the clip-path. The flap squashes
 * scaleX from the body edge: steps(1) over two keyframe segments = a
 * hard 2-frame sprite flap. */
.cottage-butterflies__fly::before,
.cottage-butterflies__fly::after {
  content: '';
  position: absolute;
  top: 0;
  width: 6px;
  height: 8px;
  background: var(--wing);
  box-shadow: inset -2px -3px 0 0 var(--wing-shade);
  clip-path: polygon(25% 0, 75% 0, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0 75%, 0 25%);
  animation: butterfly-flap var(--flap) steps(1) infinite;
}
.cottage-butterflies__fly::before {
  left: -6px;
  transform-origin: 100% 50%;
}
.cottage-butterflies__fly::after {
  left: 2px;
  transform-origin: 0% 50%;
}

@keyframes butterfly-flap {
  0%,
  100% {
    transform: scaleX(1);
  }
  50% {
    transform: scaleX(0.3);
  }
}

/* Anchors in % of the 669×373 art so they track the img if the cottage
 * is ever resized; wander offsets in px of the 720 px render. steps(7)
 * per segment ≈ 42 hops per loop ≈ 3 hops/s — the same retro cadence
 * family as the smoke. Wander boxes stay over the flowers:
 * gold ±42 px around (40%, 44%) = the left rose/lavender bed;
 * cream ±38 px around (54%, 57%) = the front vegetable beds. */
.cottage-butterflies__fly--gold {
  --wing: #e6a121;
  --wing-shade: #a06b2e;
  --flap: 360ms;
  left: 40%;
  top: 44%;
  animation: butterfly-roam-gold 13s steps(7) infinite;
}
@keyframes butterfly-roam-gold {
  0% {
    transform: translate(0, 0);
  }
  16% {
    transform: translate(-26px, -14px);
  }
  34% {
    transform: translate(-42px, 8px);
  }
  52% {
    transform: translate(-16px, 24px);
  }
  68% {
    transform: translate(12px, 10px);
  }
  84% {
    transform: translate(20px, -8px);
  }
  100% {
    transform: translate(0, 0);
  }
}

.cottage-butterflies__fly--cream {
  --wing: #f8efd0;
  --wing-shade: #cfc5b6;
  --flap: 300ms;
  left: 54%;
  top: 57%;
  animation: butterfly-roam-cream 16s steps(7) infinite;
  /* Negative delay: lands her mid-route on first paint so the pair never
   * starts from their anchors in sync. */
  animation-delay: -6s;
}
@keyframes butterfly-roam-cream {
  0% {
    transform: translate(0, 0);
  }
  14% {
    transform: translate(22px, -10px);
  }
  30% {
    transform: translate(38px, 6px);
  }
  48% {
    transform: translate(18px, 18px);
  }
  64% {
    transform: translate(-8px, 26px);
  }
  82% {
    transform: translate(-20px, 4px);
  }
  100% {
    transform: translate(0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  /* Perched instead of parked mid-air: wings open, no flap, no flight —
   * the gold one on a rose bloom, the cream one on a bed leaf.
   * animation:none explicitly — the global PRM kill-switch in
   * tokens/motion.css would otherwise leave the roam frozen mid-hop. */
  .cottage-butterflies__fly,
  .cottage-butterflies__fly::before,
  .cottage-butterflies__fly::after {
    animation: none;
  }
  .cottage-butterflies__fly--gold {
    transform: translate(-30px, 16px);
  }
  .cottage-butterflies__fly--cream {
    transform: translate(14px, 20px);
  }
}
</style>

<!--
  Non-scoped block: the gate needs to match [data-theme='dark'] on the
  <html> root, which Vue's scoped attribute rewrite cannot reach. Class
  names are namespaced (cottage-butterflies*) so there is no collision
  risk.
-->
<style>
[data-theme='dark'] .cottage-butterflies {
  display: none;
}
</style>
