<script setup lang="ts">
// Chimney smoke — NIGHT ONLY. A lit chimney only makes sense after dark,
// so the whole layer is display-gated to [data-theme='dark'] (non-scoped
// block at the bottom); by day the chimney reads cold and the butterflies
// take over (CottageButterflies.vue).
//
// Implementation per docs/superpowers/specs/2026-06-13-cottage-day-night-
// ambient-design.md (the 2026-06-12 smoke plan): five looping puffs born
// at the chimney mouth. Per-puff knobs live here, not in CSS, so tuning
// density/rhythm is a one-place edit: s = size px, dx = horizontal drift,
// dur = loop duration, delay = phase offset, o = peak opacity. Durations
// are deliberately co-prime-ish so the five cycles drift out of phase and
// the loop never reads as a repeating pattern.
//
// One deliberate deviation from the plan: delays are NEGATIVE (same
// offsets, minus sign). display:none↔block restarts every animation on a
// theme flip, and with positive delays the chimney would sit dead for up
// to ~6 s after switching to dark; negative delays land the column
// mid-emission instead.
const puffs = [
  { s: 13, dx: '-12px', dur: '6.8s', delay: '0s', o: 0.8 },
  { s: 10, dx: '7px', dur: '6.2s', delay: '-1.4s', o: 0.65 },
  { s: 15, dx: '-18px', dur: '7.4s', delay: '-2.8s', o: 0.75 },
  { s: 9, dx: '3px', dur: '6.5s', delay: '-4.2s', o: 0.6 },
  { s: 12, dx: '-8px', dur: '7.0s', delay: '-5.6s', o: 0.7 },
]
</script>

<template>
  <div class="cottage-smoke">
    <span
      v-for="(p, i) in puffs"
      :key="i"
      class="cottage-smoke__puff"
      :style="{ '--s': p.s, '--dx': p.dx, '--dur': p.dur, '--delay': p.delay, '--o': p.o }"
    />
  </div>
</template>

<style scoped>
/* Anchored at the chimney mouth — pixel (430, 47) of the 669×373 source
 * PNG → 64.3% / 12.6%. Percentages, so the anchor stays glued to the
 * chimney if the cottage is ever resized. Only transform/opacity animate
 * (compositor-only). */
.cottage-smoke {
  position: absolute;
  left: 64.3%;
  top: 12.6%;
  /* Night only — hidden here, shown by the [data-theme='dark'] rule in
   * the non-scoped block. display (not opacity) so the five animations
   * don't run at all by day. */
  display: none;
  /* Gris malva lunar — constante de escena: el humo solo existe sobre el
   * cielo abisal fijo del PNG dark, los tokens de tema no aplican. */
  --smoke-color: rgba(134, 128, 156, 0.42);
}

/* steps(5) applies per keyframe segment: 5 segments × 5 steps ≈ 25
 * discrete hops per cycle — the retro stutter that matches
 * image-rendering: pixelated. Swap for `linear` for smooth. */
.cottage-smoke__puff {
  position: absolute;
  left: 0;
  top: 0;
  width: calc(var(--s) * 1px);
  height: calc(var(--s) * 1px);
  /* margin (not transform) centers the puff on the anchor — transform
   * belongs to the animation. */
  margin: calc(var(--s) * -0.5px) 0 0 calc(var(--s) * -0.5px);
  background: var(--smoke-color);
  /* Octagon = a pixel-art "circle". */
  clip-path: polygon(25% 0, 75% 0, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0 75%, 0 25%);
  opacity: 0;
  animation: cottage-puff var(--dur) steps(5) infinite;
  animation-delay: var(--delay);
}

@keyframes cottage-puff {
  0%   { transform: translate(0, 2px) scale(0.4); opacity: 0; }
  12%  { transform: translate(calc(var(--dx) * 0.15), -10px) scale(0.65); opacity: var(--o); }
  35%  { transform: translate(calc(var(--dx) * 0.5), -30px) scale(1); opacity: calc(var(--o) * 0.85); }
  60%  { transform: translate(calc(var(--dx) * 0.35), -52px) scale(1.3); opacity: calc(var(--o) * 0.6); }
  85%  { transform: translate(calc(var(--dx) * 0.8), -72px) scale(1.55); opacity: calc(var(--o) * 0.3); }
  100% { transform: translate(var(--dx), -86px) scale(1.7); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  /* Frozen smoke: two static puffs replicate the smoke that used to be
   * painted into the art, so the chimney still reads as lit without any
   * motion. animation:none explicitly — the global PRM kill-switch in
   * tokens/motion.css would leave the puffs parked at opacity 0. */
  .cottage-smoke__puff {
    animation: none;
  }
  .cottage-smoke__puff:nth-child(1) {
    transform: translate(-3px, -14px) scale(0.9);
    opacity: 0.5;
  }
  .cottage-smoke__puff:nth-child(3) {
    transform: translate(-9px, -30px) scale(1.2);
    opacity: 0.35;
  }
}
</style>

<!--
  Non-scoped block: the gate needs to match [data-theme='dark'] on the
  <html> root, which Vue's scoped attribute rewrite cannot reach. Class
  names are namespaced (cottage-smoke*) so there is no collision risk.
-->
<style>
[data-theme='dark'] .cottage-smoke {
  display: block;
}
</style>
