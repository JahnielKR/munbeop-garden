<script setup lang="ts">
/**
 * BomiEyes — square ink eye bodies with smooth white sparkles and lashes.
 *
 * This is the ONLY sub-component that uses shape-rendering="auto"
 * (smooth) rather than crispEdges. Per spec §2.4 the sparkles and
 * lash are intentional smooth shapes against the crispEdge pixel
 * eye square.
 *
 * Eye geometry (locked, do not adjust):
 *   - Square ink rect 2.9w x 3.8h at (11, 18) and (19, 18) — centered
 *   - Sparkle grande 1.2x1.2 white at top-inner of each eye
 *   - Sparkle medio 0.7x0.7 white at bottom-outer of each eye
 *   - Lash: quadratic Bezier from top-outer corner of square,
 *     curving up-and-out
 *
 * transform-origin: (15, 18) — eye-line center. Blink scales toward
 * the horizontal line, eyes don't fly away.
 *
 * Will become <motion.g> in Task 4 with blink animation.
 */

// Eye constants
const LEFT_CX = 11
const RIGHT_CX = 19
const CY = 18
const EYE_W = 2.9
const EYE_H = 3.8
const EYE_RX = EYE_W / 2
const EYE_RY = EYE_H / 2

// Sparkle offsets (multiplied by eyeRX/RY per spec)
// grande: offset (-dir * 0.25 * eyeRX, -0.35 * eyeRY)
// medio:  offset (+dir * 0.30 * eyeRX, +0.30 * eyeRY)
const SPARKLE_BIG = 1.2
const SPARKLE_SM = 0.7

// dir: -1 for left eye, +1 for right
function spX(cx: number, dir: number, mul: number) {
  return cx + dir * mul * EYE_RX
}
function spY(mul: number) {
  return CY + mul * EYE_RY
}
</script>

<template>
  <g id="eyes" shape-rendering="auto" style="transform-origin: 15px 18px">
    <!-- LEFT eye body (square ink) -->
    <rect
      :x="LEFT_CX - EYE_RX"
      :y="CY - EYE_RY"
      :width="EYE_W"
      :height="EYE_H"
      fill="#1a1f1a"
    />
    <!-- LEFT sparkle grande (top-inner: dir = -1 reversed to +1 for "inner") -->
    <rect
      :x="spX(LEFT_CX, +1, 0.25) - SPARKLE_BIG / 2"
      :y="spY(-0.35) - SPARKLE_BIG / 2"
      :width="SPARKLE_BIG"
      :height="SPARKLE_BIG"
      fill="#ffffff"
    />
    <!-- LEFT sparkle medio (bottom-outer: dir = -1 outer is to the LEFT) -->
    <rect
      :x="spX(LEFT_CX, -1, 0.30) - SPARKLE_SM / 2"
      :y="spY(0.30) - SPARKLE_SM / 2"
      :width="SPARKLE_SM"
      :height="SPARKLE_SM"
      fill="#ffffff"
    />
    <!-- LEFT lash: top-outer corner curving up-and-out -->
    <path
      :d="`M ${LEFT_CX - EYE_RX},${CY - EYE_RY}
           Q ${LEFT_CX - EYE_RX - 1.2},${CY - EYE_RY - 0.6}
             ${LEFT_CX - EYE_RX - 1.8},${CY - EYE_RY - 1.6}`"
      stroke="#1a1f1a"
      stroke-width="0.22"
      stroke-linecap="round"
      fill="none"
    />

    <!-- RIGHT eye body -->
    <rect
      :x="RIGHT_CX - EYE_RX"
      :y="CY - EYE_RY"
      :width="EYE_W"
      :height="EYE_H"
      fill="#1a1f1a"
    />
    <!-- RIGHT sparkle grande (top-inner: dir = +1 reversed to -1) -->
    <rect
      :x="spX(RIGHT_CX, -1, 0.25) - SPARKLE_BIG / 2"
      :y="spY(-0.35) - SPARKLE_BIG / 2"
      :width="SPARKLE_BIG"
      :height="SPARKLE_BIG"
      fill="#ffffff"
    />
    <!-- RIGHT sparkle medio (bottom-outer: dir = +1 outer is to the RIGHT) -->
    <rect
      :x="spX(RIGHT_CX, +1, 0.30) - SPARKLE_SM / 2"
      :y="spY(0.30) - SPARKLE_SM / 2"
      :width="SPARKLE_SM"
      :height="SPARKLE_SM"
      fill="#ffffff"
    />
    <!-- RIGHT lash: top-outer corner curving up-and-out (mirrored) -->
    <path
      :d="`M ${RIGHT_CX + EYE_RX},${CY - EYE_RY}
           Q ${RIGHT_CX + EYE_RX + 1.2},${CY - EYE_RY - 0.6}
             ${RIGHT_CX + EYE_RX + 1.8},${CY - EYE_RY - 1.6}`"
      stroke="#1a1f1a"
      stroke-width="0.22"
      stroke-linecap="round"
      fill="none"
    />
  </g>
</template>
