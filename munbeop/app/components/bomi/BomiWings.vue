<script setup lang="ts">
import { inject, type ComputedRef } from 'vue'
import { motion } from 'motion-v'
import type { PoseGroupAnimation } from '~/lib/bomi/poses'

const wingsAnim = inject<ComputedRef<PoseGroupAnimation | undefined>>(
  'bomi:wingsAnim',
)
</script>

<template>
  <motion.g
    id="wings"
    shape-rendering="crispEdges"
    :animate="wingsAnim?.animate"
    :transition="wingsAnim?.transition"
    style="transform-origin: 16px 24px"
  >
    <rect x="3" y="20" width="5" height="4" fill="#ebe6d7" />
    <rect x="2" y="21" width="1" height="2" fill="#ebe6d7" />
    <rect x="3" y="23" width="5" height="1" fill="#a8b0a2" />

    <rect x="24" y="20" width="5" height="4" fill="#ebe6d7" />
    <rect x="29" y="21" width="1" height="2" fill="#ebe6d7" />
    <rect x="24" y="23" width="5" height="1" fill="#a8b0a2" />
  </motion.g>
</template>
