<script setup lang="ts">
// Renders a horizontal 4-px line that sweeps across the viewport.
// Direction is bound to the `direction` prop:
//   - 'down' = day → night (curtain falling at sunset)
//   - 'up'   = night → day (dawn rising)
// The parent toggles `active` for one transition cycle (~700 ms),
// then sets it back to false.
const props = defineProps<{
  active: boolean
  direction: 'up' | 'down'
}>()
</script>

<template>
  <div
    class="scanline"
    :class="[`scanline--${props.direction}`, { 'scanline--active': props.active }]"
    aria-hidden="true"
  >
    <div class="scanline__line" />
    <div class="scanline__glow" />
  </div>
</template>

<style scoped>
.scanline {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 40;
  overflow: hidden;
  opacity: 0;
}
.scanline--active { opacity: 1; }

.scanline__line {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--sky-night);
  box-shadow: 0 0 16px 4px var(--sky-night), 0 0 4px 1px rgba(255, 255, 255, 0.7);
  top: 0;
}
.scanline__glow {
  position: absolute;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.18) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  top: 0;
  transform: translateY(-50%);
}

.scanline--down.scanline--active .scanline__line,
.scanline--down.scanline--active .scanline__glow {
  animation: scanline-down 700ms ease-in-out forwards;
}
.scanline--up.scanline--active .scanline__line,
.scanline--up.scanline--active .scanline__glow {
  background: var(--sky-day);
  box-shadow: 0 0 16px 4px var(--sky-day), 0 0 4px 1px rgba(255, 255, 255, 0.7);
  animation: scanline-up 700ms ease-in-out forwards;
}

@keyframes scanline-down {
  0%   { top: 0;     opacity: 0; }
  8%   { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 100%;  opacity: 0; }
}
@keyframes scanline-up {
  0%   { top: 100%;  opacity: 0; }
  8%   { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 0;     opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .scanline--active .scanline__line,
  .scanline--active .scanline__glow {
    animation: none;
    opacity: 0;
  }
}
</style>
