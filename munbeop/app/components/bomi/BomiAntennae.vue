<script setup lang="ts">
/**
 * BomiAntennae — rows 0-4 of the sprite.
 *
 * Static group. Renders two antennae, one on each side of the head,
 * each with a pink bobble at the tip and an ink shaft curving inward
 * toward the head. Per spec §2.2 row breakdown.
 *
 * No animation here — antennae inherit any #bee transform but don't
 * animate independently.
 */
</script>

<template>
  <g id="antennae" shape-rendering="crispEdges">
    <!-- LEFT antenna -->
    <!-- Pink bobble (2x2) at top -->
    <rect x="8" y="0" width="2" height="2" fill="#e58aa0" />
    <!-- Ink outline above + below bobble -->
    <rect x="8" y="2" width="1" height="1" fill="#1a1f1a" />
    <rect x="9" y="2" width="1" height="1" fill="#1a1f1a" />
    <!-- Shaft curving inward from col 9 to col 11 across rows 3-4 -->
    <rect x="9" y="3" width="1" height="1" fill="#1a1f1a" />
    <rect x="10" y="4" width="1" height="1" fill="#1a1f1a" />

    <!-- RIGHT antenna (mirror) -->
    <rect x="22" y="0" width="2" height="2" fill="#e58aa0" />
    <rect x="22" y="2" width="1" height="1" fill="#1a1f1a" />
    <rect x="23" y="2" width="1" height="1" fill="#1a1f1a" />
    <rect x="22" y="3" width="1" height="1" fill="#1a1f1a" />
    <rect x="21" y="4" width="1" height="1" fill="#1a1f1a" />
  </g>
</template>
