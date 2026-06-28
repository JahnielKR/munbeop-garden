<script setup lang="ts">
import { inject, type ComputedRef } from 'vue'
import { motion } from 'motion-v'
import type { PoseGroupAnimation } from '~/lib/bomi/poses'

const hatAnim = inject<ComputedRef<PoseGroupAnimation | undefined>>('bomi:hatAnim')
</script>

<template>
  <motion.g
    id="hat"
    shape-rendering="crispEdges"
    :animate="hatAnim?.animate"
    :transition="hatAnim?.transition"
    style="transform-origin: 16px 14px"
  >
    <!-- Crown: rows 5-9 -->
    <rect x="11" y="5" width="10" height="1" fill="#f0c84a" />
    <rect x="10" y="6" width="12" height="2" fill="#f0c84a" />
    <rect x="11" y="7" width="10" height="1" fill="#a8741e" />
    <rect x="10" y="8" width="12" height="2" fill="#f0c84a" />

    <!-- Ribbon (rows 10-11) -->
    <rect x="10" y="10" width="12" height="2" fill="#c23e3e" />
    <rect x="9" y="10" width="1" height="2" fill="#9d2e2e" />
    <rect x="8" y="11" width="1" height="1" fill="#9d2e2e" />

    <!-- Brim (rows 12-14) -->
    <rect x="6" y="12" width="20" height="1" fill="#f0c84a" />
    <rect x="5" y="13" width="22" height="1" fill="#f0c84a" />
    <rect x="5" y="14" width="22" height="1" fill="#c89030" />

    <!-- Crown side outlines -->
    <rect x="9" y="6" width="1" height="4" fill="#c89030" />
    <rect x="22" y="6" width="1" height="4" fill="#c89030" />
  </motion.g>
</template>
