<script setup lang="ts">
/**
 * Bomi — lightweight SVG mascot.
 *
 * Pose animation is intentionally CSS-only. The previous motion-v wiring
 * pulled a large animation runtime into every authenticated page for four
 * tiny SVG transforms. CSS preserves the same pose language while keeping
 * Bomi cheap to render and honouring reduced motion automatically.
 */

import { computed } from 'vue'
import BomiAbdomen from './BomiAbdomen.vue'
import BomiBody from './BomiBody.vue'
import BomiWings from './BomiWings.vue'
import BomiHat from './BomiHat.vue'
import BomiAntennae from './BomiAntennae.vue'
import BomiEyes from './BomiEyes.vue'
import type { Pose } from '~/lib/bomi/poses'

interface Props {
  pose?: Pose
  scale?: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  pose: 'idle' as Pose,
  scale: 3,
  label: '봄이 (Bomi) mascot',
})

const renderSize = computed(() => 32 * props.scale)
</script>

<template>
  <svg
    :width="renderSize"
    :height="renderSize"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    :aria-label="label"
    role="img"
    :class="['bomi', `bomi--${pose}`]"
  >
    <g id="bee" class="bomi__bee">
      <!--
        Render order (later siblings paint on top):
        abdomen -> body -> wings -> eyes -> hat -> antennae

        Eyes paint BEFORE hat in DOM so the hat-brim can cover them
        during extreme play-hat rotation (Task 4 / spec §3.10 +
        §3.12 parenthetical — "hat falls over her eyes" beat).

        The spec's §3.12 first sentence listed eyes last, but that
        contradicts the §3.12 parenthetical and the play-hat intent;
        the parenthetical wins.
      -->
      <BomiAbdomen />
      <BomiBody />
      <BomiWings />
      <BomiEyes />
      <BomiHat />
      <BomiAntennae />

      <!--
        Sleep "Z" overlay (spec §3.9). Conditionally rendered only
        when pose === 'sleep'. Floats up + fades, loops every 2s.
        Painted last so it appears on top of antennae/hat.
        Position anchor: x=22 (right of head center col 16, near
        right antenna), starting y=14 (near hat brim), animating
        translateY=-10 (10 sprite-units upward = above the viewbox
        top edge, fades out before clipping).
      -->
      <text
        v-if="pose === 'sleep'"
        x="22"
        y="14"
        font-size="5"
        font-family="'Press Start 2P', monospace"
        font-weight="bold"
        fill="#1a1f1a"
        shape-rendering="auto"
        class="bomi__sleep-z"
        aria-hidden="true"
      >
        Z
      </text>
    </g>
  </svg>
</template>

<style scoped>
.bomi {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  /* Bomi is decorative (role=img + aria-label). Three layers of defense
   * against unwanted selection / interaction behavior:
   *   1. pointer-events:none -- the strongest: clicks pass through, so
   *      no individual sub-group (wings, hat, etc.) can be tap-selected
   *      on mobile, no focus rings on inner SVG groups.
   *   2. user-select:none + -webkit-user-drag:none -- belt-and-suspenders
   *      for text selection on the sleep-Z + drag-select on desktop.
   *   3. -webkit-tap-highlight-color:transparent -- suppresses the iOS
   *      Safari "blue flash" on tap.
   * cursor:default keeps the mouse pointer normal instead of I-beam
   * over the Z text.
   *
   * If a future iteration needs Bomi to be clickable (petting,
   * /mascota detail link), flip pointer-events back to auto on the
   * specific wrapper that should receive clicks. */
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  -webkit-tap-highlight-color: transparent;
  cursor: default;
}
.bomi__bee,
.bomi :deep(#wings),
.bomi :deep(#eyes),
.bomi :deep(#hat),
.bomi__sleep-z {
  transform-box: view-box;
}

.bomi__bee {
  transform-origin: 16px 16px;
  animation: bomi-idle 2s ease-in-out infinite;
}
.bomi :deep(#wings) {
  transform-origin: 16px 24px;
  animation: bomi-wings 180ms ease-in-out infinite;
}
.bomi :deep(#eyes) {
  transform-origin: 15px 18px;
  animation: bomi-blink 3.45s ease-in-out infinite;
}
.bomi :deep(#hat) {
  transform-origin: 16px 14px;
  transition: transform 300ms ease-out;
}

.bomi--happy .bomi__bee {
  animation: bomi-happy 400ms ease-out both;
}
.bomi--happy :deep(#eyes) {
  animation: none;
  transform: scaleY(0.3);
}

.bomi--sad .bomi__bee {
  animation: bomi-sad 300ms ease-in both;
}
.bomi--sad :deep(#eyes) {
  animation: none;
  transform: scaleY(0.55);
}
.bomi--sad :deep(#wings) {
  animation: bomi-sad-wings 400ms ease-in-out 2;
}

.bomi--thinking .bomi__bee {
  animation: bomi-thinking 2s ease-in-out infinite;
}

.bomi--cheer .bomi__bee {
  animation: bomi-cheer 800ms ease-out both;
}
.bomi--cheer :deep(#wings) {
  animation: bomi-fast-wings 100ms ease-in-out 7;
}

.bomi--fly-l .bomi__bee {
  animation: bomi-fly-left 600ms ease both;
}
.bomi--fly-r .bomi__bee {
  animation: bomi-fly-right 600ms ease both;
}
.bomi--fly-l :deep(#wings),
.bomi--fly-r :deep(#wings) {
  animation: bomi-fast-wings 100ms ease-in-out infinite;
}

.bomi--sleep .bomi__bee {
  animation: bomi-sleep 4s ease-in-out infinite;
}
.bomi--sleep :deep(#wings) {
  animation: none;
  opacity: 0;
  transform: scaleX(0.6);
  transition:
    opacity 500ms ease,
    transform 500ms ease;
}
.bomi--sleep :deep(#eyes) {
  animation: none;
  transform: scaleY(0.05);
  transition: transform 500ms ease;
}
.bomi__sleep-z {
  animation: bomi-sleep-z 2s ease-out infinite;
}

.bomi--play-hat :deep(#eyes) {
  animation: bomi-play-eyes 2.5s ease-in-out infinite;
}
.bomi--play-hat :deep(#hat) {
  animation: bomi-play-hat 2.5s ease-in-out infinite;
}

@keyframes bomi-idle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.5px);
  }
}
@keyframes bomi-wings {
  0%,
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
  50% {
    opacity: 1;
    transform: scaleX(0.45);
  }
}
@keyframes bomi-blink {
  0%,
  4.35%,
  100% {
    transform: translateY(0) scaleY(1);
  }
  2.17% {
    transform: translateY(0) scaleY(0.05);
  }
}
@keyframes bomi-happy {
  0%,
  100% {
    transform: translateY(-0.5px);
  }
  50% {
    transform: translateY(-2px);
  }
}
@keyframes bomi-sad {
  from {
    transform: translateY(-0.5px);
  }
  to {
    transform: translateY(1px);
  }
}
@keyframes bomi-sad-wings {
  0%,
  100% {
    transform: scaleX(1);
  }
  50% {
    transform: scaleX(0.7);
  }
}
@keyframes bomi-thinking {
  0%,
  100% {
    transform: rotate(0);
  }
  33% {
    transform: rotate(-3deg);
  }
  66% {
    transform: rotate(3deg);
  }
}
@keyframes bomi-cheer {
  0%,
  100% {
    transform: translateY(-0.5px) rotate(0);
  }
  33% {
    transform: translateY(-3px) rotate(8deg);
  }
  66% {
    transform: translateY(-1px) rotate(-8deg);
  }
}
@keyframes bomi-fast-wings {
  0%,
  100% {
    transform: scaleX(1);
  }
  50% {
    transform: scaleX(0.3);
  }
}
@keyframes bomi-fly-left {
  0%,
  100% {
    transform: rotate(0);
  }
  50% {
    transform: rotate(10deg);
  }
}
@keyframes bomi-fly-right {
  0%,
  100% {
    transform: rotate(0);
  }
  50% {
    transform: rotate(-10deg);
  }
}
@keyframes bomi-sleep {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(0.3px);
  }
}
@keyframes bomi-sleep-z {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  35% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}
@keyframes bomi-play-eyes {
  0%,
  100% {
    transform: translateY(-0.2px);
  }
  50% {
    transform: translateY(-0.4px);
  }
}
@keyframes bomi-play-hat {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }
  25% {
    transform: translateY(-0.6px) rotate(-8deg);
  }
  50% {
    transform: translateY(-0.4px) rotate(6deg);
  }
  75% {
    transform: translateY(-0.6px) rotate(-4deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bomi__bee,
  .bomi :deep(#wings),
  .bomi :deep(#eyes),
  .bomi :deep(#hat),
  .bomi__sleep-z {
    animation: none !important;
    transition: none !important;
  }
  .bomi--happy :deep(#eyes) {
    transform: scaleY(0.3);
  }
  .bomi--sad .bomi__bee {
    transform: translateY(1px);
  }
  .bomi--sad :deep(#eyes) {
    transform: scaleY(0.55);
  }
  .bomi--sleep :deep(#wings) {
    opacity: 0;
    transform: scaleX(0.6);
  }
  .bomi--sleep :deep(#eyes) {
    transform: scaleY(0.05);
  }
  .bomi--play-hat :deep(#eyes) {
    transform: translateY(-0.2px);
  }
  .bomi__sleep-z {
    opacity: 0;
  }
}
</style>
