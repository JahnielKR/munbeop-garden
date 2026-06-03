<script setup lang="ts">
/**
 * BomiAbdomen — rows 22-31 of the sprite (non-wing pixels).
 *
 * Gold body fill with 3 ink stripes and an ink stinger at the bottom.
 * Wings are a separate group (BomiWings) painted on top.
 *
 * Static within #bee.
 */
</script>

<template>
  <g id="abdomen" shape-rendering="crispEdges">
    <!-- Gold body fill (the bee abdomen oval) rows 22-28 -->
    <!-- Row 22: 12 wide -->
    <rect x="10" y="22" width="12" height="1" fill="#d4a04a" />
    <!-- Row 23-27: 14 wide (widest part) -->
    <rect x="9" y="23" width="14" height="5" fill="#d4a04a" />
    <!-- Row 28: 12 wide (narrowing toward stinger) -->
    <rect x="10" y="28" width="12" height="1" fill="#d4a04a" />

    <!-- 3 ink stripes across the abdomen -->
    <rect x="9" y="24" width="14" height="1" fill="#1a1f1a" />
    <rect x="9" y="26" width="14" height="1" fill="#1a1f1a" />
    <rect x="9" y="28" width="14" height="1" fill="#1a1f1a" />

    <!-- Gold-shadow on the lower-right of the abdomen for volume -->
    <rect x="21" y="25" width="2" height="3" fill="#a06b2e" />

    <!-- Stinger (rows 29-31, ink) -->
    <rect x="15" y="29" width="2" height="1" fill="#1a1f1a" />
    <rect x="15" y="30" width="2" height="1" fill="#1a1f1a" />
    <rect x="15" y="31" width="1" height="1" fill="#1a1f1a" />
  </g>
</template>
