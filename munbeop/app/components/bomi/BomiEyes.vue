<script setup lang="ts">
import { inject, type ComputedRef } from 'vue'
import { motion } from 'motion-v'
import type { PoseGroupAnimation } from './poses'

const eyesAnim = inject<ComputedRef<PoseGroupAnimation | undefined>>('bomi:eyesAnim')

const LEFT_CX = 11
const RIGHT_CX = 19
const CY = 18
const EYE_W = 2.9
const EYE_H = 3.8
const EYE_RX = EYE_W / 2
const EYE_RY = EYE_H / 2

const SPARKLE_BIG = 1.2
const SPARKLE_SM = 0.7

function spX(cx: number, dir: number, mul: number) {
  return cx + dir * mul * EYE_RX
}
function spY(mul: number) {
  return CY + mul * EYE_RY
}
</script>

<template>
  <motion.g
    id="eyes"
    shape-rendering="auto"
    :animate="eyesAnim?.animate"
    :transition="eyesAnim?.transition"
    style="transform-origin: 15px 18px"
  >
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
  </motion.g>
</template>
