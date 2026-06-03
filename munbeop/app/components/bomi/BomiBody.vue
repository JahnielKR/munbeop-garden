<script setup lang="ts">
/**
 * BomiBody — rows 15-21 of the sprite.
 *
 * Cast shadow under hat brim (row 15), head fill (rows 16-19),
 * row 20 with buches + mouth + bottom of head, row 21 head bottom.
 *
 * Static — head doesn't transform within #bee.
 */
</script>

<template>
  <g id="body" shape-rendering="crispEdges">
    <!-- Cast shadow under brim — thin gold-shadow strip -->
    <rect x="7" y="15" width="18" height="1" fill="#a06b2e" />

    <!-- Head fill (gold body color) rows 16-21 (head only, eyes paint on top later) -->
    <rect x="7" y="16" width="18" height="6" fill="#d4a04a" />

    <!-- Gold-shadow on left/right side of head -->
    <rect x="6" y="17" width="1" height="3" fill="#a06b2e" />
    <rect x="25" y="17" width="1" height="3" fill="#a06b2e" />

    <!-- Buches (cheeks) - ribbon-red, 3 px each, row 20 -->
    <rect x="7" y="20" width="3" height="1" fill="#c23e3e" />
    <rect x="22" y="20" width="3" height="1" fill="#c23e3e" />

    <!-- Mouth — pixel smile arc -->
    <!-- Row 20: col 14 and col 16 (ink) -->
    <rect x="14" y="20" width="1" height="1" fill="#1a1f1a" />
    <rect x="16" y="20" width="1" height="1" fill="#1a1f1a" />
    <!-- Row 21: col 15 (ink — mouth bottom curve) -->
    <rect x="15" y="21" width="1" height="1" fill="#1a1f1a" />
  </g>
</template>
